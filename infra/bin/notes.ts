import * as cdk from 'aws-cdk-lib';
import { resolveStage } from '../lib/site-config';
import { createStageStacks } from '../lib/stage-stacks';

const app = new cdk.App();
createStageStacks(app, resolveStage(app, process.env));
