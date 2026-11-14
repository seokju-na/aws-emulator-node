import { Buffer } from 'node:buffer';
import { CreateRoleCommand, IAMClient } from '@aws-sdk/client-iam';
import {
  AddLayerVersionPermissionCommand,
  AddPermissionCommand,
  CheckpointDurableExecutionCommand,
  CreateAliasCommand,
  CreateCapacityProviderCommand,
  CreateCodeSigningConfigCommand,
  CreateEventSourceMappingCommand,
  CreateFunctionCommand,
  CreateFunctionUrlConfigCommand,
  DeleteAliasCommand,
  DeleteCapacityProviderCommand,
  DeleteCodeSigningConfigCommand,
  DeleteEventSourceMappingCommand,
  DeleteFunctionCodeSigningConfigCommand,
  DeleteFunctionCommand,
  DeleteFunctionConcurrencyCommand,
  DeleteFunctionEventInvokeConfigCommand,
  DeleteFunctionUrlConfigCommand,
  DeleteLayerVersionCommand,
  DeleteProvisionedConcurrencyConfigCommand,
  DeleteResourcePolicyCommand,
  GetAccountSettingsCommand,
  GetAliasCommand,
  GetCapacityProviderCommand,
  GetCodeSigningConfigCommand,
  GetDurableExecutionCommand,
  GetDurableExecutionHistoryCommand,
  GetDurableExecutionStateCommand,
  GetEventSourceMappingCommand,
  GetFunctionCodeSigningConfigCommand,
  GetFunctionCommand,
  GetFunctionConcurrencyCommand,
  GetFunctionConfigurationCommand,
  GetFunctionEventInvokeConfigCommand,
  GetFunctionRecursionConfigCommand,
  GetFunctionScalingConfigCommand,
  GetFunctionUrlConfigCommand,
  GetLayerVersionByArnCommand,
  GetLayerVersionCommand,
  GetLayerVersionPolicyCommand,
  GetPolicyCommand,
  GetProvisionedConcurrencyConfigCommand,
  GetResourcePolicyCommand,
  GetRuntimeManagementConfigCommand,
  InvokeAsyncCommand,
  InvokeCommand,
  InvokeWithResponseStreamCommand,
  LambdaClient,
  ListAliasesCommand,
  ListCapacityProvidersCommand,
  ListCodeSigningConfigsCommand,
  ListDurableExecutionsByFunctionCommand,
  ListEventSourceMappingsCommand,
  ListFunctionEventInvokeConfigsCommand,
  ListFunctionsByCodeSigningConfigCommand,
  ListFunctionsCommand,
  ListFunctionUrlConfigsCommand,
  ListFunctionVersionsByCapacityProviderCommand,
  ListLayersCommand,
  ListLayerVersionsCommand,
  ListProvisionedConcurrencyConfigsCommand,
  ListTagsCommand,
  ListVersionsByFunctionCommand,
  PublishLayerVersionCommand,
  PublishVersionCommand,
  PutFunctionCodeSigningConfigCommand,
  PutFunctionConcurrencyCommand,
  PutFunctionEventInvokeConfigCommand,
  PutFunctionRecursionConfigCommand,
  PutFunctionScalingConfigCommand,
  PutProvisionedConcurrencyConfigCommand,
  PutResourcePolicyCommand,
  PutRuntimeManagementConfigCommand,
  RemoveLayerVersionPermissionCommand,
  RemovePermissionCommand,
  SendDurableExecutionCallbackFailureCommand,
  SendDurableExecutionCallbackHeartbeatCommand,
  SendDurableExecutionCallbackSuccessCommand,
  StopDurableExecutionCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateAliasCommand,
  UpdateCapacityProviderCommand,
  UpdateCodeSigningConfigCommand,
  UpdateEventSourceMappingCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  UpdateFunctionEventInvokeConfigCommand,
  UpdateFunctionUrlConfigCommand,
  waitUntilFunctionActiveV2,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { CreateQueueCommand, GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('lambda', () => {
  it('AddLayerVersionPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'perm-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    const res = await lambda.send(
      new AddLayerVersionPermissionCommand({
        LayerName: 'perm-layer',
        VersionNumber: layer.Version,
        StatementId: 'share',
        Action: 'lambda:GetLayerVersion',
        Principal: '111111111111',
      }),
    );
    expect(JSON.parse(res.Statement ?? '{}').Sid).toBe('share');
  });

  it('AddPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'perm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'perm-fn' },
    );
    const res = await lambda.send(
      new AddPermissionCommand({
        FunctionName: 'perm-fn',
        StatementId: 'allow-s3',
        Action: 'lambda:InvokeFunction',
        Principal: 's3.amazonaws.com',
      }),
    );
    expect(JSON.parse(res.Statement ?? '{}').Sid).toBe('allow-s3');
  });

  it.skip('CheckpointDurableExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(
      new CheckpointDurableExecutionCommand({
        DurableExecutionArn:
          'arn:aws:lambda:us-east-1:000000000000:function:durable-fn:$LATEST/durable-execution/run-1/00000000-0000-0000-0000-000000000000',
        CheckpointToken: 'dG9rZW4=',
      }),
    );
    expect(res.CheckpointToken).toBeTruthy();
  });

  it('CreateAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'alias-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'alias-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'alias-fn' }));
    const res = await lambda.send(
      new CreateAliasCommand({ FunctionName: 'alias-fn', Name: 'live', FunctionVersion: '1' }),
    );
    expect(res.AliasArn).toMatch(/:function:alias-fn:live$/);
  });

  it('CreateCapacityProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const res = await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'my-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    expect(res.CapacityProvider?.CapacityProviderArn).toContain(':capacity-provider:my-capacity');
  });

  it('CreateCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(
      new CreateCodeSigningConfigCommand({
        Description: 'signed only',
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    expect(res.CodeSigningConfig?.CodeSigningConfigArn).toContain(':code-signing-config:');
  });

  it('CreateEventSourceMapping', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'esm-queue' }));
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'esm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'esm-fn' },
    );
    const res = await lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: 'esm-fn',
        EventSourceArn: attrs.Attributes?.QueueArn,
        BatchSize: 5,
      }),
    );
    expect(res.UUID).toBeTruthy();
    expect(res.BatchSize).toBe(5);
  });

  it('CreateFunction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'created-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        Environment: { Variables: { STAGE: 'test' } },
      }),
    );
    expect(res.FunctionArn).toMatch(/:function:created-fn$/);
    expect(res.Environment?.Variables).toEqual({ STAGE: 'test' });
  });

  it('CreateFunctionUrlConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'url-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'url-fn' },
    );
    const res = await lambda.send(
      new CreateFunctionUrlConfigCommand({ FunctionName: 'url-fn', AuthType: 'NONE' }),
    );
    expect(res.FunctionUrl).toMatch(/^https:\/\//);
    expect(res.AuthType).toBe('NONE');
  });

  it('DeleteAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'delete-alias-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'delete-alias-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'delete-alias-fn' }));
    await lambda.send(
      new CreateAliasCommand({
        FunctionName: 'delete-alias-fn',
        Name: 'live',
        FunctionVersion: '1',
      }),
    );
    await lambda.send(new DeleteAliasCommand({ FunctionName: 'delete-alias-fn', Name: 'live' }));
    const res = await lambda.send(new ListAliasesCommand({ FunctionName: 'delete-alias-fn' }));
    expect(res.Aliases ?? []).toHaveLength(0);
  });

  it('DeleteCapacityProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'doomed-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    const res = await lambda.send(
      new DeleteCapacityProviderCommand({ CapacityProviderName: 'doomed-capacity' }),
    );
    expect(res.CapacityProvider?.State).toBe('Deleting');
  });

  it('DeleteCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    await lambda.send(
      new DeleteCodeSigningConfigCommand({
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    const res = await lambda.send(new ListCodeSigningConfigsCommand({}));
    expect(res.CodeSigningConfigs ?? []).toHaveLength(0);
  });

  it('DeleteEventSourceMapping', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'delete-esm-queue' }));
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'delete-esm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'delete-esm-fn' },
    );
    const { UUID } = await lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: 'delete-esm-fn',
        EventSourceArn: attrs.Attributes?.QueueArn,
      }),
    );
    const res = await lambda.send(new DeleteEventSourceMappingCommand({ UUID }));
    expect(res.UUID).toBe(UUID);
  });

  it('DeleteFunction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'doomed-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'doomed-fn' },
    );
    await lambda.send(new DeleteFunctionCommand({ FunctionName: 'doomed-fn' }));
    await expect(
      lambda.send(new GetFunctionCommand({ FunctionName: 'doomed-fn' })),
    ).rejects.toThrow();
  });

  it('DeleteFunctionCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'unsign-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'unsign-fn' },
    );
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    await lambda.send(
      new PutFunctionCodeSigningConfigCommand({
        FunctionName: 'unsign-fn',
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    await lambda.send(new DeleteFunctionCodeSigningConfigCommand({ FunctionName: 'unsign-fn' }));
    const res = await lambda.send(
      new GetFunctionCodeSigningConfigCommand({ FunctionName: 'unsign-fn' }),
    );
    expect(res.CodeSigningConfigArn ?? '').toBe('');
  });

  it('DeleteFunctionConcurrency', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'unconcurrent-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'unconcurrent-fn' },
    );
    await lambda.send(
      new PutFunctionConcurrencyCommand({
        FunctionName: 'unconcurrent-fn',
        ReservedConcurrentExecutions: 5,
      }),
    );
    await lambda.send(new DeleteFunctionConcurrencyCommand({ FunctionName: 'unconcurrent-fn' }));
    const res = await lambda.send(
      new GetFunctionConcurrencyCommand({ FunctionName: 'unconcurrent-fn' }),
    );
    expect(res.ReservedConcurrentExecutions).toBeUndefined();
  });

  it('DeleteFunctionEventInvokeConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'uninvoke-config-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'uninvoke-config-fn' },
    );
    await lambda.send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: 'uninvoke-config-fn',
        MaximumRetryAttempts: 1,
      }),
    );
    await lambda.send(
      new DeleteFunctionEventInvokeConfigCommand({ FunctionName: 'uninvoke-config-fn' }),
    );
    await expect(
      lambda.send(new GetFunctionEventInvokeConfigCommand({ FunctionName: 'uninvoke-config-fn' })),
    ).rejects.toThrow();
  });

  it('DeleteFunctionUrlConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'unurl-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'unurl-fn' },
    );
    await lambda.send(
      new CreateFunctionUrlConfigCommand({ FunctionName: 'unurl-fn', AuthType: 'NONE' }),
    );
    await lambda.send(new DeleteFunctionUrlConfigCommand({ FunctionName: 'unurl-fn' }));
    await expect(
      lambda.send(new GetFunctionUrlConfigCommand({ FunctionName: 'unurl-fn' })),
    ).rejects.toThrow();
  });

  it('DeleteLayerVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'doomed-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    await lambda.send(
      new DeleteLayerVersionCommand({ LayerName: 'doomed-layer', VersionNumber: layer.Version }),
    );
    const res = await lambda.send(new ListLayerVersionsCommand({ LayerName: 'doomed-layer' }));
    expect(res.LayerVersions ?? []).toHaveLength(0);
  });

  it('DeleteProvisionedConcurrencyConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'unprovision-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'unprovision-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'unprovision-fn' }));
    await lambda.send(
      new PutProvisionedConcurrencyConfigCommand({
        FunctionName: 'unprovision-fn',
        Qualifier: '1',
        ProvisionedConcurrentExecutions: 1,
      }),
    );
    await lambda.send(
      new DeleteProvisionedConcurrencyConfigCommand({
        FunctionName: 'unprovision-fn',
        Qualifier: '1',
      }),
    );
    await expect(
      lambda.send(
        new GetProvisionedConcurrencyConfigCommand({
          FunctionName: 'unprovision-fn',
          Qualifier: '1',
        }),
      ),
    ).rejects.toThrow();
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'delete-rp-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'delete-rp-fn' },
    );
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: 'delete-rp-fn' }),
    );
    await lambda.send(
      new PutResourcePolicyCommand({
        ResourceArn: Configuration?.FunctionArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'cross-account',
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'lambda:InvokeFunction',
              Resource: Configuration?.FunctionArn,
            },
          ],
        }),
      }),
    );
    await lambda.send(new DeleteResourcePolicyCommand({ ResourceArn: Configuration?.FunctionArn }));
    await expect(
      lambda.send(new GetResourcePolicyCommand({ ResourceArn: Configuration?.FunctionArn })),
    ).rejects.toThrow();
  });

  it('GetAccountSettings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(new GetAccountSettingsCommand({}));
    expect(res.AccountLimit?.ConcurrentExecutions).toBeGreaterThan(0);
  });

  it('GetAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'get-alias-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'get-alias-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'get-alias-fn' }));
    await lambda.send(
      new CreateAliasCommand({ FunctionName: 'get-alias-fn', Name: 'live', FunctionVersion: '1' }),
    );
    const res = await lambda.send(
      new GetAliasCommand({ FunctionName: 'get-alias-fn', Name: 'live' }),
    );
    expect(res.FunctionVersion).toBe('1');
  });

  it('GetCapacityProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'get-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    const res = await lambda.send(
      new GetCapacityProviderCommand({ CapacityProviderName: 'get-capacity' }),
    );
    expect(res.CapacityProvider?.CapacityProviderArn).toContain(':capacity-provider:get-capacity');
  });

  it('GetCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        Description: 'get me',
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    const res = await lambda.send(
      new GetCodeSigningConfigCommand({
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    expect(res.CodeSigningConfig?.Description).toBe('get me');
  });

  it('GetDurableExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(
        new GetDurableExecutionCommand({
          DurableExecutionArn:
            'arn:aws:lambda:us-east-1:000000000000:function:durable-fn:$LATEST/durable-execution/run-1/00000000-0000-0000-0000-000000000000',
        }),
      ),
    ).rejects.toThrow(/not found|does not exist/i);
  });

  it('GetDurableExecutionHistory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(
        new GetDurableExecutionHistoryCommand({
          DurableExecutionArn:
            'arn:aws:lambda:us-east-1:000000000000:function:durable-fn:$LATEST/durable-execution/run-1/00000000-0000-0000-0000-000000000000',
        }),
      ),
    ).rejects.toThrow(/not found|does not exist/i);
  });

  it.skip('GetDurableExecutionState', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(
      new GetDurableExecutionStateCommand({
        DurableExecutionArn:
          'arn:aws:lambda:us-east-1:000000000000:function:durable-fn:$LATEST/durable-execution/run-1/00000000-0000-0000-0000-000000000000',
        CheckpointToken: 'dG9rZW4=',
      }),
    );
    expect(res.Operations).toBeDefined();
  });

  it('GetEventSourceMapping', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'get-esm-queue' }));
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'get-esm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'get-esm-fn' },
    );
    const { UUID } = await lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: 'get-esm-fn',
        EventSourceArn: attrs.Attributes?.QueueArn,
      }),
    );
    const res = await lambda.send(new GetEventSourceMappingCommand({ UUID }));
    expect(res.EventSourceArn).toBe(attrs.Attributes?.QueueArn);
  });

  it('GetFunction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'get-fn' },
    );
    const res = await lambda.send(new GetFunctionCommand({ FunctionName: 'get-fn' }));
    expect(res.Configuration?.FunctionName).toBe('get-fn');
    expect(res.Configuration?.State).toBe('Active');
    expect(res.Code?.Location).toBeTruthy();
  });

  it('GetFunctionCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'sign-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'sign-get-fn' },
    );
    const res = await lambda.send(
      new GetFunctionCodeSigningConfigCommand({ FunctionName: 'sign-get-fn' }),
    );
    expect(res.CodeSigningConfigArn ?? '').toBe('');
  });

  it('GetFunctionConcurrency', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'concurrency-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'concurrency-get-fn' },
    );
    await lambda.send(
      new PutFunctionConcurrencyCommand({
        FunctionName: 'concurrency-get-fn',
        ReservedConcurrentExecutions: 3,
      }),
    );
    const res = await lambda.send(
      new GetFunctionConcurrencyCommand({ FunctionName: 'concurrency-get-fn' }),
    );
    expect(res.ReservedConcurrentExecutions).toBe(3);
  });

  it('GetFunctionConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'config-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        MemorySize: 256,
        Timeout: 10,
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'config-fn' },
    );
    const res = await lambda.send(
      new GetFunctionConfigurationCommand({ FunctionName: 'config-fn' }),
    );
    expect(res.MemorySize).toBe(256);
    expect(res.Timeout).toBe(10);
  });

  it('GetFunctionEventInvokeConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'invoke-config-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'invoke-config-get-fn' },
    );
    await lambda.send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: 'invoke-config-get-fn',
        MaximumRetryAttempts: 1,
        MaximumEventAgeInSeconds: 600,
      }),
    );
    const res = await lambda.send(
      new GetFunctionEventInvokeConfigCommand({ FunctionName: 'invoke-config-get-fn' }),
    );
    expect(res.MaximumRetryAttempts).toBe(1);
    expect(res.MaximumEventAgeInSeconds).toBe(600);
  });

  it('GetFunctionRecursionConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'recursion-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'recursion-get-fn' },
    );
    const res = await lambda.send(
      new GetFunctionRecursionConfigCommand({ FunctionName: 'recursion-get-fn' }),
    );
    expect(res.RecursiveLoop).toBe('Terminate');
  });

  it.skip('GetFunctionScalingConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { CapacityProvider } = await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'scaling-get-fn-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: { CapacityProviderOperatorRoleArn: Role?.Arn },
      }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'scaling-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CapacityProviderConfig: {
          LambdaManagedInstancesCapacityProviderConfig: {
            CapacityProviderArn: CapacityProvider?.CapacityProviderArn,
          },
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'scaling-get-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'scaling-get-fn' }));
    const res = await lambda.send(
      new GetFunctionScalingConfigCommand({ FunctionName: 'scaling-get-fn', Qualifier: '1' }),
    );
    expect(res.FunctionArn).toContain(':function:scaling-get-fn');
  });

  it('GetFunctionUrlConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'url-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'url-get-fn' },
    );
    await lambda.send(
      new CreateFunctionUrlConfigCommand({ FunctionName: 'url-get-fn', AuthType: 'AWS_IAM' }),
    );
    const res = await lambda.send(new GetFunctionUrlConfigCommand({ FunctionName: 'url-get-fn' }));
    expect(res.AuthType).toBe('AWS_IAM');
  });

  it('GetLayerVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'get-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    const res = await lambda.send(
      new GetLayerVersionCommand({ LayerName: 'get-layer', VersionNumber: layer.Version }),
    );
    expect(res.CompatibleRuntimes).toEqual(['nodejs22.x']);
  });

  it('GetLayerVersionByArn', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'by-arn-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    const res = await lambda.send(new GetLayerVersionByArnCommand({ Arn: layer.LayerVersionArn }));
    expect(res.Version).toBe(layer.Version);
  });

  it('GetLayerVersionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'policy-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    await lambda.send(
      new AddLayerVersionPermissionCommand({
        LayerName: 'policy-layer',
        VersionNumber: layer.Version,
        StatementId: 'share',
        Action: 'lambda:GetLayerVersion',
        Principal: '*',
      }),
    );
    const res = await lambda.send(
      new GetLayerVersionPolicyCommand({ LayerName: 'policy-layer', VersionNumber: layer.Version }),
    );
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Sid).toBe('share');
  });

  it('GetPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'policy-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'policy-fn' },
    );
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: 'policy-fn',
        StatementId: 'allow-sns',
        Action: 'lambda:InvokeFunction',
        Principal: 'sns.amazonaws.com',
      }),
    );
    const res = await lambda.send(new GetPolicyCommand({ FunctionName: 'policy-fn' }));
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Sid).toBe('allow-sns');
  });

  it('GetProvisionedConcurrencyConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'provision-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'provision-get-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'provision-get-fn' }));
    await lambda.send(
      new PutProvisionedConcurrencyConfigCommand({
        FunctionName: 'provision-get-fn',
        Qualifier: '1',
        ProvisionedConcurrentExecutions: 2,
      }),
    );
    const res = await lambda.send(
      new GetProvisionedConcurrencyConfigCommand({
        FunctionName: 'provision-get-fn',
        Qualifier: '1',
      }),
    );
    expect(res.RequestedProvisionedConcurrentExecutions).toBe(2);
  });

  it('GetResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'get-rp-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'get-rp-fn' },
    );
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: 'get-rp-fn' }),
    );
    await lambda.send(
      new PutResourcePolicyCommand({
        ResourceArn: Configuration?.FunctionArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'cross-account',
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'lambda:InvokeFunction',
              Resource: Configuration?.FunctionArn,
            },
          ],
        }),
      }),
    );
    const res = await lambda.send(
      new GetResourcePolicyCommand({ ResourceArn: Configuration?.FunctionArn }),
    );
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Sid).toBe('cross-account');
  });

  it('GetRuntimeManagementConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'runtime-get-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'runtime-get-fn' },
    );
    const res = await lambda.send(
      new GetRuntimeManagementConfigCommand({ FunctionName: 'runtime-get-fn' }),
    );
    expect(res.UpdateRuntimeOn).toBe('Auto');
  });

  it('Invoke', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'invoke-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'invoke-fn' },
    );
    const res = await lambda.send(
      new InvokeCommand({ FunctionName: 'invoke-fn', Payload: Buffer.from('{"hello":"world"}') }),
    );
    expect(res.StatusCode).toBe(200);
    expect(res.FunctionError).toBeUndefined();
    expect(JSON.parse(Buffer.from(res.Payload ?? []).toString())).toEqual({
      statusCode: 200,
      body: '{"hello":"world"}',
    });
  });

  it('InvokeAsync', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'invoke-async-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'invoke-async-fn' },
    );
    const res = await lambda.send(
      new InvokeAsyncCommand({ FunctionName: 'invoke-async-fn', InvokeArgs: Buffer.from('{}') }),
    );
    expect(res.Status).toBe(202);
  });

  it('InvokeWithResponseStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'stream-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'stream-fn' },
    );
    const res = await lambda.send(
      new InvokeWithResponseStreamCommand({
        FunctionName: 'stream-fn',
        Payload: Buffer.from('{"n":1}'),
      }),
    );
    expect(res.StatusCode).toBe(200);
    const chunks = [];
    for await (const event of res.EventStream ?? []) {
      if (event.PayloadChunk?.Payload) {
        chunks.push(Buffer.from(event.PayloadChunk.Payload));
      }
    }
    expect(JSON.parse(Buffer.concat(chunks).toString()).body).toBe('{"n":1}');
  });

  it('ListAliases', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-alias-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-alias-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'list-alias-fn' }));
    await lambda.send(
      new CreateAliasCommand({ FunctionName: 'list-alias-fn', Name: 'blue', FunctionVersion: '1' }),
    );
    await lambda.send(
      new CreateAliasCommand({
        FunctionName: 'list-alias-fn',
        Name: 'green',
        FunctionVersion: '1',
      }),
    );
    const res = await lambda.send(new ListAliasesCommand({ FunctionName: 'list-alias-fn' }));
    expect(res.Aliases?.map((alias) => alias.Name).sort()).toEqual(['blue', 'green']);
  });

  it('ListCapacityProviders', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'listed-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    const res = await lambda.send(new ListCapacityProvidersCommand({}));
    expect(res.CapacityProviders).toHaveLength(1);
  });

  it('ListCodeSigningConfigs', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    const res = await lambda.send(new ListCodeSigningConfigsCommand({}));
    expect(res.CodeSigningConfigs).toHaveLength(1);
  });

  it('ListDurableExecutionsByFunction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'durable-list-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'durable-list-fn' },
    );
    const res = await lambda.send(
      new ListDurableExecutionsByFunctionCommand({ FunctionName: 'durable-list-fn' }),
    );
    expect(res.DurableExecutions ?? []).toHaveLength(0);
  });

  it('ListEventSourceMappings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'list-esm-queue' }));
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-esm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-esm-fn' },
    );
    await lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: 'list-esm-fn',
        EventSourceArn: attrs.Attributes?.QueueArn,
      }),
    );
    const res = await lambda.send(
      new ListEventSourceMappingsCommand({ FunctionName: 'list-esm-fn' }),
    );
    expect(res.EventSourceMappings).toHaveLength(1);
  });

  it('ListFunctionEventInvokeConfigs', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-invoke-config-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-invoke-config-fn' },
    );
    await lambda.send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: 'list-invoke-config-fn',
        MaximumRetryAttempts: 0,
      }),
    );
    const res = await lambda.send(
      new ListFunctionEventInvokeConfigsCommand({ FunctionName: 'list-invoke-config-fn' }),
    );
    expect(res.FunctionEventInvokeConfigs).toHaveLength(1);
  });

  it('ListFunctionUrlConfigs', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-url-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-url-fn' },
    );
    await lambda.send(
      new CreateFunctionUrlConfigCommand({ FunctionName: 'list-url-fn', AuthType: 'NONE' }),
    );
    const res = await lambda.send(
      new ListFunctionUrlConfigsCommand({ FunctionName: 'list-url-fn' }),
    );
    expect(res.FunctionUrlConfigs).toHaveLength(1);
  });

  it('ListFunctionVersionsByCapacityProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'versions-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    const res = await lambda.send(
      new ListFunctionVersionsByCapacityProviderCommand({
        CapacityProviderName: 'versions-capacity',
      }),
    );
    expect(res.FunctionVersions ?? []).toHaveLength(0);
  });

  it('ListFunctions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-fn-a',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-fn-a' },
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-fn-b',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-fn-b' },
    );
    const res = await lambda.send(new ListFunctionsCommand({}));
    expect(res.Functions?.map((fn) => fn.FunctionName).sort()).toEqual(['list-fn-a', 'list-fn-b']);
  });

  it('ListFunctionsByCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'by-csc-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'by-csc-fn' },
    );
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    await lambda.send(
      new PutFunctionCodeSigningConfigCommand({
        FunctionName: 'by-csc-fn',
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    const res = await lambda.send(
      new ListFunctionsByCodeSigningConfigCommand({
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    expect(res.FunctionArns?.[0]).toMatch(/:function:by-csc-fn$/);
  });

  it('ListLayerVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'versions-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'versions-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    const res = await lambda.send(new ListLayerVersionsCommand({ LayerName: 'versions-layer' }));
    expect(res.LayerVersions).toHaveLength(2);
    expect(layer.Version).toBe(1);
  });

  it('ListLayers', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'listed-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    const res = await lambda.send(new ListLayersCommand({}));
    expect(res.Layers?.[0]?.LayerName).toBe('listed-layer');
    expect(res.Layers?.[0]?.LatestMatchingVersion?.Version).toBe(layer.Version);
  });

  it('ListProvisionedConcurrencyConfigs', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-provision-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-provision-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'list-provision-fn' }));
    await lambda.send(
      new PutProvisionedConcurrencyConfigCommand({
        FunctionName: 'list-provision-fn',
        Qualifier: '1',
        ProvisionedConcurrentExecutions: 1,
      }),
    );
    const res = await lambda.send(
      new ListProvisionedConcurrencyConfigsCommand({ FunctionName: 'list-provision-fn' }),
    );
    expect(res.ProvisionedConcurrencyConfigs).toHaveLength(1);
  });

  it('ListTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'list-tags-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        Tags: { team: 'core' },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'list-tags-fn' },
    );
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: 'list-tags-fn' }),
    );
    const res = await lambda.send(new ListTagsCommand({ Resource: Configuration?.FunctionArn }));
    expect(res.Tags).toEqual({ team: 'core' });
  });

  it('ListVersionsByFunction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'versions-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'versions-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'versions-fn' }));
    const res = await lambda.send(
      new ListVersionsByFunctionCommand({ FunctionName: 'versions-fn' }),
    );
    expect(res.Versions?.map((version) => version.Version)).toEqual(['$LATEST', '1']);
  });

  it('PublishLayerVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const res = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'published-layer',
        Description: 'shared code',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    expect(res.Version).toBe(1);
    expect(res.LayerVersionArn).toMatch(/:layer:published-layer:1$/);
  });

  it('PublishVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'publish-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'publish-fn' },
    );
    const res = await lambda.send(
      new PublishVersionCommand({ FunctionName: 'publish-fn', Description: 'first release' }),
    );
    expect(res.Version).toBe('1');
    expect(res.Description).toBe('first release');
  });

  it('PutFunctionCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'sign-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'sign-put-fn' },
    );
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    const res = await lambda.send(
      new PutFunctionCodeSigningConfigCommand({
        FunctionName: 'sign-put-fn',
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
      }),
    );
    expect(res.CodeSigningConfigArn).toBe(CodeSigningConfig?.CodeSigningConfigArn);
  });

  it('PutFunctionConcurrency', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'concurrency-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'concurrency-put-fn' },
    );
    const res = await lambda.send(
      new PutFunctionConcurrencyCommand({
        FunctionName: 'concurrency-put-fn',
        ReservedConcurrentExecutions: 7,
      }),
    );
    expect(res.ReservedConcurrentExecutions).toBe(7);
  });

  it('PutFunctionEventInvokeConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'invoke-config-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'invoke-config-put-fn' },
    );
    const res = await lambda.send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: 'invoke-config-put-fn',
        MaximumRetryAttempts: 2,
      }),
    );
    expect(res.MaximumRetryAttempts).toBe(2);
  });

  it('PutFunctionRecursionConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'recursion-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'recursion-put-fn' },
    );
    const res = await lambda.send(
      new PutFunctionRecursionConfigCommand({
        FunctionName: 'recursion-put-fn',
        RecursiveLoop: 'Allow',
      }),
    );
    expect(res.RecursiveLoop).toBe('Allow');
  });

  it.skip('PutFunctionScalingConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { CapacityProvider } = await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'scaling-put-fn-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: { CapacityProviderOperatorRoleArn: Role?.Arn },
      }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'scaling-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CapacityProviderConfig: {
          LambdaManagedInstancesCapacityProviderConfig: {
            CapacityProviderArn: CapacityProvider?.CapacityProviderArn,
          },
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'scaling-put-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'scaling-put-fn' }));
    const res = await lambda.send(
      new PutFunctionScalingConfigCommand({
        FunctionName: 'scaling-put-fn',
        Qualifier: '1',
        FunctionScalingConfig: { MinExecutionEnvironments: 1, MaxExecutionEnvironments: 2 },
      }),
    );
    expect(res.FunctionState).toBeTruthy();
  });

  it('PutProvisionedConcurrencyConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'provision-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'provision-put-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'provision-put-fn' }));
    const res = await lambda.send(
      new PutProvisionedConcurrencyConfigCommand({
        FunctionName: 'provision-put-fn',
        Qualifier: '1',
        ProvisionedConcurrentExecutions: 3,
      }),
    );
    expect(res.RequestedProvisionedConcurrentExecutions).toBe(3);
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'put-rp-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'put-rp-fn' },
    );
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: 'put-rp-fn' }),
    );
    const res = await lambda.send(
      new PutResourcePolicyCommand({
        ResourceArn: Configuration?.FunctionArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'cross-account',
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'lambda:InvokeFunction',
              Resource: Configuration?.FunctionArn,
            },
          ],
        }),
      }),
    );
    expect(res.RevisionId).toBeTruthy();
  });

  it('PutRuntimeManagementConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'runtime-put-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'runtime-put-fn' },
    );
    const res = await lambda.send(
      new PutRuntimeManagementConfigCommand({
        FunctionName: 'runtime-put-fn',
        UpdateRuntimeOn: 'FunctionUpdate',
      }),
    );
    expect(res.UpdateRuntimeOn).toBe('FunctionUpdate');
  });

  it('RemoveLayerVersionPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const layer = await lambda.send(
      new PublishLayerVersionCommand({
        LayerName: 'unperm-layer',
        Content: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        CompatibleRuntimes: ['nodejs22.x'],
      }),
    );
    await lambda.send(
      new AddLayerVersionPermissionCommand({
        LayerName: 'unperm-layer',
        VersionNumber: layer.Version,
        StatementId: 'share',
        Action: 'lambda:GetLayerVersion',
        Principal: '*',
      }),
    );
    await lambda.send(
      new RemoveLayerVersionPermissionCommand({
        LayerName: 'unperm-layer',
        VersionNumber: layer.Version,
        StatementId: 'share',
      }),
    );
    await expect(
      lambda.send(
        new GetLayerVersionPolicyCommand({
          LayerName: 'unperm-layer',
          VersionNumber: layer.Version,
        }),
      ),
    ).rejects.toThrow();
  });

  it('RemovePermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'unperm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'unperm-fn' },
    );
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: 'unperm-fn',
        StatementId: 'temp',
        Action: 'lambda:InvokeFunction',
        Principal: 'sns.amazonaws.com',
      }),
    );
    await lambda.send(
      new RemovePermissionCommand({ FunctionName: 'unperm-fn', StatementId: 'temp' }),
    );
    await expect(
      lambda.send(new GetPolicyCommand({ FunctionName: 'unperm-fn' })),
    ).rejects.toThrow();
  });

  it.skip('SendDurableExecutionCallbackFailure', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(new SendDurableExecutionCallbackFailureCommand({ CallbackId: 'Y2FsbGJhY2s=' })),
    ).resolves.toBeDefined();
  });

  it.skip('SendDurableExecutionCallbackHeartbeat', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(new SendDurableExecutionCallbackHeartbeatCommand({ CallbackId: 'Y2FsbGJhY2s=' })),
    ).resolves.toBeDefined();
  });

  it.skip('SendDurableExecutionCallbackSuccess', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(new SendDurableExecutionCallbackSuccessCommand({ CallbackId: 'Y2FsbGJhY2s=' })),
    ).resolves.toBeDefined();
  });

  it('StopDurableExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await expect(
      lambda.send(
        new StopDurableExecutionCommand({
          DurableExecutionArn:
            'arn:aws:lambda:us-east-1:000000000000:function:durable-fn:$LATEST/durable-execution/run-1/00000000-0000-0000-0000-000000000000',
        }),
      ),
    ).rejects.toThrow(/not found|does not exist/i);
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'tag-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'tag-fn' },
    );
    const { Configuration } = await lambda.send(new GetFunctionCommand({ FunctionName: 'tag-fn' }));
    await lambda.send(
      new TagResourceCommand({ Resource: Configuration?.FunctionArn, Tags: { env: 'test' } }),
    );
    const res = await lambda.send(new ListTagsCommand({ Resource: Configuration?.FunctionArn }));
    expect(res.Tags).toEqual({ env: 'test' });
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'untag-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
        Tags: { env: 'test', team: 'core' },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'untag-fn' },
    );
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: 'untag-fn' }),
    );
    await lambda.send(
      new UntagResourceCommand({ Resource: Configuration?.FunctionArn, TagKeys: ['env'] }),
    );
    const res = await lambda.send(new ListTagsCommand({ Resource: Configuration?.FunctionArn }));
    expect(res.Tags).toEqual({ team: 'core' });
  });

  it('UpdateAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'update-alias-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'update-alias-fn' },
    );
    await lambda.send(new PublishVersionCommand({ FunctionName: 'update-alias-fn' }));
    await lambda.send(
      new CreateAliasCommand({
        FunctionName: 'update-alias-fn',
        Name: 'live',
        FunctionVersion: '1',
      }),
    );
    const res = await lambda.send(
      new UpdateAliasCommand({
        FunctionName: 'update-alias-fn',
        Name: 'live',
        Description: 'production traffic',
      }),
    );
    expect(res.Description).toBe('production traffic');
  });

  it('UpdateCapacityProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'capacity-operator',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'lambda.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await lambda.send(
      new CreateCapacityProviderCommand({
        CapacityProviderName: 'update-capacity',
        VpcConfig: {
          SubnetIds: ['subnet-0123456789abcdef0'],
          SecurityGroupIds: ['sg-0123456789abcdef0'],
        },
        PermissionsConfig: {
          CapacityProviderOperatorRoleArn: Role?.Arn,
        },
      }),
    );
    const res = await lambda.send(
      new UpdateCapacityProviderCommand({
        CapacityProviderName: 'update-capacity',
        CapacityProviderScalingConfig: { MaxVCpuCount: 12, ScalingMode: 'Auto' },
      }),
    );
    expect(res.CapacityProvider?.CapacityProviderScalingConfig?.MaxVCpuCount).toBe(12);
  });

  it('UpdateCodeSigningConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const { CodeSigningConfig } = await lambda.send(
      new CreateCodeSigningConfigCommand({
        AllowedPublishers: {
          SigningProfileVersionArns: [
            'arn:aws:signer:us-east-1:000000000000:/signing-profiles/my-profile/abcdef1234',
          ],
        },
      }),
    );
    const res = await lambda.send(
      new UpdateCodeSigningConfigCommand({
        CodeSigningConfigArn: CodeSigningConfig?.CodeSigningConfigArn,
        Description: 'updated',
      }),
    );
    expect(res.CodeSigningConfig?.Description).toBe('updated');
  });

  it('UpdateEventSourceMapping', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'update-esm-queue' }));
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'update-esm-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'update-esm-fn' },
    );
    const { UUID } = await lambda.send(
      new CreateEventSourceMappingCommand({
        FunctionName: 'update-esm-fn',
        EventSourceArn: attrs.Attributes?.QueueArn,
        BatchSize: 1,
      }),
    );
    await expect
      .poll(async () => (await lambda.send(new GetEventSourceMappingCommand({ UUID }))).State, {
        timeout: 10_000,
      })
      .toBe('Enabled');
    const res = await lambda.send(new UpdateEventSourceMappingCommand({ UUID, BatchSize: 8 }));
    expect(res.BatchSize).toBe(8);
  });

  it('UpdateFunctionCode', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'update-code-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'update-code-fn' },
    );
    const res = await lambda.send(
      new UpdateFunctionCodeCommand({
        FunctionName: 'update-code-fn',
        ZipFile: Buffer.from(
          'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
          'base64',
        ),
        Publish: true,
      }),
    );
    expect(res.Version).toBe('1');
  });

  it('UpdateFunctionConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'update-config-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'update-config-fn' },
    );
    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: 'update-config-fn',
        MemorySize: 512,
        Environment: { Variables: { MODE: 'fast' } },
      }),
    );
    await waitUntilFunctionUpdatedV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'update-config-fn' },
    );
    const res = await lambda.send(
      new GetFunctionConfigurationCommand({ FunctionName: 'update-config-fn' }),
    );
    expect(res.MemorySize).toBe(512);
    expect(res.Environment?.Variables).toEqual({ MODE: 'fast' });
  });

  it('UpdateFunctionEventInvokeConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'invoke-config-update-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'invoke-config-update-fn' },
    );
    await lambda.send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: 'invoke-config-update-fn',
        MaximumRetryAttempts: 2,
      }),
    );
    const res = await lambda.send(
      new UpdateFunctionEventInvokeConfigCommand({
        FunctionName: 'invoke-config-update-fn',
        MaximumEventAgeInSeconds: 120,
      }),
    );
    expect(res.MaximumEventAgeInSeconds).toBe(120);
    expect(res.MaximumRetryAttempts).toBe(2);
  });

  it('UpdateFunctionUrlConfig', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const lambda = new LambdaClient(aws.clientConfig());
    await lambda.send(
      new CreateFunctionCommand({
        FunctionName: 'url-update-fn',
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: 'arn:aws:iam::000000000000:role/lambda-role',
        Code: {
          ZipFile: Buffer.from(
            'UEsDBBQAAAAAAAAAIVDnHYG6XAAAAFwAAAAJAAAAaW5kZXgubWpzZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+ICh7IHN0YXR1c0NvZGU6IDIwMCwgYm9keTogSlNPTi5zdHJpbmdpZnkoZXZlbnQpIH0pOwpQSwECFAMUAAAAAAAAACFQ5x2BulwAAABcAAAACQAAAAAAAAAAAAAAgAEAAAAAaW5kZXgubWpzUEsFBgAAAAABAAEANwAAAIMAAAAAAA==',
            'base64',
          ),
        },
      }),
    );
    await waitUntilFunctionActiveV2(
      { client: lambda, maxWaitTime: 30, minDelay: 1 },
      { FunctionName: 'url-update-fn' },
    );
    await lambda.send(
      new CreateFunctionUrlConfigCommand({ FunctionName: 'url-update-fn', AuthType: 'NONE' }),
    );
    const res = await lambda.send(
      new UpdateFunctionUrlConfigCommand({
        FunctionName: 'url-update-fn',
        Cors: { AllowOrigins: ['https://example.com'] },
      }),
    );
    expect(res.Cors?.AllowOrigins).toEqual(['https://example.com']);
  });
});
