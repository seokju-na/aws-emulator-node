import {
  AddPermissionCommand,
  CheckIfPhoneNumberIsOptedOutCommand,
  ConfirmSubscriptionCommand,
  CreatePlatformApplicationCommand,
  CreatePlatformEndpointCommand,
  CreateSMSSandboxPhoneNumberCommand,
  CreateTopicCommand,
  DeleteEndpointCommand,
  DeletePlatformApplicationCommand,
  DeleteSMSSandboxPhoneNumberCommand,
  DeleteTopicCommand,
  GetDataProtectionPolicyCommand,
  GetEndpointAttributesCommand,
  GetPlatformApplicationAttributesCommand,
  GetSMSAttributesCommand,
  GetSMSSandboxAccountStatusCommand,
  GetSubscriptionAttributesCommand,
  GetTopicAttributesCommand,
  ListEndpointsByPlatformApplicationCommand,
  ListOriginationNumbersCommand,
  ListPhoneNumbersOptedOutCommand,
  ListPlatformApplicationsCommand,
  ListSMSSandboxPhoneNumbersCommand,
  ListSubscriptionsByTopicCommand,
  ListSubscriptionsCommand,
  ListTagsForResourceCommand,
  ListTopicsCommand,
  OptInPhoneNumberCommand,
  PublishBatchCommand,
  PublishCommand,
  PutDataProtectionPolicyCommand,
  RemovePermissionCommand,
  SetEndpointAttributesCommand,
  SetPlatformApplicationAttributesCommand,
  SetSMSAttributesCommand,
  SetSubscriptionAttributesCommand,
  SetTopicAttributesCommand,
  SNSClient,
  SubscribeCommand,
  TagResourceCommand,
  UnsubscribeCommand,
  UntagResourceCommand,
  VerifySMSSandboxPhoneNumberCommand,
} from '@aws-sdk/client-sns';
import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SetQueueAttributesCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('sns', () => {
  it('AddPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'perm-topic' }));
    await sns.send(
      new AddPermissionCommand({
        TopicArn,
        Label: 'allow-publish',
        AWSAccountId: ['111111111111'],
        ActionName: ['Publish'],
      }),
    );
    const { Attributes } = await sns.send(new GetTopicAttributesCommand({ TopicArn }));
    expect(Attributes?.Policy).toContain('allow-publish');
  });

  it('CheckIfPhoneNumberIsOptedOut', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(
      new CheckIfPhoneNumberIsOptedOutCommand({ phoneNumber: '+15555550100' }),
    );
    expect(res.isOptedOut).toBe(false);
  });

  it('ConfirmSubscription', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'confirm-topic' }));
    await expect(
      sns.send(new ConfirmSubscriptionCommand({ TopicArn, Token: 'invalid-token' })),
    ).rejects.toThrow();
  });

  it('CreatePlatformApplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'my-gcm-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    expect(res.PlatformApplicationArn).toContain('app/GCM/my-gcm-app');
  });

  it('CreatePlatformEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'endpoint-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    const res = await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-1',
      }),
    );
    expect(res.EndpointArn).toContain('endpoint/GCM/endpoint-app/');
  });

  it.skip('CreateSMSSandboxPhoneNumber', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(new CreateSMSSandboxPhoneNumberCommand({ PhoneNumber: '+15555550101' }));
    const res = await sns.send(new ListSMSSandboxPhoneNumbersCommand({}));
    expect(res.PhoneNumbers?.map((number) => number.PhoneNumber)).toContain('+15555550101');
  });

  it('CreateTopic', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(
      new CreateTopicCommand({
        Name: 'events.fifo',
        Attributes: { FifoTopic: 'true', ContentBasedDeduplication: 'true' },
      }),
    );
    expect(res.TopicArn).toMatch(/:events\.fifo$/);
  });

  it('DeleteEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'delete-endpoint-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    const { EndpointArn } = await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-2',
      }),
    );
    await sns.send(new DeleteEndpointCommand({ EndpointArn }));
    const res = await sns.send(
      new ListEndpointsByPlatformApplicationCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
      }),
    );
    expect(res.Endpoints ?? []).toHaveLength(0);
  });

  it('DeletePlatformApplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'doomed-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    await sns.send(
      new DeletePlatformApplicationCommand({ PlatformApplicationArn: app.PlatformApplicationArn }),
    );
    const res = await sns.send(new ListPlatformApplicationsCommand({}));
    expect(res.PlatformApplications ?? []).toHaveLength(0);
  });

  it.skip('DeleteSMSSandboxPhoneNumber', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(new CreateSMSSandboxPhoneNumberCommand({ PhoneNumber: '+15555550102' }));
    await sns.send(new DeleteSMSSandboxPhoneNumberCommand({ PhoneNumber: '+15555550102' }));
    const res = await sns.send(new ListSMSSandboxPhoneNumbersCommand({}));
    expect(res.PhoneNumbers ?? []).toHaveLength(0);
  });

  it('DeleteTopic', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'doomed-topic' }));
    await sns.send(new DeleteTopicCommand({ TopicArn }));
    const res = await sns.send(new ListTopicsCommand({}));
    expect(res.Topics ?? []).toHaveLength(0);
  });

  it('GetDataProtectionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'dpp-get-topic' }));
    const res = await sns.send(new GetDataProtectionPolicyCommand({ ResourceArn: TopicArn }));
    expect(res.DataProtectionPolicy ?? '').toBe('');
  });

  it('GetEndpointAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'endpoint-attrs-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    const { EndpointArn } = await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-3',
        CustomUserData: 'user-42',
      }),
    );
    const res = await sns.send(new GetEndpointAttributesCommand({ EndpointArn }));
    expect(res.Attributes?.Token).toBe('device-token-3');
    expect(res.Attributes?.CustomUserData).toBe('user-42');
  });

  it('GetPlatformApplicationAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'app-attrs',
        Platform: 'GCM',
        Attributes: {
          PlatformCredential: '{"type":"service_account","project_id":"demo"}',
          SuccessFeedbackSampleRate: '50',
        },
      }),
    );
    const res = await sns.send(
      new GetPlatformApplicationAttributesCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
      }),
    );
    expect(res.Attributes?.SuccessFeedbackSampleRate).toBe('50');
  });

  it('GetSMSAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(new GetSMSAttributesCommand({}));
    expect(res.attributes).toBeDefined();
  });

  it('GetSMSSandboxAccountStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(new GetSMSSandboxAccountStatusCommand({}));
    expect(typeof res.IsInSandbox).toBe('boolean');
  });

  it('GetSubscriptionAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'sub-attrs-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'sub-attrs-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { SubscriptionArn } = await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
        ReturnSubscriptionArn: true,
      }),
    );
    const res = await sns.send(new GetSubscriptionAttributesCommand({ SubscriptionArn }));
    expect(res.Attributes?.Protocol).toBe('sqs');
    expect(res.Attributes?.TopicArn).toBe(TopicArn);
  });

  it('GetTopicAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(
      new CreateTopicCommand({ Name: 'attrs-topic', Attributes: { DisplayName: 'Attrs' } }),
    );
    const res = await sns.send(new GetTopicAttributesCommand({ TopicArn }));
    expect(res.Attributes?.DisplayName).toBe('Attrs');
    expect(res.Attributes?.TopicArn).toBe(TopicArn);
  });

  it('ListEndpointsByPlatformApplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'list-endpoints-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-a',
      }),
    );
    await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-b',
      }),
    );
    const res = await sns.send(
      new ListEndpointsByPlatformApplicationCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
      }),
    );
    expect(res.Endpoints).toHaveLength(2);
  });

  it('ListOriginationNumbers', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(new ListOriginationNumbersCommand({}));
    expect(res.PhoneNumbers ?? []).toHaveLength(0);
  });

  it('ListPhoneNumbersOptedOut', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(new ListPhoneNumbersOptedOutCommand({}));
    expect(res.phoneNumbers ?? []).toHaveLength(0);
  });

  it('ListPlatformApplications', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'listed-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    const res = await sns.send(new ListPlatformApplicationsCommand({}));
    expect(res.PlatformApplications?.[0]?.PlatformApplicationArn).toContain('listed-app');
  });

  it('ListSMSSandboxPhoneNumbers', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const res = await sns.send(new ListSMSSandboxPhoneNumbersCommand({}));
    expect(res.PhoneNumbers ?? []).toHaveLength(0);
  });

  it('ListSubscriptions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'list-subs-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'list-subs-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
      }),
    );
    const res = await sns.send(new ListSubscriptionsCommand({}));
    expect(res.Subscriptions?.[0]?.TopicArn).toBe(TopicArn);
  });

  it('ListSubscriptionsByTopic', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'by-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'by-topic-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
      }),
    );
    const res = await sns.send(new ListSubscriptionsByTopicCommand({ TopicArn }));
    expect(res.Subscriptions?.[0]?.Endpoint).toBe(queueAttrs.Attributes?.QueueArn);
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(
      new CreateTopicCommand({ Name: 'tags-topic', Tags: [{ Key: 'team', Value: 'core' }] }),
    );
    const res = await sns.send(new ListTagsForResourceCommand({ ResourceArn: TopicArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListTopics', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(new CreateTopicCommand({ Name: 'topic-a' }));
    await sns.send(new CreateTopicCommand({ Name: 'topic-b' }));
    const res = await sns.send(new ListTopicsCommand({}));
    expect(res.Topics).toHaveLength(2);
  });

  it('OptInPhoneNumber', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await expect(
      sns.send(new OptInPhoneNumberCommand({ phoneNumber: '+15555550103' })),
    ).resolves.toBeDefined();
  });

  it('Publish', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'publish-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'publish-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await sqs.send(
      new SetQueueAttributesCommand({
        QueueUrl: queue.QueueUrl,
        Attributes: {
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { Service: 'sns.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: queueAttrs.Attributes?.QueueArn,
                Condition: { ArnEquals: { 'aws:SourceArn': TopicArn } },
              },
            ],
          }),
        },
      }),
    );
    await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
        Attributes: { RawMessageDelivery: 'true' },
      }),
    );
    const res = await sns.send(new PublishCommand({ TopicArn, Message: 'hello subscribers' }));
    expect(res.MessageId).toBeTruthy();
    const received = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queue.QueueUrl }));
    expect(received.Messages?.[0]?.Body).toBe('hello subscribers');
  });

  it('PublishBatch', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'publish-batch-topic' }));
    const res = await sns.send(
      new PublishBatchCommand({
        TopicArn,
        PublishBatchRequestEntries: [
          { Id: 'one', Message: '1' },
          { Id: 'two', Message: '2' },
        ],
      }),
    );
    expect(res.Successful?.map((entry) => entry.Id).sort()).toEqual(['one', 'two']);
  });

  it.skip('PutDataProtectionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'dpp-put-topic' }));
    const policy = JSON.stringify({
      Name: 'basic',
      Description: 'deny email addresses',
      Version: '2021-06-01',
      Statement: [
        {
          Sid: 'deny-email',
          DataDirection: 'Inbound',
          Principal: ['*'],
          DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
          Operation: { Deny: {} },
        },
      ],
    });
    await sns.send(
      new PutDataProtectionPolicyCommand({ ResourceArn: TopicArn, DataProtectionPolicy: policy }),
    );
    const res = await sns.send(new GetDataProtectionPolicyCommand({ ResourceArn: TopicArn }));
    expect(JSON.parse(res.DataProtectionPolicy ?? '{}').Name).toBe('basic');
  });

  it('RemovePermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'remove-perm-topic' }));
    await sns.send(
      new AddPermissionCommand({
        TopicArn,
        Label: 'temp',
        AWSAccountId: ['111111111111'],
        ActionName: ['Publish'],
      }),
    );
    await sns.send(new RemovePermissionCommand({ TopicArn, Label: 'temp' }));
    const { Attributes } = await sns.send(new GetTopicAttributesCommand({ TopicArn }));
    expect(Attributes?.Policy ?? '').not.toContain('"temp"');
  });

  it('SetEndpointAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'set-endpoint-app',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    const { EndpointArn } = await sns.send(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Token: 'device-token-4',
      }),
    );
    await sns.send(
      new SetEndpointAttributesCommand({ EndpointArn, Attributes: { Enabled: 'false' } }),
    );
    const res = await sns.send(new GetEndpointAttributesCommand({ EndpointArn }));
    expect(res.Attributes?.Enabled).toBe('false');
  });

  it('SetPlatformApplicationAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const app = await sns.send(
      new CreatePlatformApplicationCommand({
        Name: 'set-app-attrs',
        Platform: 'GCM',
        Attributes: { PlatformCredential: '{"type":"service_account","project_id":"demo"}' },
      }),
    );
    await sns.send(
      new SetPlatformApplicationAttributesCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
        Attributes: { SuccessFeedbackSampleRate: '75' },
      }),
    );
    const res = await sns.send(
      new GetPlatformApplicationAttributesCommand({
        PlatformApplicationArn: app.PlatformApplicationArn,
      }),
    );
    expect(res.Attributes?.SuccessFeedbackSampleRate).toBe('75');
  });

  it('SetSMSAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(
      new SetSMSAttributesCommand({ attributes: { DefaultSMSType: 'Transactional' } }),
    );
    const res = await sns.send(new GetSMSAttributesCommand({ attributes: ['DefaultSMSType'] }));
    expect(res.attributes?.DefaultSMSType).toBe('Transactional');
  });

  it('SetSubscriptionAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'set-sub-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'set-sub-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { SubscriptionArn } = await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
        ReturnSubscriptionArn: true,
      }),
    );
    await sns.send(
      new SetSubscriptionAttributesCommand({
        SubscriptionArn,
        AttributeName: 'RawMessageDelivery',
        AttributeValue: 'true',
      }),
    );
    const res = await sns.send(new GetSubscriptionAttributesCommand({ SubscriptionArn }));
    expect(res.Attributes?.RawMessageDelivery).toBe('true');
  });

  it('SetTopicAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'set-attrs-topic' }));
    await sns.send(
      new SetTopicAttributesCommand({
        TopicArn,
        AttributeName: 'DisplayName',
        AttributeValue: 'Renamed',
      }),
    );
    const res = await sns.send(new GetTopicAttributesCommand({ TopicArn }));
    expect(res.Attributes?.DisplayName).toBe('Renamed');
  });

  it('Subscribe', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'subscribe-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'subscribe-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const res = await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
        ReturnSubscriptionArn: true,
      }),
    );
    expect(res.SubscriptionArn).toContain(`${TopicArn}:`);
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'tag-topic' }));
    await sns.send(
      new TagResourceCommand({ ResourceArn: TopicArn, Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await sns.send(new ListTagsForResourceCommand({ ResourceArn: TopicArn }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('Unsubscribe', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'unsubscribe-topic' }));
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'unsubscribe-queue' }));
    const queueAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { SubscriptionArn } = await sns.send(
      new SubscribeCommand({
        TopicArn,
        Protocol: 'sqs',
        Endpoint: queueAttrs.Attributes?.QueueArn,
        ReturnSubscriptionArn: true,
      }),
    );
    await sns.send(new UnsubscribeCommand({ SubscriptionArn }));
    const res = await sns.send(new ListSubscriptionsByTopicCommand({ TopicArn }));
    expect(res.Subscriptions ?? []).toHaveLength(0);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    const { TopicArn } = await sns.send(
      new CreateTopicCommand({
        Name: 'untag-topic',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await sns.send(new UntagResourceCommand({ ResourceArn: TopicArn, TagKeys: ['env'] }));
    const res = await sns.send(new ListTagsForResourceCommand({ ResourceArn: TopicArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it.skip('VerifySMSSandboxPhoneNumber', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sns = new SNSClient(aws.clientConfig());
    await sns.send(new CreateSMSSandboxPhoneNumberCommand({ PhoneNumber: '+15555550104' }));
    await expect(
      sns.send(
        new VerifySMSSandboxPhoneNumberCommand({
          PhoneNumber: '+15555550104',
          OneTimePassword: '000000',
        }),
      ),
    ).rejects.toThrow();
  });
});
