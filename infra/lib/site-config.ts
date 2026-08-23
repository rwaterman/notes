function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

export const ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT ?? requireEnv('AWS_ACCOUNT_ID');
export const REGION = 'us-west-2';
// CloudFront certificates must live in us-east-1.
export const EDGE_REGION = 'us-east-1';

export const HOSTED_ZONE_ID = requireEnv('HOSTED_ZONE_ID');
export const ZONE_NAME = 'rickwaterman.com';

export const GITHUB_REPO = 'rwaterman/notes';

/**
 * The GitHub Actions OIDC provider is an account-level singleton (one per URL per
 * AWS account). It is already created by the `website` repo's WebsiteShared stack,
 * so we import it by ARN here — creating a second one would be rejected.
 */
export const OIDC_PROVIDER_ARN = `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com`;

export interface SiteEnv {
  /** PascalCase suffix used in stack ids, e.g. "Dev" -> NotesSiteDev. */
  id: string;
  /** Lowercase environment key used in role names and SSM paths, e.g. "dev". */
  envName: string;
  /** Primary domain served, e.g. "notes-dev.rickwaterman.com". */
  domainName: string;
  /** Git branch whose pushes deploy this environment. */
  branch: string;
}

export const SITE_ENVS: SiteEnv[] = [
  {
    id: 'Dev',
    envName: 'dev',
    domainName: 'notes-dev.rickwaterman.com',
    branch: 'develop',
  },
  {
    id: 'Prod',
    envName: 'prod',
    domainName: 'notes.rickwaterman.com',
    branch: 'main',
  },
];
