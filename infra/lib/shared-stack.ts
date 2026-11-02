import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { REGION, EDGE_REGION, GITHUB_REPO, StageConfig, oidcProviderArn } from './site-config';

export interface SharedStackProps extends cdk.StackProps {
  stage: StageConfig;
}

/**
 * Per-account pieces for notes CI:
 *  - imports the GitHub Actions OIDC provider (owned by the account baseline in aws-orgs)
 *  - creates the infra-deploy role assumed by CI to run `cdk deploy`
 */
export class SharedStack extends cdk.Stack {
  public readonly oidcProvider: iam.IOpenIdConnectProvider;

  constructor(scope: Construct, id: string, props: SharedStackProps) {
    super(scope, id, props);
    const { stage } = props;

    this.oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidcProvider',
      oidcProviderArn(stage.account),
    );

    // CI role for `cdk deploy`. It holds no service permissions of its own — it can only
    // assume the CDK bootstrap roles, which carry the actual provisioning permissions.
    const infraRole = new iam.Role(this, 'InfraDeployRole', {
      roleName: 'notes-infra-deploy',
      description: 'GitHub Actions role to run cdk deploy for notes (assumes CDK bootstrap roles only)',
      assumedBy: new iam.OpenIdConnectPrincipal(this.oidcProvider, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:environment:${stage.githubEnvironment}`,
        },
      }),
    });
    infraRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [REGION, EDGE_REGION].map(
          (region) => `arn:aws:iam::${stage.account}:role/cdk-hnb659fds-*-${stage.account}-${region}`,
        ),
      }),
    );

    new cdk.CfnOutput(this, 'InfraDeployRoleArn', { value: infraRole.roleArn });
  }
}
