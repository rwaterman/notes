import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ACCOUNT, REGION, EDGE_REGION, GITHUB_REPO, OIDC_PROVIDER_ARN } from './site-config';

/**
 * Account-global pieces for notes CI:
 *  - imports the existing GitHub Actions OIDC provider (owned by the `website` repo's
 *    stack; one per account, cannot be recreated)
 *  - creates the infra-deploy role assumed by CI to run `cdk deploy`
 */
export class SharedStack extends cdk.Stack {
  public readonly oidcProvider: iam.IOpenIdConnectProvider;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidcProvider',
      OIDC_PROVIDER_ARN,
    );

    // CI role for `cdk deploy`. It holds no service permissions of its own — it can only
    // assume the CDK bootstrap roles (home + edge region), which carry the actual
    // provisioning permissions.
    const infraRole = new iam.Role(this, 'InfraDeployRole', {
      roleName: 'notes-infra-deploy',
      description: 'GitHub Actions role to run cdk deploy for notes (assumes CDK bootstrap roles only)',
      assumedBy: new iam.OpenIdConnectPrincipal(this.oidcProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:ref:refs/heads/develop`,
        },
      }),
    });
    infraRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [REGION, EDGE_REGION].map(
          (region) => `arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-*-${ACCOUNT}-${region}`,
        ),
      }),
    );

    new cdk.CfnOutput(this, 'InfraDeployRoleArn', { value: infraRole.roleArn });
  }
}
