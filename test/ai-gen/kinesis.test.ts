import { Buffer } from 'node:buffer';
import { CreateRoleCommand, IAMClient, PutRolePolicyCommand } from '@aws-sdk/client-iam';
import {
  AddTagsToStreamCommand,
  CreateChannelCommand,
  CreateStreamCommand,
  DecreaseStreamRetentionPeriodCommand,
  DeleteChannelCommand,
  DeleteResourcePolicyCommand,
  DeleteStreamCommand,
  DeregisterStreamConsumerCommand,
  DescribeAccountSettingsCommand,
  DescribeChannelCommand,
  DescribeLimitsCommand,
  DescribeStreamCommand,
  DescribeStreamConsumerCommand,
  DescribeStreamSummaryCommand,
  DisableEnhancedMonitoringCommand,
  EnableEnhancedMonitoringCommand,
  GetRecordsCommand,
  GetResourcePolicyCommand,
  GetShardIteratorCommand,
  IncreaseStreamRetentionPeriodCommand,
  KinesisClient,
  ListChannelsCommand,
  ListShardsCommand,
  ListStreamConsumersCommand,
  ListStreamsCommand,
  ListTagsForResourceCommand,
  ListTagsForStreamCommand,
  MergeShardsCommand,
  PutRecordCommand,
  PutRecordsCommand,
  PutResourcePolicyCommand,
  RegisterStreamConsumerCommand,
  RemoveTagsFromStreamCommand,
  SplitShardCommand,
  StartStreamEncryptionCommand,
  StopStreamEncryptionCommand,
  SubscribeToShardCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateAccountSettingsCommand,
  UpdateChannelCommand,
  UpdateMaxRecordSizeCommand,
  UpdateShardCountCommand,
  UpdateStreamModeCommand,
  UpdateStreamRecordDistributionStrategyCommand,
  UpdateStreamWarmThroughputCommand,
  waitUntilStreamExists,
  waitUntilStreamNotExists,
} from '@aws-sdk/client-kinesis';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('kinesis', () => {
  it('AddTagsToStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'tags-add', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'tags-add' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'tags-add' }));
    await kinesis.send(
      new AddTagsToStreamCommand({ StreamName: 'tags-add', Tags: { env: 'test' } }),
    );
    const res = await kinesis.send(new ListTagsForStreamCommand({ StreamName: 'tags-add' }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('CreateChannel', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'channel-source',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'channel-source' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'channel-source' }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'created-channel-bucket' }));
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'created-channel-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'kinesis.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'created-channel-role',
        PolicyName: 'channel',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: ['kinesis:*', 's3:*'], Resource: '*' }],
        }),
      }),
    );
    const { ChannelDescription } = await kinesis.send(
      new CreateChannelCommand({
        ChannelName: 'created-channel',
        ServiceExecutionRoleARN: Role?.Arn,
        StreamConfigurationList: [
          {
            StreamARN: StreamDescriptionSummary?.StreamARN,
            RecordConfiguration: { RecordFormatType: 'JSON' },
          },
        ],
        S3DestinationConfiguration: {
          StorageConfiguration: {
            BucketARN: 'arn:aws:s3:::created-channel-bucket',
            ExpectedBucketOwner: '000000000000',
            CompressionType: 'GZIP',
          },
        },
      }),
    );
    const ChannelARN = ChannelDescription?.ChannelARN;
    expect(ChannelARN).toContain(':channel/created-channel');
  });

  it('CreateStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'created-stream', ShardCount: 2 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'created-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'created-stream' }),
    );
    expect(res.StreamDescriptionSummary?.StreamStatus).toBe('ACTIVE');
    expect(res.StreamDescriptionSummary?.OpenShardCount).toBe(2);
  });

  it('DecreaseStreamRetentionPeriod', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'retention-down', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'retention-down' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'retention-down' }));
    await kinesis.send(
      new IncreaseStreamRetentionPeriodCommand({
        StreamName: 'retention-down',
        RetentionPeriodHours: 48,
      }),
    );
    await kinesis.send(
      new DecreaseStreamRetentionPeriodCommand({
        StreamName: 'retention-down',
        RetentionPeriodHours: 24,
      }),
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'retention-down' }),
    );
    expect(res.StreamDescriptionSummary?.RetentionPeriodHours).toBe(24);
  });

  it('DeleteChannel', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'delete-channel-source',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'delete-channel-source' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'delete-channel-source' }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'doomed-channel-bucket' }));
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'doomed-channel-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'kinesis.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'doomed-channel-role',
        PolicyName: 'channel',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: ['kinesis:*', 's3:*'], Resource: '*' }],
        }),
      }),
    );
    const { ChannelDescription } = await kinesis.send(
      new CreateChannelCommand({
        ChannelName: 'doomed-channel',
        ServiceExecutionRoleARN: Role?.Arn,
        StreamConfigurationList: [
          {
            StreamARN: StreamDescriptionSummary?.StreamARN,
            RecordConfiguration: { RecordFormatType: 'JSON' },
          },
        ],
        S3DestinationConfiguration: {
          StorageConfiguration: {
            BucketARN: 'arn:aws:s3:::doomed-channel-bucket',
            ExpectedBucketOwner: '000000000000',
            CompressionType: 'GZIP',
          },
        },
      }),
    );
    const ChannelARN = ChannelDescription?.ChannelARN;
    await kinesis.send(new DeleteChannelCommand({ ChannelARN }));
    await expect
      .poll(async () => (await kinesis.send(new ListChannelsCommand({}))).ChannelSummaries ?? [], {
        timeout: 10_000,
      })
      .toHaveLength(0);
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'policy-delete', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'policy-delete' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'policy-delete' }),
    );
    await kinesis.send(
      new PutResourcePolicyCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'kinesis:GetRecords',
              Resource: StreamDescriptionSummary?.StreamARN,
            },
          ],
        }),
      }),
    );
    await kinesis.send(
      new DeleteResourcePolicyCommand({ ResourceARN: StreamDescriptionSummary?.StreamARN }),
    );
    const res = await kinesis.send(
      new GetResourcePolicyCommand({ ResourceARN: StreamDescriptionSummary?.StreamARN }),
    );
    expect(res.Policy ?? '{}').toBe('{}');
  });

  it('DeleteStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'doomed-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'doomed-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'doomed-stream' }));
    await kinesis.send(new DeleteStreamCommand({ StreamName: 'doomed-stream' }));
    await waitUntilStreamNotExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'doomed-stream' },
    );
    const res = await kinesis.send(new ListStreamsCommand({}));
    expect(res.StreamNames ?? []).toHaveLength(0);
  });

  it('DeregisterStreamConsumer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'consumer-deregister', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'consumer-deregister' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'consumer-deregister' }),
    );
    const { Consumer } = await kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        ConsumerName: 'doomed-consumer',
      }),
    );
    await kinesis.send(new DeregisterStreamConsumerCommand({ ConsumerARN: Consumer?.ConsumerARN }));
    await expect
      .poll(
        async () =>
          (
            await kinesis.send(
              new ListStreamConsumersCommand({ StreamARN: StreamDescriptionSummary?.StreamARN }),
            )
          ).Consumers ?? [],
        { timeout: 10_000 },
      )
      .toHaveLength(0);
  });

  it('DescribeAccountSettings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    const res = await kinesis.send(new DescribeAccountSettingsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeChannel', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'describe-channel-source',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'describe-channel-source' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'describe-channel-source' }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'described-channel-bucket' }));
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'described-channel-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'kinesis.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'described-channel-role',
        PolicyName: 'channel',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: ['kinesis:*', 's3:*'], Resource: '*' }],
        }),
      }),
    );
    const { ChannelDescription } = await kinesis.send(
      new CreateChannelCommand({
        ChannelName: 'described-channel',
        ServiceExecutionRoleARN: Role?.Arn,
        StreamConfigurationList: [
          {
            StreamARN: StreamDescriptionSummary?.StreamARN,
            RecordConfiguration: { RecordFormatType: 'JSON' },
          },
        ],
        S3DestinationConfiguration: {
          StorageConfiguration: {
            BucketARN: 'arn:aws:s3:::described-channel-bucket',
            ExpectedBucketOwner: '000000000000',
            CompressionType: 'GZIP',
          },
        },
      }),
    );
    const ChannelARN = ChannelDescription?.ChannelARN;
    const res = await kinesis.send(new DescribeChannelCommand({ ChannelARN }));
    expect(res.ChannelDescription?.ChannelName).toBe('described-channel');
  });

  it('DescribeLimits', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    const res = await kinesis.send(new DescribeLimitsCommand({}));
    expect(res.ShardLimit).toBeGreaterThan(0);
    expect(res.OpenShardCount).toBe(0);
  });

  it('DescribeStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'described-stream', ShardCount: 2 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'described-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'described-stream' }),
    );
    const res = await kinesis.send(new DescribeStreamCommand({ StreamName: 'described-stream' }));
    expect(res.StreamDescription?.Shards).toHaveLength(2);
    expect(res.StreamDescription?.StreamARN).toBe(StreamDescriptionSummary?.StreamARN);
  });

  it('DescribeStreamConsumer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'consumer-describe', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'consumer-describe' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'consumer-describe' }),
    );
    const { Consumer } = await kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        ConsumerName: 'described-consumer',
      }),
    );
    const res = await kinesis.send(
      new DescribeStreamConsumerCommand({ ConsumerARN: Consumer?.ConsumerARN }),
    );
    expect(res.ConsumerDescription?.ConsumerName).toBe('described-consumer');
  });

  it('DescribeStreamSummary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'summary-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'summary-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'summary-stream' }),
    );
    expect(StreamDescriptionSummary?.StreamName).toBe('summary-stream');
    expect(StreamDescriptionSummary?.RetentionPeriodHours).toBe(24);
  });

  it('DisableEnhancedMonitoring', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'monitor-off', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'monitor-off' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'monitor-off' }));
    await kinesis.send(
      new EnableEnhancedMonitoringCommand({
        StreamName: 'monitor-off',
        ShardLevelMetrics: ['ALL'],
      }),
    );
    const res = await kinesis.send(
      new DisableEnhancedMonitoringCommand({
        StreamName: 'monitor-off',
        ShardLevelMetrics: ['ALL'],
      }),
    );
    expect(res.DesiredShardLevelMetrics ?? []).toHaveLength(0);
  });

  it('EnableEnhancedMonitoring', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'monitor-on', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'monitor-on' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'monitor-on' }));
    const res = await kinesis.send(
      new EnableEnhancedMonitoringCommand({
        StreamName: 'monitor-on',
        ShardLevelMetrics: ['IncomingBytes'],
      }),
    );
    expect(res.DesiredShardLevelMetrics).toEqual(['IncomingBytes']);
  });

  it('GetRecords', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'records-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'records-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'records-stream' }));
    await kinesis.send(
      new PutRecordCommand({
        StreamName: 'records-stream',
        PartitionKey: 'pk',
        Data: Buffer.from('hello'),
      }),
    );
    const { StreamDescription } = await kinesis.send(
      new DescribeStreamCommand({ StreamName: 'records-stream' }),
    );
    const { ShardIterator } = await kinesis.send(
      new GetShardIteratorCommand({
        StreamName: 'records-stream',
        ShardId: StreamDescription?.Shards?.[0]?.ShardId,
        ShardIteratorType: 'TRIM_HORIZON',
      }),
    );
    const res = await kinesis.send(new GetRecordsCommand({ ShardIterator }));
    expect(Buffer.from(res.Records?.[0]?.Data ?? []).toString()).toBe('hello');
  });

  it('GetResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'policy-get', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'policy-get' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'policy-get' }),
    );
    await kinesis.send(
      new PutResourcePolicyCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'kinesis:GetRecords',
              Resource: StreamDescriptionSummary?.StreamARN,
            },
          ],
        }),
      }),
    );
    const res = await kinesis.send(
      new GetResourcePolicyCommand({ ResourceARN: StreamDescriptionSummary?.StreamARN }),
    );
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Action).toBe('kinesis:GetRecords');
  });

  it('GetShardIterator', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'iterator-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'iterator-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'iterator-stream' }));
    const { Shards } = await kinesis.send(new ListShardsCommand({ StreamName: 'iterator-stream' }));
    const res = await kinesis.send(
      new GetShardIteratorCommand({
        StreamName: 'iterator-stream',
        ShardId: Shards?.[0]?.ShardId,
        ShardIteratorType: 'LATEST',
      }),
    );
    expect(res.ShardIterator).toBeTruthy();
  });

  it('IncreaseStreamRetentionPeriod', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'retention-up', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'retention-up' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'retention-up' }));
    await kinesis.send(
      new IncreaseStreamRetentionPeriodCommand({
        StreamName: 'retention-up',
        RetentionPeriodHours: 72,
      }),
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'retention-up' }),
    );
    expect(res.StreamDescriptionSummary?.RetentionPeriodHours).toBe(72);
  });

  it('ListChannels', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'list-channel-source',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'list-channel-source' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'list-channel-source' }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'listed-channel-bucket' }));
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'listed-channel-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'kinesis.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'listed-channel-role',
        PolicyName: 'channel',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: ['kinesis:*', 's3:*'], Resource: '*' }],
        }),
      }),
    );
    const { ChannelDescription } = await kinesis.send(
      new CreateChannelCommand({
        ChannelName: 'listed-channel',
        ServiceExecutionRoleARN: Role?.Arn,
        StreamConfigurationList: [
          {
            StreamARN: StreamDescriptionSummary?.StreamARN,
            RecordConfiguration: { RecordFormatType: 'JSON' },
          },
        ],
        S3DestinationConfiguration: {
          StorageConfiguration: {
            BucketARN: 'arn:aws:s3:::listed-channel-bucket',
            ExpectedBucketOwner: '000000000000',
            CompressionType: 'GZIP',
          },
        },
      }),
    );
    const ChannelARN = ChannelDescription?.ChannelARN;
    const res = await kinesis.send(new ListChannelsCommand({}));
    expect(res.ChannelSummaries?.[0]?.ChannelARN).toBe(ChannelARN);
  });

  it('ListShards', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'shards-stream', ShardCount: 3 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'shards-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'shards-stream' }));
    const res = await kinesis.send(new ListShardsCommand({ StreamName: 'shards-stream' }));
    expect(res.Shards).toHaveLength(3);
  });

  it('ListStreamConsumers', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'consumer-list', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'consumer-list' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'consumer-list' }),
    );
    const { Consumer } = await kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        ConsumerName: 'listed-consumer',
      }),
    );
    const res = await kinesis.send(
      new ListStreamConsumersCommand({ StreamARN: StreamDescriptionSummary?.StreamARN }),
    );
    expect(res.Consumers?.[0]?.ConsumerARN).toBe(Consumer?.ConsumerARN);
  });

  it('ListStreams', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'listed-a', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'listed-a' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'listed-a' }),
    );
    await kinesis.send(new CreateStreamCommand({ StreamName: 'listed-b', ShardCount: 1 }));
    const res = await kinesis.send(new ListStreamsCommand({}));
    expect(res.StreamNames?.sort()).toEqual(['listed-a', 'listed-b']);
    expect(StreamDescriptionSummary?.StreamName).toBe('listed-a');
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'tags-resource', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'tags-resource' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'tags-resource' }),
    );
    await kinesis.send(
      new AddTagsToStreamCommand({ StreamName: 'tags-resource', Tags: { team: 'core' } }),
    );
    const res = await kinesis.send(
      new ListTagsForResourceCommand({ ResourceARN: StreamDescriptionSummary?.StreamARN }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListTagsForStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'tags-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'tags-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'tags-stream' }));
    await kinesis.send(
      new AddTagsToStreamCommand({ StreamName: 'tags-stream', Tags: { team: 'core' } }),
    );
    const res = await kinesis.send(new ListTagsForStreamCommand({ StreamName: 'tags-stream' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('MergeShards', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'merge-stream', ShardCount: 2 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'merge-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'merge-stream' }));
    const { Shards } = await kinesis.send(new ListShardsCommand({ StreamName: 'merge-stream' }));
    await kinesis.send(
      new MergeShardsCommand({
        StreamName: 'merge-stream',
        ShardToMerge: Shards?.[0]?.ShardId,
        AdjacentShardToMerge: Shards?.[1]?.ShardId,
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'merge-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'merge-stream' }),
    );
    expect(res.StreamDescriptionSummary?.OpenShardCount).toBe(1);
  });

  it('PutRecord', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'put-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'put-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'put-stream' }));
    const res = await kinesis.send(
      new PutRecordCommand({
        StreamName: 'put-stream',
        PartitionKey: 'user-1',
        Data: Buffer.from('event'),
      }),
    );
    expect(res.ShardId).toBeTruthy();
    expect(res.SequenceNumber).toBeTruthy();
  });

  it('PutRecords', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'put-many-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'put-many-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'put-many-stream' }));
    const res = await kinesis.send(
      new PutRecordsCommand({
        StreamName: 'put-many-stream',
        Records: [
          { PartitionKey: 'a', Data: Buffer.from('1') },
          { PartitionKey: 'b', Data: Buffer.from('2') },
        ],
      }),
    );
    expect(res.FailedRecordCount).toBe(0);
    expect(res.Records).toHaveLength(2);
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'policy-put', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'policy-put' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'policy-put' }),
    );
    const res = await kinesis.send(
      new PutResourcePolicyCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'kinesis:GetRecords',
              Resource: StreamDescriptionSummary?.StreamARN,
            },
          ],
        }),
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('RegisterStreamConsumer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'consumer-register', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'consumer-register' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'consumer-register' }),
    );
    const { Consumer } = await kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        ConsumerName: 'registered-consumer',
      }),
    );
    expect(Consumer?.ConsumerName).toBe('registered-consumer');
    expect(Consumer?.ConsumerARN).toContain('/consumer/registered-consumer:');
  });

  it('RemoveTagsFromStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'tags-remove', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'tags-remove' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'tags-remove' }));
    await kinesis.send(
      new AddTagsToStreamCommand({
        StreamName: 'tags-remove',
        Tags: { env: 'test', team: 'core' },
      }),
    );
    await kinesis.send(
      new RemoveTagsFromStreamCommand({ StreamName: 'tags-remove', TagKeys: ['env'] }),
    );
    const res = await kinesis.send(new ListTagsForStreamCommand({ StreamName: 'tags-remove' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('SplitShard', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'split-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'split-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'split-stream' }));
    const { Shards } = await kinesis.send(new ListShardsCommand({ StreamName: 'split-stream' }));
    await kinesis.send(
      new SplitShardCommand({
        StreamName: 'split-stream',
        ShardToSplit: Shards?.[0]?.ShardId,
        NewStartingHashKey: '170141183460469231731687303715884105728',
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'split-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'split-stream' }),
    );
    expect(res.StreamDescriptionSummary?.OpenShardCount).toBe(2);
  });

  it('StartStreamEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'encrypt-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'encrypt-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'encrypt-stream' }));
    await kinesis.send(
      new StartStreamEncryptionCommand({
        StreamName: 'encrypt-stream',
        EncryptionType: 'KMS',
        KeyId: 'alias/aws/kinesis',
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'encrypt-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'encrypt-stream' }),
    );
    expect(res.StreamDescriptionSummary?.EncryptionType).toBe('KMS');
  });

  it('StopStreamEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'decrypt-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'decrypt-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'decrypt-stream' }));
    await kinesis.send(
      new StartStreamEncryptionCommand({
        StreamName: 'decrypt-stream',
        EncryptionType: 'KMS',
        KeyId: 'alias/aws/kinesis',
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'decrypt-stream' },
    );
    await kinesis.send(
      new StopStreamEncryptionCommand({
        StreamName: 'decrypt-stream',
        EncryptionType: 'KMS',
        KeyId: 'alias/aws/kinesis',
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'decrypt-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'decrypt-stream' }),
    );
    expect(res.StreamDescriptionSummary?.EncryptionType).toBe('NONE');
  });

  it('SubscribeToShard', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'subscribe-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'subscribe-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'subscribe-stream' }),
    );
    const { Consumer } = await kinesis.send(
      new RegisterStreamConsumerCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        ConsumerName: 'subscriber',
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await kinesis.send(
              new DescribeStreamConsumerCommand({ ConsumerARN: Consumer?.ConsumerARN }),
            )
          ).ConsumerDescription?.ConsumerStatus,
        { timeout: 10_000 },
      )
      .toBe('ACTIVE');
    const { Shards } = await kinesis.send(
      new ListShardsCommand({ StreamName: 'subscribe-stream' }),
    );
    await kinesis.send(
      new PutRecordCommand({
        StreamName: 'subscribe-stream',
        PartitionKey: 'pk',
        Data: Buffer.from('pushed'),
      }),
    );
    const res = await kinesis.send(
      new SubscribeToShardCommand({
        ConsumerARN: Consumer?.ConsumerARN,
        ShardId: Shards?.[0]?.ShardId,
        StartingPosition: { Type: 'TRIM_HORIZON' },
      }),
    );
    for await (const event of res.EventStream ?? []) {
      const records = event.SubscribeToShardEvent?.Records ?? [];
      if (records.length > 0) {
        expect(Buffer.from(records[0]?.Data ?? []).toString()).toBe('pushed');
        break;
      }
    }
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'tag-resource', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'tag-resource' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'tag-resource' }),
    );
    await kinesis.send(
      new TagResourceCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        Tags: { env: 'test' },
      }),
    );
    const res = await kinesis.send(new ListTagsForStreamCommand({ StreamName: 'tag-resource' }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'untag-resource', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'untag-resource' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'untag-resource' }),
    );
    await kinesis.send(
      new TagResourceCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        Tags: { env: 'test', team: 'core' },
      }),
    );
    await kinesis.send(
      new UntagResourceCommand({
        ResourceARN: StreamDescriptionSummary?.StreamARN,
        TagKeys: ['env'],
      }),
    );
    const res = await kinesis.send(new ListTagsForStreamCommand({ StreamName: 'untag-resource' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UpdateAccountSettings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    const res = await kinesis.send(
      new UpdateAccountSettingsCommand({
        MinimumThroughputBillingCommitment: { Status: 'DISABLED' },
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateChannel', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'update-channel-source',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'update-channel-source' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'update-channel-source' }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'updated-channel-bucket' }));
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'updated-channel-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'kinesis.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'updated-channel-role',
        PolicyName: 'channel',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: ['kinesis:*', 's3:*'], Resource: '*' }],
        }),
      }),
    );
    const { ChannelDescription } = await kinesis.send(
      new CreateChannelCommand({
        ChannelName: 'updated-channel',
        ServiceExecutionRoleARN: Role?.Arn,
        StreamConfigurationList: [
          {
            StreamARN: StreamDescriptionSummary?.StreamARN,
            RecordConfiguration: { RecordFormatType: 'JSON' },
          },
        ],
        S3DestinationConfiguration: {
          StorageConfiguration: {
            BucketARN: 'arn:aws:s3:::updated-channel-bucket',
            ExpectedBucketOwner: '000000000000',
            CompressionType: 'GZIP',
          },
        },
      }),
    );
    const ChannelARN = ChannelDescription?.ChannelARN;
    await expect
      .poll(
        async () =>
          (await kinesis.send(new DescribeChannelCommand({ ChannelARN }))).ChannelDescription
            ?.ChannelStatus,
        {
          timeout: 30_000,
          interval: 200,
        },
      )
      .toBe('ACTIVE');
    const res = await kinesis.send(
      new UpdateChannelCommand({
        ChannelARN,
        S3DestinationConfiguration: { DataFreshnessInSeconds: 120 },
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateMaxRecordSize', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'record-size-stream', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'record-size-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'record-size-stream' }),
    );
    await kinesis.send(
      new UpdateMaxRecordSizeCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        MaxRecordSizeInKiB: 2048,
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'record-size-stream' },
    );
    const res = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'record-size-stream' }),
    );
    expect(res.StreamDescriptionSummary?.MaxRecordSizeInKiB).toBe(2048);
  });

  it('UpdateShardCount', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'scale-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'scale-stream' },
    );
    await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'scale-stream' }));
    const res = await kinesis.send(
      new UpdateShardCountCommand({
        StreamName: 'scale-stream',
        TargetShardCount: 2,
        ScalingType: 'UNIFORM_SCALING',
      }),
    );
    expect(res.TargetShardCount).toBe(2);
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'scale-stream' },
    );
    const summary = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'scale-stream' }),
    );
    expect(summary.StreamDescriptionSummary?.OpenShardCount).toBe(2);
  });

  it('UpdateStreamMode', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(new CreateStreamCommand({ StreamName: 'mode-stream', ShardCount: 1 }));
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'mode-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'mode-stream' }),
    );
    await kinesis.send(
      new UpdateStreamModeCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'mode-stream' },
    );
    const res = await kinesis.send(new DescribeStreamSummaryCommand({ StreamName: 'mode-stream' }));
    expect(res.StreamDescriptionSummary?.StreamModeDetails?.StreamMode).toBe('ON_DEMAND');
  });

  it('UpdateStreamRecordDistributionStrategy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'distribution-stream',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'distribution-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'distribution-stream' }),
    );
    const res = await kinesis.send(
      new UpdateStreamRecordDistributionStrategyCommand({
        StreamARN: StreamDescriptionSummary?.StreamARN,
        RecordDistributionStrategy: 'USER_PARTITION_KEY',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateStreamWarmThroughput', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({
        StreamName: 'warm-stream',
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
      }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'warm-stream' },
    );
    const res = await kinesis.send(
      new UpdateStreamWarmThroughputCommand({ StreamName: 'warm-stream', WarmThroughputMiBps: 10 }),
    );
    expect(res.WarmThroughput?.TargetMiBps).toBe(10);
  });
});
