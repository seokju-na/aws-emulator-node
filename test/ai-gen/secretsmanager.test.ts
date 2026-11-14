import { Buffer } from 'node:buffer';
import { AddPermissionCommand, CreateFunctionCommand, LambdaClient } from '@aws-sdk/client-lambda';
import {
  BatchGetSecretValueCommand,
  CancelRotateSecretCommand,
  CreateSecretCommand,
  DeleteResourcePolicyCommand,
  DeleteSecretCommand,
  DescribeSecretCommand,
  GetRandomPasswordCommand,
  GetResourcePolicyCommand,
  GetSecretValueCommand,
  ListSecretsCommand,
  ListSecretVersionIdsCommand,
  PutResourcePolicyCommand,
  PutSecretValueCommand,
  RemoveRegionsFromReplicationCommand,
  ReplicateSecretToRegionsCommand,
  RestoreSecretCommand,
  RotateSecretCommand,
  SecretsManagerClient,
  StopReplicationToReplicaCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateSecretCommand,
  UpdateSecretVersionStageCommand,
  ValidateResourcePolicyCommand,
} from '@aws-sdk/client-secrets-manager';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('secretsmanager', () => {
  it('BatchGetSecretValue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'batch-a', SecretString: 'value-a' }));
    await sm.send(new CreateSecretCommand({ Name: 'batch-b', SecretString: 'value-b' }));
    const res = await sm.send(
      new BatchGetSecretValueCommand({ SecretIdList: ['batch-a', 'batch-b'] }),
    );
    expect(res.SecretValues?.map((secret) => secret.SecretString).sort()).toEqual([
      'value-a',
      'value-b',
    ]);
  });

  it('CancelRotateSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const lambda = new LambdaClient(aws.clientConfig());
    const { FunctionArn } = await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'rotator',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/rotator-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: 'rotator',
        StatementId: 'secretsmanager',
        Action: 'lambda:InvokeFunction',
        Principal: 'secretsmanager.amazonaws.com',
      }),
    );
    await sm.send(new CreateSecretCommand({ Name: 'cancel-rotate', SecretString: 'v1' }));
    await sm.send(
      new RotateSecretCommand({
        SecretId: 'cancel-rotate',
        RotationLambdaARN: FunctionArn,
        RotationRules: { AutomaticallyAfterDays: 30 },
        RotateImmediately: false,
      }),
    );
    await sm.send(new CancelRotateSecretCommand({ SecretId: 'cancel-rotate' }));
    const res = await sm.send(new DescribeSecretCommand({ SecretId: 'cancel-rotate' }));
    expect(res.RotationEnabled).toBe(false);
  });

  it('CreateSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const res = await sm.send(
      new CreateSecretCommand({
        Name: 'db/password',
        SecretString: JSON.stringify({ username: 'admin', password: 'hunter2' }),
      }),
    );
    expect(res.ARN).toContain(':secret:db/password-');
    expect(res.Name).toBe('db/password');
    expect(res.VersionId).toBeTruthy();
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'delete-policy', SecretString: 'v' }));
    await sm.send(
      new PutResourcePolicyCommand({
        SecretId: 'delete-policy',
        ResourcePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'secretsmanager:GetSecretValue',
              Resource: '*',
            },
          ],
        }),
      }),
    );
    await sm.send(new DeleteResourcePolicyCommand({ SecretId: 'delete-policy' }));
    const res = await sm.send(new GetResourcePolicyCommand({ SecretId: 'delete-policy' }));
    expect(res.ResourcePolicy).toBeUndefined();
  });

  it('DeleteSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'doomed-secret', SecretString: 'v' }));
    const res = await sm.send(
      new DeleteSecretCommand({ SecretId: 'doomed-secret', RecoveryWindowInDays: 7 }),
    );
    expect(res.DeletionDate).toBeInstanceOf(Date);
    await expect(
      sm.send(new GetSecretValueCommand({ SecretId: 'doomed-secret' })),
    ).rejects.toThrow();
  });

  it('DescribeSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(
      new CreateSecretCommand({
        Name: 'described',
        Description: 'a described secret',
        SecretString: 'v',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await sm.send(new DescribeSecretCommand({ SecretId: 'described' }));
    expect(res.Name).toBe('described');
    expect(res.Description).toBe('a described secret');
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('GetRandomPassword', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const res = await sm.send(
      new GetRandomPasswordCommand({ PasswordLength: 24, ExcludePunctuation: true }),
    );
    expect(res.RandomPassword).toHaveLength(24);
    expect(res.RandomPassword).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('GetResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'get-policy', SecretString: 'v' }));
    await sm.send(
      new PutResourcePolicyCommand({
        SecretId: 'get-policy',
        ResourcePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'secretsmanager:GetSecretValue',
              Resource: '*',
            },
          ],
        }),
      }),
    );
    const res = await sm.send(new GetResourcePolicyCommand({ SecretId: 'get-policy' }));
    expect(JSON.parse(res.ResourcePolicy ?? '{}').Statement[0].Action).toBe(
      'secretsmanager:GetSecretValue',
    );
  });

  it('GetSecretValue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'api-key', SecretString: 'abc123' }));
    const res = await sm.send(new GetSecretValueCommand({ SecretId: 'api-key' }));
    expect(res.SecretString).toBe('abc123');
    expect(res.VersionStages).toEqual(['AWSCURRENT']);
  });

  it('ListSecrets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'list-a', SecretString: 'a' }));
    await sm.send(new CreateSecretCommand({ Name: 'list-b', SecretString: 'b' }));
    const res = await sm.send(new ListSecretsCommand({}));
    expect(res.SecretList?.map((secret) => secret.Name).sort()).toEqual(['list-a', 'list-b']);
  });

  it('ListSecretVersionIds', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'versioned', SecretString: 'v1' }));
    await sm.send(new PutSecretValueCommand({ SecretId: 'versioned', SecretString: 'v2' }));
    const res = await sm.send(new ListSecretVersionIdsCommand({ SecretId: 'versioned' }));
    expect(res.Versions).toHaveLength(2);
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'put-policy', SecretString: 'v' }));
    const res = await sm.send(
      new PutResourcePolicyCommand({
        SecretId: 'put-policy',
        ResourcePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'secretsmanager:GetSecretValue',
              Resource: '*',
            },
          ],
        }),
      }),
    );
    expect(res.Name).toBe('put-policy');
  });

  it('PutSecretValue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'rotating', SecretString: 'old' }));
    await sm.send(new PutSecretValueCommand({ SecretId: 'rotating', SecretString: 'new' }));
    const current = await sm.send(new GetSecretValueCommand({ SecretId: 'rotating' }));
    expect(current.SecretString).toBe('new');
    const previous = await sm.send(
      new GetSecretValueCommand({ SecretId: 'rotating', VersionStage: 'AWSPREVIOUS' }),
    );
    expect(previous.SecretString).toBe('old');
  });

  it('RemoveRegionsFromReplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(
      new CreateSecretCommand({
        Name: 'replicated-remove',
        SecretString: 'v',
        AddReplicaRegions: [{ Region: 'us-west-2' }],
      }),
    );
    const res = await sm.send(
      new RemoveRegionsFromReplicationCommand({
        SecretId: 'replicated-remove',
        RemoveReplicaRegions: ['us-west-2'],
      }),
    );
    expect(res.ReplicationStatus ?? []).toHaveLength(0);
  });

  it('ReplicateSecretToRegions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'replicate-me', SecretString: 'v' }));
    const res = await sm.send(
      new ReplicateSecretToRegionsCommand({
        SecretId: 'replicate-me',
        AddReplicaRegions: [{ Region: 'eu-west-1' }],
      }),
    );
    expect(res.ReplicationStatus?.[0]?.Region).toBe('eu-west-1');
  });

  it('RestoreSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'restore-me', SecretString: 'v' }));
    await sm.send(new DeleteSecretCommand({ SecretId: 'restore-me', RecoveryWindowInDays: 7 }));
    await sm.send(new RestoreSecretCommand({ SecretId: 'restore-me' }));
    const res = await sm.send(new GetSecretValueCommand({ SecretId: 'restore-me' }));
    expect(res.SecretString).toBe('v');
  });

  it('RotateSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const lambda = new LambdaClient(aws.clientConfig());
    const { FunctionArn } = await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'rotator',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/rotator-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: 'rotator',
        StatementId: 'secretsmanager',
        Action: 'lambda:InvokeFunction',
        Principal: 'secretsmanager.amazonaws.com',
      }),
    );
    await sm.send(new CreateSecretCommand({ Name: 'rotate-me', SecretString: 'v1' }));
    await sm.send(
      new RotateSecretCommand({
        SecretId: 'rotate-me',
        RotationLambdaARN: FunctionArn,
        RotationRules: { AutomaticallyAfterDays: 30 },
        RotateImmediately: false,
      }),
    );
    const res = await sm.send(new DescribeSecretCommand({ SecretId: 'rotate-me' }));
    expect(res.RotationEnabled).toBe(true);
    expect(res.RotationRules?.AutomaticallyAfterDays).toBe(30);
  });

  it('StopReplicationToReplica', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const primary = new SecretsManagerClient(aws.clientConfig());
    const replica = new SecretsManagerClient({ ...aws.clientConfig(), region: 'us-west-2' });
    const { ARN } = await primary.send(
      new CreateSecretCommand({
        Name: 'stop-replication',
        SecretString: 'v',
        AddReplicaRegions: [{ Region: 'us-west-2' }],
      }),
    );
    const res = await replica.send(
      new StopReplicationToReplicaCommand({
        SecretId: ARN?.replace(':us-east-1:', ':us-west-2:'),
      }),
    );
    expect(res.ARN).toContain(':us-west-2:');
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'tag-me', SecretString: 'v' }));
    await sm.send(
      new TagResourceCommand({ SecretId: 'tag-me', Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await sm.send(new DescribeSecretCommand({ SecretId: 'tag-me' }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(
      new CreateSecretCommand({
        Name: 'untag-me',
        SecretString: 'v',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await sm.send(new UntagResourceCommand({ SecretId: 'untag-me', TagKeys: ['env'] }));
    const res = await sm.send(new DescribeSecretCommand({ SecretId: 'untag-me' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UpdateSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    await sm.send(new CreateSecretCommand({ Name: 'update-me', SecretString: 'v1' }));
    await sm.send(
      new UpdateSecretCommand({
        SecretId: 'update-me',
        Description: 'updated',
        SecretString: 'v2',
      }),
    );
    const described = await sm.send(new DescribeSecretCommand({ SecretId: 'update-me' }));
    expect(described.Description).toBe('updated');
    const value = await sm.send(new GetSecretValueCommand({ SecretId: 'update-me' }));
    expect(value.SecretString).toBe('v2');
  });

  it('UpdateSecretVersionStage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const created = await sm.send(new CreateSecretCommand({ Name: 'staged', SecretString: 'v1' }));
    await sm.send(new PutSecretValueCommand({ SecretId: 'staged', SecretString: 'v2' }));
    await sm.send(
      new UpdateSecretVersionStageCommand({
        SecretId: 'staged',
        VersionStage: 'BLUE',
        MoveToVersionId: created.VersionId,
      }),
    );
    const res = await sm.send(
      new GetSecretValueCommand({ SecretId: 'staged', VersionStage: 'BLUE' }),
    );
    expect(res.SecretString).toBe('v1');
  });

  it('ValidateResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sm = new SecretsManagerClient(aws.clientConfig());
    const res = await sm.send(
      new ValidateResourcePolicyCommand({
        ResourcePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'secretsmanager:GetSecretValue',
              Resource: '*',
            },
          ],
        }),
      }),
    );
    expect(res.PolicyValidationPassed).toBe(true);
  });
});
