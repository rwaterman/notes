import * as cdk from 'aws-cdk-lib';
import { SharedStack } from './shared-stack';
import { CertStack } from './cert-stack';
import { SiteStack } from './site-stack';
import { REGION, EDGE_REGION, StageConfig } from './site-config';

export interface StageStacks {
  shared: SharedStack;
  cert: CertStack;
  site: SiteStack;
}

export function createStageStacks(app: cdk.App, stage: StageConfig): StageStacks {
  const env = { account: stage.account, region: REGION };
  const edgeEnv = { account: stage.account, region: EDGE_REGION };

  const shared = new SharedStack(app, 'NotesShared', { env, stage });
  const cert = new CertStack(app, `NotesCert${stage.id}`, {
    env: edgeEnv,
    crossRegionReferences: true,
    stage,
  });
  const site = new SiteStack(app, `NotesSite${stage.id}`, {
    env,
    crossRegionReferences: true,
    stage,
    oidcProvider: shared.oidcProvider,
    certificate: cert.certificate,
  });
  return { shared, cert, site };
}
