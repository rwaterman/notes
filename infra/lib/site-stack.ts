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
import { HOSTED_ZONE_ID, ZONE_NAME, GITHUB_REPO, SiteEnv } from './site-config';

export interface SiteStackProps extends cdk.StackProps {
  site: SiteEnv;
  oidcProvider: iam.IOpenIdConnectProvider;
}

/**
 * One notes environment: private S3 bucket behind a CloudFront distribution (Origin
 * Access Control), an in-region ACM certificate, Route53 alias records, a
 * directory-index CloudFront Function, and a branch-scoped OIDC role for content deploys.
 */
export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);
    const { site, oidcProvider } = props;
    const isProd = site.envName === 'prod';

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: HOSTED_ZONE_ID,
      zoneName: ZONE_NAME,
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: site.domainName,
      validation: acm.CertificateValidation.fromDns(zone),
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

    // Shared "blanket" CloudFront WebACL, owned by the website repo's SharedStack and
    // published to SSM there. Read its ARN at deploy time and associate this distribution
    // with it instead of defining a per-repo WebACL. Requires the website WebsiteShared
    // stack to have deployed first so the parameter exists.
    const sharedWebAclArn = ssm.StringParameter.valueForStringParameter(
      this,
      '/website/shared/cloudfront-webacl-arn',
    );

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [site.domainName],
      certificate,
      webAclId: sharedWebAclArn,
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

    const aliasTarget = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
    new route53.ARecord(this, 'AliasA', { zone, recordName: site.domainName, target: aliasTarget });
    new route53.AaaaRecord(this, 'AliasAAAA', { zone, recordName: site.domainName, target: aliasTarget });

    // Branch-scoped CI role: only this env's branch can assume it, and it can only touch
    // this env's bucket, distribution, and SSM parameters.
    const contentRole = new iam.Role(this, 'ContentDeployRole', {
      roleName: `notes-content-${site.envName}`,
      description: `GitHub Actions role to deploy ${site.envName} notes content`,
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:ref:refs/heads/${site.branch}`,
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
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/notes/${site.envName}/*`],
      }),
    );

    new ssm.StringParameter(this, 'BucketNameParam', {
      parameterName: `/notes/${site.envName}/bucket-name`,
      stringValue: bucket.bucketName,
    });
    new ssm.StringParameter(this, 'DistributionIdParam', {
      parameterName: `/notes/${site.envName}/distribution-id`,
      stringValue: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${site.domainName}` });
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
