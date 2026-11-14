import { Buffer } from 'node:buffer';
import { CreateKeyCommand, KMSClient } from '@aws-sdk/client-kms';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  CreateBucketCommand,
  CreateBucketMetadataConfigurationCommand,
  CreateBucketMetadataTableConfigurationCommand,
  CreateMultipartUploadCommand,
  CreateSessionCommand,
  DeleteBucketAnalyticsConfigurationCommand,
  DeleteBucketCommand,
  DeleteBucketCorsCommand,
  DeleteBucketEncryptionCommand,
  DeleteBucketIntelligentTieringConfigurationCommand,
  DeleteBucketInventoryConfigurationCommand,
  DeleteBucketLifecycleCommand,
  DeleteBucketMetadataConfigurationCommand,
  DeleteBucketMetadataTableConfigurationCommand,
  DeleteBucketMetricsConfigurationCommand,
  DeleteBucketOwnershipControlsCommand,
  DeleteBucketPolicyCommand,
  DeleteBucketReplicationCommand,
  DeleteBucketTaggingCommand,
  DeleteBucketWebsiteCommand,
  DeleteObjectAnnotationCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectTaggingCommand,
  DeletePublicAccessBlockCommand,
  GetBucketAbacCommand,
  GetBucketAccelerateConfigurationCommand,
  GetBucketAclCommand,
  GetBucketAnalyticsConfigurationCommand,
  GetBucketCorsCommand,
  GetBucketEncryptionCommand,
  GetBucketIntelligentTieringConfigurationCommand,
  GetBucketInventoryConfigurationCommand,
  GetBucketLifecycleConfigurationCommand,
  GetBucketLocationCommand,
  GetBucketLoggingCommand,
  GetBucketMetadataConfigurationCommand,
  GetBucketMetadataTableConfigurationCommand,
  GetBucketMetricsConfigurationCommand,
  GetBucketNotificationConfigurationCommand,
  GetBucketOwnershipControlsCommand,
  GetBucketPolicyCommand,
  GetBucketPolicyStatusCommand,
  GetBucketReplicationCommand,
  GetBucketRequestPaymentCommand,
  GetBucketTaggingCommand,
  GetBucketVersioningCommand,
  GetBucketWebsiteCommand,
  GetObjectAclCommand,
  GetObjectAnnotationCommand,
  GetObjectAttributesCommand,
  GetObjectCommand,
  GetObjectLegalHoldCommand,
  GetObjectLockConfigurationCommand,
  GetObjectRetentionCommand,
  GetObjectTaggingCommand,
  GetObjectTorrentCommand,
  GetPublicAccessBlockCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListBucketAnalyticsConfigurationsCommand,
  ListBucketIntelligentTieringConfigurationsCommand,
  ListBucketInventoryConfigurationsCommand,
  ListBucketMetricsConfigurationsCommand,
  ListBucketsCommand,
  ListDirectoryBucketsCommand,
  ListMultipartUploadsCommand,
  ListObjectAnnotationsCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  ListPartsCommand,
  PutBucketAbacCommand,
  PutBucketAccelerateConfigurationCommand,
  PutBucketAclCommand,
  PutBucketAnalyticsConfigurationCommand,
  PutBucketCorsCommand,
  PutBucketEncryptionCommand,
  PutBucketIntelligentTieringConfigurationCommand,
  PutBucketInventoryConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketLoggingCommand,
  PutBucketMetricsConfigurationCommand,
  PutBucketNotificationConfigurationCommand,
  PutBucketOwnershipControlsCommand,
  PutBucketPolicyCommand,
  PutBucketReplicationCommand,
  PutBucketRequestPaymentCommand,
  PutBucketTaggingCommand,
  PutBucketVersioningCommand,
  PutBucketWebsiteCommand,
  PutObjectAclCommand,
  PutObjectAnnotationCommand,
  PutObjectCommand,
  PutObjectLegalHoldCommand,
  PutObjectLockConfigurationCommand,
  PutObjectRetentionCommand,
  PutObjectTaggingCommand,
  PutPublicAccessBlockCommand,
  RenameObjectCommand,
  RestoreObjectCommand,
  S3Client,
  SelectObjectContentCommand,
  UpdateBucketMetadataAnnotationTableConfigurationCommand,
  UpdateBucketMetadataInventoryTableConfigurationCommand,
  UpdateBucketMetadataJournalTableConfigurationCommand,
  UpdateObjectEncryptionCommand,
  UploadPartCommand,
  UploadPartCopyCommand,
  WriteGetObjectResponseCommand,
} from '@aws-sdk/client-s3';
import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SetQueueAttributesCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('s3', () => {
  it('AbortMultipartUpload', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'abort-mpu' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'abort-mpu', Key: 'big.bin' }),
    );
    await s3.send(
      new AbortMultipartUploadCommand({ Bucket: 'abort-mpu', Key: 'big.bin', UploadId }),
    );
    const res = await s3.send(new ListMultipartUploadsCommand({ Bucket: 'abort-mpu' }));
    expect(res.Uploads ?? []).toHaveLength(0);
  });

  it('CompleteMultipartUpload', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'complete-mpu' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'complete-mpu', Key: 'big.bin' }),
    );
    const part1 = await s3.send(
      new UploadPartCommand({
        Bucket: 'complete-mpu',
        Key: 'big.bin',
        UploadId,
        PartNumber: 1,
        Body: Buffer.alloc(5 * 1024 * 1024, 'a'),
      }),
    );
    const part2 = await s3.send(
      new UploadPartCommand({
        Bucket: 'complete-mpu',
        Key: 'big.bin',
        UploadId,
        PartNumber: 2,
        Body: 'tail',
      }),
    );
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: 'complete-mpu',
        Key: 'big.bin',
        UploadId,
        MultipartUpload: {
          Parts: [
            { PartNumber: 1, ETag: part1.ETag },
            { PartNumber: 2, ETag: part2.ETag },
          ],
        },
      }),
    );
    const head = await s3.send(new HeadObjectCommand({ Bucket: 'complete-mpu', Key: 'big.bin' }));
    expect(head.ContentLength).toBe(5 * 1024 * 1024 + 4);
    expect(head.ETag).toMatch(/-2"$/);
  });

  it('CopyObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'copy-source' }));
    await s3.send(new PutObjectCommand({ Bucket: 'copy-source', Key: 'a.txt', Body: 'copy me' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'copy-target' }));
    await s3.send(
      new CopyObjectCommand({
        Bucket: 'copy-target',
        Key: 'b.txt',
        CopySource: 'copy-source/a.txt',
      }),
    );
    const res = await s3.send(new GetObjectCommand({ Bucket: 'copy-target', Key: 'b.txt' }));
    expect(await res.Body?.transformToString()).toBe('copy me');
  });

  it('CreateBucket', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ireland = new S3Client({ ...aws.clientConfig(), region: 'eu-west-1' });
    const res = await ireland.send(
      new CreateBucketCommand({
        Bucket: 'created-bucket',
        CreateBucketConfiguration: { LocationConstraint: 'eu-west-1' },
      }),
    );
    expect(res.Location).toContain('created-bucket');
    const location = await ireland.send(new GetBucketLocationCommand({ Bucket: 'created-bucket' }));
    expect(location.LocationConstraint).toBe('eu-west-1');
  });

  it('CreateBucketMetadataConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-create' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-create',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (await s3.send(new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-create' })))
            .GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    const res = await s3.send(
      new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-create' }),
    );
    expect(
      res.GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
        ?.JournalTableConfigurationResult?.RecordExpiration?.Days,
    ).toBe(7);
  });

  it.skip('CreateBucketMetadataTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-table-create' }));
    await s3.send(
      new CreateBucketMetadataTableConfigurationCommand({
        Bucket: 'metadata-table-create',
        MetadataTableConfiguration: {
          S3TablesDestination: {
            TableBucketArn: 'arn:aws:s3tables:us-east-1:000000000000:bucket/metadata',
            TableName: 'journal',
          },
        },
      }),
    );
  });

  it('CreateMultipartUpload', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'create-mpu' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'create-mpu', Key: 'big.bin' }),
    );
    expect(UploadId).toBeTruthy();
  });

  it('CreateSession', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({
        Bucket: 'express--use1-az4--x-s3',
        CreateBucketConfiguration: {
          Location: { Type: 'AvailabilityZone', Name: 'use1-az4' },
          Bucket: { Type: 'Directory', DataRedundancy: 'SingleAvailabilityZone' },
        },
      }),
    );
    const res = await s3.send(new CreateSessionCommand({ Bucket: 'express--use1-az4--x-s3' }));
    expect(res.Credentials?.SessionToken).toBeTruthy();
  });

  it('DeleteBucket', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'doomed-bucket' }));
    await s3.send(new DeleteBucketCommand({ Bucket: 'doomed-bucket' }));
    await expect(s3.send(new HeadBucketCommand({ Bucket: 'doomed-bucket' }))).rejects.toThrow();
  });

  it('DeleteBucketAnalyticsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'analytics-delete' }));
    await s3.send(
      new PutBucketAnalyticsConfigurationCommand({
        Bucket: 'analytics-delete',
        Id: 'analytics-1',
        AnalyticsConfiguration: {
          Id: 'analytics-1',
          Filter: { Prefix: 'logs/' },
          StorageClassAnalysis: {},
        },
      }),
    );
    await s3.send(
      new DeleteBucketAnalyticsConfigurationCommand({
        Bucket: 'analytics-delete',
        Id: 'analytics-1',
      }),
    );
    const res = await s3.send(
      new ListBucketAnalyticsConfigurationsCommand({ Bucket: 'analytics-delete' }),
    );
    expect(res.AnalyticsConfigurationList ?? []).toHaveLength(0);
  });

  it('DeleteBucketCors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'cors-delete' }));
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: 'cors-delete',
        CORSConfiguration: {
          CORSRules: [{ AllowedMethods: ['GET'], AllowedOrigins: ['https://example.com'] }],
        },
      }),
    );
    await s3.send(new DeleteBucketCorsCommand({ Bucket: 'cors-delete' }));
    await expect(s3.send(new GetBucketCorsCommand({ Bucket: 'cors-delete' }))).rejects.toThrow(
      /CORS/,
    );
  });

  it('DeleteBucketEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'encryption-delete' }));
    await s3.send(
      new PutBucketEncryptionCommand({
        Bucket: 'encryption-delete',
        ServerSideEncryptionConfiguration: {
          Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'aws:kms' } }],
        },
      }),
    );
    await s3.send(new DeleteBucketEncryptionCommand({ Bucket: 'encryption-delete' }));
    const res = await s3.send(new GetBucketEncryptionCommand({ Bucket: 'encryption-delete' }));
    expect(
      res.ServerSideEncryptionConfiguration?.Rules?.[0]?.ApplyServerSideEncryptionByDefault
        ?.SSEAlgorithm,
    ).toBe('AES256');
  });

  it('DeleteBucketIntelligentTieringConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tiering-delete' }));
    await s3.send(
      new PutBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-delete',
        Id: 'tiering-1',
        IntelligentTieringConfiguration: {
          Id: 'tiering-1',
          Status: 'Enabled',
          Tierings: [{ Days: 90, AccessTier: 'ARCHIVE_ACCESS' }],
        },
      }),
    );
    await s3.send(
      new DeleteBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-delete',
        Id: 'tiering-1',
      }),
    );
    const res = await s3.send(
      new ListBucketIntelligentTieringConfigurationsCommand({ Bucket: 'tiering-delete' }),
    );
    expect(res.IntelligentTieringConfigurationList ?? []).toHaveLength(0);
  });

  it('DeleteBucketInventoryConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-delete' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-delete-reports' }));
    await s3.send(
      new PutBucketInventoryConfigurationCommand({
        Bucket: 'inventory-delete',
        Id: 'inventory-1',
        InventoryConfiguration: {
          Id: 'inventory-1',
          IsEnabled: true,
          IncludedObjectVersions: 'Current',
          Schedule: { Frequency: 'Daily' },
          Destination: {
            S3BucketDestination: { Bucket: 'arn:aws:s3:::inventory-delete-reports', Format: 'CSV' },
          },
        },
      }),
    );
    await s3.send(
      new DeleteBucketInventoryConfigurationCommand({
        Bucket: 'inventory-delete',
        Id: 'inventory-1',
      }),
    );
    const res = await s3.send(
      new ListBucketInventoryConfigurationsCommand({ Bucket: 'inventory-delete' }),
    );
    expect(res.InventoryConfigurationList ?? []).toHaveLength(0);
  });

  it('DeleteBucketLifecycle', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'lifecycle-delete' }));
    await s3.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: 'lifecycle-delete',
        LifecycleConfiguration: {
          Rules: [
            {
              ID: 'expire-tmp',
              Status: 'Enabled',
              Filter: { Prefix: 'tmp/' },
              Expiration: { Days: 1 },
            },
          ],
        },
      }),
    );
    await s3.send(new DeleteBucketLifecycleCommand({ Bucket: 'lifecycle-delete' }));
    await expect(
      s3.send(new GetBucketLifecycleConfigurationCommand({ Bucket: 'lifecycle-delete' })),
    ).rejects.toThrow(/lifecycle/i);
  });

  it('DeleteBucketMetadataConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-delete' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-delete',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (await s3.send(new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-delete' })))
            .GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    await s3.send(new DeleteBucketMetadataConfigurationCommand({ Bucket: 'metadata-delete' }));
    await expect(
      s3.send(new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-delete' })),
    ).rejects.toThrow();
  });

  it.skip('DeleteBucketMetadataTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-table-delete' }));
    await s3.send(
      new DeleteBucketMetadataTableConfigurationCommand({ Bucket: 'metadata-table-delete' }),
    );
  });

  it('DeleteBucketMetricsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metrics-delete' }));
    await s3.send(
      new PutBucketMetricsConfigurationCommand({
        Bucket: 'metrics-delete',
        Id: 'metrics-1',
        MetricsConfiguration: { Id: 'metrics-1', Filter: { Prefix: 'images/' } },
      }),
    );
    await s3.send(
      new DeleteBucketMetricsConfigurationCommand({ Bucket: 'metrics-delete', Id: 'metrics-1' }),
    );
    const res = await s3.send(
      new ListBucketMetricsConfigurationsCommand({ Bucket: 'metrics-delete' }),
    );
    expect(res.MetricsConfigurationList ?? []).toHaveLength(0);
  });

  it('DeleteBucketOwnershipControls', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'ownership-delete' }));
    await s3.send(
      new PutBucketOwnershipControlsCommand({
        Bucket: 'ownership-delete',
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      }),
    );
    await s3.send(new DeleteBucketOwnershipControlsCommand({ Bucket: 'ownership-delete' }));
    await expect(
      s3.send(new GetBucketOwnershipControlsCommand({ Bucket: 'ownership-delete' })),
    ).rejects.toThrow();
  });

  it('DeleteBucketPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'policy-delete' }));
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'policy-delete' }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: 'policy-delete',
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'public-read',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::policy-delete/*',
            },
          ],
        }),
      }),
    );
    await s3.send(new DeleteBucketPolicyCommand({ Bucket: 'policy-delete' }));
    await expect(s3.send(new GetBucketPolicyCommand({ Bucket: 'policy-delete' }))).rejects.toThrow(
      /policy/i,
    );
  });

  it('DeleteBucketReplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-delete' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-delete',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-delete-replica' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-delete-replica',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(
      new PutBucketReplicationCommand({
        Bucket: 'replication-delete',
        ReplicationConfiguration: {
          Role: 'arn:aws:iam::000000000000:role/replication',
          Rules: [
            {
              ID: 'replicate-all',
              Status: 'Enabled',
              Priority: 1,
              Filter: { Prefix: '' },
              DeleteMarkerReplication: { Status: 'Disabled' },
              Destination: { Bucket: 'arn:aws:s3:::replication-delete-replica' },
            },
          ],
        },
      }),
    );
    await s3.send(new DeleteBucketReplicationCommand({ Bucket: 'replication-delete' }));
    await expect(
      s3.send(new GetBucketReplicationCommand({ Bucket: 'replication-delete' })),
    ).rejects.toThrow(/replication/i);
  });

  it('DeleteBucketTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tagging-delete' }));
    await s3.send(
      new PutBucketTaggingCommand({
        Bucket: 'tagging-delete',
        Tagging: { TagSet: [{ Key: 'team', Value: 'core' }] },
      }),
    );
    await s3.send(new DeleteBucketTaggingCommand({ Bucket: 'tagging-delete' }));
    await expect(
      s3.send(new GetBucketTaggingCommand({ Bucket: 'tagging-delete' })),
    ).rejects.toThrow(/tag/i);
  });

  it('DeleteBucketWebsite', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'website-delete' }));
    await s3.send(
      new PutBucketWebsiteCommand({
        Bucket: 'website-delete',
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'error.html' },
        },
      }),
    );
    await s3.send(new DeleteBucketWebsiteCommand({ Bucket: 'website-delete' }));
    await expect(
      s3.send(new GetBucketWebsiteCommand({ Bucket: 'website-delete' })),
    ).rejects.toThrow(/website/i);
  });

  it('DeleteObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'delete-object' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'delete-object', Key: 'gone.txt', Body: 'hello' }),
    );
    await s3.send(new DeleteObjectCommand({ Bucket: 'delete-object', Key: 'gone.txt' }));
    await expect(
      s3.send(new HeadObjectCommand({ Bucket: 'delete-object', Key: 'gone.txt' })),
    ).rejects.toThrow();
  });

  it('DeleteObjectAnnotation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'annotation-delete' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'annotation-delete', Key: 'doc.txt', Body: 'hello' }),
    );
    await s3.send(
      new PutObjectAnnotationCommand({
        Bucket: 'annotation-delete',
        Key: 'doc.txt',
        AnnotationName: 'review',
        AnnotationPayload: JSON.stringify({ approved: true }),
      }),
    );
    await s3.send(
      new DeleteObjectAnnotationCommand({
        Bucket: 'annotation-delete',
        Key: 'doc.txt',
        AnnotationName: 'review',
      }),
    );
    const res = await s3.send(
      new ListObjectAnnotationsCommand({ Bucket: 'annotation-delete', Key: 'doc.txt' }),
    );
    expect(res.Annotations ?? []).toHaveLength(0);
  });

  it('DeleteObjectTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-tagging-delete' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'object-tagging-delete',
        Key: 'tagged.txt',
        Body: 'x',
        Tagging: 'env=test',
      }),
    );
    await s3.send(
      new DeleteObjectTaggingCommand({ Bucket: 'object-tagging-delete', Key: 'tagged.txt' }),
    );
    const res = await s3.send(
      new GetObjectTaggingCommand({ Bucket: 'object-tagging-delete', Key: 'tagged.txt' }),
    );
    expect(res.TagSet).toEqual([]);
  });

  it('DeleteObjects', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'delete-objects' }));
    await s3.send(new PutObjectCommand({ Bucket: 'delete-objects', Key: 'a', Body: 'hello' }));
    await s3.send(new PutObjectCommand({ Bucket: 'delete-objects', Key: 'b', Body: 'hello' }));
    const res = await s3.send(
      new DeleteObjectsCommand({
        Bucket: 'delete-objects',
        Delete: { Objects: [{ Key: 'a' }, { Key: 'b' }] },
      }),
    );
    expect(res.Deleted?.map((entry) => entry.Key).sort()).toEqual(['a', 'b']);
    const list = await s3.send(new ListObjectsV2Command({ Bucket: 'delete-objects' }));
    expect(list.KeyCount).toBe(0);
  });

  it('DeletePublicAccessBlock', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'pab-delete' }));
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket: 'pab-delete',
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      }),
    );
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'pab-delete' }));
    await expect(
      s3.send(new GetPublicAccessBlockCommand({ Bucket: 'pab-delete' })),
    ).rejects.toThrow();
  });

  it('GetBucketAbac', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'abac-get' }));
    const res = await s3.send(new GetBucketAbacCommand({ Bucket: 'abac-get' }));
    expect(res.AbacStatus?.Status ?? 'Disabled').toBe('Disabled');
  });

  it('GetBucketAccelerateConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'accelerate-get' }));
    await s3.send(
      new PutBucketAccelerateConfigurationCommand({
        Bucket: 'accelerate-get',
        AccelerateConfiguration: { Status: 'Enabled' },
      }),
    );
    const res = await s3.send(
      new GetBucketAccelerateConfigurationCommand({ Bucket: 'accelerate-get' }),
    );
    expect(res.Status).toBe('Enabled');
  });

  it('GetBucketAcl', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'acl-get' }));
    const res = await s3.send(new GetBucketAclCommand({ Bucket: 'acl-get' }));
    expect(res.Grants?.[0]?.Permission).toBe('FULL_CONTROL');
    expect(res.Owner?.ID).toBeTruthy();
  });

  it('GetBucketAnalyticsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'analytics-get' }));
    await s3.send(
      new PutBucketAnalyticsConfigurationCommand({
        Bucket: 'analytics-get',
        Id: 'analytics-1',
        AnalyticsConfiguration: {
          Id: 'analytics-1',
          Filter: { Prefix: 'logs/' },
          StorageClassAnalysis: {},
        },
      }),
    );
    const res = await s3.send(
      new GetBucketAnalyticsConfigurationCommand({ Bucket: 'analytics-get', Id: 'analytics-1' }),
    );
    expect(res.AnalyticsConfiguration?.Filter?.Prefix).toBe('logs/');
  });

  it('GetBucketCors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'cors-get' }));
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: 'cors-get',
        CORSConfiguration: {
          CORSRules: [{ AllowedMethods: ['GET'], AllowedOrigins: ['https://example.com'] }],
        },
      }),
    );
    const res = await s3.send(new GetBucketCorsCommand({ Bucket: 'cors-get' }));
    expect(res.CORSRules?.[0]?.AllowedOrigins).toEqual(['https://example.com']);
  });

  it('GetBucketEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'encryption-get' }));
    const res = await s3.send(new GetBucketEncryptionCommand({ Bucket: 'encryption-get' }));
    expect(
      res.ServerSideEncryptionConfiguration?.Rules?.[0]?.ApplyServerSideEncryptionByDefault
        ?.SSEAlgorithm,
    ).toBe('AES256');
  });

  it('GetBucketIntelligentTieringConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tiering-get' }));
    await s3.send(
      new PutBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-get',
        Id: 'tiering-1',
        IntelligentTieringConfiguration: {
          Id: 'tiering-1',
          Status: 'Enabled',
          Tierings: [{ Days: 90, AccessTier: 'ARCHIVE_ACCESS' }],
        },
      }),
    );
    const res = await s3.send(
      new GetBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-get',
        Id: 'tiering-1',
      }),
    );
    expect(res.IntelligentTieringConfiguration?.Tierings?.[0]?.AccessTier).toBe('ARCHIVE_ACCESS');
  });

  it('GetBucketInventoryConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-get' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-get-reports' }));
    await s3.send(
      new PutBucketInventoryConfigurationCommand({
        Bucket: 'inventory-get',
        Id: 'inventory-1',
        InventoryConfiguration: {
          Id: 'inventory-1',
          IsEnabled: true,
          IncludedObjectVersions: 'Current',
          Schedule: { Frequency: 'Daily' },
          Destination: {
            S3BucketDestination: { Bucket: 'arn:aws:s3:::inventory-get-reports', Format: 'CSV' },
          },
        },
      }),
    );
    const res = await s3.send(
      new GetBucketInventoryConfigurationCommand({ Bucket: 'inventory-get', Id: 'inventory-1' }),
    );
    expect(res.InventoryConfiguration?.Schedule?.Frequency).toBe('Daily');
  });

  it('GetBucketLifecycleConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'lifecycle-get' }));
    await s3.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: 'lifecycle-get',
        LifecycleConfiguration: {
          Rules: [
            {
              ID: 'expire-tmp',
              Status: 'Enabled',
              Filter: { Prefix: 'tmp/' },
              Expiration: { Days: 1 },
            },
          ],
        },
      }),
    );
    const res = await s3.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: 'lifecycle-get' }),
    );
    expect(res.Rules?.[0]?.ID).toBe('expire-tmp');
  });

  it('GetBucketLocation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const seoul = new S3Client({ ...aws.clientConfig(), region: 'ap-northeast-2' });
    await seoul.send(
      new CreateBucketCommand({
        Bucket: 'location-get',
        CreateBucketConfiguration: { LocationConstraint: 'ap-northeast-2' },
      }),
    );
    const res = await seoul.send(new GetBucketLocationCommand({ Bucket: 'location-get' }));
    expect(res.LocationConstraint).toBe('ap-northeast-2');
  });

  it('GetBucketLogging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'logging-get' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'logging-get-target' }));
    await s3.send(
      new PutBucketLoggingCommand({
        Bucket: 'logging-get',
        BucketLoggingStatus: {
          LoggingEnabled: { TargetBucket: 'logging-get-target', TargetPrefix: 'logs/' },
        },
      }),
    );
    const res = await s3.send(new GetBucketLoggingCommand({ Bucket: 'logging-get' }));
    expect(res.LoggingEnabled?.TargetBucket).toBe('logging-get-target');
  });

  it('GetBucketMetadataConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-get' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-get',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (await s3.send(new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-get' })))
            .GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    const res = await s3.send(
      new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-get' }),
    );
    expect(
      res.GetBucketMetadataConfigurationResult?.MetadataConfigurationResult?.DestinationResult,
    ).toBeDefined();
  });

  it.skip('GetBucketMetadataTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-table-get' }));
    const res = await s3.send(
      new GetBucketMetadataTableConfigurationCommand({ Bucket: 'metadata-table-get' }),
    );
    expect(res.GetBucketMetadataTableConfigurationResult).toBeDefined();
  });

  it('GetBucketMetricsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metrics-get' }));
    await s3.send(
      new PutBucketMetricsConfigurationCommand({
        Bucket: 'metrics-get',
        Id: 'metrics-1',
        MetricsConfiguration: { Id: 'metrics-1', Filter: { Prefix: 'images/' } },
      }),
    );
    const res = await s3.send(
      new GetBucketMetricsConfigurationCommand({ Bucket: 'metrics-get', Id: 'metrics-1' }),
    );
    expect(res.MetricsConfiguration?.Filter).toEqual({ Prefix: 'images/' });
  });

  it('GetBucketNotificationConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'notification-get' }));
    const res = await s3.send(
      new GetBucketNotificationConfigurationCommand({ Bucket: 'notification-get' }),
    );
    expect(res.QueueConfigurations ?? []).toHaveLength(0);
  });

  it('GetBucketOwnershipControls', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'ownership-get' }));
    await s3.send(
      new PutBucketOwnershipControlsCommand({
        Bucket: 'ownership-get',
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      }),
    );
    const res = await s3.send(new GetBucketOwnershipControlsCommand({ Bucket: 'ownership-get' }));
    expect(res.OwnershipControls?.Rules?.[0]?.ObjectOwnership).toBe('BucketOwnerPreferred');
  });

  it('GetBucketPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'policy-get' }));
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'policy-get' }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: 'policy-get',
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'public-read',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::policy-get/*',
            },
          ],
        }),
      }),
    );
    const res = await s3.send(new GetBucketPolicyCommand({ Bucket: 'policy-get' }));
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Sid).toBe('public-read');
  });

  it('GetBucketPolicyStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'policy-status' }));
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'policy-status' }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: 'policy-status',
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'public-read',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::policy-status/*',
            },
          ],
        }),
      }),
    );
    const res = await s3.send(new GetBucketPolicyStatusCommand({ Bucket: 'policy-status' }));
    expect(res.PolicyStatus?.IsPublic).toBe(true);
  });

  it('GetBucketReplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-get' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-get',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-get-replica' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-get-replica',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(
      new PutBucketReplicationCommand({
        Bucket: 'replication-get',
        ReplicationConfiguration: {
          Role: 'arn:aws:iam::000000000000:role/replication',
          Rules: [
            {
              ID: 'replicate-all',
              Status: 'Enabled',
              Priority: 1,
              Filter: { Prefix: '' },
              DeleteMarkerReplication: { Status: 'Disabled' },
              Destination: { Bucket: 'arn:aws:s3:::replication-get-replica' },
            },
          ],
        },
      }),
    );
    const res = await s3.send(new GetBucketReplicationCommand({ Bucket: 'replication-get' }));
    expect(res.ReplicationConfiguration?.Rules?.[0]?.ID).toBe('replicate-all');
  });

  it('GetBucketRequestPayment', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'payment-get' }));
    const res = await s3.send(new GetBucketRequestPaymentCommand({ Bucket: 'payment-get' }));
    expect(res.Payer).toBe('BucketOwner');
  });

  it('GetBucketTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tagging-get' }));
    await s3.send(
      new PutBucketTaggingCommand({
        Bucket: 'tagging-get',
        Tagging: { TagSet: [{ Key: 'team', Value: 'core' }] },
      }),
    );
    const res = await s3.send(new GetBucketTaggingCommand({ Bucket: 'tagging-get' }));
    expect(res.TagSet).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('GetBucketVersioning', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'versioning-get' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'versioning-get',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    const res = await s3.send(new GetBucketVersioningCommand({ Bucket: 'versioning-get' }));
    expect(res.Status).toBe('Enabled');
  });

  it('GetBucketWebsite', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'website-get' }));
    await s3.send(
      new PutBucketWebsiteCommand({
        Bucket: 'website-get',
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'error.html' },
        },
      }),
    );
    const res = await s3.send(new GetBucketWebsiteCommand({ Bucket: 'website-get' }));
    expect(res.IndexDocument?.Suffix).toBe('index.html');
  });

  it('GetObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'get-object' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'get-object',
        Key: 'hello.txt',
        Body: 'hello world',
        ContentType: 'text/plain',
        Metadata: { owner: 'me' },
      }),
    );
    const res = await s3.send(
      new GetObjectCommand({ Bucket: 'get-object', Key: 'hello.txt', Range: 'bytes=0-4' }),
    );
    expect(await res.Body?.transformToString()).toBe('hello');
    expect(res.ContentType).toBe('text/plain');
    expect(res.Metadata).toEqual({ owner: 'me' });
  });

  it('GetObjectAcl', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-acl-get' }));
    await s3.send(new PutObjectCommand({ Bucket: 'object-acl-get', Key: 'a.txt', Body: 'hello' }));
    const res = await s3.send(new GetObjectAclCommand({ Bucket: 'object-acl-get', Key: 'a.txt' }));
    expect(res.Grants?.[0]?.Permission).toBe('FULL_CONTROL');
  });

  it('GetObjectAnnotation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'annotation-get' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'annotation-get', Key: 'doc.txt', Body: 'hello' }),
    );
    await s3.send(
      new PutObjectAnnotationCommand({
        Bucket: 'annotation-get',
        Key: 'doc.txt',
        AnnotationName: 'review',
        AnnotationPayload: JSON.stringify({ approved: true }),
      }),
    );
    const res = await s3.send(
      new GetObjectAnnotationCommand({
        Bucket: 'annotation-get',
        Key: 'doc.txt',
        AnnotationName: 'review',
      }),
    );
    expect(JSON.parse((await res.AnnotationPayload?.transformToString()) ?? '{}')).toEqual({
      approved: true,
    });
  });

  it('GetObjectAttributes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'attributes-get' }));
    await s3.send(new PutObjectCommand({ Bucket: 'attributes-get', Key: 'a.txt', Body: 'abc' }));
    const res = await s3.send(
      new GetObjectAttributesCommand({
        Bucket: 'attributes-get',
        Key: 'a.txt',
        ObjectAttributes: ['ETag', 'ObjectSize', 'StorageClass'],
      }),
    );
    expect(res.ObjectSize).toBe(3);
    expect(res.StorageClass).toBe('STANDARD');
  });

  it('GetObjectLegalHold', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'legal-hold-get', ObjectLockEnabledForBucket: true }),
    );
    await s3.send(new PutObjectCommand({ Bucket: 'legal-hold-get', Key: 'a.txt', Body: 'hello' }));
    await s3.send(
      new PutObjectLegalHoldCommand({
        Bucket: 'legal-hold-get',
        Key: 'a.txt',
        LegalHold: { Status: 'ON' },
      }),
    );
    const res = await s3.send(
      new GetObjectLegalHoldCommand({ Bucket: 'legal-hold-get', Key: 'a.txt' }),
    );
    expect(res.LegalHold?.Status).toBe('ON');
  });

  it('GetObjectLockConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'lock-get', ObjectLockEnabledForBucket: true }),
    );
    const res = await s3.send(new GetObjectLockConfigurationCommand({ Bucket: 'lock-get' }));
    expect(res.ObjectLockConfiguration?.ObjectLockEnabled).toBe('Enabled');
  });

  it('GetObjectRetention', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'retention-get', ObjectLockEnabledForBucket: true }),
    );
    await s3.send(new PutObjectCommand({ Bucket: 'retention-get', Key: 'a.txt', Body: 'hello' }));
    await s3.send(
      new PutObjectRetentionCommand({
        Bucket: 'retention-get',
        Key: 'a.txt',
        Retention: { Mode: 'GOVERNANCE', RetainUntilDate: new Date(Date.now() + 86_400_000) },
      }),
    );
    const res = await s3.send(
      new GetObjectRetentionCommand({ Bucket: 'retention-get', Key: 'a.txt' }),
    );
    expect(res.Retention?.Mode).toBe('GOVERNANCE');
  });

  it('GetObjectTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-tagging-get' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'object-tagging-get',
        Key: 'a.txt',
        Body: 'x',
        Tagging: 'env=test&team=core',
      }),
    );
    const res = await s3.send(
      new GetObjectTaggingCommand({ Bucket: 'object-tagging-get', Key: 'a.txt' }),
    );
    expect(res.TagSet).toEqual([
      { Key: 'env', Value: 'test' },
      { Key: 'team', Value: 'core' },
    ]);
  });

  it.skip('GetObjectTorrent', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'torrent-get' }));
    await s3.send(new PutObjectCommand({ Bucket: 'torrent-get', Key: 'a.txt', Body: 'hello' }));
    const res = await s3.send(new GetObjectTorrentCommand({ Bucket: 'torrent-get', Key: 'a.txt' }));
    expect((await res.Body?.transformToByteArray())?.length).toBeGreaterThan(0);
  });

  it('GetPublicAccessBlock', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'pab-get' }));
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket: 'pab-get',
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      }),
    );
    const res = await s3.send(new GetPublicAccessBlockCommand({ Bucket: 'pab-get' }));
    expect(res.PublicAccessBlockConfiguration?.BlockPublicAcls).toBe(true);
  });

  it('HeadBucket', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'head-bucket' }));
    const res = await s3.send(new HeadBucketCommand({ Bucket: 'head-bucket' }));
    expect(res.BucketRegion).toBe('us-east-1');
  });

  it('HeadObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'head-object' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'head-object',
        Key: 'a.txt',
        Body: 'abcd',
        ContentType: 'text/plain',
      }),
    );
    const res = await s3.send(new HeadObjectCommand({ Bucket: 'head-object', Key: 'a.txt' }));
    expect(res.ContentLength).toBe(4);
    expect(res.ContentType).toBe('text/plain');
  });

  it('ListBucketAnalyticsConfigurations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'analytics-list' }));
    await s3.send(
      new PutBucketAnalyticsConfigurationCommand({
        Bucket: 'analytics-list',
        Id: 'analytics-1',
        AnalyticsConfiguration: {
          Id: 'analytics-1',
          Filter: { Prefix: 'logs/' },
          StorageClassAnalysis: {},
        },
      }),
    );
    const res = await s3.send(
      new ListBucketAnalyticsConfigurationsCommand({ Bucket: 'analytics-list' }),
    );
    expect(res.AnalyticsConfigurationList?.map((config) => config.Id)).toEqual(['analytics-1']);
  });

  it('ListBucketIntelligentTieringConfigurations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tiering-list' }));
    await s3.send(
      new PutBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-list',
        Id: 'tiering-1',
        IntelligentTieringConfiguration: {
          Id: 'tiering-1',
          Status: 'Enabled',
          Tierings: [{ Days: 90, AccessTier: 'ARCHIVE_ACCESS' }],
        },
      }),
    );
    const res = await s3.send(
      new ListBucketIntelligentTieringConfigurationsCommand({ Bucket: 'tiering-list' }),
    );
    expect(res.IntelligentTieringConfigurationList?.map((config) => config.Id)).toEqual([
      'tiering-1',
    ]);
  });

  it('ListBucketInventoryConfigurations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-list' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-list-reports' }));
    await s3.send(
      new PutBucketInventoryConfigurationCommand({
        Bucket: 'inventory-list',
        Id: 'inventory-1',
        InventoryConfiguration: {
          Id: 'inventory-1',
          IsEnabled: true,
          IncludedObjectVersions: 'Current',
          Schedule: { Frequency: 'Daily' },
          Destination: {
            S3BucketDestination: { Bucket: 'arn:aws:s3:::inventory-list-reports', Format: 'CSV' },
          },
        },
      }),
    );
    const res = await s3.send(
      new ListBucketInventoryConfigurationsCommand({ Bucket: 'inventory-list' }),
    );
    expect(res.InventoryConfigurationList?.map((config) => config.Id)).toEqual(['inventory-1']);
  });

  it('ListBucketMetricsConfigurations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metrics-list' }));
    await s3.send(
      new PutBucketMetricsConfigurationCommand({
        Bucket: 'metrics-list',
        Id: 'metrics-1',
        MetricsConfiguration: { Id: 'metrics-1', Filter: { Prefix: 'images/' } },
      }),
    );
    const res = await s3.send(
      new ListBucketMetricsConfigurationsCommand({ Bucket: 'metrics-list' }),
    );
    expect(res.MetricsConfigurationList?.map((config) => config.Id)).toEqual(['metrics-1']);
  });

  it('ListBuckets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'listed-a' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'listed-b' }));
    const res = await s3.send(new ListBucketsCommand({}));
    expect(res.Buckets?.map((bucket) => bucket.Name)).toEqual(['listed-a', 'listed-b']);
  });

  it('ListDirectoryBuckets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({
        Bucket: 'express--use1-az4--x-s3',
        CreateBucketConfiguration: {
          Location: { Type: 'AvailabilityZone', Name: 'use1-az4' },
          Bucket: { Type: 'Directory', DataRedundancy: 'SingleAvailabilityZone' },
        },
      }),
    );
    const res = await s3.send(new ListDirectoryBucketsCommand({}));
    expect(res.Buckets?.map((bucket) => bucket.Name)).toEqual(['express--use1-az4--x-s3']);
  });

  it('ListMultipartUploads', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'list-mpu' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'list-mpu', Key: 'big.bin' }),
    );
    const res = await s3.send(new ListMultipartUploadsCommand({ Bucket: 'list-mpu' }));
    expect(res.Uploads?.map((upload) => upload.UploadId)).toEqual([UploadId]);
  });

  it('ListObjectAnnotations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'annotation-list' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'annotation-list', Key: 'doc.txt', Body: 'hello' }),
    );
    await s3.send(
      new PutObjectAnnotationCommand({
        Bucket: 'annotation-list',
        Key: 'doc.txt',
        AnnotationName: 'review',
        AnnotationPayload: JSON.stringify({ approved: true }),
      }),
    );
    const res = await s3.send(
      new ListObjectAnnotationsCommand({ Bucket: 'annotation-list', Key: 'doc.txt' }),
    );
    expect(res.Annotations?.map((annotation) => annotation.AnnotationName)).toEqual(['review']);
  });

  it('ListObjectVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'list-versions' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'list-versions',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(new PutObjectCommand({ Bucket: 'list-versions', Key: 'a.txt', Body: 'v1' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-versions', Key: 'a.txt', Body: 'v2' }));
    const res = await s3.send(new ListObjectVersionsCommand({ Bucket: 'list-versions' }));
    expect(res.Versions).toHaveLength(2);
    expect(res.Versions?.filter((version) => version.IsLatest)).toHaveLength(1);
  });

  it('ListObjects', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'list-objects' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects', Key: 'a/1', Body: 'hello' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects', Key: 'a/2', Body: 'hello' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects', Key: 'b/1', Body: 'hello' }));
    const res = await s3.send(new ListObjectsCommand({ Bucket: 'list-objects', Prefix: 'a/' }));
    expect(res.Contents?.map((object) => object.Key)).toEqual(['a/1', 'a/2']);
  });

  it('ListObjectsV2', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'list-objects-v2' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects-v2', Key: 'a/1', Body: 'hello' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects-v2', Key: 'a/2', Body: 'hello' }));
    await s3.send(new PutObjectCommand({ Bucket: 'list-objects-v2', Key: 'b/1', Body: 'hello' }));
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: 'list-objects-v2', Delimiter: '/' }),
    );
    expect(res.CommonPrefixes?.map((prefix) => prefix.Prefix)).toEqual(['a/', 'b/']);
    const page = await s3.send(new ListObjectsV2Command({ Bucket: 'list-objects-v2', MaxKeys: 2 }));
    expect(page.IsTruncated).toBe(true);
    const next = await s3.send(
      new ListObjectsV2Command({
        Bucket: 'list-objects-v2',
        ContinuationToken: page.NextContinuationToken,
      }),
    );
    expect(next.Contents?.map((object) => object.Key)).toEqual(['b/1']);
  });

  it('ListParts', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'list-parts' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'list-parts', Key: 'big.bin' }),
    );
    await s3.send(
      new UploadPartCommand({
        Bucket: 'list-parts',
        Key: 'big.bin',
        UploadId,
        PartNumber: 1,
        Body: 'part',
      }),
    );
    const res = await s3.send(
      new ListPartsCommand({ Bucket: 'list-parts', Key: 'big.bin', UploadId }),
    );
    expect(res.Parts?.map((part) => part.PartNumber)).toEqual([1]);
  });

  it('PutBucketAbac', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'abac-put' }));
    await s3.send(
      new PutBucketAbacCommand({ Bucket: 'abac-put', AbacStatus: { Status: 'Enabled' } }),
    );
    const res = await s3.send(new GetBucketAbacCommand({ Bucket: 'abac-put' }));
    expect(res.AbacStatus?.Status).toBe('Enabled');
  });

  it('PutBucketAccelerateConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'accelerate-put' }));
    await s3.send(
      new PutBucketAccelerateConfigurationCommand({
        Bucket: 'accelerate-put',
        AccelerateConfiguration: { Status: 'Suspended' },
      }),
    );
    const res = await s3.send(
      new GetBucketAccelerateConfigurationCommand({ Bucket: 'accelerate-put' }),
    );
    expect(res.Status).toBe('Suspended');
  });

  it('PutBucketAcl', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'acl-put' }));
    await s3.send(
      new PutBucketOwnershipControlsCommand({
        Bucket: 'acl-put',
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      }),
    );
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'acl-put' }));
    await s3.send(new PutBucketAclCommand({ Bucket: 'acl-put', ACL: 'public-read' }));
    const res = await s3.send(new GetBucketAclCommand({ Bucket: 'acl-put' }));
    expect(
      res.Grants?.some(
        (grant) => grant.Grantee?.URI?.endsWith('/AllUsers') && grant.Permission === 'READ',
      ),
    ).toBe(true);
  });

  it('PutBucketAnalyticsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'analytics-put' }));
    await s3.send(
      new PutBucketAnalyticsConfigurationCommand({
        Bucket: 'analytics-put',
        Id: 'analytics-1',
        AnalyticsConfiguration: {
          Id: 'analytics-1',
          Filter: { Prefix: 'logs/' },
          StorageClassAnalysis: {},
        },
      }),
    );
    const res = await s3.send(
      new ListBucketAnalyticsConfigurationsCommand({ Bucket: 'analytics-put' }),
    );
    expect(res.AnalyticsConfigurationList).toHaveLength(1);
  });

  it('PutBucketCors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'cors-put' }));
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: 'cors-put',
        CORSConfiguration: {
          CORSRules: [{ AllowedMethods: ['GET'], AllowedOrigins: ['https://example.com'] }],
        },
      }),
    );
    const res = await s3.send(new GetBucketCorsCommand({ Bucket: 'cors-put' }));
    expect(res.CORSRules?.[0]?.AllowedMethods).toEqual(['GET']);
  });

  it('PutBucketEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'encryption-put' }));
    await s3.send(
      new PutBucketEncryptionCommand({
        Bucket: 'encryption-put',
        ServerSideEncryptionConfiguration: {
          Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'aws:kms' } }],
        },
      }),
    );
    const res = await s3.send(new GetBucketEncryptionCommand({ Bucket: 'encryption-put' }));
    expect(
      res.ServerSideEncryptionConfiguration?.Rules?.[0]?.ApplyServerSideEncryptionByDefault
        ?.SSEAlgorithm,
    ).toBe('aws:kms');
  });

  it('PutBucketIntelligentTieringConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tiering-put' }));
    await s3.send(
      new PutBucketIntelligentTieringConfigurationCommand({
        Bucket: 'tiering-put',
        Id: 'tiering-1',
        IntelligentTieringConfiguration: {
          Id: 'tiering-1',
          Status: 'Enabled',
          Tierings: [{ Days: 90, AccessTier: 'ARCHIVE_ACCESS' }],
        },
      }),
    );
    const res = await s3.send(
      new ListBucketIntelligentTieringConfigurationsCommand({ Bucket: 'tiering-put' }),
    );
    expect(res.IntelligentTieringConfigurationList?.[0]?.Status).toBe('Enabled');
  });

  it('PutBucketInventoryConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-put' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'inventory-put-reports' }));
    await s3.send(
      new PutBucketInventoryConfigurationCommand({
        Bucket: 'inventory-put',
        Id: 'inventory-1',
        InventoryConfiguration: {
          Id: 'inventory-1',
          IsEnabled: true,
          IncludedObjectVersions: 'Current',
          Schedule: { Frequency: 'Daily' },
          Destination: {
            S3BucketDestination: { Bucket: 'arn:aws:s3:::inventory-put-reports', Format: 'CSV' },
          },
        },
      }),
    );
    const res = await s3.send(
      new ListBucketInventoryConfigurationsCommand({ Bucket: 'inventory-put' }),
    );
    expect(res.InventoryConfigurationList?.[0]?.IsEnabled).toBe(true);
  });

  it('PutBucketLifecycleConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'lifecycle-put' }));
    await s3.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: 'lifecycle-put',
        LifecycleConfiguration: {
          Rules: [
            {
              ID: 'expire-tmp',
              Status: 'Enabled',
              Filter: { Prefix: 'tmp/' },
              Expiration: { Days: 1 },
            },
          ],
        },
      }),
    );
    const res = await s3.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: 'lifecycle-put' }),
    );
    expect(res.Rules?.[0]?.Expiration?.Days).toBe(1);
  });

  it('PutBucketLogging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'logging-put' }));
    await s3.send(new CreateBucketCommand({ Bucket: 'logging-put-target' }));
    await s3.send(
      new PutBucketLoggingCommand({
        Bucket: 'logging-put',
        BucketLoggingStatus: {
          LoggingEnabled: { TargetBucket: 'logging-put-target', TargetPrefix: 'access/' },
        },
      }),
    );
    const res = await s3.send(new GetBucketLoggingCommand({ Bucket: 'logging-put' }));
    expect(res.LoggingEnabled?.TargetPrefix).toBe('access/');
  });

  it('PutBucketMetricsConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metrics-put' }));
    await s3.send(
      new PutBucketMetricsConfigurationCommand({
        Bucket: 'metrics-put',
        Id: 'metrics-1',
        MetricsConfiguration: { Id: 'metrics-1', Filter: { Prefix: 'images/' } },
      }),
    );
    const res = await s3.send(
      new ListBucketMetricsConfigurationsCommand({ Bucket: 'metrics-put' }),
    );
    expect(res.MetricsConfigurationList).toHaveLength(1);
  });

  it('PutBucketNotificationConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'notification-put' }));
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'bucket-events' }));
    const { Attributes } = await sqs.send(
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
                Principal: { Service: 's3.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: Attributes?.QueueArn,
                Condition: { ArnLike: { 'aws:SourceArn': 'arn:aws:s3:::notification-put' } },
              },
            ],
          }),
        },
      }),
    );
    await s3.send(
      new PutBucketNotificationConfigurationCommand({
        Bucket: 'notification-put',
        NotificationConfiguration: {
          QueueConfigurations: [{ QueueArn: Attributes?.QueueArn, Events: ['s3:ObjectCreated:*'] }],
        },
      }),
    );
    await s3.send(
      new PutObjectCommand({ Bucket: 'notification-put', Key: 'uploaded.txt', Body: 'hello' }),
    );
    await expect
      .poll(
        async () =>
          (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queue.QueueUrl }))).Messages?.find(
            (message) => message.Body?.includes('uploaded.txt'),
          ) !== undefined,
        { timeout: 10_000 },
      )
      .toBe(true);
  });

  it('PutBucketOwnershipControls', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'ownership-put' }));
    await s3.send(
      new PutBucketOwnershipControlsCommand({
        Bucket: 'ownership-put',
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      }),
    );
    const res = await s3.send(new GetBucketOwnershipControlsCommand({ Bucket: 'ownership-put' }));
    expect(res.OwnershipControls?.Rules).toHaveLength(1);
  });

  it('PutBucketPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'policy-put' }));
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'policy-put' }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: 'policy-put',
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'public-read',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::policy-put/*',
            },
          ],
        }),
      }),
    );
    const res = await s3.send(new GetBucketPolicyCommand({ Bucket: 'policy-put' }));
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Action).toBe('s3:GetObject');
  });

  it('PutBucketReplication', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-put' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-put',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(new CreateBucketCommand({ Bucket: 'replication-put-replica' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'replication-put-replica',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(
      new PutBucketReplicationCommand({
        Bucket: 'replication-put',
        ReplicationConfiguration: {
          Role: 'arn:aws:iam::000000000000:role/replication',
          Rules: [
            {
              ID: 'replicate-all',
              Status: 'Enabled',
              Priority: 1,
              Filter: { Prefix: '' },
              DeleteMarkerReplication: { Status: 'Disabled' },
              Destination: { Bucket: 'arn:aws:s3:::replication-put-replica' },
            },
          ],
        },
      }),
    );
    const res = await s3.send(new GetBucketReplicationCommand({ Bucket: 'replication-put' }));
    expect(res.ReplicationConfiguration?.Rules?.[0]?.Destination?.Bucket).toBe(
      'arn:aws:s3:::replication-put-replica',
    );
  });

  it('PutBucketRequestPayment', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'payment-put' }));
    await s3.send(
      new PutBucketRequestPaymentCommand({
        Bucket: 'payment-put',
        RequestPaymentConfiguration: { Payer: 'Requester' },
      }),
    );
    const res = await s3.send(new GetBucketRequestPaymentCommand({ Bucket: 'payment-put' }));
    expect(res.Payer).toBe('Requester');
  });

  it('PutBucketTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'tagging-put' }));
    await s3.send(
      new PutBucketTaggingCommand({
        Bucket: 'tagging-put',
        Tagging: { TagSet: [{ Key: 'team', Value: 'core' }] },
      }),
    );
    const res = await s3.send(new GetBucketTaggingCommand({ Bucket: 'tagging-put' }));
    expect(res.TagSet).toHaveLength(1);
  });

  it('PutBucketVersioning', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'versioning-put' }));
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'versioning-put',
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    );
    await s3.send(
      new PutBucketVersioningCommand({
        Bucket: 'versioning-put',
        VersioningConfiguration: { Status: 'Suspended' },
      }),
    );
    const res = await s3.send(new GetBucketVersioningCommand({ Bucket: 'versioning-put' }));
    expect(res.Status).toBe('Suspended');
  });

  it('PutBucketWebsite', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'website-put' }));
    await s3.send(
      new PutBucketWebsiteCommand({
        Bucket: 'website-put',
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'error.html' },
        },
      }),
    );
    const res = await s3.send(new GetBucketWebsiteCommand({ Bucket: 'website-put' }));
    expect(res.ErrorDocument?.Key).toBe('error.html');
  });

  it('PutObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'put-object' }));
    const res = await s3.send(
      new PutObjectCommand({
        Bucket: 'put-object',
        Key: 'data.json',
        Body: '{"a":1}',
        ContentType: 'application/json',
      }),
    );
    expect(res.ETag).toBe('"' + 'bb6cb5c68df4652941caf652a366f2d8' + '"');
    const conditional = s3.send(
      new PutObjectCommand({
        Bucket: 'put-object',
        Key: 'data.json',
        Body: 'again',
        IfNoneMatch: '*',
      }),
    );
    await expect(conditional).rejects.toThrow(/pre-conditions/);
  });

  it('PutObjectAcl', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-acl-put' }));
    await s3.send(
      new PutBucketOwnershipControlsCommand({
        Bucket: 'object-acl-put',
        OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      }),
    );
    await s3.send(new DeletePublicAccessBlockCommand({ Bucket: 'object-acl-put' }));
    await s3.send(new PutObjectCommand({ Bucket: 'object-acl-put', Key: 'a.txt', Body: 'hello' }));
    await s3.send(
      new PutObjectAclCommand({ Bucket: 'object-acl-put', Key: 'a.txt', ACL: 'public-read' }),
    );
    const res = await s3.send(new GetObjectAclCommand({ Bucket: 'object-acl-put', Key: 'a.txt' }));
    expect(res.Grants?.some((grant) => grant.Permission === 'READ')).toBe(true);
  });

  it('PutObjectAnnotation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'annotation-put' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'annotation-put', Key: 'doc.txt', Body: 'hello' }),
    );
    await s3.send(
      new PutObjectAnnotationCommand({
        Bucket: 'annotation-put',
        Key: 'doc.txt',
        AnnotationName: 'review',
        AnnotationPayload: JSON.stringify({ approved: true }),
      }),
    );
    const res = await s3.send(
      new ListObjectAnnotationsCommand({ Bucket: 'annotation-put', Key: 'doc.txt' }),
    );
    expect(res.Annotations).toHaveLength(1);
  });

  it('PutObjectLegalHold', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'legal-hold-put', ObjectLockEnabledForBucket: true }),
    );
    await s3.send(new PutObjectCommand({ Bucket: 'legal-hold-put', Key: 'a.txt', Body: 'hello' }));
    await s3.send(
      new PutObjectLegalHoldCommand({
        Bucket: 'legal-hold-put',
        Key: 'a.txt',
        LegalHold: { Status: 'ON' },
      }),
    );
    const { VersionId } = await s3.send(
      new HeadObjectCommand({ Bucket: 'legal-hold-put', Key: 'a.txt' }),
    );
    await expect(
      s3.send(new DeleteObjectCommand({ Bucket: 'legal-hold-put', Key: 'a.txt', VersionId })),
    ).rejects.toThrow();
  });

  it('PutObjectLockConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'lock-put', ObjectLockEnabledForBucket: true }),
    );
    await s3.send(
      new PutObjectLockConfigurationCommand({
        Bucket: 'lock-put',
        ObjectLockConfiguration: {
          ObjectLockEnabled: 'Enabled',
          Rule: { DefaultRetention: { Mode: 'GOVERNANCE', Days: 1 } },
        },
      }),
    );
    const res = await s3.send(new GetObjectLockConfigurationCommand({ Bucket: 'lock-put' }));
    expect(res.ObjectLockConfiguration?.Rule?.DefaultRetention?.Days).toBe(1);
  });

  it('PutObjectRetention', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({ Bucket: 'retention-put', ObjectLockEnabledForBucket: true }),
    );
    await s3.send(new PutObjectCommand({ Bucket: 'retention-put', Key: 'a.txt', Body: 'hello' }));
    const until = new Date(Date.now() + 86_400_000);
    await s3.send(
      new PutObjectRetentionCommand({
        Bucket: 'retention-put',
        Key: 'a.txt',
        Retention: { Mode: 'COMPLIANCE', RetainUntilDate: until },
      }),
    );
    const res = await s3.send(
      new GetObjectRetentionCommand({ Bucket: 'retention-put', Key: 'a.txt' }),
    );
    expect(res.Retention?.Mode).toBe('COMPLIANCE');
  });

  it('PutObjectTagging', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-tagging-put' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'object-tagging-put', Key: 'a.txt', Body: 'hello' }),
    );
    await s3.send(
      new PutObjectTaggingCommand({
        Bucket: 'object-tagging-put',
        Key: 'a.txt',
        Tagging: { TagSet: [{ Key: 'env', Value: 'test' }] },
      }),
    );
    const res = await s3.send(
      new GetObjectTaggingCommand({ Bucket: 'object-tagging-put', Key: 'a.txt' }),
    );
    expect(res.TagSet).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('PutPublicAccessBlock', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'pab-put' }));
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket: 'pab-put',
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      }),
    );
    const res = await s3.send(new GetPublicAccessBlockCommand({ Bucket: 'pab-put' }));
    expect(res.PublicAccessBlockConfiguration?.RestrictPublicBuckets).toBe(true);
  });

  it('RenameObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new CreateBucketCommand({
        Bucket: 'express--use1-az4--x-s3',
        CreateBucketConfiguration: {
          Location: { Type: 'AvailabilityZone', Name: 'use1-az4' },
          Bucket: { Type: 'Directory', DataRedundancy: 'SingleAvailabilityZone' },
        },
      }),
    );
    await s3.send(
      new PutObjectCommand({
        Bucket: 'express--use1-az4--x-s3',
        Key: 'old.txt',
        Body: 'rename me',
      }),
    );
    await s3.send(
      new RenameObjectCommand({
        Bucket: 'express--use1-az4--x-s3',
        Key: 'new.txt',
        RenameSource: 'old.txt',
      }),
    );
    const res = await s3.send(
      new GetObjectCommand({ Bucket: 'express--use1-az4--x-s3', Key: 'new.txt' }),
    );
    expect(await res.Body?.transformToString()).toBe('rename me');
  });

  it('RestoreObject', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'restore-object' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'restore-object',
        Key: 'cold.txt',
        Body: 'frozen',
        StorageClass: 'GLACIER',
      }),
    );
    await s3.send(
      new RestoreObjectCommand({
        Bucket: 'restore-object',
        Key: 'cold.txt',
        RestoreRequest: { Days: 1 },
      }),
    );
    const res = await s3.send(new HeadObjectCommand({ Bucket: 'restore-object', Key: 'cold.txt' }));
    expect(res.Restore).toContain('ongoing-request');
  });

  it.skip('SelectObjectContent', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'select-object' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'select-object',
        Key: 'people.csv',
        Body: 'name,age\\nalice,30\\nbob,20\\n',
      }),
    );
    const res = await s3.send(
      new SelectObjectContentCommand({
        Bucket: 'select-object',
        Key: 'people.csv',
        ExpressionType: 'SQL',
        Expression: 'SELECT s.name FROM S3Object s WHERE CAST(s.age AS INT) > 25',
        InputSerialization: { CSV: { FileHeaderInfo: 'USE' } },
        OutputSerialization: { CSV: {} },
      }),
    );
    const chunks = [];
    for await (const event of res.Payload ?? []) {
      if (event.Records?.Payload) {
        chunks.push(Buffer.from(event.Records.Payload));
      }
    }
    expect(Buffer.concat(chunks).toString().trim()).toBe('alice');
  });

  it('UpdateBucketMetadataAnnotationTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-annotation' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-annotation',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await s3.send(
              new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-annotation' }),
            )
          ).GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    await s3.send(
      new UpdateBucketMetadataAnnotationTableConfigurationCommand({
        Bucket: 'metadata-annotation',
        AnnotationTableConfiguration: { ConfigurationState: 'DISABLED' },
      }),
    );
    const res = await s3.send(
      new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-annotation' }),
    );
    expect(res.GetBucketMetadataConfigurationResult?.MetadataConfigurationResult).toBeDefined();
  });

  it('UpdateBucketMetadataInventoryTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-inventory' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-inventory',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (
            await s3.send(
              new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-inventory' }),
            )
          ).GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    await s3.send(
      new UpdateBucketMetadataInventoryTableConfigurationCommand({
        Bucket: 'metadata-inventory',
        InventoryTableConfiguration: { ConfigurationState: 'ENABLED' },
      }),
    );
    const res = await s3.send(
      new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-inventory' }),
    );
    expect(
      res.GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
        ?.InventoryTableConfigurationResult?.ConfigurationState,
    ).toBe('ENABLED');
  });

  it('UpdateBucketMetadataJournalTableConfiguration', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'metadata-journal' }));
    await s3.send(
      new CreateBucketMetadataConfigurationCommand({
        Bucket: 'metadata-journal',
        MetadataConfiguration: {
          JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 7 } },
          InventoryTableConfiguration: { ConfigurationState: 'DISABLED' },
        },
      }),
    );
    await expect
      .poll(
        async () =>
          (await s3.send(new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-journal' })))
            .GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
            ?.JournalTableConfigurationResult?.TableStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('ACTIVE');
    await s3.send(
      new UpdateBucketMetadataJournalTableConfigurationCommand({
        Bucket: 'metadata-journal',
        JournalTableConfiguration: { RecordExpiration: { Expiration: 'ENABLED', Days: 30 } },
      }),
    );
    const res = await s3.send(
      new GetBucketMetadataConfigurationCommand({ Bucket: 'metadata-journal' }),
    );
    expect(
      res.GetBucketMetadataConfigurationResult?.MetadataConfigurationResult
        ?.JournalTableConfigurationResult?.RecordExpiration?.Days,
    ).toBe(30);
  });

  it('UpdateObjectEncryption', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'object-encryption' }));
    await s3.send(
      new PutObjectCommand({ Bucket: 'object-encryption', Key: 'a.txt', Body: 'hello' }),
    );
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await s3.send(
      new UpdateObjectEncryptionCommand({
        Bucket: 'object-encryption',
        Key: 'a.txt',
        ObjectEncryption: { SSEKMS: { KMSKeyArn: KeyMetadata?.Arn } },
      }),
    );
    const res = await s3.send(new HeadObjectCommand({ Bucket: 'object-encryption', Key: 'a.txt' }));
    expect(res.ServerSideEncryption).toBe('aws:kms');
  });

  it('UploadPart', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'upload-part' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'upload-part', Key: 'big.bin' }),
    );
    const res = await s3.send(
      new UploadPartCommand({
        Bucket: 'upload-part',
        Key: 'big.bin',
        UploadId,
        PartNumber: 1,
        Body: 'part-1',
      }),
    );
    expect(res.ETag).toBeTruthy();
  });

  it('UploadPartCopy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'upload-part-copy-source' }));
    await s3.send(
      new PutObjectCommand({
        Bucket: 'upload-part-copy-source',
        Key: 'src.txt',
        Body: 'copied part',
      }),
    );
    await s3.send(new CreateBucketCommand({ Bucket: 'upload-part-copy' }));
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({ Bucket: 'upload-part-copy', Key: 'big.bin' }),
    );
    const res = await s3.send(
      new UploadPartCopyCommand({
        Bucket: 'upload-part-copy',
        Key: 'big.bin',
        UploadId,
        PartNumber: 1,
        CopySource: 'upload-part-copy-source/src.txt',
      }),
    );
    expect(res.CopyPartResult?.ETag).toBeTruthy();
  });

  it.skip('WriteGetObjectResponse', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(
      new WriteGetObjectResponseCommand({
        RequestRoute: 'route',
        RequestToken: 'token',
        Body: 'transformed',
      }),
    );
  });
});
