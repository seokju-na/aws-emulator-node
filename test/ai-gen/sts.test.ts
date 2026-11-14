import { Buffer } from 'node:buffer';
import { CreateRoleCommand, IAMClient } from '@aws-sdk/client-iam';
import {
  AssumeRoleCommand,
  AssumeRoleWithSAMLCommand,
  AssumeRoleWithWebIdentityCommand,
  AssumeRootCommand,
  DecodeAuthorizationMessageCommand,
  GetAccessKeyInfoCommand,
  GetCallerIdentityCommand,
  GetDelegatedAccessTokenCommand,
  GetFederationTokenCommand,
  GetSessionTokenCommand,
  GetWebIdentityTokenCommand,
  STSClient,
} from '@aws-sdk/client-sts';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('sts', () => {
  it('AssumeRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const sts = new STSClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'assume-me',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Principal: { AWS: '*' }, Action: 'sts:AssumeRole' }],
        }),
      }),
    );
    const res = await sts.send(
      new AssumeRoleCommand({ RoleArn: Role?.Arn, RoleSessionName: 'session-1' }),
    );
    expect(res.Credentials?.AccessKeyId).toBeTruthy();
    expect(res.Credentials?.SecretAccessKey).toBeTruthy();
    expect(res.Credentials?.SessionToken).toBeTruthy();
    expect(res.AssumedRoleUser?.Arn).toContain('assumed-role/assume-me/session-1');
  });

  it('AssumeRoleWithSAML', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    await expect(
      sts.send(
        new AssumeRoleWithSAMLCommand({
          RoleArn: 'arn:aws:iam::000000000000:role/saml-role',
          PrincipalArn: 'arn:aws:iam::000000000000:saml-provider/my-idp',
          SAMLAssertion: Buffer.from('<not-a-saml-assertion/>').toString('base64'),
        }),
      ),
    ).rejects.toThrow();
  });

  it('AssumeRoleWithWebIdentity', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    await expect(
      sts.send(
        new AssumeRoleWithWebIdentityCommand({
          RoleArn: 'arn:aws:iam::000000000000:role/web-role',
          RoleSessionName: 'web-session',
          WebIdentityToken: 'not-a-jwt',
        }),
      ),
    ).rejects.toThrow();
  });

  it.skip('AssumeRoot', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(
      new AssumeRootCommand({
        TargetPrincipal: '111111111111',
        TaskPolicyArn: { arn: 'arn:aws:iam::aws:policy/root-task/IAMAuditRootUserCredentials' },
      }),
    );
    expect(res.Credentials?.AccessKeyId).toBeTruthy();
  });

  it('DecodeAuthorizationMessage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    await expect(
      sts.send(new DecodeAuthorizationMessageCommand({ EncodedMessage: 'not-an-encoded-message' })),
    ).rejects.toThrow();
  });

  it('GetAccessKeyInfo', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(
      new GetAccessKeyInfoCommand({ AccessKeyId: 'AKIAIOSFODNN7EXAMPLE' }),
    );
    expect(res.Account).toMatch(/^\d{12}$/);
  });

  it('GetCallerIdentity', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(new GetCallerIdentityCommand({}));
    expect(res.Account).toMatch(/^\d{12}$/);
    expect(res.Arn).toContain(res.Account);
    expect(res.UserId).toBeTruthy();
  });

  it('GetDelegatedAccessToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    await expect(
      sts.send(new GetDelegatedAccessTokenCommand({ TradeInToken: 'not-a-token' })),
    ).rejects.toThrow();
  });

  it('GetFederationToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(new GetFederationTokenCommand({ Name: 'federated-bob' }));
    expect(res.Credentials?.AccessKeyId).toBeTruthy();
    expect(res.FederatedUser?.Arn).toContain('federated-user/federated-bob');
  });

  it('GetSessionToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(new GetSessionTokenCommand({ DurationSeconds: 900 }));
    expect(res.Credentials?.AccessKeyId).toBeTruthy();
    expect(res.Credentials?.SessionToken).toBeTruthy();
  });

  it.skip('GetWebIdentityToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sts = new STSClient(aws.clientConfig());
    const res = await sts.send(
      new GetWebIdentityTokenCommand({
        Audience: ['https://example.com'],
        SigningAlgorithm: 'RS256',
      }),
    );
    expect(res.WebIdentityToken).toBeTruthy();
  });
});
