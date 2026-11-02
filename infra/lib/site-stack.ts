import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { GITHUB_REPO, WEB_ACL_ARN_PARAMETER, StageConfig } from './site-config';

export interface SiteStackProps extends cdk.StackProps {
  stage: StageConfig;
  oidcProvider: iam.IOpenIdConnectProvider;
  certificate: acm.ICertificate;
}

/**
 * One notes environment: private S3 bucket behind a CloudFront distribution (Origin
 * Access Control), Route53 alias records, a directory-index CloudFront Function, and an
 * environment-scoped OIDC role for content deploys.
 */
export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);
    const { stage, oidcProvider, certificate } = props;
    const isProd = stage.envName === 'prod';
    const attachDomains = this.node.tryGetContext('attachDomains') !== 'false';

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: stage.hostedZoneId,
      zoneName: stage.zoneName,
    });

    const bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    });

    const rewriteFunction = new cloudfront.Function(this, 'RewriteFunction', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(DIRECTORY_INDEX_FUNCTION),
    });

    // The account baseline (aws-orgs) owns the CloudFront web ACL and publishes its ARN to
    // SSM. Only stages with webAcl set read it, so dev carries no WAF cost.
    const webAclId = stage.webAcl
      ? ssm.StringParameter.valueForStringParameter(this, WEB_ACL_ARN_PARAMETER)
      : undefined;

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: attachDomains ? [stage.domainName] : undefined,
      certificate,
      webAclId,
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        functionAssociations: [
          { function: rewriteFunction, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: cdk.Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: cdk.Duration.minutes(5) },
      ],
    });

    if (attachDomains) {
      const aliasTarget = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
      new route53.ARecord(this, 'AliasA', { zone, recordName: stage.domainName, target: aliasTarget });
      new route53.AaaaRecord(this, 'AliasAAAA', { zone, recordName: stage.domainName, target: aliasTarget });
    }

    // Environment-scoped CI role: only this stage's GitHub environment can assume it, and it
    // can only touch this stage's bucket, distribution, and SSM parameters.
    const contentRole = new iam.Role(this, 'ContentDeployRole', {
      roleName: `notes-content-${stage.envName}`,
      description: `GitHub Actions role to deploy ${stage.envName} notes content`,
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:environment:${stage.githubEnvironment}`,
        },
      }),
    });
    bucket.grantReadWrite(contentRole);
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`],
      }),
    );
    contentRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/notes/${stage.envName}/*`],
      }),
    );

    new ssm.StringParameter(this, 'BucketNameParam', {
      parameterName: `/notes/${stage.envName}/bucket-name`,
      stringValue: bucket.bucketName,
    });
    new ssm.StringParameter(this, 'DistributionIdParam', {
      parameterName: `/notes/${stage.envName}/distribution-id`,
      stringValue: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${stage.domainName}` });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'ContentRoleArn', { value: contentRole.roleArn });
  }
}

/**
 * CloudFront viewer-request function (cloudfront-js-2.0, ES5.1-safe). With OAC the S3 REST
 * origin does no index resolution, so we map Quartz's clean URLs to their emitted objects:
 *  - trailing slash (folder/section index, e.g. "/aws/", "/")  -> "<uri>index.html"
 *  - extensionless, no slash (content note or tag, e.g. "/aws/s3", "/tags/aws") -> "<uri>.html"
 * Quartz emits content pages as flat "<slug>.html" files (only folder pages are
 * "<folder>/index.html"), so extensionless paths must get ".html", not "/index.html".
 */
const DIRECTORY_INDEX_FUNCTION = `function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.charAt(uri.length - 1) === '/') {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri = uri + '.html';
  }
  return request;
}`;
