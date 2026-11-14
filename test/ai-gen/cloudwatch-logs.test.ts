import { CloudTrailClient, CreateEventDataStoreCommand } from '@aws-sdk/client-cloudtrail';
import {
  AssociateKmsKeyCommand,
  AssociateSourceToS3TableIntegrationCommand,
  CancelExportTaskCommand,
  CancelImportTaskCommand,
  CloudWatchLogsClient,
  CreateDeliveryCommand,
  CreateExportTaskCommand,
  CreateImportTaskCommand,
  CreateLogAnomalyDetectorCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  CreateLookupTableCommand,
  CreateScheduledQueryCommand,
  DeleteAccountPolicyCommand,
  DeleteDataProtectionPolicyCommand,
  DeleteDeliveryCommand,
  DeleteDeliveryDestinationCommand,
  DeleteDeliveryDestinationPolicyCommand,
  DeleteDeliverySourceCommand,
  DeleteDestinationCommand,
  DeleteIndexPolicyCommand,
  DeleteIntegrationCommand,
  DeleteLogAnomalyDetectorCommand,
  DeleteLogGroupCommand,
  DeleteLogStreamCommand,
  DeleteLookupTableCommand,
  DeleteMetricFilterCommand,
  DeleteQueryDefinitionCommand,
  DeleteResourcePolicyCommand,
  DeleteRetentionPolicyCommand,
  DeleteScheduledQueryCommand,
  DeleteSubscriptionFilterCommand,
  DeleteSyslogConfigurationCommand,
  DeleteTransformerCommand,
  DescribeAccountPoliciesCommand,
  DescribeConfigurationTemplatesCommand,
  DescribeDeliveriesCommand,
  DescribeDeliveryDestinationsCommand,
  DescribeDeliverySourcesCommand,
  DescribeDestinationsCommand,
  DescribeExportTasksCommand,
  DescribeFieldIndexesCommand,
  DescribeImportTaskBatchesCommand,
  DescribeImportTasksCommand,
  DescribeIndexPoliciesCommand,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  DescribeLookupTablesCommand,
  DescribeMetricFiltersCommand,
  DescribeQueriesCommand,
  DescribeQueryDefinitionsCommand,
  DescribeResourcePoliciesCommand,
  DescribeSubscriptionFiltersCommand,
  DisassociateKmsKeyCommand,
  DisassociateSourceFromS3TableIntegrationCommand,
  FilterLogEventsCommand,
  GetDataProtectionPolicyCommand,
  GetDeliveryCommand,
  GetDeliveryDestinationCommand,
  GetDeliveryDestinationPolicyCommand,
  GetDeliverySourceCommand,
  GetIntegrationCommand,
  GetLogAnomalyDetectorCommand,
  GetLogEventsCommand,
  GetLogFieldsCommand,
  GetLogGroupFieldsCommand,
  GetLogObjectCommand,
  GetLogRecordCommand,
  GetLookupTableCommand,
  GetQueryResultsCommand,
  GetScheduledQueryCommand,
  GetScheduledQueryHistoryCommand,
  GetStorageTierPolicyCommand,
  GetTransformerCommand,
  ListAggregateLogGroupSummariesCommand,
  ListAnomaliesCommand,
  ListIntegrationsCommand,
  ListLogAnomalyDetectorsCommand,
  ListLogGroupsCommand,
  ListLogGroupsForQueryCommand,
  ListScheduledQueriesCommand,
  ListSourcesForS3TableIntegrationCommand,
  ListSyslogConfigurationsCommand,
  ListTagsForResourceCommand,
  ListTagsLogGroupCommand,
  PutAccountPolicyCommand,
  PutBearerTokenAuthenticationCommand,
  PutDataProtectionPolicyCommand,
  PutDeliveryDestinationCommand,
  PutDeliveryDestinationPolicyCommand,
  PutDeliverySourceCommand,
  PutDestinationCommand,
  PutDestinationPolicyCommand,
  PutIndexPolicyCommand,
  PutIntegrationCommand,
  PutLogEventsCommand,
  PutLogGroupDeletionProtectionCommand,
  PutMetricFilterCommand,
  PutQueryDefinitionCommand,
  PutResourcePolicyCommand,
  PutRetentionPolicyCommand,
  PutStorageTierPolicyCommand,
  PutSubscriptionFilterCommand,
  PutSyslogConfigurationCommand,
  PutTransformerCommand,
  StartLiveTailCommand,
  StartQueryCommand,
  StopQueryCommand,
  TagLogGroupCommand,
  TagResourceCommand,
  TestMetricFilterCommand,
  TestTransformerCommand,
  UntagLogGroupCommand,
  UntagResourceCommand,
  UpdateAnomalyCommand,
  UpdateDeliveryConfigurationCommand,
  UpdateLogAnomalyDetectorCommand,
  UpdateLookupTableCommand,
  UpdateScheduledQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { CreateVpcCommand, CreateVpcEndpointCommand, EC2Client } from '@aws-sdk/client-ec2';
import {
  CreateStreamCommand,
  DescribeStreamSummaryCommand,
  KinesisClient,
} from '@aws-sdk/client-kinesis';
import { CreateKeyCommand, KMSClient } from '@aws-sdk/client-kms';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('cloudwatch-logs', () => {
  it('AssociateKmsKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/kms/associate' }));
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'kms:*',
              Resource: '*',
            },
            {
              Effect: 'Allow',
              Principal: { Service: 'logs.us-east-1.amazonaws.com' },
              Action: [
                'kms:Encrypt*',
                'kms:Decrypt*',
                'kms:ReEncrypt*',
                'kms:GenerateDataKey*',
                'kms:Describe*',
              ],
              Resource: '*',
            },
          ],
        }),
      }),
    );
    await logs.send(
      new AssociateKmsKeyCommand({ logGroupName: '/kms/associate', kmsKeyId: KeyMetadata?.Arn }),
    );
    const res = await logs.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: '/kms/associate' }),
    );
    expect(res.logGroups?.[0]?.kmsKeyId).toBe(KeyMetadata?.Arn);
  });

  it.skip('AssociateSourceToS3TableIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new AssociateSourceToS3TableIntegrationCommand({
        integrationArn: 'arn:aws:logs:us-east-1:000000000000:integration:s3-tables',
        dataSource: { name: 'amazon_vpc', type: 'flow' },
      }),
    );
    expect(res.identifier).toBeTruthy();
  });

  it('CancelExportTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/export/cancel' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/export/cancel', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/export/cancel',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: 'hello world' }],
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-export-cancel' }));
    const { taskId } = await logs.send(
      new CreateExportTaskCommand({
        logGroupName: '/export/cancel',
        from: 0,
        to: Date.now() + 60_000,
        destination: 'export-export-cancel',
      }),
    );
    await logs.send(new CancelExportTaskCommand({ taskId })).catch(() => undefined);
    const res = await logs.send(new DescribeExportTasksCommand({ taskId }));
    expect(res.exportTasks?.[0]?.status?.code).toMatch(/CANCELLED|COMPLETED/);
  });

  it.skip('CancelImportTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const cloudtrail = new CloudTrailClient(aws.clientConfig());
    const { EventDataStoreArn } = await cloudtrail.send(
      new CreateEventDataStoreCommand({ Name: 'cancel-import' }),
    );
    const { importId } = await logs.send(
      new CreateImportTaskCommand({
        importSourceArn: EventDataStoreArn,
        importRoleArn: 'arn:aws:iam::000000000000:role/import-role',
      }),
    );
    const res = await logs.send(new CancelImportTaskCommand({ importId }));
    expect(res.importStatus).toBe('CANCELLED');
  });

  it('CreateDelivery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'create-delivery-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/create-delivery-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/delivery/create-delivery-destination' }),
    );
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'create-delivery-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/create-delivery-destination',
        },
      }),
    );
    const { delivery } = await logs.send(
      new CreateDeliveryCommand({
        deliverySourceName: deliverySource?.name,
        deliveryDestinationArn: deliveryDestination?.arn,
      }),
    );
    expect(delivery?.deliverySourceName).toBe('create-delivery-source');
    expect(delivery?.deliveryDestinationArn).toBe(deliveryDestination?.arn);
  });

  it('CreateExportTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/export/create' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/export/create', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/export/create',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: 'hello world' }],
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-export-create' }));
    const { taskId } = await logs.send(
      new CreateExportTaskCommand({
        logGroupName: '/export/create',
        from: 0,
        to: Date.now() + 60_000,
        destination: 'export-export-create',
      }),
    );
    expect(taskId).toBeTruthy();
  });

  it('CreateImportTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const cloudtrail = new CloudTrailClient(aws.clientConfig());
    const { EventDataStoreArn } = await cloudtrail.send(
      new CreateEventDataStoreCommand({ Name: 'create-import' }),
    );
    const { importId } = await logs.send(
      new CreateImportTaskCommand({
        importSourceArn: EventDataStoreArn,
        importRoleArn: 'arn:aws:iam::000000000000:role/import-role',
      }),
    );
    expect(importId).toBeTruthy();
  });

  it('CreateLogAnomalyDetector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/create' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/create'],
        detectorName: 'anomaly-create-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    expect(anomalyDetectorArn).toContain(':anomaly-detector:');
  });

  it('CreateLogGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/app/created', tags: { team: 'core' } }),
    );
    const res = await logs.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: '/app/created' }),
    );
    expect(res.logGroups?.[0]?.logGroupName).toBe('/app/created');
  });

  it('CreateLogStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/app/streams' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/app/streams', logStreamName: 'stream-1' }),
    );
    const res = await logs.send(new DescribeLogStreamsCommand({ logGroupName: '/app/streams' }));
    expect(res.logStreams?.map((stream) => stream.logStreamName)).toEqual(['stream-1']);
  });

  it('CreateLookupTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { lookupTableArn } = await logs.send(
      new CreateLookupTableCommand({
        lookupTableName: 'create_lookup',
        description: 'status codes',
        tableBody: 'code,label\n200,OK\n404,Not Found\n',
      }),
    );
    expect(lookupTableArn).toContain(':lookup-table:create_lookup');
  });

  it('CreateScheduledQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/create' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'create-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/create'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    expect(scheduledQueryArn).toContain(':scheduled-query:');
  });

  it('DeleteAccountPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutAccountPolicyCommand({
        policyName: 'doomed-policy',
        policyType: 'DATA_PROTECTION_POLICY',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    await logs.send(
      new DeleteAccountPolicyCommand({
        policyName: 'doomed-policy',
        policyType: 'DATA_PROTECTION_POLICY',
      }),
    );
    const res = await logs.send(
      new DescribeAccountPoliciesCommand({ policyType: 'DATA_PROTECTION_POLICY' }),
    );
    expect(res.accountPolicies ?? []).toHaveLength(0);
  });

  it('DeleteDataProtectionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/dpp/delete' }));
    await logs.send(
      new PutDataProtectionPolicyCommand({
        logGroupIdentifier: '/dpp/delete',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    await logs.send(new DeleteDataProtectionPolicyCommand({ logGroupIdentifier: '/dpp/delete' }));
    await expect(
      logs.send(new GetDataProtectionPolicyCommand({ logGroupIdentifier: '/dpp/delete' })),
    ).rejects.toThrow(/does not exist/);
  });

  it('DeleteDelivery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'delete-delivery-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/delete-delivery-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/delivery/delete-delivery-destination' }),
    );
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'delete-delivery-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/delete-delivery-destination',
        },
      }),
    );
    const { delivery } = await logs.send(
      new CreateDeliveryCommand({
        deliverySourceName: deliverySource?.name,
        deliveryDestinationArn: deliveryDestination?.arn,
      }),
    );
    await logs.send(new DeleteDeliveryCommand({ id: delivery?.id }));
    const res = await logs.send(new DescribeDeliveriesCommand({}));
    expect(res.deliveries ?? []).toHaveLength(0);
  });

  it('DeleteDeliveryDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/delete-destination' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'delete-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/delete-destination',
        },
      }),
    );
    await logs.send(new DeleteDeliveryDestinationCommand({ name: 'delete-destination' }));
    const res = await logs.send(new DescribeDeliveryDestinationsCommand({}));
    expect(res.deliveryDestinations ?? []).toHaveLength(0);
    expect(deliveryDestination?.name).toBe('delete-destination');
  });

  it('DeleteDeliveryDestinationPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/delete-dd-policy' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'delete-dd-policy',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/delete-dd-policy',
        },
      }),
    );
    await logs.send(
      new PutDeliveryDestinationPolicyCommand({
        deliveryDestinationName: 'delete-dd-policy',
        deliveryDestinationPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'logs:CreateDelivery',
              Resource: deliveryDestination?.arn,
            },
          ],
        }),
      }),
    );
    await logs.send(
      new DeleteDeliveryDestinationPolicyCommand({ deliveryDestinationName: 'delete-dd-policy' }),
    );
    const res = await logs.send(
      new GetDeliveryDestinationPolicyCommand({ deliveryDestinationName: 'delete-dd-policy' }),
    );
    expect(res.policy?.deliveryDestinationPolicy).toBeUndefined();
  });

  it('DeleteDeliverySource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'delete-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/delete-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    await logs.send(new DeleteDeliverySourceCommand({ name: 'delete-source' }));
    const res = await logs.send(new DescribeDeliverySourcesCommand({}));
    expect(res.deliverySources ?? []).toHaveLength(0);
    expect(deliverySource?.name).toBe('delete-source');
  });

  it('DeleteDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'doomed-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'doomed-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'doomed-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    await logs.send(new DeleteDestinationCommand({ destinationName: 'doomed-destination' }));
    const res = await logs.send(new DescribeDestinationsCommand({}));
    expect(res.destinations ?? []).toHaveLength(0);
    expect(destination?.destinationName).toBe('doomed-destination');
  });

  it('DeleteIndexPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/index/delete' }));
    await logs.send(
      new PutIndexPolicyCommand({
        logGroupIdentifier: '/index/delete',
        policyDocument: JSON.stringify({ Fields: ['requestId'] }),
      }),
    );
    await logs.send(new DeleteIndexPolicyCommand({ logGroupIdentifier: '/index/delete' }));
    const res = await logs.send(
      new DescribeIndexPoliciesCommand({ logGroupIdentifiers: ['/index/delete'] }),
    );
    expect(res.indexPolicies ?? []).toHaveLength(0);
  });

  it('DeleteIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutIntegrationCommand({
        integrationName: 'doomed-integration',
        integrationType: 'OPENSEARCH',
        resourceConfig: {
          openSearchResourceConfig: {
            dataSourceRoleArn: 'arn:aws:iam::000000000000:role/opensearch-role',
            dashboardViewerPrincipals: ['arn:aws:iam::000000000000:role/viewer'],
            retentionDays: 30,
          },
        },
      }),
    );
    await logs.send(
      new DeleteIntegrationCommand({ integrationName: 'doomed-integration', force: true }),
    );
    const res = await logs.send(new ListIntegrationsCommand({}));
    expect(res.integrationSummaries ?? []).toHaveLength(0);
  });

  it('DeleteLogAnomalyDetector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/delete' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/delete'],
        detectorName: 'anomaly-delete-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    await logs.send(new DeleteLogAnomalyDetectorCommand({ anomalyDetectorArn }));
    const res = await logs.send(new ListLogAnomalyDetectorsCommand({}));
    expect(res.anomalyDetectors ?? []).toHaveLength(0);
  });

  it('DeleteLogGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/app/doomed' }));
    await logs.send(new DeleteLogGroupCommand({ logGroupName: '/app/doomed' }));
    const res = await logs.send(new DescribeLogGroupsCommand({}));
    expect(res.logGroups ?? []).toHaveLength(0);
  });

  it('DeleteLogStream', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/app/doomed-stream' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/app/doomed-stream', logStreamName: 'doomed' }),
    );
    await logs.send(
      new DeleteLogStreamCommand({ logGroupName: '/app/doomed-stream', logStreamName: 'doomed' }),
    );
    const res = await logs.send(
      new DescribeLogStreamsCommand({ logGroupName: '/app/doomed-stream' }),
    );
    expect(res.logStreams ?? []).toHaveLength(0);
  });

  it('DeleteLookupTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { lookupTableArn } = await logs.send(
      new CreateLookupTableCommand({
        lookupTableName: 'doomed_lookup',
        description: 'status codes',
        tableBody: 'code,label\n200,OK\n404,Not Found\n',
      }),
    );
    await logs.send(new DeleteLookupTableCommand({ lookupTableArn }));
    const res = await logs.send(new DescribeLookupTablesCommand({}));
    expect(res.lookupTables ?? []).toHaveLength(0);
  });

  it('DeleteMetricFilter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/metric/delete' }));
    await logs.send(
      new PutMetricFilterCommand({
        logGroupName: '/metric/delete',
        filterName: 'doomed-filter',
        filterPattern: 'ERROR',
        metricTransformations: [
          { metricName: 'ErrorCount', metricNamespace: 'App', metricValue: '1' },
        ],
      }),
    );
    await logs.send(
      new DeleteMetricFilterCommand({
        logGroupName: '/metric/delete',
        filterName: 'doomed-filter',
      }),
    );
    const res = await logs.send(
      new DescribeMetricFiltersCommand({ logGroupName: '/metric/delete' }),
    );
    expect(res.metricFilters ?? []).toHaveLength(0);
  });

  it('DeleteQueryDefinition', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { queryDefinitionId } = await logs.send(
      new PutQueryDefinitionCommand({ name: 'doomed-query', queryString: 'fields @message' }),
    );
    const res = await logs.send(new DeleteQueryDefinitionCommand({ queryDefinitionId }));
    expect(res.success).toBe(true);
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutResourcePolicyCommand({
        policyName: 'doomed-resource-policy',
        policyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'route53.amazonaws.com' },
              Action: ['logs:PutLogEvents', 'logs:CreateLogStream'],
              Resource: '*',
            },
          ],
        }),
      }),
    );
    await logs.send(new DeleteResourcePolicyCommand({ policyName: 'doomed-resource-policy' }));
    const res = await logs.send(new DescribeResourcePoliciesCommand({}));
    expect(res.resourcePolicies ?? []).toHaveLength(0);
  });

  it('DeleteRetentionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/retention/delete' }));
    await logs.send(
      new PutRetentionPolicyCommand({ logGroupName: '/retention/delete', retentionInDays: 7 }),
    );
    await logs.send(new DeleteRetentionPolicyCommand({ logGroupName: '/retention/delete' }));
    const res = await logs.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: '/retention/delete' }),
    );
    expect(res.logGroups?.[0]?.retentionInDays).toBeUndefined();
  });

  it('DeleteScheduledQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/delete' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'doomed-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/delete'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    await logs.send(new DeleteScheduledQueryCommand({ identifier: scheduledQueryArn }));
    const res = await logs.send(new ListScheduledQueriesCommand({}));
    expect(res.scheduledQueries ?? []).toHaveLength(0);
  });

  it('DeleteSubscriptionFilter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sub/delete' }));
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'doomed-sub-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'doomed-sub-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'doomed-sub-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    await logs.send(
      new PutDestinationPolicyCommand({
        destinationName: 'doomed-sub-destination',
        accessPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '000000000000' },
              Action: 'logs:PutSubscriptionFilter',
              Resource: destination?.arn,
            },
          ],
        }),
      }),
    );
    await logs.send(
      new PutSubscriptionFilterCommand({
        logGroupName: '/sub/delete',
        filterName: 'doomed-sub',
        filterPattern: '',
        destinationArn: destination?.arn,
      }),
    );
    await logs.send(
      new DeleteSubscriptionFilterCommand({
        logGroupName: '/sub/delete',
        filterName: 'doomed-sub',
      }),
    );
    const res = await logs.send(
      new DescribeSubscriptionFiltersCommand({ logGroupName: '/sub/delete' }),
    );
    expect(res.subscriptionFilters ?? []).toHaveLength(0);
  });

  it('DeleteSyslogConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/syslog/delete' }));
    const ec2 = new EC2Client(aws.clientConfig());
    const { Vpc } = await ec2.send(new CreateVpcCommand({ CidrBlock: '10.0.0.0/16' }));
    const { VpcEndpoint } = await ec2.send(
      new CreateVpcEndpointCommand({
        VpcId: Vpc?.VpcId,
        ServiceName: 'com.amazonaws.us-east-1.logs',
        VpcEndpointType: 'Interface',
      }),
    );
    await logs.send(
      new PutSyslogConfigurationCommand({
        logGroupIdentifier: '/syslog/delete',
        vpcEndpointId: VpcEndpoint?.VpcEndpointId,
      }),
    );
    await logs.send(
      new DeleteSyslogConfigurationCommand({
        logGroupIdentifier: '/syslog/delete',
        vpcEndpointId: VpcEndpoint?.VpcEndpointId,
      }),
    );
    const res = await logs.send(
      new ListSyslogConfigurationsCommand({ logGroupIdentifier: '/syslog/delete' }),
    );
    expect(res.syslogConfigurations ?? []).toHaveLength(0);
  });

  it('DeleteTransformer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/transformer/delete' }));
    await logs.send(
      new PutTransformerCommand({
        logGroupIdentifier: '/transformer/delete',
        transformerConfig: [
          { parseJSON: {} },
          { addKeys: { entries: [{ key: 'env', value: 'test' }] } },
        ],
      }),
    );
    await logs.send(new DeleteTransformerCommand({ logGroupIdentifier: '/transformer/delete' }));
    const res = await logs.send(
      new GetTransformerCommand({ logGroupIdentifier: '/transformer/delete' }),
    );
    expect(res.transformerConfig ?? []).toHaveLength(0);
  });

  it('DescribeAccountPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutAccountPolicyCommand({
        policyName: 'described-policy',
        policyType: 'DATA_PROTECTION_POLICY',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    const res = await logs.send(
      new DescribeAccountPoliciesCommand({ policyType: 'DATA_PROTECTION_POLICY' }),
    );
    expect(res.accountPolicies?.map((policy) => policy.policyName)).toEqual(['described-policy']);
  });

  it('DescribeConfigurationTemplates', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(new DescribeConfigurationTemplatesCommand({}));
    expect(res.configurationTemplates?.length).toBeGreaterThan(0);
  });

  it('DescribeDeliveries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'describe-deliveries-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/describe-deliveries-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/delivery/describe-deliveries-destination' }),
    );
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'describe-deliveries-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/describe-deliveries-destination',
        },
      }),
    );
    const { delivery } = await logs.send(
      new CreateDeliveryCommand({
        deliverySourceName: deliverySource?.name,
        deliveryDestinationArn: deliveryDestination?.arn,
      }),
    );
    const res = await logs.send(new DescribeDeliveriesCommand({}));
    expect(res.deliveries?.map((item) => item.id)).toEqual([delivery?.id]);
  });

  it('DescribeDeliveryDestinations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/described-destination' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'described-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/described-destination',
        },
      }),
    );
    const res = await logs.send(new DescribeDeliveryDestinationsCommand({}));
    expect(res.deliveryDestinations?.map((item) => item.arn)).toEqual([deliveryDestination?.arn]);
  });

  it('DescribeDeliverySources', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'described-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/described-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    const res = await logs.send(new DescribeDeliverySourcesCommand({}));
    expect(res.deliverySources?.map((item) => item.name)).toEqual([deliverySource?.name]);
  });

  it('DescribeDestinations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'described-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'described-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'described-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    const res = await logs.send(
      new DescribeDestinationsCommand({ DestinationNamePrefix: 'described' }),
    );
    expect(res.destinations?.map((item) => item.arn)).toEqual([destination?.arn]);
  });

  it('DescribeExportTasks', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/export/describe' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/export/describe', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/export/describe',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: 'hello world' }],
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-export-describe' }));
    const { taskId } = await logs.send(
      new CreateExportTaskCommand({
        logGroupName: '/export/describe',
        from: 0,
        to: Date.now() + 60_000,
        destination: 'export-export-describe',
      }),
    );
    const res = await logs.send(new DescribeExportTasksCommand({ taskId }));
    expect(res.exportTasks?.[0]?.logGroupName).toBe('/export/describe');
  });

  it('DescribeFieldIndexes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/index/fields' }));
    await logs.send(
      new PutIndexPolicyCommand({
        logGroupIdentifier: '/index/fields',
        policyDocument: JSON.stringify({ Fields: ['requestId'] }),
      }),
    );
    const res = await logs.send(
      new DescribeFieldIndexesCommand({ logGroupIdentifiers: ['/index/fields'] }),
    );
    expect(res.fieldIndexes).toBeDefined();
  });

  it.skip('DescribeImportTaskBatches', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const cloudtrail = new CloudTrailClient(aws.clientConfig());
    const { EventDataStoreArn } = await cloudtrail.send(
      new CreateEventDataStoreCommand({ Name: 'batches-import' }),
    );
    const { importId } = await logs.send(
      new CreateImportTaskCommand({
        importSourceArn: EventDataStoreArn,
        importRoleArn: 'arn:aws:iam::000000000000:role/import-role',
      }),
    );
    const res = await logs.send(new DescribeImportTaskBatchesCommand({ importId }));
    expect(res.importBatches).toBeDefined();
  });

  it('DescribeImportTasks', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const cloudtrail = new CloudTrailClient(aws.clientConfig());
    const { EventDataStoreArn } = await cloudtrail.send(
      new CreateEventDataStoreCommand({ Name: 'describe-import' }),
    );
    const { importId } = await logs.send(
      new CreateImportTaskCommand({
        importSourceArn: EventDataStoreArn,
        importRoleArn: 'arn:aws:iam::000000000000:role/import-role',
      }),
    );
    const res = await logs.send(new DescribeImportTasksCommand({ importId }));
    expect(res.imports?.[0]?.importId).toBe(importId);
  });

  it('DescribeIndexPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/index/describe' }));
    await logs.send(
      new PutIndexPolicyCommand({
        logGroupIdentifier: '/index/describe',
        policyDocument: JSON.stringify({ Fields: ['requestId'] }),
      }),
    );
    const res = await logs.send(
      new DescribeIndexPoliciesCommand({ logGroupIdentifiers: ['/index/describe'] }),
    );
    expect(JSON.parse(res.indexPolicies?.[0]?.policyDocument ?? '{}').Fields).toEqual([
      'requestId',
    ]);
  });

  it('DescribeLogGroups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/describe/a' }));
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/describe/b' }));
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/other' }));
    const res = await logs.send(new DescribeLogGroupsCommand({ logGroupNamePrefix: '/describe/' }));
    expect(res.logGroups?.map((group) => group.logGroupName)).toEqual([
      '/describe/a',
      '/describe/b',
    ]);
  });

  it('DescribeLogStreams', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/streams/describe' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/streams/describe', logStreamName: 'a' }),
    );
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/streams/describe', logStreamName: 'b' }),
    );
    const res = await logs.send(
      new DescribeLogStreamsCommand({
        logGroupName: '/streams/describe',
        logStreamNamePrefix: 'b',
      }),
    );
    expect(res.logStreams?.map((stream) => stream.logStreamName)).toEqual(['b']);
  });

  it('DescribeLookupTables', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { lookupTableArn } = await logs.send(
      new CreateLookupTableCommand({
        lookupTableName: 'described_lookup',
        description: 'status codes',
        tableBody: 'code,label\n200,OK\n404,Not Found\n',
      }),
    );
    const res = await logs.send(new DescribeLookupTablesCommand({}));
    expect(res.lookupTables?.map((table) => table.lookupTableArn)).toEqual([lookupTableArn]);
  });

  it('DescribeMetricFilters', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/metric/describe' }));
    await logs.send(
      new PutMetricFilterCommand({
        logGroupName: '/metric/describe',
        filterName: 'described-filter',
        filterPattern: 'ERROR',
        metricTransformations: [
          { metricName: 'ErrorCount', metricNamespace: 'App', metricValue: '1' },
        ],
      }),
    );
    const res = await logs.send(
      new DescribeMetricFiltersCommand({ logGroupName: '/metric/describe' }),
    );
    expect(res.metricFilters?.[0]?.filterName).toBe('described-filter');
    expect(res.metricFilters?.[0]?.metricTransformations?.[0]?.metricName).toBe('ErrorCount');
  });

  it('DescribeQueries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/query/describe' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/query/describe', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/query/describe',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/query/describe',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    const res = await logs.send(new DescribeQueriesCommand({ logGroupName: '/query/describe' }));
    expect(res.queries?.map((query) => query.queryId)).toEqual([queryId]);
  });

  it('DescribeQueryDefinitions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutQueryDefinitionCommand({ name: 'described-query', queryString: 'fields @message' }),
    );
    const res = await logs.send(
      new DescribeQueryDefinitionsCommand({ queryDefinitionNamePrefix: 'described' }),
    );
    expect(res.queryDefinitions?.[0]?.name).toBe('described-query');
  });

  it('DescribeResourcePolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutResourcePolicyCommand({
        policyName: 'described-resource-policy',
        policyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'route53.amazonaws.com' },
              Action: ['logs:PutLogEvents', 'logs:CreateLogStream'],
              Resource: '*',
            },
          ],
        }),
      }),
    );
    const res = await logs.send(new DescribeResourcePoliciesCommand({}));
    expect(res.resourcePolicies?.map((policy) => policy.policyName)).toEqual([
      'described-resource-policy',
    ]);
  });

  it('DescribeSubscriptionFilters', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sub/describe' }));
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'described-sub-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'described-sub-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'described-sub-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    await logs.send(
      new PutDestinationPolicyCommand({
        destinationName: 'described-sub-destination',
        accessPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '000000000000' },
              Action: 'logs:PutSubscriptionFilter',
              Resource: destination?.arn,
            },
          ],
        }),
      }),
    );
    await logs.send(
      new PutSubscriptionFilterCommand({
        logGroupName: '/sub/describe',
        filterName: 'described-sub',
        filterPattern: '',
        destinationArn: destination?.arn,
      }),
    );
    const res = await logs.send(
      new DescribeSubscriptionFiltersCommand({ logGroupName: '/sub/describe' }),
    );
    expect(res.subscriptionFilters?.[0]?.destinationArn).toBe(destination?.arn);
  });

  it('DisassociateKmsKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/kms/disassociate' }));
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::000000000000:root' },
              Action: 'kms:*',
              Resource: '*',
            },
            {
              Effect: 'Allow',
              Principal: { Service: 'logs.us-east-1.amazonaws.com' },
              Action: [
                'kms:Encrypt*',
                'kms:Decrypt*',
                'kms:ReEncrypt*',
                'kms:GenerateDataKey*',
                'kms:Describe*',
              ],
              Resource: '*',
            },
          ],
        }),
      }),
    );
    await logs.send(
      new AssociateKmsKeyCommand({ logGroupName: '/kms/disassociate', kmsKeyId: KeyMetadata?.Arn }),
    );
    await logs.send(new DisassociateKmsKeyCommand({ logGroupName: '/kms/disassociate' }));
    const res = await logs.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: '/kms/disassociate' }),
    );
    expect(res.logGroups?.[0]?.kmsKeyId).toBeUndefined();
  });

  it.skip('DisassociateSourceFromS3TableIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { identifier } = await logs.send(
      new AssociateSourceToS3TableIntegrationCommand({
        integrationArn: 'arn:aws:logs:us-east-1:000000000000:integration:s3-tables',
        dataSource: { name: 'amazon_vpc', type: 'flow' },
      }),
    );
    const res = await logs.send(
      new DisassociateSourceFromS3TableIntegrationCommand({ identifier }),
    );
    expect(res.identifier).toBe(identifier);
  });

  it('FilterLogEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/filter/events' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/filter/events', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/filter/events',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR boom' },
          { timestamp: Date.now(), message: 'INFO fine' },
          { timestamp: Date.now(), message: 'ERROR again' },
        ],
      }),
    );
    const res = await logs.send(
      new FilterLogEventsCommand({ logGroupName: '/filter/events', filterPattern: 'ERROR' }),
    );
    expect(res.events?.map((event) => event.message)).toEqual(['ERROR boom', 'ERROR again']);
  });

  it('GetDataProtectionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/dpp/get' }));
    await logs.send(
      new PutDataProtectionPolicyCommand({
        logGroupIdentifier: '/dpp/get',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    const res = await logs.send(
      new GetDataProtectionPolicyCommand({ logGroupIdentifier: '/dpp/get' }),
    );
    expect(JSON.parse(res.policyDocument ?? '{}').Name).toBe('data-protection');
  });

  it('GetDelivery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'get-delivery-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/get-delivery-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/delivery/get-delivery-destination' }),
    );
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'get-delivery-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/get-delivery-destination',
        },
      }),
    );
    const { delivery } = await logs.send(
      new CreateDeliveryCommand({
        deliverySourceName: deliverySource?.name,
        deliveryDestinationArn: deliveryDestination?.arn,
      }),
    );
    const res = await logs.send(new GetDeliveryCommand({ id: delivery?.id }));
    expect(res.delivery?.deliveryDestinationArn).toBe(deliveryDestination?.arn);
  });

  it('GetDeliveryDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/get-destination' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'get-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/get-destination',
        },
      }),
    );
    const res = await logs.send(new GetDeliveryDestinationCommand({ name: 'get-destination' }));
    expect(res.deliveryDestination?.arn).toBe(deliveryDestination?.arn);
  });

  it('GetDeliveryDestinationPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/get-dd-policy' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'get-dd-policy',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/get-dd-policy',
        },
      }),
    );
    await logs.send(
      new PutDeliveryDestinationPolicyCommand({
        deliveryDestinationName: 'get-dd-policy',
        deliveryDestinationPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'logs:CreateDelivery',
              Resource: deliveryDestination?.arn,
            },
          ],
        }),
      }),
    );
    const res = await logs.send(
      new GetDeliveryDestinationPolicyCommand({ deliveryDestinationName: 'get-dd-policy' }),
    );
    expect(JSON.parse(res.policy?.deliveryDestinationPolicy ?? '{}').Statement[0].Action).toBe(
      'logs:CreateDelivery',
    );
  });

  it('GetDeliverySource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'get-source',
        resourceArn: 'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/get-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    const res = await logs.send(new GetDeliverySourceCommand({ name: 'get-source' }));
    expect(res.deliverySource?.logType).toBe('APPLICATION_LOGS');
    expect(deliverySource?.name).toBe('get-source');
  });

  it('GetIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutIntegrationCommand({
        integrationName: 'get-integration',
        integrationType: 'OPENSEARCH',
        resourceConfig: {
          openSearchResourceConfig: {
            dataSourceRoleArn: 'arn:aws:iam::000000000000:role/opensearch-role',
            dashboardViewerPrincipals: ['arn:aws:iam::000000000000:role/viewer'],
            retentionDays: 30,
          },
        },
      }),
    );
    const res = await logs.send(new GetIntegrationCommand({ integrationName: 'get-integration' }));
    expect(res.integrationType).toBe('OPENSEARCH');
  });

  it('GetLogAnomalyDetector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/get' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/get'],
        detectorName: 'anomaly-get-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    const res = await logs.send(new GetLogAnomalyDetectorCommand({ anomalyDetectorArn }));
    expect(res.evaluationFrequency).toBe('FIVE_MIN');
  });

  it('GetLogEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/get/events' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/get/events', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/get/events',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'first' },
          { timestamp: Date.now(), message: 'second' },
        ],
      }),
    );
    const res = await logs.send(
      new GetLogEventsCommand({
        logGroupName: '/get/events',
        logStreamName: 'main',
        startFromHead: true,
      }),
    );
    expect(res.events?.map((event) => event.message)).toEqual(['first', 'second']);
  });

  it('GetLogFields', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new GetLogFieldsCommand({ dataSourceName: 'amazon_vpc', dataSourceType: 'flow' }),
    );
    expect(res.logFields).toBeDefined();
  });

  it('GetLogGroupFields', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/fields/get' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/fields/get', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/fields/get',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: '{"level":"info"}' }],
      }),
    );
    const res = await logs.send(new GetLogGroupFieldsCommand({ logGroupName: '/fields/get' }));
    expect(res.logGroupFields?.map((field) => field.name)).toContain('@message');
  });

  it('GetLogObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/object/get' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/object/get', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/object/get',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: '{"a":1}' }],
      }),
    );
    const { events } = await logs.send(new FilterLogEventsCommand({ logGroupName: '/object/get' }));
    await expect(
      logs.send(new GetLogObjectCommand({ logObjectPointer: events?.[0]?.eventId, unmask: false })),
    ).rejects.toThrow();
  });

  it('GetLogRecord', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/record/get' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/record/get', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/record/get',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/record/get',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    await expect
      .poll(async () => (await logs.send(new GetQueryResultsCommand({ queryId }))).status, {
        timeout: 10_000,
      })
      .toBe('Complete');
    const { results } = await logs.send(new GetQueryResultsCommand({ queryId }));
    const pointer = results?.[0]?.find((field) => field.field === '@ptr')?.value;
    const res = await logs.send(new GetLogRecordCommand({ logRecordPointer: pointer }));
    expect(res.logRecord?.['@message']).toBe('ERROR one');
  });

  it('GetLookupTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { lookupTableArn } = await logs.send(
      new CreateLookupTableCommand({
        lookupTableName: 'get_lookup',
        description: 'status codes',
        tableBody: 'code,label\n200,OK\n404,Not Found\n',
      }),
    );
    const res = await logs.send(new GetLookupTableCommand({ lookupTableArn }));
    expect(res.tableBody).toContain('404,Not Found');
  });

  it('GetQueryResults', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/query/results' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/query/results', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/query/results',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/query/results',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    await expect
      .poll(async () => (await logs.send(new GetQueryResultsCommand({ queryId }))).status, {
        timeout: 10_000,
      })
      .toBe('Complete');
    const res = await logs.send(new GetQueryResultsCommand({ queryId }));
    expect(res.results).toHaveLength(1);
    expect(res.results?.[0]?.find((field) => field.field === '@message')?.value).toBe('ERROR one');
  });

  it('GetScheduledQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/get' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'get-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/get'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    const res = await logs.send(new GetScheduledQueryCommand({ identifier: scheduledQueryArn }));
    expect(res.name).toBe('get-query');
    expect(res.scheduleExpression).toBe('rate(1 hour)');
  });

  it('GetScheduledQueryHistory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/history' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'history-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/history'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    const res = await logs.send(
      new GetScheduledQueryHistoryCommand({
        identifier: scheduledQueryArn,
        startTime: 0,
        endTime: Date.now(),
      }),
    );
    expect(res.triggerHistory ?? []).toEqual([]);
  });

  it('GetStorageTierPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(new GetStorageTierPolicyCommand({}));
    expect(res.storageTier).toBe('STANDARD');
  });

  it('GetTransformer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/transformer/get' }));
    await logs.send(
      new PutTransformerCommand({
        logGroupIdentifier: '/transformer/get',
        transformerConfig: [
          { parseJSON: {} },
          { addKeys: { entries: [{ key: 'env', value: 'test' }] } },
        ],
      }),
    );
    const res = await logs.send(
      new GetTransformerCommand({ logGroupIdentifier: '/transformer/get' }),
    );
    expect(res.transformerConfig).toHaveLength(2);
  });

  it('ListAggregateLogGroupSummaries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/aggregate/a' }));
    const res = await logs.send(
      new ListAggregateLogGroupSummariesCommand({ groupBy: 'DATA_SOURCE_NAME_AND_TYPE' }),
    );
    expect(res.aggregateLogGroupSummaries).toBeDefined();
  });

  it('ListAnomalies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/list' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/list'],
        detectorName: 'anomaly-list-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    const res = await logs.send(new ListAnomaliesCommand({ anomalyDetectorArn }));
    expect(res.anomalies ?? []).toEqual([]);
  });

  it('ListIntegrations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new PutIntegrationCommand({
        integrationName: 'listed-integration',
        integrationType: 'OPENSEARCH',
        resourceConfig: {
          openSearchResourceConfig: {
            dataSourceRoleArn: 'arn:aws:iam::000000000000:role/opensearch-role',
            dashboardViewerPrincipals: ['arn:aws:iam::000000000000:role/viewer'],
            retentionDays: 30,
          },
        },
      }),
    );
    const res = await logs.send(new ListIntegrationsCommand({}));
    expect(res.integrationSummaries?.map((item) => item.integrationName)).toEqual([
      'listed-integration',
    ]);
  });

  it('ListLogAnomalyDetectors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/listed' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/listed'],
        detectorName: 'anomaly-listed-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    const res = await logs.send(new ListLogAnomalyDetectorsCommand({}));
    expect(res.anomalyDetectors?.map((detector) => detector.anomalyDetectorArn)).toEqual([
      anomalyDetectorArn,
    ]);
  });

  it('ListLogGroups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/list/a' }));
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/list/b' }));
    const res = await logs.send(new ListLogGroupsCommand({ logGroupNamePattern: 'list' }));
    expect(res.logGroups?.map((group) => group.logGroupName)).toEqual(['/list/a', '/list/b']);
  });

  it('ListLogGroupsForQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/query/groups' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/query/groups', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/query/groups',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/query/groups',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    const res = await logs.send(new ListLogGroupsForQueryCommand({ queryId }));
    expect(res.logGroupIdentifiers?.[0]).toContain('/query/groups');
  });

  it('ListScheduledQueries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/list' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'listed-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/list'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    const res = await logs.send(new ListScheduledQueriesCommand({}));
    expect(res.scheduledQueries?.map((query) => query.scheduledQueryArn)).toEqual([
      scheduledQueryArn,
    ]);
  });

  it.skip('ListSourcesForS3TableIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new ListSourcesForS3TableIntegrationCommand({
        integrationArn: 'arn:aws:logs:us-east-1:000000000000:integration:s3-tables',
      }),
    );
    expect(res.sources ?? []).toEqual([]);
  });

  it('ListSyslogConfigurations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/syslog/list' }));
    const ec2 = new EC2Client(aws.clientConfig());
    const { Vpc } = await ec2.send(new CreateVpcCommand({ CidrBlock: '10.0.0.0/16' }));
    const { VpcEndpoint } = await ec2.send(
      new CreateVpcEndpointCommand({
        VpcId: Vpc?.VpcId,
        ServiceName: 'com.amazonaws.us-east-1.logs',
        VpcEndpointType: 'Interface',
      }),
    );
    await logs.send(
      new PutSyslogConfigurationCommand({
        logGroupIdentifier: '/syslog/list',
        vpcEndpointId: VpcEndpoint?.VpcEndpointId,
      }),
    );
    const res = await logs.send(
      new ListSyslogConfigurationsCommand({ logGroupIdentifier: '/syslog/list' }),
    );
    expect(res.syslogConfigurations).toHaveLength(1);
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/tags/resource', tags: { team: 'core' } }),
    );
    const res = await logs.send(
      new ListTagsForResourceCommand({
        resourceArn: 'arn:aws:logs:us-east-1:000000000000:log-group:/tags/resource',
      }),
    );
    expect(res.tags).toEqual({ team: 'core' });
  });

  it('ListTagsLogGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new CreateLogGroupCommand({ logGroupName: '/tags/group', tags: { team: 'core' } }),
    );
    const res = await logs.send(new ListTagsLogGroupCommand({ logGroupName: '/tags/group' }));
    expect(res.tags).toEqual({ team: 'core' });
  });

  it('PutAccountPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new PutAccountPolicyCommand({
        policyName: 'put-policy',
        policyType: 'DATA_PROTECTION_POLICY',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    expect(res.accountPolicy?.policyName).toBe('put-policy');
  });

  it('PutBearerTokenAuthentication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/bearer/put' }));
    const res = await logs.send(
      new PutBearerTokenAuthenticationCommand({
        logGroupIdentifier: '/bearer/put',
        bearerTokenAuthenticationEnabled: true,
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('PutDataProtectionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/dpp/put' }));
    const res = await logs.send(
      new PutDataProtectionPolicyCommand({
        logGroupIdentifier: '/dpp/put',
        policyDocument: JSON.stringify({
          Name: 'data-protection',
          Version: '2021-06-01',
          Statement: [
            {
              Sid: 'audit',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Audit: { FindingsDestination: {} } },
            },
            {
              Sid: 'redact',
              DataIdentifier: ['arn:aws:dataprotection::aws:data-identifier/EmailAddress'],
              Operation: { Deidentify: { MaskConfig: {} } },
            },
          ],
        }),
      }),
    );
    expect(res.logGroupIdentifier).toBe('/dpp/put');
  });

  it('PutDeliveryDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/put-destination' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'put-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/put-destination',
        },
      }),
    );
    expect(deliveryDestination?.arn).toContain(':delivery-destination:put-destination');
  });

  it('PutDeliveryDestinationPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/delivery/put-dd-policy' }));
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'put-dd-policy',
        deliveryDestinationConfiguration: {
          destinationResourceArn:
            'arn:aws:logs:us-east-1:000000000000:log-group:/delivery/put-dd-policy',
        },
      }),
    );
    const res = await logs.send(
      new PutDeliveryDestinationPolicyCommand({
        deliveryDestinationName: 'put-dd-policy',
        deliveryDestinationPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'logs:CreateDelivery',
              Resource: deliveryDestination?.arn,
            },
          ],
        }),
      }),
    );
    expect(res.policy?.deliveryDestinationPolicy).toContain('logs:CreateDelivery');
  });

  it('PutDeliverySource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'put-source',
        resourceArn: 'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/put-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    expect(deliverySource?.arn).toContain(':delivery-source:put-source');
  });

  it('PutDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'put-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'put-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'put-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    expect(destination?.arn).toContain(':destination:put-destination');
  });

  it('PutDestinationPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'policy-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'policy-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'policy-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    await logs.send(
      new PutDestinationPolicyCommand({
        destinationName: 'policy-destination',
        accessPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'logs:PutSubscriptionFilter',
              Resource: destination?.arn,
            },
          ],
        }),
      }),
    );
    const res = await logs.send(
      new DescribeDestinationsCommand({ DestinationNamePrefix: 'policy-destination' }),
    );
    expect(res.destinations?.[0]?.accessPolicy).toContain('logs:PutSubscriptionFilter');
  });

  it('PutIndexPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/index/put' }));
    const res = await logs.send(
      new PutIndexPolicyCommand({
        logGroupIdentifier: '/index/put',
        policyDocument: JSON.stringify({ Fields: ['requestId'] }),
      }),
    );
    expect(res.indexPolicy?.logGroupIdentifier).toContain('/index/put');
  });

  it('PutIntegration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new PutIntegrationCommand({
        integrationName: 'put-integration',
        integrationType: 'OPENSEARCH',
        resourceConfig: {
          openSearchResourceConfig: {
            dataSourceRoleArn: 'arn:aws:iam::000000000000:role/opensearch-role',
            dashboardViewerPrincipals: ['arn:aws:iam::000000000000:role/viewer'],
            retentionDays: 30,
          },
        },
      }),
    );
    expect(res.integrationName).toBe('put-integration');
  });

  it('PutLogEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/put/events' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/put/events', logStreamName: 'main' }),
    );
    const res = await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/put/events',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'one' },
          { timestamp: Date.now(), message: 'two' },
        ],
      }),
    );
    expect(res.rejectedLogEventsInfo).toBeUndefined();
  });

  it('PutLogGroupDeletionProtection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/protected' }));
    await logs.send(
      new PutLogGroupDeletionProtectionCommand({
        logGroupIdentifier: '/protected',
        deletionProtectionEnabled: true,
      }),
    );
    await expect(
      logs.send(new DeleteLogGroupCommand({ logGroupName: '/protected' })),
    ).rejects.toThrow();
  });

  it('PutMetricFilter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/metric/put' }));
    await logs.send(
      new PutMetricFilterCommand({
        logGroupName: '/metric/put',
        filterName: 'put-filter',
        filterPattern: 'ERROR',
        metricTransformations: [
          { metricName: 'ErrorCount', metricNamespace: 'App', metricValue: '1' },
        ],
      }),
    );
    const res = await logs.send(
      new DescribeMetricFiltersCommand({ filterNamePrefix: 'put-filter' }),
    );
    expect(res.metricFilters?.[0]?.filterPattern).toBe('ERROR');
  });

  it('PutQueryDefinition', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new PutQueryDefinitionCommand({
        name: 'errors',
        queryString: 'fields @message | filter @message like /ERROR/',
        logGroupNames: ['/app'],
      }),
    );
    expect(res.queryDefinitionId).toBeTruthy();
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new PutResourcePolicyCommand({
        policyName: 'put-resource-policy',
        policyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'route53.amazonaws.com' },
              Action: ['logs:PutLogEvents', 'logs:CreateLogStream'],
              Resource: '*',
            },
          ],
        }),
      }),
    );
    expect(res.resourcePolicy?.policyName).toBe('put-resource-policy');
  });

  it('PutRetentionPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/retention/put' }));
    await logs.send(
      new PutRetentionPolicyCommand({ logGroupName: '/retention/put', retentionInDays: 14 }),
    );
    const res = await logs.send(
      new DescribeLogGroupsCommand({ logGroupNamePrefix: '/retention/put' }),
    );
    expect(res.logGroups?.[0]?.retentionInDays).toBe(14);
  });

  it('PutStorageTierPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new PutStorageTierPolicyCommand({ storageTier: 'INTELLIGENT_TIERING' }));
    const res = await logs.send(new GetStorageTierPolicyCommand({}));
    expect(res.storageTier).toBe('INTELLIGENT_TIERING');
  });

  it('PutSubscriptionFilter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sub/put' }));
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'put-sub-destination-stream', ShardCount: 1 }),
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'put-sub-destination-stream' }),
    );
    const { destination } = await logs.send(
      new PutDestinationCommand({
        destinationName: 'put-sub-destination',
        targetArn: StreamDescriptionSummary?.StreamARN,
        roleArn: 'arn:aws:iam::000000000000:role/cwl-to-kinesis',
      }),
    );
    await logs.send(
      new PutDestinationPolicyCommand({
        destinationName: 'put-sub-destination',
        accessPolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: '000000000000' },
              Action: 'logs:PutSubscriptionFilter',
              Resource: destination?.arn,
            },
          ],
        }),
      }),
    );
    await logs.send(
      new PutSubscriptionFilterCommand({
        logGroupName: '/sub/put',
        filterName: 'put-sub',
        filterPattern: '',
        destinationArn: destination?.arn,
      }),
    );
    const res = await logs.send(
      new DescribeSubscriptionFiltersCommand({ logGroupName: '/sub/put' }),
    );
    expect(res.subscriptionFilters?.[0]?.filterName).toBe('put-sub');
  });

  it('PutSyslogConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/syslog/put' }));
    const ec2 = new EC2Client(aws.clientConfig());
    const { Vpc } = await ec2.send(new CreateVpcCommand({ CidrBlock: '10.0.0.0/16' }));
    const { VpcEndpoint } = await ec2.send(
      new CreateVpcEndpointCommand({
        VpcId: Vpc?.VpcId,
        ServiceName: 'com.amazonaws.us-east-1.logs',
        VpcEndpointType: 'Interface',
      }),
    );
    const res = await logs.send(
      new PutSyslogConfigurationCommand({
        logGroupIdentifier: '/syslog/put',
        vpcEndpointId: VpcEndpoint?.VpcEndpointId,
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('PutTransformer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/transformer/put' }));
    const res = await logs.send(
      new PutTransformerCommand({
        logGroupIdentifier: '/transformer/put',
        transformerConfig: [
          { parseJSON: {} },
          { addKeys: { entries: [{ key: 'env', value: 'test' }] } },
        ],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('StartLiveTail', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/live/tail' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/live/tail', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/live/tail',
        logStreamName: 'main',
        logEvents: [{ timestamp: Date.now(), message: 'hello world' }],
      }),
    );
    const res = await logs.send(
      new StartLiveTailCommand({
        logGroupIdentifiers: ['arn:aws:logs:us-east-1:000000000000:log-group:/live/tail'],
      }),
    );
    for await (const event of res.responseStream ?? []) {
      expect(event.sessionStart?.sessionId).toBeTruthy();
      break;
    }
  });

  it('StartQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/query/start' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/query/start', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/query/start',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/query/start',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    expect(queryId).toBeTruthy();
  });

  it('StopQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/query/stop' }));
    await logs.send(
      new CreateLogStreamCommand({ logGroupName: '/query/stop', logStreamName: 'main' }),
    );
    await logs.send(
      new PutLogEventsCommand({
        logGroupName: '/query/stop',
        logStreamName: 'main',
        logEvents: [
          { timestamp: Date.now(), message: 'ERROR one' },
          { timestamp: Date.now(), message: 'INFO two' },
        ],
      }),
    );
    const { queryId } = await logs.send(
      new StartQueryCommand({
        logGroupName: '/query/stop',
        startTime: Math.floor(Date.now() / 1000) - 3600,
        endTime: Math.floor(Date.now() / 1000) + 60,
        queryString: 'fields @message | filter @message like /ERROR/',
      }),
    );
    const res = await logs.send(new StopQueryCommand({ queryId }));
    expect(typeof res.success).toBe('boolean');
  });

  it('TagLogGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/tag/group' }));
    await logs.send(new TagLogGroupCommand({ logGroupName: '/tag/group', tags: { env: 'test' } }));
    const res = await logs.send(new ListTagsLogGroupCommand({ logGroupName: '/tag/group' }));
    expect(res.tags).toEqual({ env: 'test' });
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/tag/resource' }));
    await logs.send(
      new TagResourceCommand({
        resourceArn: 'arn:aws:logs:us-east-1:000000000000:log-group:/tag/resource',
        tags: { env: 'test' },
      }),
    );
    const res = await logs.send(new ListTagsLogGroupCommand({ logGroupName: '/tag/resource' }));
    expect(res.tags).toEqual({ env: 'test' });
  });

  it('TestMetricFilter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new TestMetricFilterCommand({
        filterPattern: '[ip, user, status = 500, ...]',
        logEventMessages: ['10.0.0.1 alice 200 ok', '10.0.0.2 bob 500 boom'],
      }),
    );
    expect(res.matches?.map((match) => match.eventMessage)).toEqual(['10.0.0.2 bob 500 boom']);
  });

  it.skip('TestTransformer', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const res = await logs.send(
      new TestTransformerCommand({
        transformerConfig: [
          { parseJSON: {} },
          { addKeys: { entries: [{ key: 'env', value: 'test' }] } },
        ],
        logEventMessages: ['{"level":"info"}'],
      }),
    );
    expect(JSON.parse(res.transformedLogs?.[0]?.transformedEventMessage ?? '{}')).toMatchObject({
      env: 'test',
    });
  });

  it('UntagLogGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new CreateLogGroupCommand({
        logGroupName: '/untag/group',
        tags: { env: 'test', team: 'core' },
      }),
    );
    await logs.send(new UntagLogGroupCommand({ logGroupName: '/untag/group', tags: ['env'] }));
    const res = await logs.send(new ListTagsLogGroupCommand({ logGroupName: '/untag/group' }));
    expect(res.tags).toEqual({ team: 'core' });
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(
      new CreateLogGroupCommand({
        logGroupName: '/untag/resource',
        tags: { env: 'test', team: 'core' },
      }),
    );
    await logs.send(
      new UntagResourceCommand({
        resourceArn: 'arn:aws:logs:us-east-1:000000000000:log-group:/untag/resource',
        tagKeys: ['env'],
      }),
    );
    const res = await logs.send(new ListTagsLogGroupCommand({ logGroupName: '/untag/resource' }));
    expect(res.tags).toEqual({ team: 'core' });
  });

  it('UpdateAnomaly', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/update' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/update'],
        detectorName: 'anomaly-update-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    await expect(
      logs.send(
        new UpdateAnomalyCommand({
          anomalyDetectorArn,
          anomalyId: '00000000-0000-0000-0000-000000000000',
          suppressionType: 'INFINITE',
        }),
      ),
    ).rejects.toThrow();
  });

  it('UpdateDeliveryConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'delivery-config-bucket' }));
    const { deliverySource } = await logs.send(
      new PutDeliverySourceCommand({
        name: 'update-config-source',
        resourceArn:
          'arn:aws:bedrock-agentcore:us-east-1:000000000000:runtime/update-config-source-runtime',
        logType: 'APPLICATION_LOGS',
      }),
    );
    const { deliveryDestination } = await logs.send(
      new PutDeliveryDestinationCommand({
        name: 'update-config-destination',
        deliveryDestinationConfiguration: {
          destinationResourceArn: 'arn:aws:s3:::delivery-config-bucket',
        },
      }),
    );
    const { delivery } = await logs.send(
      new CreateDeliveryCommand({
        deliverySourceName: deliverySource?.name,
        deliveryDestinationArn: deliveryDestination?.arn,
      }),
    );
    await logs.send(
      new UpdateDeliveryConfigurationCommand({
        id: delivery?.id,
        s3DeliveryConfiguration: { suffixPath: 'logs/{yyyy}', enableHiveCompatiblePath: true },
      }),
    );
    const res = await logs.send(new GetDeliveryCommand({ id: delivery?.id }));
    expect(res.delivery?.s3DeliveryConfiguration?.enableHiveCompatiblePath).toBe(true);
  });

  it('UpdateLogAnomalyDetector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/anomaly/update-detector' }));
    const { anomalyDetectorArn } = await logs.send(
      new CreateLogAnomalyDetectorCommand({
        logGroupArnList: ['arn:aws:logs:us-east-1:000000000000:log-group:/anomaly/update-detector'],
        detectorName: 'anomaly-update-detector-detector',
        evaluationFrequency: 'FIVE_MIN',
      }),
    );
    await logs.send(
      new UpdateLogAnomalyDetectorCommand({
        anomalyDetectorArn,
        enabled: true,
        evaluationFrequency: 'ONE_HOUR',
      }),
    );
    const res = await logs.send(new GetLogAnomalyDetectorCommand({ anomalyDetectorArn }));
    expect(res.evaluationFrequency).toBe('ONE_HOUR');
  });

  it('UpdateLookupTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    const { lookupTableArn } = await logs.send(
      new CreateLookupTableCommand({
        lookupTableName: 'update_lookup',
        description: 'status codes',
        tableBody: 'code,label\n200,OK\n404,Not Found\n',
      }),
    );
    await logs.send(
      new UpdateLookupTableCommand({ lookupTableArn, tableBody: 'code,label\n500,Server Error\n' }),
    );
    const res = await logs.send(new GetLookupTableCommand({ lookupTableArn }));
    expect(res.tableBody).toContain('500,Server Error');
  });

  it('UpdateScheduledQuery', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const logs = new CloudWatchLogsClient(aws.clientConfig());
    await logs.send(new CreateLogGroupCommand({ logGroupName: '/sched/update' }));
    const { scheduledQueryArn } = await logs.send(
      new CreateScheduledQueryCommand({
        name: 'update-query',
        queryLanguage: 'CWLI',
        queryString: 'fields @timestamp, @message | limit 10',
        logGroupIdentifiers: ['/sched/update'],
        scheduleExpression: 'rate(1 hour)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
        state: 'ENABLED',
      }),
    );
    await logs.send(
      new UpdateScheduledQueryCommand({
        identifier: scheduledQueryArn,
        queryLanguage: 'CWLI',
        queryString: 'fields @message | limit 5',
        logGroupIdentifiers: ['/sched/update'],
        scheduleExpression: 'rate(2 hours)',
        executionRoleArn: 'arn:aws:iam::000000000000:role/scheduled-query-role',
      }),
    );
    const res = await logs.send(new GetScheduledQueryCommand({ identifier: scheduledQueryArn }));
    expect(res.scheduleExpression).toBe('rate(2 hours)');
  });
});
