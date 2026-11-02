import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { StageName, resolveStage } from '../lib/site-config';
import { createStageStacks } from '../lib/stage-stacks';

interface StageTemplates {
  shared: Template;
  cert: Template;
  site: Template;
}

function synthStage(stageName: StageName, context: Record<string, string> = {}): StageTemplates {
  const app = new cdk.App({ context: { stage: stageName, ...context } });
  const stage = resolveStage(app, { CDK_DEFAULT_ACCOUNT: stageAccount(stageName) });
  const stacks = createStageStacks(app, stage);
  return {
    shared: Template.fromStack(stacks.shared),
    cert: Template.fromStack(stacks.cert),
    site: Template.fromStack(stacks.site),
  };
}

function stageAccount(stageName: StageName): string {
  return stageName === 'dev' ? '690084476262' : '582621605246';
}

function roleTrustConditions(template: Template, roleName: string): unknown {
  const roles = template.findResources('AWS::IAM::Role', {
    Properties: { RoleName: roleName },
  });
  const [role] = Object.values(roles);
  assert.ok(role, `role ${roleName} not found`);
  const properties = role.Properties as { AssumeRolePolicyDocument: { Statement: Array<{ Condition: unknown }> } };
  return properties.AssumeRolePolicyDocument.Statement[0].Condition;
}

describe('SiteStack', () => {
  for (const stageName of ['dev', 'prod'] as const) {
    it(`${stageName} content role trusts only the stage's GitHub environment`, () => {
      const { site } = synthStage(stageName);
      assert.deepEqual(roleTrustConditions(site, `notes-content-${stageName}`), {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:rwaterman/notes:environment:${stageName}`,
        },
      });
      assert.ok(!JSON.stringify(site.toJSON()).includes('StringLike'));
    });

    it(`${stageName} infra deploy role trusts only the stage's GitHub environment`, () => {
      const { shared } = synthStage(stageName);
      assert.deepEqual(roleTrustConditions(shared, 'notes-infra-deploy'), {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:rwaterman/notes:environment:${stageName}`,
        },
      });
      assert.ok(!JSON.stringify(shared.toJSON()).includes('StringLike'));
    });
  }

  it('shared stack imports the OIDC provider instead of creating it', () => {
    const { shared } = synthStage('dev');
    shared.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0);
    shared.resourceCountIs('AWS::IAM::OIDCProvider', 0);
    const federated = JSON.stringify(shared.toJSON());
    assert.ok(
      federated.includes('arn:aws:iam::690084476262:oidc-provider/token.actions.githubusercontent.com'),
    );
  });

  it('dev has no web ACL and no WAF parameter', () => {
    const { site } = synthStage('dev');
    site.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: { WebACLId: Match.absent() },
    });
    assert.ok(!JSON.stringify(site.toJSON()).includes('/account/cloudfront-webacl-arn'));
  });

  it('prod reads WebACLId from /account/cloudfront-webacl-arn', () => {
    const { site } = synthStage('prod');
    const parameters = site.toJSON().Parameters as Record<string, { Type: string; Default: string }>;
    const [logicalId] = Object.entries(parameters)
      .filter(([, parameter]) => parameter.Default === '/account/cloudfront-webacl-arn')
      .map(([key]) => key);
    assert.ok(logicalId, 'SSM parameter for the web ACL ARN not found');
    assert.equal(parameters[logicalId].Type, 'AWS::SSM::Parameter::Value<String>');
    site.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: { WebACLId: { Ref: logicalId } },
    });
    assert.ok(!JSON.stringify(site.toJSON()).includes('/website/shared/cloudfront-webacl-arn'));
  });

  it('serves the stage domain with alias records in the stage zone', () => {
    const { site } = synthStage('dev');
    site.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: { Aliases: ['notes.dev.rickwaterman.com'] },
    });
    for (const type of ['A', 'AAAA']) {
      site.hasResourceProperties('AWS::Route53::RecordSet', {
        Name: 'notes.dev.rickwaterman.com.',
        Type: type,
        HostedZoneId: 'Z02783752H850YJ2Z0LST',
      });
    }
  });

  it('attachDomains=false yields a distribution with a certificate, no Aliases and no Route 53 records', () => {
    const { site } = synthStage('prod', { attachDomains: 'false' });
    site.resourceCountIs('AWS::Route53::RecordSet', 0);
    const distributions = Object.values(site.findResources('AWS::CloudFront::Distribution'));
    assert.equal(distributions.length, 1);
    const config = (distributions[0].Properties as { DistributionConfig: Record<string, unknown> })
      .DistributionConfig;
    assert.equal(config.Aliases, undefined);
    assert.ok(config.ViewerCertificate, 'viewer certificate missing');
    assert.notEqual(
      (config.ViewerCertificate as Record<string, unknown>).CloudFrontDefaultCertificate,
      true,
    );
    assert.ok((config.ViewerCertificate as Record<string, unknown>).AcmCertificateArn);
  });

  it('attachDomains=false still creates the DNS-validated certificate', () => {
    const { cert } = synthStage('prod', { attachDomains: 'false' });
    cert.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'notes.rickwaterman.com',
      DomainValidationOptions: [
        { DomainName: 'notes.rickwaterman.com', HostedZoneId: 'Z050080263SGEDSJA265' },
      ],
    });
  });

  it('keeps the CloudFront function that maps extensionless paths to .html', () => {
    const { site } = synthStage('dev');
    const functions = Object.values(site.findResources('AWS::CloudFront::Function'));
    assert.equal(functions.length, 1);
    const code = (functions[0].Properties as { FunctionCode: string }).FunctionCode;
    assert.ok(code.includes(`request.uri = uri + '.html'`));
    assert.ok(code.includes(`request.uri = uri + 'index.html'`));
  });

  it('retains the bucket in prod and destroys it in dev', () => {
    const prod = synthStage('prod').site;
    const dev = synthStage('dev').site;
    prod.hasResource('AWS::S3::Bucket', { DeletionPolicy: 'Retain' });
    dev.hasResource('AWS::S3::Bucket', { DeletionPolicy: 'Delete' });
  });

  it('publishes bucket and distribution SSM parameters under /notes/<stage>/', () => {
    const { site } = synthStage('dev');
    site.hasResourceProperties('AWS::SSM::Parameter', { Name: '/notes/dev/bucket-name' });
    site.hasResourceProperties('AWS::SSM::Parameter', { Name: '/notes/dev/distribution-id' });
  });
});
