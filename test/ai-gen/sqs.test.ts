import {
  AddPermissionCommand,
  CancelMessageMoveTaskCommand,
  ChangeMessageVisibilityBatchCommand,
  ChangeMessageVisibilityCommand,
  CreateQueueCommand,
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  DeleteQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  ListDeadLetterSourceQueuesCommand,
  ListMessageMoveTasksCommand,
  ListQueuesCommand,
  ListQueueTagsCommand,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  RemovePermissionCommand,
  SendMessageBatchCommand,
  SendMessageCommand,
  SetQueueAttributesCommand,
  SQSClient,
  StartMessageMoveTaskCommand,
  TagQueueCommand,
  UntagQueueCommand,
} from '@aws-sdk/client-sqs';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('sqs', () => {
  it('AddPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'perm-queue' }));
    await sqs.send(
      new AddPermissionCommand({
        QueueUrl,
        Label: 'allow-send',
        AWSAccountIds: ['111111111111'],
        Actions: ['SendMessage'],
      }),
    );
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ['Policy'] }),
    );
    expect(JSON.parse(Attributes?.Policy ?? '{}').Statement[0].Sid).toBe('allow-send');
  });

  it('CancelMessageMoveTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const dlq = await sqs.send(new CreateQueueCommand({ QueueName: 'cancel-dlq' }));
    const dlqAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: dlq.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const source = await sqs.send(
      new CreateQueueCommand({
        QueueName: 'cancel-source',
        Attributes: {
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: dlqAttrs.Attributes?.QueueArn,
            maxReceiveCount: 1,
          }),
        },
      }),
    );
    expect(source.QueueUrl).toBeTruthy();
    const { TaskHandle } = await sqs.send(
      new StartMessageMoveTaskCommand({ SourceArn: dlqAttrs.Attributes?.QueueArn }),
    );
    await expect(sqs.send(new CancelMessageMoveTaskCommand({ TaskHandle }))).resolves.toBeDefined();
  });

  it('ChangeMessageVisibility', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'visibility-queue' }));
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'hello' }));
    const { Messages } = await sqs.send(new ReceiveMessageCommand({ QueueUrl }));
    await sqs.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl,
        ReceiptHandle: Messages?.[0]?.ReceiptHandle,
        VisibilityTimeout: 0,
      }),
    );
    const again = await sqs.send(new ReceiveMessageCommand({ QueueUrl }));
    expect(again.Messages?.[0]?.Body).toBe('hello');
  });

  it('ChangeMessageVisibilityBatch', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'visibility-batch-queue' }),
    );
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'hello' }));
    const { Messages } = await sqs.send(new ReceiveMessageCommand({ QueueUrl }));
    const res = await sqs.send(
      new ChangeMessageVisibilityBatchCommand({
        QueueUrl,
        Entries: [{ Id: 'm1', ReceiptHandle: Messages?.[0]?.ReceiptHandle, VisibilityTimeout: 0 }],
      }),
    );
    expect(res.Successful?.map((entry) => entry.Id)).toEqual(['m1']);
  });

  it('CreateQueue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const res = await sqs.send(
      new CreateQueueCommand({
        QueueName: 'orders.fifo',
        Attributes: { FifoQueue: 'true', ContentBasedDeduplication: 'true' },
      }),
    );
    expect(res.QueueUrl).toMatch(/orders\.fifo$/);
  });

  it('DeleteMessage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'delete-message-queue' }),
    );
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'bye' }));
    const { Messages } = await sqs.send(new ReceiveMessageCommand({ QueueUrl }));
    await sqs.send(
      new DeleteMessageCommand({ QueueUrl, ReceiptHandle: Messages?.[0]?.ReceiptHandle }),
    );
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl,
        AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible'],
      }),
    );
    expect(Attributes?.ApproximateNumberOfMessages).toBe('0');
    expect(Attributes?.ApproximateNumberOfMessagesNotVisible).toBe('0');
  });

  it('DeleteMessageBatch', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'delete-batch-queue' }),
    );
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'a' }));
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'b' }));
    const { Messages } = await sqs.send(
      new ReceiveMessageCommand({ QueueUrl, MaxNumberOfMessages: 10 }),
    );
    const res = await sqs.send(
      new DeleteMessageBatchCommand({
        QueueUrl,
        Entries: (Messages ?? []).map((message, index) => ({
          Id: `m${index}`,
          ReceiptHandle: message.ReceiptHandle,
        })),
      }),
    );
    expect(res.Successful).toHaveLength(2);
  });

  it('DeleteQueue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'doomed-queue' }));
    await sqs.send(new DeleteQueueCommand({ QueueUrl }));
    await expect(sqs.send(new GetQueueUrlCommand({ QueueName: 'doomed-queue' }))).rejects.toThrow();
  });

  it('GetQueueAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'attrs-queue', Attributes: { DelaySeconds: '5' } }),
    );
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ['All'] }),
    );
    expect(Attributes?.DelaySeconds).toBe('5');
    expect(Attributes?.QueueArn).toMatch(/:attrs-queue$/);
  });

  it('GetQueueUrl', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const created = await sqs.send(new CreateQueueCommand({ QueueName: 'lookup-queue' }));
    const res = await sqs.send(new GetQueueUrlCommand({ QueueName: 'lookup-queue' }));
    expect(res.QueueUrl).toBe(created.QueueUrl);
  });

  it('ListDeadLetterSourceQueues', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const dlq = await sqs.send(new CreateQueueCommand({ QueueName: 'dlq' }));
    const dlqAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: dlq.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const source = await sqs.send(
      new CreateQueueCommand({
        QueueName: 'dlq-source',
        Attributes: {
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: dlqAttrs.Attributes?.QueueArn,
            maxReceiveCount: 3,
          }),
        },
      }),
    );
    const res = await sqs.send(new ListDeadLetterSourceQueuesCommand({ QueueUrl: dlq.QueueUrl }));
    expect(res.queueUrls).toEqual([source.QueueUrl]);
  });

  it('ListMessageMoveTasks', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const dlq = await sqs.send(new CreateQueueCommand({ QueueName: 'move-dlq' }));
    const dlqAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: dlq.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await sqs.send(
      new CreateQueueCommand({
        QueueName: 'move-source',
        Attributes: {
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: dlqAttrs.Attributes?.QueueArn,
            maxReceiveCount: 1,
          }),
        },
      }),
    );
    await sqs.send(new StartMessageMoveTaskCommand({ SourceArn: dlqAttrs.Attributes?.QueueArn }));
    const res = await sqs.send(
      new ListMessageMoveTasksCommand({ SourceArn: dlqAttrs.Attributes?.QueueArn }),
    );
    expect(res.Results?.length).toBeGreaterThan(0);
  });

  it('ListQueues', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    await sqs.send(new CreateQueueCommand({ QueueName: 'list-a' }));
    await sqs.send(new CreateQueueCommand({ QueueName: 'list-b' }));
    await sqs.send(new CreateQueueCommand({ QueueName: 'other' }));
    const res = await sqs.send(new ListQueuesCommand({ QueueNamePrefix: 'list-' }));
    expect(res.QueueUrls).toHaveLength(2);
  });

  it('ListQueueTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'tagged-queue', tags: { team: 'core' } }),
    );
    const res = await sqs.send(new ListQueueTagsCommand({ QueueUrl }));
    expect(res.Tags).toEqual({ team: 'core' });
  });

  it('PurgeQueue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'purge-queue' }));
    await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'x' }));
    await sqs.send(new PurgeQueueCommand({ QueueUrl }));
    const res = await sqs.send(new ReceiveMessageCommand({ QueueUrl }));
    expect(res.Messages ?? []).toHaveLength(0);
  });

  it('ReceiveMessage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'receive-queue' }));
    await sqs.send(
      new SendMessageCommand({
        QueueUrl,
        MessageBody: 'payload',
        MessageAttributes: { kind: { DataType: 'String', StringValue: 'greeting' } },
      }),
    );
    const res = await sqs.send(
      new ReceiveMessageCommand({ QueueUrl, MessageAttributeNames: ['All'] }),
    );
    expect(res.Messages?.[0]?.Body).toBe('payload');
    expect(res.Messages?.[0]?.MessageAttributes?.kind?.StringValue).toBe('greeting');
  });

  it('RemovePermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'remove-perm-queue' }));
    await sqs.send(
      new AddPermissionCommand({
        QueueUrl,
        Label: 'temp',
        AWSAccountIds: ['111111111111'],
        Actions: ['SendMessage'],
      }),
    );
    await sqs.send(new RemovePermissionCommand({ QueueUrl, Label: 'temp' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ['Policy'] }),
    );
    expect(Attributes?.Policy ?? '').not.toContain('temp');
  });

  it('SendMessage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'send-queue' }));
    const res = await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: 'hello' }));
    expect(res.MessageId).toBeTruthy();
    expect(res.MD5OfMessageBody).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('SendMessageBatch', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'send-batch-queue' }));
    const res = await sqs.send(
      new SendMessageBatchCommand({
        QueueUrl,
        Entries: [
          { Id: 'one', MessageBody: '1' },
          { Id: 'two', MessageBody: '2' },
        ],
      }),
    );
    expect(res.Successful?.map((entry) => entry.Id).sort()).toEqual(['one', 'two']);
  });

  it('SetQueueAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'set-attrs-queue' }));
    await sqs.send(
      new SetQueueAttributesCommand({ QueueUrl, Attributes: { VisibilityTimeout: '45' } }),
    );
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ['VisibilityTimeout'] }),
    );
    expect(Attributes?.VisibilityTimeout).toBe('45');
  });

  it('StartMessageMoveTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const dlq = await sqs.send(new CreateQueueCommand({ QueueName: 'start-dlq' }));
    const dlqAttrs = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: dlq.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    await sqs.send(
      new CreateQueueCommand({
        QueueName: 'start-source',
        Attributes: {
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: dlqAttrs.Attributes?.QueueArn,
            maxReceiveCount: 1,
          }),
        },
      }),
    );
    const res = await sqs.send(
      new StartMessageMoveTaskCommand({ SourceArn: dlqAttrs.Attributes?.QueueArn }),
    );
    expect(res.TaskHandle).toBeTruthy();
  });

  it('TagQueue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: 'tag-queue' }));
    await sqs.send(new TagQueueCommand({ QueueUrl, Tags: { env: 'test' } }));
    const res = await sqs.send(new ListQueueTagsCommand({ QueueUrl }));
    expect(res.Tags).toEqual({ env: 'test' });
  });

  it('UntagQueue', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sqs = new SQSClient(aws.clientConfig());
    const { QueueUrl } = await sqs.send(
      new CreateQueueCommand({ QueueName: 'untag-queue', tags: { env: 'test', team: 'core' } }),
    );
    await sqs.send(new UntagQueueCommand({ QueueUrl, TagKeys: ['env'] }));
    const res = await sqs.send(new ListQueueTagsCommand({ QueueUrl }));
    expect(res.Tags).toEqual({ team: 'core' });
  });
});
