import * as cdk from 'aws-cdk-lib';
import { SharedStack } from '../lib/shared-stack';
import { CertStack } from '../lib/cert-stack';
import { SiteStack } from '../lib/site-stack';
import { ACCOUNT, REGION, EDGE_REGION, SITE_ENVS } from '../lib/site-config';

const app = new cdk.App();
const env = { account: ACCOUNT, region: REGION };
const edgeEnv = { account: ACCOUNT, region: EDGE_REGION };

const shared = new SharedStack(app, 'NotesShared', { env });

// Certificates must be in us-east-1; everything else lives in the home region.
// crossRegionReferences lets the site stack consume the edge-region certificate ARN.
for (const site of SITE_ENVS) {
  const cert = new CertStack(app, `NotesCert${site.id}`, {
    env: edgeEnv,
    crossRegionReferences: true,
    site,
  });
  new SiteStack(app, `NotesSite${site.id}`, {
    env,
    crossRegionReferences: true,
    site,
    oidcProvider: shared.oidcProvider,
    certificate: cert.certificate,
  });
}
