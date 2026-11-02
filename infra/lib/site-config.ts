import * as cdk from 'aws-cdk-lib';

export const REGION = 'us-west-2';
// CloudFront certificates must live in us-east-1.
export const EDGE_REGION = 'us-east-1';

export const GITHUB_REPO = 'rwaterman/notes';

export const WEB_ACL_ARN_PARAMETER = '/account/cloudfront-webacl-arn';

export type StageName = 'dev' | 'prod';

export interface SiteEnv {
  /** PascalCase suffix used in stack ids, e.g. "Dev" -> NotesSiteDev. */
  id: string;
  /** Lowercase environment key used in role names and SSM paths, e.g. "dev". */
  envName: StageName;
  /** Primary domain served, e.g. "notes.dev.rickwaterman.com". */
  domainName: string;
}

export interface StageConfig extends SiteEnv {
  /** AWS account that owns this stage. */
  account: string;
  /** Public hosted zone in that account that holds the stage's records. */
  hostedZoneId: string;
  zoneName: string;
  /** GitHub environment whose OIDC subject the stage's roles trust. */
  githubEnvironment: StageName;
  /** Attach the account's CloudFront web ACL, read from SSM. */
  webAcl: boolean;
}

export const STAGES: Record<StageName, StageConfig> = {
  dev: {
    id: 'Dev',
    envName: 'dev',
    domainName: 'notes.dev.rickwaterman.com',
    account: '690084476262',
    hostedZoneId: 'Z02783752H850YJ2Z0LST',
    zoneName: 'dev.rickwaterman.com',
    githubEnvironment: 'dev',
    webAcl: false,
  },
  prod: {
    id: 'Prod',
    envName: 'prod',
    domainName: 'notes.rickwaterman.com',
    account: '582621605246',
    hostedZoneId: 'Z050080263SGEDSJA265',
    zoneName: 'rickwaterman.com',
    githubEnvironment: 'prod',
    webAcl: true,
  },
};

const STAGE_USAGE = 'Pass -c stage=dev or -c stage=prod';

function isStageName(value: unknown): value is StageName {
  return value === 'dev' || value === 'prod';
}

export function resolveStage(app: cdk.App, env: NodeJS.ProcessEnv): StageConfig {
  const requested: unknown = app.node.tryGetContext('stage');
  if (!isStageName(requested)) {
    throw new Error(`Missing or unknown stage ${JSON.stringify(requested)}. ${STAGE_USAGE}`);
  }
  const stage = STAGES[requested];

  const credentialsAccount = env.CDK_DEFAULT_ACCOUNT;
  if (!credentialsAccount) {
    throw new Error(
      `CDK_DEFAULT_ACCOUNT is not set, so the credentials' account cannot be checked against stage ${requested} (${stage.account})`,
    );
  }
  if (credentialsAccount !== stage.account) {
    throw new Error(
      `Stage ${requested} targets ${stage.account}, but credentials are for ${credentialsAccount}`,
    );
  }
  return stage;
}

/**
 * The GitHub Actions OIDC provider is an account-level singleton owned by the account
 * baseline in the aws-orgs repo, so stacks here import it by ARN.
 */
export function oidcProviderArn(account: string): string {
  return `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`;
}
