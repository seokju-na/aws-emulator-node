import {
  BatchExecuteStatementCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  CreateBackupCommand,
  CreateGlobalTableCommand,
  CreateTableCommand,
  DeleteBackupCommand,
  DeleteItemCommand,
  DeleteResourcePolicyCommand,
  DeleteTableCommand,
  DescribeBackupCommand,
  DescribeContinuousBackupsCommand,
  DescribeContributorInsightsCommand,
  DescribeEndpointsCommand,
  DescribeExportCommand,
  DescribeGlobalTableCommand,
  DescribeGlobalTableSettingsCommand,
  DescribeImportCommand,
  DescribeKinesisStreamingDestinationCommand,
  DescribeLimitsCommand,
  DescribeTableCommand,
  DescribeTableReplicaAutoScalingCommand,
  DescribeTimeToLiveCommand,
  DisableKinesisStreamingDestinationCommand,
  DynamoDBClient,
  EnableKinesisStreamingDestinationCommand,
  ExecuteStatementCommand,
  ExecuteTransactionCommand,
  ExportTableToPointInTimeCommand,
  GetItemCommand,
  GetResourcePolicyCommand,
  ImportTableCommand,
  ListBackupsCommand,
  ListContributorInsightsCommand,
  ListExportsCommand,
  ListGlobalTablesCommand,
  ListImportsCommand,
  ListTablesCommand,
  ListTagsOfResourceCommand,
  PutItemCommand,
  PutResourcePolicyCommand,
  QueryCommand,
  RestoreTableFromBackupCommand,
  RestoreTableToPointInTimeCommand,
  ScanCommand,
  SearchVectorsCommand,
  TagResourceCommand,
  TransactGetItemsCommand,
  TransactWriteItemsCommand,
  UntagResourceCommand,
  UpdateContinuousBackupsCommand,
  UpdateContributorInsightsCommand,
  UpdateGlobalTableCommand,
  UpdateGlobalTableSettingsCommand,
  UpdateItemCommand,
  UpdateKinesisStreamingDestinationCommand,
  UpdateTableCommand,
  UpdateTableReplicaAutoScalingCommand,
  UpdateTimeToLiveCommand,
  waitUntilTableNotExists,
} from '@aws-sdk/client-dynamodb';
import {
  CreateStreamCommand,
  DescribeStreamSummaryCommand,
  KinesisClient,
  waitUntilStreamExists,
} from '@aws-sdk/client-kinesis';
import { CreateBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('dynamodb', () => {
  it('BatchExecuteStatement', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'partiql-batch',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'partiql-batch' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new BatchExecuteStatementCommand({
        Statements: [
          { Statement: "INSERT INTO \"partiql-batch\" VALUE {'pk': 'a'}" },
          { Statement: "INSERT INTO \"partiql-batch\" VALUE {'pk': 'b'}" },
        ],
      }),
    );
    expect(res.Responses?.every((response) => !response.Error)).toBe(true);
    const scan = await ddb.send(new ScanCommand({ TableName: 'partiql-batch' }));
    expect(scan.Count).toBe(2);
  });

  it('BatchGetItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'batch-get',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'batch-get' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'batch-get', Item: { pk: { S: 'a' } } }));
    await ddb.send(new PutItemCommand({ TableName: 'batch-get', Item: { pk: { S: 'b' } } }));
    const res = await ddb.send(
      new BatchGetItemCommand({
        RequestItems: { 'batch-get': { Keys: [{ pk: { S: 'a' } }, { pk: { S: 'b' } }] } },
      }),
    );
    expect(res.Responses?.['batch-get']?.map((item) => item.pk?.S).sort()).toEqual(['a', 'b']);
  });

  it('BatchWriteItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'batch-write',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'batch-write' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new BatchWriteItemCommand({
        RequestItems: {
          'batch-write': [
            { PutRequest: { Item: { pk: { S: 'a' } } } },
            { PutRequest: { Item: { pk: { S: 'b' } } } },
          ],
        },
      }),
    );
    expect(res.UnprocessedItems ?? {}).toEqual({});
    const scan = await ddb.send(new ScanCommand({ TableName: 'batch-write' }));
    expect(scan.Count).toBe(2);
  });

  it('CreateBackup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'backup-create',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'backup-create' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'backup-create', Item: { pk: { S: 'a' } } }));
    const { BackupDetails } = await ddb.send(
      new CreateBackupCommand({ TableName: 'backup-create', BackupName: 'backup-create-backup' }),
    );
    expect(BackupDetails?.BackupName).toBe('backup-create-backup');
    expect(BackupDetails?.BackupStatus).toMatch(/CREATING|AVAILABLE/);
  });

  it.skip('CreateGlobalTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'global-create',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-create' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const west = new DynamoDBClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(
      new CreateTableCommand({
        TableName: 'global-create',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await west.send(new DescribeTableCommand({ TableName: 'global-create' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const { GlobalTableDescription } = await ddb.send(
      new CreateGlobalTableCommand({
        GlobalTableName: 'global-create',
        ReplicationGroup: [{ RegionName: 'us-east-1' }, { RegionName: 'us-west-2' }],
      }),
    );
    expect(
      GlobalTableDescription?.ReplicationGroup?.map((replica) => replica.RegionName).sort(),
    ).toEqual(['us-east-1', 'us-west-2']);
    expect(TableDescription?.TableName).toBe('global-create');
  });

  it('CreateTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const res = await ddb.send(
      new CreateTableCommand({
        TableName: 'created-table',
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'N' },
          { AttributeName: 'gsi', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'by-gsi',
            KeySchema: [{ AttributeName: 'gsi', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    expect(res.TableDescription?.TableArn).toMatch(/:table\/created-table$/);
    expect(res.TableDescription?.GlobalSecondaryIndexes?.[0]?.IndexName).toBe('by-gsi');
  });

  it('DeleteBackup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'backup-delete',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'backup-delete' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'backup-delete', Item: { pk: { S: 'a' } } }));
    const { BackupDetails } = await ddb.send(
      new CreateBackupCommand({ TableName: 'backup-delete', BackupName: 'backup-delete-backup' }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeBackupCommand({ BackupArn: BackupDetails?.BackupArn })))
            .BackupDescription?.BackupDetails?.BackupStatus,
        { timeout: 10_000 },
      )
      .toBe('AVAILABLE');
    const res = await ddb.send(new DeleteBackupCommand({ BackupArn: BackupDetails?.BackupArn }));
    expect(res.BackupDescription?.BackupDetails?.BackupStatus).toBe('DELETED');
  });

  it('DeleteItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'delete-item',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'delete-item' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'delete-item', Item: { pk: { S: 'a' } } }));
    await ddb.send(new DeleteItemCommand({ TableName: 'delete-item', Key: { pk: { S: 'a' } } }));
    const res = await ddb.send(
      new GetItemCommand({ TableName: 'delete-item', Key: { pk: { S: 'a' } } }),
    );
    expect(res.Item).toBeUndefined();
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'policy-delete',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'policy-delete' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutResourcePolicyCommand({
        ResourceArn: TableDescription?.TableArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'dynamodb:GetItem',
              Resource: TableDescription?.TableArn,
            },
          ],
        }),
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new GetResourcePolicyCommand({ ResourceArn: TableDescription?.TableArn }),
            )
          ).Policy,
        {
          timeout: 10_000,
        },
      )
      .toBeTruthy();
    await ddb.send(new DeleteResourcePolicyCommand({ ResourceArn: TableDescription?.TableArn }));
    await expect
      .poll(
        () =>
          ddb.send(new GetResourcePolicyCommand({ ResourceArn: TableDescription?.TableArn })).then(
            () => 'found',
            (error: Error) => error.name,
          ),
        { timeout: 10_000 },
      )
      .toBe('PolicyNotFoundException');
  });

  it('DeleteTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'doomed-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'doomed-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new DeleteTableCommand({ TableName: 'doomed-table' }));
    await waitUntilTableNotExists(
      { client: ddb, maxWaitTime: 30, minDelay: 1 },
      { TableName: 'doomed-table' },
    );
    const res = await ddb.send(new ListTablesCommand({}));
    expect(res.TableNames).toEqual([]);
    expect(TableDescription?.TableName).toBe('doomed-table');
  });

  it('DescribeBackup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'backup-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'backup-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'backup-describe', Item: { pk: { S: 'a' } } }));
    const { BackupDetails } = await ddb.send(
      new CreateBackupCommand({
        TableName: 'backup-describe',
        BackupName: 'backup-describe-backup',
      }),
    );
    const res = await ddb.send(new DescribeBackupCommand({ BackupArn: BackupDetails?.BackupArn }));
    expect(res.BackupDescription?.SourceTableDetails?.TableName).toBe('backup-describe');
  });

  it('DescribeContinuousBackups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'pitr-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'pitr-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'pitr-describe',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    const res = await ddb.send(
      new DescribeContinuousBackupsCommand({ TableName: 'pitr-describe' }),
    );
    expect(
      res.ContinuousBackupsDescription?.PointInTimeRecoveryDescription?.PointInTimeRecoveryStatus,
    ).toBe('ENABLED');
  });

  it('DescribeContributorInsights', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'insights-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'insights-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new DescribeContributorInsightsCommand({ TableName: 'insights-describe' }),
    );
    expect(res.ContributorInsightsStatus).toBe('DISABLED');
  });

  it('DescribeEndpoints', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const res = await ddb.send(new DescribeEndpointsCommand({}));
    expect(res.Endpoints?.length).toBeGreaterThan(0);
  });

  it('DescribeExport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'export-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'export-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'export-describe', Item: { pk: { S: 'a' } } }));
    await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'export-describe',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-describe-exports' }));
    const { ExportDescription } = await ddb.send(
      new ExportTableToPointInTimeCommand({
        TableArn: TableDescription?.TableArn,
        S3Bucket: 'export-describe-exports',
        ExportFormat: 'DYNAMODB_JSON',
      }),
    );
    const res = await ddb.send(
      new DescribeExportCommand({ ExportArn: ExportDescription?.ExportArn }),
    );
    expect(res.ExportDescription?.S3Bucket).toBe('export-describe-exports');
  });

  it.skip('DescribeGlobalTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'global-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const west = new DynamoDBClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(
      new CreateTableCommand({
        TableName: 'global-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await west.send(new DescribeTableCommand({ TableName: 'global-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const { GlobalTableDescription } = await ddb.send(
      new CreateGlobalTableCommand({
        GlobalTableName: 'global-describe',
        ReplicationGroup: [{ RegionName: 'us-east-1' }, { RegionName: 'us-west-2' }],
      }),
    );
    const res = await ddb.send(
      new DescribeGlobalTableCommand({ GlobalTableName: 'global-describe' }),
    );
    expect(res.GlobalTableDescription?.GlobalTableArn).toBe(GlobalTableDescription?.GlobalTableArn);
  });

  it.skip('DescribeGlobalTableSettings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'global-settings-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-settings-describe' })))
            .Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateTableCommand({
        TableName: 'global-settings-describe',
        ReplicaUpdates: [{ Create: { RegionName: 'us-west-2' } }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-settings-describe' })))
            .Table?.Replicas?.[0]?.ReplicaStatus,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new DescribeGlobalTableSettingsCommand({ GlobalTableName: 'global-settings-describe' }),
    );
    expect(res.ReplicaSettings?.map((replica) => replica.RegionName).sort()).toEqual([
      'us-east-1',
      'us-west-2',
    ]);
  });

  it('DescribeImport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'import-describe-source' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'import-describe-source',
        Key: 'data/items.csv',
        Body: 'pk,name\na,Alice\nb,Bob\n',
      }),
    );
    const { ImportTableDescription } = await ddb.send(
      new ImportTableCommand({
        S3BucketSource: { S3Bucket: 'import-describe-source', S3KeyPrefix: 'data/' },
        InputFormat: 'CSV',
        TableCreationParameters: {
          TableName: 'import-describe',
          AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        },
      }),
    );
    const res = await ddb.send(
      new DescribeImportCommand({ ImportArn: ImportTableDescription?.ImportArn }),
    );
    expect(res.ImportTableDescription?.InputFormat).toBe('CSV');
  });

  it('DescribeKinesisStreamingDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'kinesis-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'kinesis-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'kinesis-describe-stream', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'kinesis-describe-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'kinesis-describe-stream' }),
    );
    await ddb.send(
      new EnableKinesisStreamingDestinationCommand({
        TableName: 'kinesis-describe',
        StreamArn: StreamDescriptionSummary?.StreamARN,
      }),
    );
    const res = await ddb.send(
      new DescribeKinesisStreamingDestinationCommand({ TableName: 'kinesis-describe' }),
    );
    expect(res.KinesisDataStreamDestinations?.[0]?.StreamArn).toBe(
      StreamDescriptionSummary?.StreamARN,
    );
  });

  it('DescribeLimits', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const res = await ddb.send(new DescribeLimitsCommand({}));
    expect(res.TableMaxReadCapacityUnits).toBeGreaterThan(0);
  });

  it('DescribeTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'described-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'described-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(new DescribeTableCommand({ TableName: 'described-table' }));
    expect(res.Table?.TableStatus).toBe('ACTIVE');
    expect(res.Table?.KeySchema).toEqual([{ AttributeName: 'pk', KeyType: 'HASH' }]);
  });

  it('DescribeTableReplicaAutoScaling', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'autoscaling-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'autoscaling-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateTableCommand({
        TableName: 'autoscaling-describe',
        ReplicaUpdates: [{ Create: { RegionName: 'us-west-2' } }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'autoscaling-describe' }))).Table
            ?.Replicas?.[0]?.ReplicaStatus,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new DescribeTableReplicaAutoScalingCommand({ TableName: 'autoscaling-describe' }),
    );
    expect(res.TableAutoScalingDescription?.TableName).toBe('autoscaling-describe');
  });

  it('DescribeTimeToLive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'ttl-describe',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'ttl-describe' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(new DescribeTimeToLiveCommand({ TableName: 'ttl-describe' }));
    expect(res.TimeToLiveDescription?.TimeToLiveStatus).toBe('DISABLED');
  });

  it('DisableKinesisStreamingDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'kinesis-disable',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'kinesis-disable' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'kinesis-disable-stream', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'kinesis-disable-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'kinesis-disable-stream' }),
    );
    await ddb.send(
      new EnableKinesisStreamingDestinationCommand({
        TableName: 'kinesis-disable',
        StreamArn: StreamDescriptionSummary?.StreamARN,
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new DescribeKinesisStreamingDestinationCommand({ TableName: 'kinesis-disable' }),
            )
          ).KinesisDataStreamDestinations?.[0]?.DestinationStatus,
        { timeout: 10_000 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new DisableKinesisStreamingDestinationCommand({
        TableName: 'kinesis-disable',
        StreamArn: StreamDescriptionSummary?.StreamARN,
      }),
    );
    expect(res.DestinationStatus).toBe('DISABLING');
  });

  it('EnableKinesisStreamingDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'kinesis-enable',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'kinesis-enable' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'kinesis-enable-stream', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'kinesis-enable-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'kinesis-enable-stream' }),
    );
    await ddb.send(
      new EnableKinesisStreamingDestinationCommand({
        TableName: 'kinesis-enable',
        StreamArn: StreamDescriptionSummary?.StreamARN,
      }),
    );
    const res = await ddb.send(
      new DescribeKinesisStreamingDestinationCommand({ TableName: 'kinesis-enable' }),
    );
    expect(res.KinesisDataStreamDestinations?.[0]?.DestinationStatus).toMatch(/ENABLING|ACTIVE/);
  });

  it('ExecuteStatement', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'partiql',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'partiql' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({ TableName: 'partiql', Item: { pk: { S: 'a' }, name: { S: 'Alice' } } }),
    );
    const res = await ddb.send(
      new ExecuteStatementCommand({
        Statement: 'SELECT * FROM "partiql" WHERE pk = ?',
        Parameters: [{ S: 'a' }],
      }),
    );
    expect(res.Items?.[0]?.name?.S).toBe('Alice');
  });

  it('ExecuteTransaction', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'partiql-tx',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'partiql-tx' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new ExecuteTransactionCommand({
        TransactStatements: [
          { Statement: "INSERT INTO \"partiql-tx\" VALUE {'pk': 'a'}" },
          { Statement: "INSERT INTO \"partiql-tx\" VALUE {'pk': 'b'}" },
        ],
      }),
    );
    const scan = await ddb.send(new ScanCommand({ TableName: 'partiql-tx' }));
    expect(scan.Count).toBe(2);
  });

  it('ExportTableToPointInTime', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'export-run',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'export-run' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'export-run', Item: { pk: { S: 'a' } } }));
    await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'export-run',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-run-exports' }));
    const { ExportDescription } = await ddb.send(
      new ExportTableToPointInTimeCommand({
        TableArn: TableDescription?.TableArn,
        S3Bucket: 'export-run-exports',
        ExportFormat: 'DYNAMODB_JSON',
      }),
    );
    expect(ExportDescription?.ExportArn).toContain('/export/');
    expect(ExportDescription?.ExportFormat).toBe('DYNAMODB_JSON');
  });

  it('GetItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'get-item',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'get-item' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({ TableName: 'get-item', Item: { pk: { S: 'a' }, count: { N: '3' } } }),
    );
    const res = await ddb.send(
      new GetItemCommand({ TableName: 'get-item', Key: { pk: { S: 'a' } } }),
    );
    expect(res.Item).toEqual({ pk: { S: 'a' }, count: { N: '3' } });
  });

  it('GetResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'policy-get',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'policy-get' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutResourcePolicyCommand({
        ResourceArn: TableDescription?.TableArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'dynamodb:GetItem',
              Resource: TableDescription?.TableArn,
            },
          ],
        }),
      }),
    );
    await expect
      .poll(
        () =>
          ddb.send(new GetResourcePolicyCommand({ ResourceArn: TableDescription?.TableArn })).then(
            (res) => JSON.parse(res.Policy ?? '{}').Statement[0].Action,
            () => undefined,
          ),
        { timeout: 10_000 },
      )
      .toBe('dynamodb:GetItem');
  });

  it('ImportTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'import-run-source' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'import-run-source',
        Key: 'data/items.csv',
        Body: 'pk,name\na,Alice\nb,Bob\n',
      }),
    );
    const { ImportTableDescription } = await ddb.send(
      new ImportTableCommand({
        S3BucketSource: { S3Bucket: 'import-run-source', S3KeyPrefix: 'data/' },
        InputFormat: 'CSV',
        TableCreationParameters: {
          TableName: 'import-run',
          AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        },
      }),
    );
    expect(ImportTableDescription?.ImportArn).toContain('/import/');
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new DescribeImportCommand({ ImportArn: ImportTableDescription?.ImportArn }),
            )
          ).ImportTableDescription?.ImportStatus,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('COMPLETED');
    const scan = await ddb.send(new ScanCommand({ TableName: 'import-run' }));
    expect(scan.Count).toBe(2);
  });

  it('ListBackups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'backup-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'backup-list' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'backup-list', Item: { pk: { S: 'a' } } }));
    const { BackupDetails } = await ddb.send(
      new CreateBackupCommand({ TableName: 'backup-list', BackupName: 'backup-list-backup' }),
    );
    const res = await ddb.send(new ListBackupsCommand({ TableName: 'backup-list' }));
    expect(res.BackupSummaries?.map((backup) => backup.BackupArn)).toEqual([
      BackupDetails?.BackupArn,
    ]);
  });

  it('ListContributorInsights', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'insights-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'insights-list' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateContributorInsightsCommand({
        TableName: 'insights-list',
        ContributorInsightsAction: 'ENABLE',
      }),
    );
    const res = await ddb.send(new ListContributorInsightsCommand({ TableName: 'insights-list' }));
    expect(res.ContributorInsightsSummaries?.[0]?.TableName).toBe('insights-list');
  });

  it('ListExports', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'export-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'export-list' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'export-list', Item: { pk: { S: 'a' } } }));
    await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'export-list',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'export-list-exports' }));
    const { ExportDescription } = await ddb.send(
      new ExportTableToPointInTimeCommand({
        TableArn: TableDescription?.TableArn,
        S3Bucket: 'export-list-exports',
        ExportFormat: 'DYNAMODB_JSON',
      }),
    );
    const res = await ddb.send(new ListExportsCommand({ TableArn: TableDescription?.TableArn }));
    expect(res.ExportSummaries?.map((summary) => summary.ExportArn)).toEqual([
      ExportDescription?.ExportArn,
    ]);
  });

  it.skip('ListGlobalTables', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'global-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-list' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const west = new DynamoDBClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(
      new CreateTableCommand({
        TableName: 'global-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await west.send(new DescribeTableCommand({ TableName: 'global-list' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const { GlobalTableDescription } = await ddb.send(
      new CreateGlobalTableCommand({
        GlobalTableName: 'global-list',
        ReplicationGroup: [{ RegionName: 'us-east-1' }, { RegionName: 'us-west-2' }],
      }),
    );
    const res = await ddb.send(new ListGlobalTablesCommand({}));
    expect(res.GlobalTables?.map((table) => table.GlobalTableName)).toEqual(['global-list']);
    expect(GlobalTableDescription).toBeDefined();
  });

  it('ListImports', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'import-list-source' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'import-list-source',
        Key: 'data/items.csv',
        Body: 'pk,name\na,Alice\nb,Bob\n',
      }),
    );
    const { ImportTableDescription } = await ddb.send(
      new ImportTableCommand({
        S3BucketSource: { S3Bucket: 'import-list-source', S3KeyPrefix: 'data/' },
        InputFormat: 'CSV',
        TableCreationParameters: {
          TableName: 'import-list',
          AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
          BillingMode: 'PAY_PER_REQUEST',
        },
      }),
    );
    const res = await ddb.send(new ListImportsCommand({}));
    expect(res.ImportSummaryList?.map((summary) => summary.ImportArn)).toEqual([
      ImportTableDescription?.ImportArn,
    ]);
  });

  it('ListTables', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'listed-a',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'listed-a' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new CreateTableCommand({
        TableName: 'listed-b',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    const res = await ddb.send(new ListTablesCommand({}));
    expect(res.TableNames).toEqual(['listed-a', 'listed-b']);
    expect(TableDescription?.TableName).toBe('listed-a');
  });

  it('ListTagsOfResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'tags-list',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'tags-list' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new ListTagsOfResourceCommand({ ResourceArn: TableDescription?.TableArn }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('PutItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'put-item',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'put-item' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new PutItemCommand({
        TableName: 'put-item',
        Item: { pk: { S: 'a' }, tags: { SS: ['x', 'y'] } },
        ReturnValues: 'ALL_OLD',
      }),
    );
    expect(res.Attributes).toBeUndefined();
    const item = await ddb.send(
      new GetItemCommand({ TableName: 'put-item', Key: { pk: { S: 'a' } } }),
    );
    expect(item.Item?.tags?.SS?.sort()).toEqual(['x', 'y']);
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'policy-put',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'policy-put' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new PutResourcePolicyCommand({
        ResourceArn: TableDescription?.TableArn,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: 'arn:aws:iam::111111111111:root' },
              Action: 'dynamodb:GetItem',
              Resource: TableDescription?.TableArn,
            },
          ],
        }),
      }),
    );
    expect(res.RevisionId).toBeTruthy();
  });

  it('Query', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'query-table',
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'N' },
        ],
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'query-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({ TableName: 'query-table', Item: { pk: { S: 'u' }, sk: { N: '1' } } }),
    );
    await ddb.send(
      new PutItemCommand({ TableName: 'query-table', Item: { pk: { S: 'u' }, sk: { N: '2' } } }),
    );
    await ddb.send(
      new PutItemCommand({ TableName: 'query-table', Item: { pk: { S: 'u' }, sk: { N: '3' } } }),
    );
    const res = await ddb.send(
      new QueryCommand({
        TableName: 'query-table',
        KeyConditionExpression: 'pk = :pk AND sk >= :min',
        ExpressionAttributeValues: { ':pk': { S: 'u' }, ':min': { N: '2' } },
        ScanIndexForward: false,
      }),
    );
    expect(res.Items?.map((item) => item.sk?.N)).toEqual(['3', '2']);
  });

  it('RestoreTableFromBackup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'restore-source',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'restore-source' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'restore-source', Item: { pk: { S: 'a' } } }));
    const { BackupDetails } = await ddb.send(
      new CreateBackupCommand({ TableName: 'restore-source', BackupName: 'restore-source-backup' }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeBackupCommand({ BackupArn: BackupDetails?.BackupArn })))
            .BackupDescription?.BackupDetails?.BackupStatus,
        { timeout: 10_000 },
      )
      .toBe('AVAILABLE');
    await ddb.send(
      new RestoreTableFromBackupCommand({
        TargetTableName: 'restore-target',
        BackupArn: BackupDetails?.BackupArn,
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'restore-target' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new GetItemCommand({ TableName: 'restore-target', Key: { pk: { S: 'a' } } }),
    );
    expect(res.Item?.pk?.S).toBe('a');
  });

  it('RestoreTableToPointInTime', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'pitr-source',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'pitr-source' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'pitr-source', Item: { pk: { S: 'a' } } }));
    await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'pitr-source',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    await ddb.send(
      new RestoreTableToPointInTimeCommand({
        SourceTableName: 'pitr-source',
        TargetTableName: 'pitr-target',
        UseLatestRestorableTime: true,
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'pitr-target' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(new DescribeTableCommand({ TableName: 'pitr-target' }));
    expect(res.Table?.RestoreSummary?.SourceTableArn).toBe(TableDescription?.TableArn);
  });

  it('Scan', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'scan-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'scan-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({ TableName: 'scan-table', Item: { pk: { S: 'a' }, n: { N: '1' } } }),
    );
    await ddb.send(
      new PutItemCommand({ TableName: 'scan-table', Item: { pk: { S: 'b' }, n: { N: '5' } } }),
    );
    const res = await ddb.send(
      new ScanCommand({
        TableName: 'scan-table',
        FilterExpression: 'n > :min',
        ExpressionAttributeValues: { ':min': { N: '2' } },
      }),
    );
    expect(res.Items?.map((item) => item.pk?.S)).toEqual(['b']);
  });

  it('SearchVectors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'vectors',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        VectorIndexes: [
          {
            IndexName: 'embedding-index',
            VectorAttribute: { AttributeName: 'embedding' },
            Projection: { ProjectionType: 'ALL' },
            Dimensions: 2,
            DistanceFunction: 'EUCLIDEAN',
          },
        ],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'vectors' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({
        TableName: 'vectors',
        Item: { pk: { S: 'near' }, embedding: { L: [{ N: '1' }, { N: '1' }] } },
      }),
    );
    await ddb.send(
      new PutItemCommand({
        TableName: 'vectors',
        Item: { pk: { S: 'far' }, embedding: { L: [{ N: '10' }, { N: '10' }] } },
      }),
    );
    const res = await ddb.send(
      new SearchVectorsCommand({
        TableName: 'vectors',
        IndexName: 'embedding-index',
        SearchVector: [{ N: '0' }, { N: '0' }],
        TopK: 1,
      }),
    );
    expect(res.SearchResults?.[0]?.Item?.pk?.S).toBe('near');
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'tag-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'tag-table' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new TagResourceCommand({
        ResourceArn: TableDescription?.TableArn,
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new ListTagsOfResourceCommand({ ResourceArn: TableDescription?.TableArn }),
            )
          ).Tags,
        { timeout: 10_000 },
      )
      .toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TransactGetItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'tx-get',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'tx-get' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(new PutItemCommand({ TableName: 'tx-get', Item: { pk: { S: 'a' } } }));
    await ddb.send(new PutItemCommand({ TableName: 'tx-get', Item: { pk: { S: 'b' } } }));
    const res = await ddb.send(
      new TransactGetItemsCommand({
        TransactItems: [
          { Get: { TableName: 'tx-get', Key: { pk: { S: 'a' } } } },
          { Get: { TableName: 'tx-get', Key: { pk: { S: 'b' } } } },
        ],
      }),
    );
    expect(res.Responses?.map((response) => response.Item?.pk?.S)).toEqual(['a', 'b']);
  });

  it('TransactWriteItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'tx-write',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'tx-write' }))).Table?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({
        TableName: 'tx-write',
        Item: { pk: { S: 'existing' }, balance: { N: '10' } },
      }),
    );
    await ddb.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          { Put: { TableName: 'tx-write', Item: { pk: { S: 'new' } } } },
          {
            Update: {
              TableName: 'tx-write',
              Key: { pk: { S: 'existing' } },
              UpdateExpression: 'SET balance = balance - :amount',
              ConditionExpression: 'balance >= :amount',
              ExpressionAttributeValues: { ':amount': { N: '4' } },
            },
          },
        ],
      }),
    );
    const res = await ddb.send(
      new GetItemCommand({ TableName: 'tx-write', Key: { pk: { S: 'existing' } } }),
    );
    expect(res.Item?.balance?.N).toBe('6');
    await expect(
      ddb.send(
        new TransactWriteItemsCommand({
          TransactItems: [
            {
              ConditionCheck: {
                TableName: 'tx-write',
                Key: { pk: { S: 'existing' } },
                ConditionExpression: 'balance > :limit',
                ExpressionAttributeValues: { ':limit': { N: '100' } },
              },
            },
          ],
        }),
      ),
    ).rejects.toThrow(/cancel/i);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    const { TableDescription } = await ddb.send(
      new CreateTableCommand({
        TableName: 'untag-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'untag-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UntagResourceCommand({ ResourceArn: TableDescription?.TableArn, TagKeys: ['env'] }),
    );
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new ListTagsOfResourceCommand({ ResourceArn: TableDescription?.TableArn }),
            )
          ).Tags,
        { timeout: 10_000 },
      )
      .toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UpdateContinuousBackups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'pitr-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'pitr-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateContinuousBackupsCommand({
        TableName: 'pitr-update',
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      }),
    );
    expect(
      res.ContinuousBackupsDescription?.PointInTimeRecoveryDescription?.PointInTimeRecoveryStatus,
    ).toBe('ENABLED');
  });

  it('UpdateContributorInsights', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'insights-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'insights-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateContributorInsightsCommand({
        TableName: 'insights-update',
        ContributorInsightsAction: 'ENABLE',
      }),
    );
    expect(res.ContributorInsightsStatus).toMatch(/ENABLING|ENABLED/);
  });

  it.skip('UpdateGlobalTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'global-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const west = new DynamoDBClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(
      new CreateTableCommand({
        TableName: 'global-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await west.send(new DescribeTableCommand({ TableName: 'global-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const { GlobalTableDescription } = await ddb.send(
      new CreateGlobalTableCommand({
        GlobalTableName: 'global-update',
        ReplicationGroup: [{ RegionName: 'us-east-1' }, { RegionName: 'us-west-2' }],
      }),
    );
    const res = await ddb.send(
      new UpdateGlobalTableCommand({
        GlobalTableName: 'global-update',
        ReplicaUpdates: [{ Delete: { RegionName: 'us-west-2' } }],
      }),
    );
    expect(
      res.GlobalTableDescription?.ReplicationGroup?.map((replica) => replica.RegionName),
    ).toEqual(['us-east-1']);
    expect(GlobalTableDescription).toBeDefined();
  });

  it.skip('UpdateGlobalTableSettings', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'global-settings-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-settings-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateTableCommand({
        TableName: 'global-settings-update',
        ReplicaUpdates: [{ Create: { RegionName: 'us-west-2' } }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'global-settings-update' }))).Table
            ?.Replicas?.[0]?.ReplicaStatus,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateGlobalTableSettingsCommand({
        GlobalTableName: 'global-settings-update',
        GlobalTableBillingMode: 'PAY_PER_REQUEST',
      }),
    );
    expect(res.GlobalTableName).toBe('global-settings-update');
  });

  it('UpdateItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'update-item',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'update-item' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new PutItemCommand({ TableName: 'update-item', Item: { pk: { S: 'a' }, count: { N: '1' } } }),
    );
    const res = await ddb.send(
      new UpdateItemCommand({
        TableName: 'update-item',
        Key: { pk: { S: 'a' } },
        UpdateExpression: 'SET #c = #c + :inc, label = :label',
        ExpressionAttributeNames: { '#c': 'count' },
        ExpressionAttributeValues: { ':inc': { N: '2' }, ':label': { S: 'bumped' } },
        ReturnValues: 'ALL_NEW',
      }),
    );
    expect(res.Attributes).toEqual({ pk: { S: 'a' }, count: { N: '3' }, label: { S: 'bumped' } });
  });

  it('UpdateKinesisStreamingDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'kinesis-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'kinesis-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const kinesis = new KinesisClient(aws.clientConfig());
    await kinesis.send(
      new CreateStreamCommand({ StreamName: 'kinesis-update-stream', ShardCount: 1 }),
    );
    await waitUntilStreamExists(
      { client: kinesis, maxWaitTime: 30, minDelay: 1 },
      { StreamName: 'kinesis-update-stream' },
    );
    const { StreamDescriptionSummary } = await kinesis.send(
      new DescribeStreamSummaryCommand({ StreamName: 'kinesis-update-stream' }),
    );
    await ddb.send(
      new EnableKinesisStreamingDestinationCommand({
        TableName: 'kinesis-update',
        StreamArn: StreamDescriptionSummary?.StreamARN,
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await ddb.send(
              new DescribeKinesisStreamingDestinationCommand({ TableName: 'kinesis-update' }),
            )
          ).KinesisDataStreamDestinations?.[0]?.DestinationStatus,
        { timeout: 10_000 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateKinesisStreamingDestinationCommand({
        TableName: 'kinesis-update',
        StreamArn: StreamDescriptionSummary?.StreamARN,
        UpdateKinesisStreamingConfiguration: {
          ApproximateCreationDateTimePrecision: 'MICROSECOND',
        },
      }),
    );
    expect(res.UpdateKinesisStreamingConfiguration?.ApproximateCreationDateTimePrecision).toBe(
      'MICROSECOND',
    );
  });

  it('UpdateTable', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'update-table',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'update-table' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateTableCommand({
        TableName: 'update-table',
        AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: 'by-email',
              KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
              Projection: { ProjectionType: 'KEYS_ONLY' },
            },
          },
        ],
      }),
    );
    const res = await ddb.send(new DescribeTableCommand({ TableName: 'update-table' }));
    expect(res.Table?.GlobalSecondaryIndexes?.[0]?.IndexName).toBe('by-email');
  });

  it('UpdateTableReplicaAutoScaling', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'autoscaling-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' },
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'autoscaling-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    await ddb.send(
      new UpdateTableCommand({
        TableName: 'autoscaling-update',
        ReplicaUpdates: [{ Create: { RegionName: 'us-west-2' } }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'autoscaling-update' }))).Table
            ?.Replicas?.[0]?.ReplicaStatus,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateTableReplicaAutoScalingCommand({
        TableName: 'autoscaling-update',
        ReplicaUpdates: [{ RegionName: 'us-west-2', ReplicaGlobalSecondaryIndexUpdates: [] }],
      }),
    );
    expect(res.TableAutoScalingDescription?.TableName).toBe('autoscaling-update');
  });

  it('UpdateTimeToLive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ddb = new DynamoDBClient(aws.clientConfig());
    await ddb.send(
      new CreateTableCommand({
        TableName: 'ttl-update',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    await expect
      .poll(
        async () =>
          (await ddb.send(new DescribeTableCommand({ TableName: 'ttl-update' }))).Table
            ?.TableStatus,
        {
          timeout: 30_000,
          interval: 100,
        },
      )
      .toBe('ACTIVE');
    const res = await ddb.send(
      new UpdateTimeToLiveCommand({
        TableName: 'ttl-update',
        TimeToLiveSpecification: { Enabled: true, AttributeName: 'expiresAt' },
      }),
    );
    expect(res.TimeToLiveSpecification).toEqual({ Enabled: true, AttributeName: 'expiresAt' });
  });
});
