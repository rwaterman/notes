import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { STAGES, resolveStage } from '../lib/site-config';

const DEV_ACCOUNT = '690084476262';
const PROD_ACCOUNT = '582621605246';
const MANAGEMENT_ACCOUNT = '349324301382';

function appForStage(stage?: string): cdk.App {
  return new cdk.App({ context: stage === undefined ? {} : { stage } });
}

describe('resolveStage', () => {
  it('throws when -c stage is missing', () => {
    assert.throws(
      () => resolveStage(appForStage(), { CDK_DEFAULT_ACCOUNT: DEV_ACCOUNT }),
      /Pass -c stage=dev or -c stage=prod/,
    );
  });

  it('throws when -c stage is not a known stage', () => {
    assert.throws(
      () => resolveStage(appForStage('staging'), { CDK_DEFAULT_ACCOUNT: DEV_ACCOUNT }),
      /Pass -c stage=dev or -c stage=prod/,
    );
  });

  it('throws when credentials are for another account', () => {
    assert.throws(
      () => resolveStage(appForStage('dev'), { CDK_DEFAULT_ACCOUNT: MANAGEMENT_ACCOUNT }),
      new Error(`Stage dev targets ${DEV_ACCOUNT}, but credentials are for ${MANAGEMENT_ACCOUNT}`),
    );
  });

  it('throws when prod is selected with dev credentials', () => {
    assert.throws(
      () => resolveStage(appForStage('prod'), { CDK_DEFAULT_ACCOUNT: DEV_ACCOUNT }),
      new Error(`Stage prod targets ${PROD_ACCOUNT}, but credentials are for ${DEV_ACCOUNT}`),
    );
  });

  it('throws when the credentials account is unknown', () => {
    assert.throws(() => resolveStage(appForStage('dev'), {}), /CDK_DEFAULT_ACCOUNT/);
  });

  it('returns the dev stage when credentials match', () => {
    const stage = resolveStage(appForStage('dev'), { CDK_DEFAULT_ACCOUNT: DEV_ACCOUNT });
    assert.equal(stage, STAGES.dev);
    assert.equal(stage.account, DEV_ACCOUNT);
    assert.equal(stage.hostedZoneId, 'Z02783752H850YJ2Z0LST');
    assert.equal(stage.zoneName, 'dev.rickwaterman.com');
    assert.equal(stage.domainName, 'notes.dev.rickwaterman.com');
    assert.equal(stage.webAcl, false);
    assert.equal(stage.githubEnvironment, 'dev');
  });

  it('returns the prod stage when credentials match', () => {
    const stage = resolveStage(appForStage('prod'), { CDK_DEFAULT_ACCOUNT: PROD_ACCOUNT });
    assert.equal(stage.account, PROD_ACCOUNT);
    assert.equal(stage.hostedZoneId, 'Z050080263SGEDSJA265');
    assert.equal(stage.zoneName, 'rickwaterman.com');
    assert.equal(stage.domainName, 'notes.rickwaterman.com');
    assert.equal(stage.webAcl, true);
    assert.equal(stage.githubEnvironment, 'prod');
  });
});
