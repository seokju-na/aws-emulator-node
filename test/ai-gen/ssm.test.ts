import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import {
  AddTagsToResourceCommand,
  AssociateOpsItemRelatedItemCommand,
  CancelCommandCommand,
  CancelMaintenanceWindowExecutionCommand,
  CreateActivationCommand,
  CreateAssociationBatchCommand,
  CreateAssociationCommand,
  CreateCloudConnectorCommand,
  CreateDocumentCommand,
  CreateMaintenanceWindowCommand,
  CreateOpsItemCommand,
  CreateOpsMetadataCommand,
  CreatePatchBaselineCommand,
  CreateResourceDataSyncCommand,
  DeleteActivationCommand,
  DeleteAssociationCommand,
  DeleteCloudConnectorCommand,
  DeleteDocumentCommand,
  DeleteInventoryCommand,
  DeleteMaintenanceWindowCommand,
  DeleteOpsItemCommand,
  DeleteOpsMetadataCommand,
  DeleteParameterCommand,
  DeleteParametersCommand,
  DeletePatchBaselineCommand,
  DeleteResourceDataSyncCommand,
  DeleteResourcePolicyCommand,
  DeregisterManagedInstanceCommand,
  DeregisterPatchBaselineForPatchGroupCommand,
  DeregisterTargetFromMaintenanceWindowCommand,
  DeregisterTaskFromMaintenanceWindowCommand,
  DescribeActivationsCommand,
  DescribeAssociationCommand,
  DescribeAssociationExecutionsCommand,
  DescribeAssociationExecutionTargetsCommand,
  DescribeAutomationExecutionsCommand,
  DescribeAutomationStepExecutionsCommand,
  DescribeAvailablePatchesCommand,
  DescribeDocumentCommand,
  DescribeDocumentPermissionCommand,
  DescribeEffectiveInstanceAssociationsCommand,
  DescribeEffectivePatchesForPatchBaselineCommand,
  DescribeInstanceAssociationsStatusCommand,
  DescribeInstanceInformationCommand,
  DescribeInstancePatchesCommand,
  DescribeInstancePatchStatesCommand,
  DescribeInstancePatchStatesForPatchGroupCommand,
  DescribeInstancePropertiesCommand,
  DescribeInventoryDeletionsCommand,
  DescribeMaintenanceWindowExecutionsCommand,
  DescribeMaintenanceWindowExecutionTaskInvocationsCommand,
  DescribeMaintenanceWindowExecutionTasksCommand,
  DescribeMaintenanceWindowScheduleCommand,
  DescribeMaintenanceWindowsCommand,
  DescribeMaintenanceWindowsForTargetCommand,
  DescribeMaintenanceWindowTargetsCommand,
  DescribeMaintenanceWindowTasksCommand,
  DescribeOpsItemsCommand,
  DescribeParametersCommand,
  DescribePatchBaselinesCommand,
  DescribePatchGroupStateCommand,
  DescribePatchGroupsCommand,
  DescribePatchPropertiesCommand,
  DescribeSessionsCommand,
  DisassociateOpsItemRelatedItemCommand,
  GetAccessTokenCommand,
  GetAutomationExecutionCommand,
  GetCalendarStateCommand,
  GetCloudConnectorCommand,
  GetCommandInvocationCommand,
  GetConnectionStatusCommand,
  GetDefaultPatchBaselineCommand,
  GetDeployablePatchSnapshotForInstanceCommand,
  GetDocumentCommand,
  GetExecutionPreviewCommand,
  GetInventoryCommand,
  GetInventorySchemaCommand,
  GetMaintenanceWindowCommand,
  GetMaintenanceWindowExecutionCommand,
  GetMaintenanceWindowExecutionTaskCommand,
  GetMaintenanceWindowExecutionTaskInvocationCommand,
  GetMaintenanceWindowTaskCommand,
  GetOpsItemCommand,
  GetOpsMetadataCommand,
  GetOpsSummaryCommand,
  GetParameterCommand,
  GetParameterHistoryCommand,
  GetParametersByPathCommand,
  GetParametersCommand,
  GetPatchBaselineCommand,
  GetPatchBaselineForPatchGroupCommand,
  GetResourcePoliciesCommand,
  GetServiceSettingCommand,
  LabelParameterVersionCommand,
  ListAssociationsCommand,
  ListAssociationVersionsCommand,
  ListCloudConnectorsCommand,
  ListCommandInvocationsCommand,
  ListCommandsCommand,
  ListComplianceItemsCommand,
  ListComplianceSummariesCommand,
  ListDocumentMetadataHistoryCommand,
  ListDocumentsCommand,
  ListDocumentVersionsCommand,
  ListInventoryEntriesCommand,
  ListNodesCommand,
  ListNodesSummaryCommand,
  ListOpsItemEventsCommand,
  ListOpsItemRelatedItemsCommand,
  ListOpsMetadataCommand,
  ListResourceComplianceSummariesCommand,
  ListResourceDataSyncCommand,
  ListTagsForResourceCommand,
  ModifyDocumentPermissionCommand,
  PutComplianceItemsCommand,
  PutInventoryCommand,
  PutParameterCommand,
  PutResourcePolicyCommand,
  RegisterDefaultPatchBaselineCommand,
  RegisterPatchBaselineForPatchGroupCommand,
  RegisterTargetWithMaintenanceWindowCommand,
  RegisterTaskWithMaintenanceWindowCommand,
  RemoveTagsFromResourceCommand,
  ResetServiceSettingCommand,
  ResumeSessionCommand,
  SendAutomationSignalCommand,
  SendCommandCommand,
  SSMClient,
  StartAccessRequestCommand,
  StartAssociationsOnceCommand,
  StartAutomationExecutionCommand,
  StartChangeRequestExecutionCommand,
  StartExecutionPreviewCommand,
  StartSessionCommand,
  StopAutomationExecutionCommand,
  TerminateSessionCommand,
  UnlabelParameterVersionCommand,
  UpdateAssociationCommand,
  UpdateAssociationStatusCommand,
  UpdateCloudConnectorCommand,
  UpdateDocumentCommand,
  UpdateDocumentDefaultVersionCommand,
  UpdateDocumentMetadataCommand,
  UpdateMaintenanceWindowCommand,
  UpdateMaintenanceWindowTargetCommand,
  UpdateMaintenanceWindowTaskCommand,
  UpdateManagedInstanceRoleCommand,
  UpdateOpsItemCommand,
  UpdateOpsMetadataCommand,
  UpdatePatchBaselineCommand,
  UpdateResourceDataSyncCommand,
  UpdateServiceSettingCommand,
  ValidateCloudConnectorCommand,
} from '@aws-sdk/client-ssm';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('ssm', () => {
  it('AddTagsToResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/tags/add', Value: 'v1', Type: 'String' }));
    await ssm.send(
      new AddTagsToResourceCommand({
        ResourceType: 'Parameter',
        ResourceId: '/tags/add',
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
    const res = await ssm.send(
      new ListTagsForResourceCommand({ ResourceType: 'Parameter', ResourceId: '/tags/add' }),
    );
    expect(res.TagList).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('AssociateOpsItemRelatedItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'related',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    const res = await ssm.send(
      new AssociateOpsItemRelatedItemCommand({
        OpsItemId,
        AssociationType: 'IsParentOf',
        ResourceType: 'AWS::SSMIncidents::IncidentRecord',
        ResourceUri: 'arn:aws:ssm-incidents::000000000000:incident-record/plan/0123456789abcdef',
      }),
    );
    expect(res.AssociationId).toBeTruthy();
  });

  it.skip('CancelCommand', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new CancelCommandCommand({ CommandId: '00000000-0000-0000-0000-000000000000' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('CancelMaintenanceWindowExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new CancelMaintenanceWindowExecutionCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('CreateActivation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { ActivationId } = await ssm.send(
      new CreateActivationCommand({
        IamRole: 'ssm-managed-instance-role',
        Description: 'on-prem servers',
        RegistrationLimit: 5,
      }),
    );
    expect(ActivationId).toBeTruthy();
  });

  it('CreateAssociation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'assoc-create',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { AssociationDescription } = await ssm.send(
      new CreateAssociationCommand({
        Name: 'assoc-create',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
        AssociationName: 'assoc-create-association',
      }),
    );
    expect(AssociationDescription?.AssociationId).toBeTruthy();
    expect(AssociationDescription?.Name).toBe('assoc-create');
  });

  it.skip('CreateAssociationBatch', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new CreateAssociationBatchCommand({
        Entries: [{ Name: 'AWS-RunShellScript', InstanceId: 'i-0123456789abcdef0' }],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('CreateCloudConnector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { CloudConnectorId } = await ssm.send(
      new CreateCloudConnectorCommand({
        DisplayName: 'azure-connector',
        RoleArn: 'arn:aws:iam::000000000000:role/cloud-connector',
        ConfigConnectorArn: 'arn:aws:config:us-east-1:000000000000:connector/azure',
        Configuration: {
          AzureConfiguration: {
            TenantId: '00000000-0000-0000-0000-000000000000',
            ApplicationId: '00000000-0000-0000-0000-000000000000',
          },
        },
      }),
    );
    expect(CloudConnectorId).toBeTruthy();
  });

  it('CreateDocument', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new CreateDocumentCommand({
        Name: 'created-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    expect(res.DocumentDescription?.Name).toBe('created-doc');
    expect(res.DocumentDescription?.DocumentVersion).toBe('1');
  });

  it('CreateMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { WindowId } = await ssm.send(
      new CreateMaintenanceWindowCommand({
        Name: 'created-window',
        Schedule: 'cron(0 2 ? * SUN *)',
        Duration: 2,
        Cutoff: 1,
        AllowUnassociatedTargets: true,
      }),
    );
    expect(WindowId).toMatch(/^mw-/);
  });

  it('CreateOpsItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'created-item',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    expect(OpsItemId).toMatch(/^oi-/);
  });

  it.skip('CreateOpsMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new CreateOpsMetadataCommand({ ResourceId: 'i-0123456789abcdef0' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('CreatePatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { BaselineId } = await ssm.send(
      new CreatePatchBaselineCommand({
        Name: 'created-baseline',
        OperatingSystem: 'AMAZON_LINUX_2023',
        ApprovalRules: {
          PatchRules: [
            {
              PatchFilterGroup: { PatchFilters: [{ Key: 'CLASSIFICATION', Values: ['Security'] }] },
              ApproveAfterDays: 7,
            },
          ],
        },
      }),
    );
    expect(BaselineId).toMatch(/^pb-/);
  });

  it('CreateResourceDataSync', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'created-sync-bucket' }));
    await ssm.send(
      new CreateResourceDataSyncCommand({
        SyncName: 'created-sync',
        S3Destination: {
          BucketName: 'created-sync-bucket',
          SyncFormat: 'JsonSerDe',
          Region: 'us-east-1',
        },
      }),
    );
    const res = await ssm.send(new ListResourceDataSyncCommand({}));
    expect(res.ResourceDataSyncItems?.map((item) => item.SyncName)).toEqual(['created-sync']);
  });

  it('DeleteActivation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { ActivationId } = await ssm.send(
      new CreateActivationCommand({
        IamRole: 'ssm-managed-instance-role',
        Description: 'on-prem servers',
        RegistrationLimit: 5,
      }),
    );
    await ssm.send(new DeleteActivationCommand({ ActivationId }));
    const res = await ssm.send(new DescribeActivationsCommand({}));
    expect(res.ActivationList ?? []).toHaveLength(0);
  });

  it('DeleteAssociation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'assoc-delete',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { AssociationDescription } = await ssm.send(
      new CreateAssociationCommand({
        Name: 'assoc-delete',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
        AssociationName: 'assoc-delete-association',
      }),
    );
    await ssm.send(
      new DeleteAssociationCommand({ AssociationId: AssociationDescription?.AssociationId }),
    );
    const res = await ssm.send(new ListAssociationsCommand({}));
    expect(res.Associations ?? []).toHaveLength(0);
  });

  it.skip('DeleteCloudConnector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeleteCloudConnectorCommand({ CloudConnectorId: 'cc-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DeleteDocument', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'doomed-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    await ssm.send(new DeleteDocumentCommand({ Name: 'doomed-doc' }));
    await expect(ssm.send(new DescribeDocumentCommand({ Name: 'doomed-doc' }))).rejects.toThrow();
  });

  it.skip('DeleteInventory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DeleteInventoryCommand({ TypeName: 'Custom:Software' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DeleteMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeleteMaintenanceWindowCommand({ WindowId: 'mw-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DeleteOpsItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'doomed-item',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    await ssm.send(new DeleteOpsItemCommand({ OpsItemId }));
    await expect
      .poll(
        () =>
          ssm.send(new GetOpsItemCommand({ OpsItemId })).then(
            () => 'found',
            (error: Error) => error.name,
          ),
        { timeout: 20_000, interval: 1_000 },
      )
      .toBe('OpsItemNotFoundException');
  });

  it.skip('DeleteOpsMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeleteOpsMetadataCommand({
        OpsMetadataArn: 'arn:aws:ssm:us-east-1:000000000000:opsmetadata/app',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DeleteParameter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/doomed', Value: 'v1', Type: 'String' }));
    await ssm.send(new DeleteParameterCommand({ Name: '/doomed' }));
    await expect(ssm.send(new GetParameterCommand({ Name: '/doomed' }))).rejects.toMatchObject({
      name: 'ParameterNotFound',
    });
  });

  it('DeleteParameters', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/bulk/a', Value: 'v1', Type: 'String' }));
    await ssm.send(new PutParameterCommand({ Name: '/bulk/b', Value: 'v1', Type: 'String' }));
    const res = await ssm.send(
      new DeleteParametersCommand({ Names: ['/bulk/a', '/bulk/b', '/bulk/missing'] }),
    );
    expect(res.DeletedParameters?.sort()).toEqual(['/bulk/a', '/bulk/b']);
    expect(res.InvalidParameters).toEqual(['/bulk/missing']);
  });

  it.skip('DeletePatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeletePatchBaselineCommand({ BaselineId: 'pb-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DeleteResourceDataSync', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'doomed-sync-bucket' }));
    await ssm.send(
      new CreateResourceDataSyncCommand({
        SyncName: 'doomed-sync',
        S3Destination: {
          BucketName: 'doomed-sync-bucket',
          SyncFormat: 'JsonSerDe',
          Region: 'us-east-1',
        },
      }),
    );
    await ssm.send(new DeleteResourceDataSyncCommand({ SyncName: 'doomed-sync' }));
    const res = await ssm.send(new ListResourceDataSyncCommand({}));
    expect(res.ResourceDataSyncItems ?? []).toHaveLength(0);
  });

  it('DeleteResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({
        Name: '/shared/delete',
        Value: 'shared',
        Type: 'String',
        Tier: 'Advanced',
      }),
    );
    const { Parameter } = await ssm.send(new GetParameterCommand({ Name: '/shared/delete' }));
    const { PolicyId, PolicyHash } = await ssm.send(
      new PutResourcePolicyCommand({
        ResourceArn: Parameter?.ARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'share',
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'ssm:GetParameter',
              Resource: Parameter?.ARN,
            },
          ],
        }),
      }),
    );
    await ssm.send(
      new DeleteResourcePolicyCommand({ ResourceArn: Parameter?.ARN, PolicyId, PolicyHash }),
    );
    const res = await ssm.send(new GetResourcePoliciesCommand({ ResourceArn: Parameter?.ARN }));
    expect(res.Policies ?? []).toHaveLength(0);
  });

  it.skip('DeregisterManagedInstance', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeregisterManagedInstanceCommand({ InstanceId: 'i-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DeregisterPatchBaselineForPatchGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeregisterPatchBaselineForPatchGroupCommand({
        BaselineId: 'pb-0123456789abcdef0',
        PatchGroup: 'web',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DeregisterTargetFromMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeregisterTargetFromMaintenanceWindowCommand({
        WindowId: 'mw-0123456789abcdef0',
        WindowTargetId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DeregisterTaskFromMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DeregisterTaskFromMaintenanceWindowCommand({
        WindowId: 'mw-0123456789abcdef0',
        WindowTaskId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeActivations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { ActivationId } = await ssm.send(
      new CreateActivationCommand({
        IamRole: 'ssm-managed-instance-role',
        Description: 'on-prem servers',
        RegistrationLimit: 5,
      }),
    );
    const res = await ssm.send(new DescribeActivationsCommand({}));
    expect(res.ActivationList?.map((activation) => activation.ActivationId)).toEqual([
      ActivationId,
    ]);
  });

  it('DescribeAssociation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'assoc-describe',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { AssociationDescription } = await ssm.send(
      new CreateAssociationCommand({
        Name: 'assoc-describe',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
        AssociationName: 'assoc-describe-association',
      }),
    );
    const res = await ssm.send(
      new DescribeAssociationCommand({ AssociationId: AssociationDescription?.AssociationId }),
    );
    expect(res.AssociationDescription?.AssociationName).toBe('assoc-describe-association');
  });

  it.skip('DescribeAssociationExecutionTargets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeAssociationExecutionTargetsCommand({
        AssociationId: '00000000-0000-0000-0000-000000000000',
        ExecutionId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeAssociationExecutions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeAssociationExecutionsCommand({
        AssociationId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeAutomationExecutions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-describe',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const { AutomationExecutionId } = await ssm.send(
      new StartAutomationExecutionCommand({ DocumentName: 'auto-describe' }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new GetAutomationExecutionCommand({ AutomationExecutionId })))
            .AutomationExecution?.AutomationExecutionStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('Success');
    const res = await ssm.send(new DescribeAutomationExecutionsCommand({}));
    expect(res.AutomationExecutionMetadataList?.map((item) => item.AutomationExecutionId)).toEqual([
      AutomationExecutionId,
    ]);
  });

  it('DescribeAutomationStepExecutions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-steps',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const { AutomationExecutionId } = await ssm.send(
      new StartAutomationExecutionCommand({ DocumentName: 'auto-steps' }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new GetAutomationExecutionCommand({ AutomationExecutionId })))
            .AutomationExecution?.AutomationExecutionStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('Success');
    const res = await ssm.send(
      new DescribeAutomationStepExecutionsCommand({ AutomationExecutionId }),
    );
    expect(res.StepExecutions?.map((step) => step.StepName)).toEqual(['pause']);
  });

  it.skip('DescribeAvailablePatches', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeAvailablePatchesCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeDocument', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'described-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new DescribeDocumentCommand({ Name: 'described-doc' }))).Document?.Status,
        {
          timeout: 10_000,
        },
      )
      .toBe('Active');
    const res = await ssm.send(new DescribeDocumentCommand({ Name: 'described-doc' }));
    expect(res.Document?.DocumentType).toBe('Command');
  });

  it.skip('DescribeDocumentPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeDocumentPermissionCommand({ Name: 'my-document', PermissionType: 'Share' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeEffectiveInstanceAssociations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeEffectiveInstanceAssociationsCommand({ InstanceId: 'i-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeEffectivePatchesForPatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeEffectivePatchesForPatchBaselineCommand({ BaselineId: 'pb-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeInstanceAssociationsStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeInstanceAssociationsStatusCommand({ InstanceId: 'i-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeInstanceInformation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeInstanceInformationCommand({}));
    expect(res.InstanceInformationList ?? []).toEqual([]);
  });

  it.skip('DescribeInstancePatchStates', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeInstancePatchStatesCommand({ InstanceIds: ['i-0123456789abcdef0'] }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeInstancePatchStatesForPatchGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeInstancePatchStatesForPatchGroupCommand({ PatchGroup: 'web' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeInstancePatches', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeInstancePatchesCommand({ InstanceId: 'i-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeInstanceProperties', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeInstancePropertiesCommand({}));
    expect(res.InstanceProperties ?? []).toEqual([]);
  });

  it.skip('DescribeInventoryDeletions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeInventoryDeletionsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowExecutionTaskInvocations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowExecutionTaskInvocationsCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
        TaskId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowExecutionTasks', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowExecutionTasksCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowExecutions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowExecutionsCommand({ WindowId: 'mw-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowSchedule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeMaintenanceWindowScheduleCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowTargets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowTargetsCommand({ WindowId: 'mw-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowTasks', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowTasksCommand({ WindowId: 'mw-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindows', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeMaintenanceWindowsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribeMaintenanceWindowsForTarget', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribeMaintenanceWindowsForTargetCommand({
        Targets: [{ Key: 'InstanceIds', Values: ['i-0123456789abcdef0'] }],
        ResourceType: 'INSTANCE',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribeOpsItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'described-item',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    const res = await ssm.send(
      new DescribeOpsItemsCommand({
        OpsItemFilters: [{ Key: 'Status', Values: ['Open'], Operator: 'Equal' }],
      }),
    );
    expect(res.OpsItemSummaries?.map((item) => item.OpsItemId)).toEqual([OpsItemId]);
  });

  it('DescribeParameters', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/describe/a', Value: 'v1', Type: 'String' }));
    await ssm.send(new PutParameterCommand({ Name: '/describe/b', Value: 'v1', Type: 'String' }));
    await ssm.send(new PutParameterCommand({ Name: '/other', Value: 'v1', Type: 'String' }));
    const res = await ssm.send(
      new DescribeParametersCommand({
        ParameterFilters: [{ Key: 'Name', Option: 'BeginsWith', Values: ['/describe/'] }],
      }),
    );
    expect(res.Parameters?.map((parameter) => parameter.Name)).toEqual([
      '/describe/a',
      '/describe/b',
    ]);
  });

  it('DescribePatchBaselines', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { BaselineId } = await ssm.send(
      new CreatePatchBaselineCommand({
        Name: 'described-baseline',
        OperatingSystem: 'AMAZON_LINUX_2023',
        ApprovalRules: {
          PatchRules: [
            {
              PatchFilterGroup: { PatchFilters: [{ Key: 'CLASSIFICATION', Values: ['Security'] }] },
              ApproveAfterDays: 7,
            },
          ],
        },
      }),
    );
    const res = await ssm.send(
      new DescribePatchBaselinesCommand({ Filters: [{ Key: 'OWNER', Values: ['Self'] }] }),
    );
    expect(res.BaselineIdentities?.map((baseline) => baseline.BaselineId)).toEqual([BaselineId]);
  });

  it.skip('DescribePatchGroupState', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribePatchGroupStateCommand({ PatchGroup: 'web' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DescribePatchGroups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribePatchGroupsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('DescribePatchProperties', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DescribePatchPropertiesCommand({
        OperatingSystem: 'AMAZON_LINUX_2023',
        Property: 'CLASSIFICATION',
      }),
    );
    expect(res.Properties?.length).toBeGreaterThan(0);
  });

  it.skip('DescribeSessions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new DescribeSessionsCommand({ State: 'Active' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('DisassociateOpsItemRelatedItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new DisassociateOpsItemRelatedItemCommand({
        OpsItemId: 'oi-0123456789ab',
        AssociationId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetAccessToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-approve',
        DocumentType: 'AutoApprovalPolicy',
        DocumentFormat: 'TEXT',
        Content:
          'permit (principal, action == AWS::SSM::Action::"getTokenForInstanceAccess", resource);',
      }),
    );
    const { AccessRequestId } = await ssm.send(
      new StartAccessRequestCommand({
        Reason: 'debugging',
        Targets: [{ Key: 'InstanceIds', Values: ['i-0123456789abcdef0'] }],
      }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new GetAccessTokenCommand({ AccessRequestId }))).AccessRequestStatus,
        {
          timeout: 10_000,
          interval: 200,
        },
      )
      .toBe('Approved');
    const res = await ssm.send(new GetAccessTokenCommand({ AccessRequestId }));
    expect(res.Credentials?.AccessKeyId).toBeTruthy();
  });

  it('GetAutomationExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-get',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const { AutomationExecutionId } = await ssm.send(
      new StartAutomationExecutionCommand({ DocumentName: 'auto-get' }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new GetAutomationExecutionCommand({ AutomationExecutionId })))
            .AutomationExecution?.AutomationExecutionStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('Success');
    const res = await ssm.send(new GetAutomationExecutionCommand({ AutomationExecutionId }));
    expect(res.AutomationExecution?.DocumentName).toBe('auto-get');
  });

  it.skip('GetCalendarState', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetCalendarStateCommand({ CalendarNames: ['my-calendar'] }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetCloudConnector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { CloudConnectorId } = await ssm.send(
      new CreateCloudConnectorCommand({
        DisplayName: 'azure-connector',
        RoleArn: 'arn:aws:iam::000000000000:role/cloud-connector',
        ConfigConnectorArn: 'arn:aws:config:us-east-1:000000000000:connector/azure',
        Configuration: {
          AzureConfiguration: {
            TenantId: '00000000-0000-0000-0000-000000000000',
            ApplicationId: '00000000-0000-0000-0000-000000000000',
          },
        },
      }),
    );
    const res = await ssm.send(new GetCloudConnectorCommand({ CloudConnectorId }));
    expect(res.DisplayName).toBe('azure-connector');
  });

  it('GetCommandInvocation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'invocation-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { Command } = await ssm.send(
      new SendCommandCommand({
        DocumentName: 'invocation-doc',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
      }),
    );
    await expect(
      ssm.send(
        new GetCommandInvocationCommand({
          CommandId: Command?.CommandId,
          InstanceId: 'i-0123456789abcdef0',
        }),
      ),
    ).rejects.toThrow(/not in a valid state|does not exist/);
  });

  it.skip('GetConnectionStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetConnectionStatusCommand({ Target: 'i-0123456789abcdef0' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetDefaultPatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetDefaultPatchBaselineCommand({ OperatingSystem: 'AMAZON_LINUX_2023' }),
    );
    expect(res.BaselineId).toBeTruthy();
  });

  it.skip('GetDeployablePatchSnapshotForInstance', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetDeployablePatchSnapshotForInstanceCommand({
        InstanceId: 'i-0123456789abcdef0',
        SnapshotId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetDocument', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'get-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const res = await ssm.send(new GetDocumentCommand({ Name: 'get-doc' }));
    expect(JSON.parse(res.Content ?? '{}').mainSteps[0].name).toBe('echo');
  });

  it('GetExecutionPreview', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'preview-get',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const { ExecutionPreviewId } = await ssm.send(
      new StartExecutionPreviewCommand({
        DocumentName: 'preview-get',
        ExecutionInputs: { Automation: {} },
      }),
    );
    const res = await ssm.send(new GetExecutionPreviewCommand({ ExecutionPreviewId }));
    expect(res.ExecutionPreviewId).toBe(ExecutionPreviewId);
  });

  it('GetInventory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetInventoryCommand({}));
    expect(res.Entities ?? []).toEqual([]);
  });

  it.skip('GetInventorySchema', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetInventorySchemaCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { WindowId } = await ssm.send(
      new CreateMaintenanceWindowCommand({
        Name: 'get-window',
        Schedule: 'cron(0 2 ? * SUN *)',
        Duration: 2,
        Cutoff: 1,
        AllowUnassociatedTargets: true,
      }),
    );
    const res = await ssm.send(new GetMaintenanceWindowCommand({ WindowId }));
    expect(res.Name).toBe('get-window');
    expect(res.Duration).toBe(2);
  });

  it.skip('GetMaintenanceWindowExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetMaintenanceWindowExecutionCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('GetMaintenanceWindowExecutionTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetMaintenanceWindowExecutionTaskCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
        TaskId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('GetMaintenanceWindowExecutionTaskInvocation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetMaintenanceWindowExecutionTaskInvocationCommand({
        WindowExecutionId: '00000000-0000-0000-0000-000000000000',
        TaskId: '00000000-0000-0000-0000-000000000000',
        InvocationId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('GetMaintenanceWindowTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetMaintenanceWindowTaskCommand({
        WindowId: 'mw-0123456789abcdef0',
        WindowTaskId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetOpsItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'get-item',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    const res = await ssm.send(new GetOpsItemCommand({ OpsItemId }));
    expect(res.OpsItem?.Title).toBe('get-item');
    expect(res.OpsItem?.Status).toBe('Open');
  });

  it.skip('GetOpsMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetOpsMetadataCommand({
        OpsMetadataArn: 'arn:aws:ssm:us-east-1:000000000000:opsmetadata/app',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('GetOpsSummary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetOpsSummaryCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetParameter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({ Name: '/app/db-url', Value: 'postgres://db', Type: 'String' }),
    );
    const res = await ssm.send(new GetParameterCommand({ Name: '/app/db-url' }));
    expect(res.Parameter?.Value).toBe('postgres://db');
    expect(res.Parameter?.Version).toBe(1);
  });

  it('GetParameterHistory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/history', Value: 'v1', Type: 'String' }));
    await ssm.send(
      new PutParameterCommand({ Name: '/history', Value: 'v2', Type: 'String', Overwrite: true }),
    );
    const res = await ssm.send(new GetParameterHistoryCommand({ Name: '/history' }));
    expect(res.Parameters?.map((parameter) => parameter.Value)).toEqual(['v1', 'v2']);
  });

  it('GetParameters', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/many/a', Value: 'a', Type: 'String' }));
    await ssm.send(new PutParameterCommand({ Name: '/many/b', Value: 'b', Type: 'String' }));
    const res = await ssm.send(
      new GetParametersCommand({ Names: ['/many/a', '/many/b', '/many/missing'] }),
    );
    expect(res.Parameters?.map((parameter) => parameter.Value).sort()).toEqual(['a', 'b']);
    expect(res.InvalidParameters).toEqual(['/many/missing']);
  });

  it('GetParametersByPath', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/tree/a', Value: '1', Type: 'String' }));
    await ssm.send(new PutParameterCommand({ Name: '/tree/sub/b', Value: '2', Type: 'String' }));
    const shallow = await ssm.send(new GetParametersByPathCommand({ Path: '/tree' }));
    expect(shallow.Parameters?.map((parameter) => parameter.Name)).toEqual(['/tree/a']);
    const deep = await ssm.send(new GetParametersByPathCommand({ Path: '/tree', Recursive: true }));
    expect(deep.Parameters?.map((parameter) => parameter.Name).sort()).toEqual([
      '/tree/a',
      '/tree/sub/b',
    ]);
  });

  it('GetPatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { BaselineId } = await ssm.send(
      new CreatePatchBaselineCommand({
        Name: 'get-baseline',
        OperatingSystem: 'AMAZON_LINUX_2023',
        ApprovalRules: {
          PatchRules: [
            {
              PatchFilterGroup: { PatchFilters: [{ Key: 'CLASSIFICATION', Values: ['Security'] }] },
              ApproveAfterDays: 7,
            },
          ],
        },
      }),
    );
    const res = await ssm.send(new GetPatchBaselineCommand({ BaselineId }));
    expect(res.Name).toBe('get-baseline');
  });

  it.skip('GetPatchBaselineForPatchGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new GetPatchBaselineForPatchGroupCommand({ PatchGroup: 'web' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetResourcePolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({
        Name: '/shared/get',
        Value: 'shared',
        Type: 'String',
        Tier: 'Advanced',
      }),
    );
    const { Parameter } = await ssm.send(new GetParameterCommand({ Name: '/shared/get' }));
    const { PolicyId, PolicyHash } = await ssm.send(
      new PutResourcePolicyCommand({
        ResourceArn: Parameter?.ARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'share',
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'ssm:GetParameter',
              Resource: Parameter?.ARN,
            },
          ],
        }),
      }),
    );
    const res = await ssm.send(new GetResourcePoliciesCommand({ ResourceArn: Parameter?.ARN }));
    expect(res.Policies?.map((policy) => policy.PolicyId)).toEqual([PolicyId]);
    expect(PolicyHash).toBeTruthy();
  });

  it('GetServiceSetting', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new GetServiceSettingCommand({ SettingId: '/ssm/parameter-store/high-throughput-enabled' }),
    );
    expect(res.ServiceSetting?.SettingValue).toBe('false');
  });

  it('LabelParameterVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/labeled', Value: 'v1', Type: 'String' }));
    await ssm.send(
      new LabelParameterVersionCommand({ Name: '/labeled', ParameterVersion: 1, Labels: ['prod'] }),
    );
    const res = await ssm.send(new GetParameterCommand({ Name: '/labeled:prod' }));
    expect(res.Parameter?.Selector).toBe(':prod');
  });

  it.skip('ListAssociationVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ListAssociationVersionsCommand({ AssociationId: '00000000-0000-0000-0000-000000000000' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('ListAssociations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'assoc-list',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { AssociationDescription } = await ssm.send(
      new CreateAssociationCommand({
        Name: 'assoc-list',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
        AssociationName: 'assoc-list-association',
      }),
    );
    const res = await ssm.send(new ListAssociationsCommand({}));
    expect(res.Associations?.map((association) => association.AssociationId)).toEqual([
      AssociationDescription?.AssociationId,
    ]);
  });

  it('ListCloudConnectors', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { CloudConnectorId } = await ssm.send(
      new CreateCloudConnectorCommand({
        DisplayName: 'azure-connector',
        RoleArn: 'arn:aws:iam::000000000000:role/cloud-connector',
        ConfigConnectorArn: 'arn:aws:config:us-east-1:000000000000:connector/azure',
        Configuration: {
          AzureConfiguration: {
            TenantId: '00000000-0000-0000-0000-000000000000',
            ApplicationId: '00000000-0000-0000-0000-000000000000',
          },
        },
      }),
    );
    const res = await ssm.send(new ListCloudConnectorsCommand({}));
    expect(res.CloudConnectors?.map((connector) => connector.CloudConnectorId)).toEqual([
      CloudConnectorId,
    ]);
  });

  it.skip('ListCommandInvocations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListCommandInvocationsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('ListCommands', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'list-commands-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { Command } = await ssm.send(
      new SendCommandCommand({
        DocumentName: 'list-commands-doc',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
      }),
    );
    const res = await ssm.send(new ListCommandsCommand({}));
    expect(res.Commands?.map((command) => command.CommandId)).toEqual([Command?.CommandId]);
  });

  it.skip('ListComplianceItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListComplianceItemsCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListComplianceSummaries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListComplianceSummariesCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListDocumentMetadataHistory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ListDocumentMetadataHistoryCommand({ Name: 'my-document', Metadata: 'DocumentReviews' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListDocumentVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListDocumentVersionsCommand({ Name: 'my-document' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('ListDocuments', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'listed-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const res = await ssm.send(
      new ListDocumentsCommand({ Filters: [{ Key: 'Owner', Values: ['Self'] }] }),
    );
    expect(res.DocumentIdentifiers?.map((document) => document.Name)).toEqual(['listed-doc']);
  });

  it.skip('ListInventoryEntries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ListInventoryEntriesCommand({
        InstanceId: 'i-0123456789abcdef0',
        TypeName: 'Custom:Software',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListNodes', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListNodesCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListNodesSummary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ListNodesSummaryCommand({
        Aggregators: [
          { AggregatorType: 'Count', TypeName: 'Instance', AttributeName: 'PlatformName' },
        ],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('ListOpsItemEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListOpsItemEventsCommand({}));
    expect(res.Summaries ?? []).toEqual([]);
  });

  it('ListOpsItemRelatedItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'related-list',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    await ssm.send(
      new AssociateOpsItemRelatedItemCommand({
        OpsItemId,
        AssociationType: 'IsParentOf',
        ResourceType: 'AWS::SSMIncidents::IncidentRecord',
        ResourceUri: 'arn:aws:ssm-incidents::000000000000:incident-record/plan/0123456789abcdef',
      }),
    );
    const res = await ssm.send(new ListOpsItemRelatedItemsCommand({ OpsItemId }));
    expect(res.Summaries).toHaveLength(1);
  });

  it.skip('ListOpsMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListOpsMetadataCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('ListResourceComplianceSummaries', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new ListResourceComplianceSummariesCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('ListResourceDataSync', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const s3 = new S3Client(aws.clientConfig());
    await s3.send(new CreateBucketCommand({ Bucket: 'listed-sync-bucket' }));
    await ssm.send(
      new CreateResourceDataSyncCommand({
        SyncName: 'listed-sync',
        S3Destination: {
          BucketName: 'listed-sync-bucket',
          SyncFormat: 'JsonSerDe',
          Region: 'us-east-1',
        },
      }),
    );
    const res = await ssm.send(new ListResourceDataSyncCommand({}));
    expect(res.ResourceDataSyncItems?.[0]?.S3Destination?.BucketName).toBe('listed-sync-bucket');
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({
        Name: '/tags/list',
        Value: 'v',
        Type: 'String',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await ssm.send(
      new ListTagsForResourceCommand({ ResourceType: 'Parameter', ResourceId: '/tags/list' }),
    );
    expect(res.TagList).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it.skip('ModifyDocumentPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ModifyDocumentPermissionCommand({ Name: 'my-document', PermissionType: 'Share' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('PutComplianceItems', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new PutComplianceItemsCommand({
        ResourceId: 'i-0123456789abcdef0',
        ResourceType: 'ManagedInstance',
        ComplianceType: 'Custom:Patch',
        ExecutionSummary: { ExecutionTime: new Date() },
        Items: [],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('PutInventory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new PutInventoryCommand({ InstanceId: 'i-0123456789abcdef0', Items: [] }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('PutParameter', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new PutParameterCommand({ Name: '/app/secret', Value: 'hunter2', Type: 'SecureString' }),
    );
    expect(res.Version).toBe(1);
    const encrypted = await ssm.send(new GetParameterCommand({ Name: '/app/secret' }));
    expect(encrypted.Parameter?.Value).not.toBe('hunter2');
    const decrypted = await ssm.send(
      new GetParameterCommand({ Name: '/app/secret', WithDecryption: true }),
    );
    expect(decrypted.Parameter?.Value).toBe('hunter2');
  });

  it('PutResourcePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({
        Name: '/shared/put',
        Value: 'shared',
        Type: 'String',
        Tier: 'Advanced',
      }),
    );
    const { Parameter } = await ssm.send(new GetParameterCommand({ Name: '/shared/put' }));
    const { PolicyId, PolicyHash } = await ssm.send(
      new PutResourcePolicyCommand({
        ResourceArn: Parameter?.ARN,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'share',
              Effect: 'Allow',
              Principal: { AWS: '111111111111' },
              Action: 'ssm:GetParameter',
              Resource: Parameter?.ARN,
            },
          ],
        }),
      }),
    );
    expect(PolicyId).toBeTruthy();
    expect(PolicyHash).toBeTruthy();
  });

  it('RegisterDefaultPatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { BaselineId } = await ssm.send(
      new CreatePatchBaselineCommand({
        Name: 'default-baseline',
        OperatingSystem: 'AMAZON_LINUX_2023',
        ApprovalRules: {
          PatchRules: [
            {
              PatchFilterGroup: { PatchFilters: [{ Key: 'CLASSIFICATION', Values: ['Security'] }] },
              ApproveAfterDays: 7,
            },
          ],
        },
      }),
    );
    await ssm.send(new RegisterDefaultPatchBaselineCommand({ BaselineId }));
    const res = await ssm.send(
      new GetDefaultPatchBaselineCommand({ OperatingSystem: 'AMAZON_LINUX_2023' }),
    );
    expect(res.BaselineId).toBe(BaselineId);
  });

  it.skip('RegisterPatchBaselineForPatchGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new RegisterPatchBaselineForPatchGroupCommand({
        BaselineId: 'pb-0123456789abcdef0',
        PatchGroup: 'web',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('RegisterTargetWithMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new RegisterTargetWithMaintenanceWindowCommand({
        WindowId: 'mw-0123456789abcdef0',
        ResourceType: 'INSTANCE',
        Targets: [{ Key: 'InstanceIds', Values: ['i-0123456789abcdef0'] }],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('RegisterTaskWithMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new RegisterTaskWithMaintenanceWindowCommand({
        WindowId: 'mw-0123456789abcdef0',
        TaskArn: 'AWS-RunShellScript',
        TaskType: 'RUN_COMMAND',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('RemoveTagsFromResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new PutParameterCommand({
        Name: '/tags/remove',
        Value: 'v',
        Type: 'String',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await ssm.send(
      new RemoveTagsFromResourceCommand({
        ResourceType: 'Parameter',
        ResourceId: '/tags/remove',
        TagKeys: ['env'],
      }),
    );
    const res = await ssm.send(
      new ListTagsForResourceCommand({ ResourceType: 'Parameter', ResourceId: '/tags/remove' }),
    );
    expect(res.TagList).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ResetServiceSetting', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new UpdateServiceSettingCommand({
        SettingId: '/ssm/parameter-store/high-throughput-enabled',
        SettingValue: 'true',
      }),
    );
    const res = await ssm.send(
      new ResetServiceSettingCommand({ SettingId: '/ssm/parameter-store/high-throughput-enabled' }),
    );
    expect(res.ServiceSetting?.SettingValue).toBe('false');
  });

  it.skip('ResumeSession', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ResumeSessionCommand({ SessionId: 'session-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('SendAutomationSignal', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new SendAutomationSignalCommand({
        AutomationExecutionId: '00000000-0000-0000-0000-000000000000',
        SignalType: 'Approve',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('SendCommand', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'send-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { Command } = await ssm.send(
      new SendCommandCommand({
        DocumentName: 'send-doc',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
      }),
    );
    expect(Command?.CommandId).toBeTruthy();
    expect(Command?.DocumentName).toBe('send-doc');
  });

  it('StartAccessRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-approve',
        DocumentType: 'AutoApprovalPolicy',
        DocumentFormat: 'TEXT',
        Content:
          'permit (principal, action == AWS::SSM::Action::"getTokenForInstanceAccess", resource);',
      }),
    );
    const { AccessRequestId } = await ssm.send(
      new StartAccessRequestCommand({
        Reason: 'debugging',
        Targets: [{ Key: 'InstanceIds', Values: ['i-0123456789abcdef0'] }],
      }),
    );
    expect(AccessRequestId).toMatch(/^oi-/);
  });

  it.skip('StartAssociationsOnce', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new StartAssociationsOnceCommand({
        AssociationIds: ['00000000-0000-0000-0000-000000000000'],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('StartAutomationExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'auto-start',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const { AutomationExecutionId } = await ssm.send(
      new StartAutomationExecutionCommand({ DocumentName: 'auto-start' }),
    );
    await expect
      .poll(
        async () =>
          (await ssm.send(new GetAutomationExecutionCommand({ AutomationExecutionId })))
            .AutomationExecution?.AutomationExecutionStatus,
        { timeout: 10_000, interval: 100 },
      )
      .toBe('Success');
    expect(AutomationExecutionId).toBeTruthy();
  });

  it.skip('StartChangeRequestExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new StartChangeRequestExecutionCommand({
        DocumentName: 'my-change-template',
        Runbooks: [{ DocumentName: 'AWS-RestartEC2Instance' }],
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('StartExecutionPreview', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'preview-start',
        DocumentType: 'Automation',
        Content: JSON.stringify({
          schemaVersion: '0.3',
          description: 'sleep briefly',
          mainSteps: [{ name: 'pause', action: 'aws:sleep', inputs: { Duration: 'PT0S' } }],
        }),
      }),
    );
    const res = await ssm.send(
      new StartExecutionPreviewCommand({
        DocumentName: 'preview-start',
        ExecutionInputs: { Automation: {} },
      }),
    );
    expect(res.ExecutionPreviewId).toBeTruthy();
  });

  it.skip('StartSession', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(new StartSessionCommand({ Target: 'i-0123456789abcdef0' }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('StopAutomationExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new StopAutomationExecutionCommand({
        AutomationExecutionId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('TerminateSession', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new TerminateSessionCommand({ SessionId: 'session-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UnlabelParameterVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(new PutParameterCommand({ Name: '/unlabeled', Value: 'v1', Type: 'String' }));
    await ssm.send(
      new LabelParameterVersionCommand({
        Name: '/unlabeled',
        ParameterVersion: 1,
        Labels: ['prod'],
      }),
    );
    const res = await ssm.send(
      new UnlabelParameterVersionCommand({
        Name: '/unlabeled',
        ParameterVersion: 1,
        Labels: ['prod'],
      }),
    );
    expect(res.RemovedLabels).toEqual(['prod']);
  });

  it('UpdateAssociation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'assoc-update',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const { AssociationDescription } = await ssm.send(
      new CreateAssociationCommand({
        Name: 'assoc-update',
        Targets: [{ Key: 'tag:Role', Values: ['web'] }],
        AssociationName: 'assoc-update-association',
      }),
    );
    const res = await ssm.send(
      new UpdateAssociationCommand({
        AssociationId: AssociationDescription?.AssociationId,
        ScheduleExpression: 'rate(1 day)',
      }),
    );
    expect(res.AssociationDescription?.ScheduleExpression).toBe('rate(1 day)');
  });

  it.skip('UpdateAssociationStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateAssociationStatusCommand({
        Name: 'my-document',
        InstanceId: 'i-0123456789abcdef0',
        AssociationStatus: { Date: new Date(), Name: 'Success', Message: 'ok' },
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateCloudConnector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { CloudConnectorId } = await ssm.send(
      new CreateCloudConnectorCommand({
        DisplayName: 'azure-connector',
        RoleArn: 'arn:aws:iam::000000000000:role/cloud-connector',
        ConfigConnectorArn: 'arn:aws:config:us-east-1:000000000000:connector/azure',
        Configuration: {
          AzureConfiguration: {
            TenantId: '00000000-0000-0000-0000-000000000000',
            ApplicationId: '00000000-0000-0000-0000-000000000000',
          },
        },
      }),
    );
    await ssm.send(
      new UpdateCloudConnectorCommand({ CloudConnectorId, DisplayName: 'renamed-connector' }),
    );
    const res = await ssm.send(new GetCloudConnectorCommand({ CloudConnectorId }));
    expect(res.DisplayName).toBe('renamed-connector');
  });

  it('UpdateDocument', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'update-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    const res = await ssm.send(
      new UpdateDocumentCommand({
        Name: 'update-doc',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo bye'] } },
          ],
        }),
        DocumentVersion: '$LATEST',
      }),
    );
    expect(res.DocumentDescription?.DocumentVersion).toBe('2');
  });

  it('UpdateDocumentDefaultVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateDocumentCommand({
        Name: 'default-doc',
        DocumentType: 'Command',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo hello'] } },
          ],
        }),
      }),
    );
    await ssm.send(
      new UpdateDocumentCommand({
        Name: 'default-doc',
        Content: JSON.stringify({
          schemaVersion: '2.2',
          description: 'echo',
          mainSteps: [
            { action: 'aws:runShellScript', name: 'echo', inputs: { runCommand: ['echo bye'] } },
          ],
        }),
        DocumentVersion: '$LATEST',
      }),
    );
    const res = await ssm.send(
      new UpdateDocumentDefaultVersionCommand({ Name: 'default-doc', DocumentVersion: '2' }),
    );
    expect(res.Description?.DefaultVersion).toBe('2');
  });

  it.skip('UpdateDocumentMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateDocumentMetadataCommand({
        Name: 'my-document',
        DocumentReviews: { Action: 'Approve' },
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('UpdateMaintenanceWindow', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateMaintenanceWindowCommand({ WindowId: 'mw-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('UpdateMaintenanceWindowTarget', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateMaintenanceWindowTargetCommand({
        WindowId: 'mw-0123456789abcdef0',
        WindowTargetId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('UpdateMaintenanceWindowTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateMaintenanceWindowTaskCommand({
        WindowId: 'mw-0123456789abcdef0',
        WindowTaskId: '00000000-0000-0000-0000-000000000000',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('UpdateManagedInstanceRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateManagedInstanceRoleCommand({
        InstanceId: 'i-0123456789abcdef0',
        IamRole: 'ssm-role',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateOpsItem', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const { OpsItemId } = await ssm.send(
      new CreateOpsItemCommand({
        Title: 'update-item',
        Description: 'disk is full',
        Source: 'monitoring',
        Priority: 2,
      }),
    );
    await ssm.send(new UpdateOpsItemCommand({ OpsItemId, Status: 'Resolved' }));
    const res = await ssm.send(new GetOpsItemCommand({ OpsItemId }));
    expect(res.OpsItem?.Status).toBe('Resolved');
  });

  it.skip('UpdateOpsMetadata', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdateOpsMetadataCommand({
        OpsMetadataArn: 'arn:aws:ssm:us-east-1:000000000000:opsmetadata/app',
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('UpdatePatchBaseline', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new UpdatePatchBaselineCommand({ BaselineId: 'pb-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('UpdateResourceDataSync', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new CreateResourceDataSyncCommand({
        SyncName: 'update-sync',
        SyncType: 'SyncFromSource',
        SyncSource: { SourceType: 'SingleAccountMultiRegions', SourceRegions: ['us-east-1'] },
      }),
    );
    await ssm.send(
      new UpdateResourceDataSyncCommand({
        SyncName: 'update-sync',
        SyncType: 'SyncFromSource',
        SyncSource: {
          SourceType: 'SingleAccountMultiRegions',
          SourceRegions: ['us-east-1', 'us-west-2'],
        },
      }),
    );
    const res = await ssm.send(new ListResourceDataSyncCommand({ SyncType: 'SyncFromSource' }));
    expect(res.ResourceDataSyncItems?.[0]?.SyncSource?.SourceRegions).toEqual([
      'us-east-1',
      'us-west-2',
    ]);
  });

  it('UpdateServiceSetting', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    await ssm.send(
      new UpdateServiceSettingCommand({
        SettingId: '/ssm/parameter-store/high-throughput-enabled',
        SettingValue: 'true',
      }),
    );
    const res = await ssm.send(
      new GetServiceSettingCommand({ SettingId: '/ssm/parameter-store/high-throughput-enabled' }),
    );
    expect(res.ServiceSetting?.SettingValue).toBe('true');
  });

  it.skip('ValidateCloudConnector', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const ssm = new SSMClient(aws.clientConfig());
    const res = await ssm.send(
      new ValidateCloudConnectorCommand({ CloudConnectorId: 'cc-0123456789abcdef0' }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });
});
