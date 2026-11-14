import { CreateRoleCommand, IAMClient, PutRolePolicyCommand } from '@aws-sdk/client-iam';
import {
  CreateActivityCommand,
  CreateStateMachineAliasCommand,
  CreateStateMachineCommand,
  DeleteActivityCommand,
  DeleteStateMachineAliasCommand,
  DeleteStateMachineCommand,
  DeleteStateMachineVersionCommand,
  DescribeActivityCommand,
  DescribeExecutionCommand,
  DescribeMapRunCommand,
  DescribeStateMachineAliasCommand,
  DescribeStateMachineCommand,
  DescribeStateMachineForExecutionCommand,
  GetActivityTaskCommand,
  GetExecutionHistoryCommand,
  ListActivitiesCommand,
  ListExecutionsCommand,
  ListMapRunsCommand,
  ListStateMachineAliasesCommand,
  ListStateMachinesCommand,
  ListStateMachineVersionsCommand,
  ListTagsForResourceCommand,
  PublishStateMachineVersionCommand,
  RedriveExecutionCommand,
  SendTaskFailureCommand,
  SendTaskHeartbeatCommand,
  SendTaskSuccessCommand,
  SFNClient,
  StartExecutionCommand,
  StartSyncExecutionCommand,
  StopExecutionCommand,
  TagResourceCommand,
  TestStateCommand,
  UntagResourceCommand,
  UpdateMapRunCommand,
  UpdateStateMachineAliasCommand,
  UpdateStateMachineCommand,
  ValidateStateMachineDefinitionCommand,
} from '@aws-sdk/client-sfn';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('sfn', () => {
  it('CreateActivity', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const res = await sfn.send(new CreateActivityCommand({ name: 'created-activity' }));
    expect(res.activityArn).toMatch(/:activity:created-activity$/);
  });

  it('CreateStateMachine', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'created-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    expect(stateMachineArn).toMatch(/:stateMachine:created-machine$/);
  });

  it('CreateStateMachineAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'alias-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    const res = await sfn.send(
      new CreateStateMachineAliasCommand({
        name: 'live',
        routingConfiguration: [{ stateMachineVersionArn, weight: 100 }],
      }),
    );
    expect(res.stateMachineAliasArn).toMatch(/:stateMachine:alias-machine:live$/);
  });

  it('DeleteActivity', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(new CreateActivityCommand({ name: 'doomed-activity' }));
    await sfn.send(new DeleteActivityCommand({ activityArn }));
    const res = await sfn.send(new ListActivitiesCommand({}));
    expect(res.activities ?? []).toHaveLength(0);
  });

  it('DeleteStateMachine', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'doomed-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    await sfn.send(new DeleteStateMachineCommand({ stateMachineArn }));
    await expect
      .poll(async () => (await sfn.send(new ListStateMachinesCommand({}))).stateMachines ?? [], {
        timeout: 10_000,
      })
      .toHaveLength(0);
  });

  it('DeleteStateMachineAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'delete-alias-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    const { stateMachineAliasArn } = await sfn.send(
      new CreateStateMachineAliasCommand({
        name: 'doomed',
        routingConfiguration: [{ stateMachineVersionArn, weight: 100 }],
      }),
    );
    await sfn.send(new DeleteStateMachineAliasCommand({ stateMachineAliasArn }));
    const res = await sfn.send(new ListStateMachineAliasesCommand({ stateMachineArn }));
    expect(res.stateMachineAliases ?? []).toHaveLength(0);
  });

  it('DeleteStateMachineVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'delete-version-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    await sfn.send(new DeleteStateMachineVersionCommand({ stateMachineVersionArn }));
    const res = await sfn.send(new ListStateMachineVersionsCommand({ stateMachineArn }));
    expect(res.stateMachineVersions ?? []).toHaveLength(0);
  });

  it('DescribeActivity', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(
      new CreateActivityCommand({ name: 'described-activity' }),
    );
    const res = await sfn.send(new DescribeActivityCommand({ activityArn }));
    expect(res.name).toBe('described-activity');
  });

  it('DescribeExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'describe-execution-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const res = await sfn.send(new DescribeExecutionCommand({ executionArn }));
    expect(res.status).toBe('SUCCEEDED');
    expect(JSON.parse(res.output ?? '{}')).toEqual({ ok: true });
  });

  it('DescribeMapRun', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'sfn-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'states.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'sfn-role',
        PolicyName: 'map-run',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 'states:*', Resource: '*' }],
        }),
      }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'describe-map-machine',
        roleArn: Role?.Arn,
        definition: JSON.stringify({
          StartAt: 'Fan',
          States: {
            Fan: {
              Type: 'Map',
              ItemProcessor: {
                ProcessorConfig: { Mode: 'DISTRIBUTED', ExecutionType: 'STANDARD' },
                StartAt: 'Item',
                States: { Item: { Type: 'Pass', End: true } },
              },
              End: true,
            },
          },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '[1, 2, 3]' }),
    );
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const { mapRuns } = await sfn.send(new ListMapRunsCommand({ executionArn }));
    const res = await sfn.send(new DescribeMapRunCommand({ mapRunArn: mapRuns?.[0]?.mapRunArn }));
    expect(res.status).toBe('SUCCEEDED');
    expect(res.itemCounts?.succeeded).toBe(3);
  });

  it('DescribeStateMachine', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'described-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const res = await sfn.send(new DescribeStateMachineCommand({ stateMachineArn }));
    expect(res.name).toBe('described-machine');
    expect(JSON.parse(res.definition ?? '{}').StartAt).toBe('Done');
  });

  it('DescribeStateMachineAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'describe-alias-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    const { stateMachineAliasArn } = await sfn.send(
      new CreateStateMachineAliasCommand({
        name: 'described',
        description: 'alias description',
        routingConfiguration: [{ stateMachineVersionArn, weight: 100 }],
      }),
    );
    const res = await sfn.send(new DescribeStateMachineAliasCommand({ stateMachineAliasArn }));
    expect(res.description).toBe('alias description');
  });

  it('DescribeStateMachineForExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'for-execution-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    const res = await sfn.send(new DescribeStateMachineForExecutionCommand({ executionArn }));
    expect(res.stateMachineArn).toBe(stateMachineArn);
  });

  it('GetActivityTask', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(
      new CreateActivityCommand({ name: 'get-task-activity' }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'get-task',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Work',
          States: { Work: { Type: 'Task', Resource: activityArn, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{"job":1}' }),
    );
    const { taskToken, input } = await sfn.send(
      new GetActivityTaskCommand({ activityArn, workerName: 'worker-1' }),
    );
    expect(JSON.parse(input ?? '{}')).toEqual({ job: 1 });
    expect(taskToken).toBeTruthy();
    expect(executionArn).toBeTruthy();
  });

  it('GetExecutionHistory', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'history-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const res = await sfn.send(new GetExecutionHistoryCommand({ executionArn }));
    expect(res.events?.[0]?.type).toBe('ExecutionStarted');
    expect(res.events?.at(-1)?.type).toBe('ExecutionSucceeded');
  });

  it('ListActivities', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    await sfn.send(new CreateActivityCommand({ name: 'listed-a' }));
    await sfn.send(new CreateActivityCommand({ name: 'listed-b' }));
    const res = await sfn.send(new ListActivitiesCommand({}));
    expect(res.activities?.map((activity) => activity.name).sort()).toEqual([
      'listed-a',
      'listed-b',
    ]);
  });

  it('ListExecutions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'list-executions-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    const res = await sfn.send(new ListExecutionsCommand({ stateMachineArn }));
    expect(res.executions?.map((execution) => execution.executionArn)).toEqual([executionArn]);
  });

  it('ListMapRuns', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'sfn-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'states.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'sfn-role',
        PolicyName: 'map-run',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 'states:*', Resource: '*' }],
        }),
      }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'list-map-machine',
        roleArn: Role?.Arn,
        definition: JSON.stringify({
          StartAt: 'Fan',
          States: {
            Fan: {
              Type: 'Map',
              ItemProcessor: {
                ProcessorConfig: { Mode: 'DISTRIBUTED', ExecutionType: 'STANDARD' },
                StartAt: 'Item',
                States: { Item: { Type: 'Pass', End: true } },
              },
              End: true,
            },
          },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '[1, 2, 3]' }),
    );
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const { mapRuns } = await sfn.send(new ListMapRunsCommand({ executionArn }));
    expect(mapRuns).toHaveLength(1);
  });

  it('ListStateMachineAliases', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'list-alias-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    await sfn.send(
      new CreateStateMachineAliasCommand({
        name: 'listed',
        routingConfiguration: [{ stateMachineVersionArn, weight: 100 }],
      }),
    );
    const res = await sfn.send(new ListStateMachineAliasesCommand({ stateMachineArn }));
    expect(res.stateMachineAliases).toHaveLength(1);
  });

  it('ListStateMachineVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'list-version-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    const res = await sfn.send(new ListStateMachineVersionsCommand({ stateMachineArn }));
    expect(res.stateMachineVersions?.[0]?.stateMachineVersionArn).toBe(stateMachineVersionArn);
  });

  it('ListStateMachines', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'listed-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const res = await sfn.send(new ListStateMachinesCommand({}));
    expect(res.stateMachines?.[0]?.stateMachineArn).toBe(stateMachineArn);
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'tags-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
        tags: [{ key: 'team', value: 'core' }],
      }),
    );
    const res = await sfn.send(new ListTagsForResourceCommand({ resourceArn: stateMachineArn }));
    expect(res.tags).toEqual([{ key: 'team', value: 'core' }]);
  });

  it('PublishStateMachineVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'publish-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const res = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn, description: 'v1' }),
    );
    expect(res.stateMachineVersionArn).toMatch(/:stateMachine:publish-machine:1$/);
  });

  it('RedriveExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'redrive-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Boom',
          States: { Boom: { Type: 'Fail', Error: 'Boom', Cause: 'always fails' } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const res = await sfn.send(new RedriveExecutionCommand({ executionArn }));
    expect(res.redriveDate).toBeInstanceOf(Date);
  });

  it('SendTaskFailure', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(
      new CreateActivityCommand({ name: 'task-failure-activity' }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'task-failure',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Work',
          States: { Work: { Type: 'Task', Resource: activityArn, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{"job":1}' }),
    );
    const { taskToken, input } = await sfn.send(
      new GetActivityTaskCommand({ activityArn, workerName: 'worker-1' }),
    );
    expect(JSON.parse(input ?? '{}')).toEqual({ job: 1 });
    await sfn.send(new SendTaskFailureCommand({ taskToken, error: 'WorkerError', cause: 'nope' }));
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const res = await sfn.send(new DescribeExecutionCommand({ executionArn }));
    expect(res.status).toBe('FAILED');
    expect(res.error).toBe('WorkerError');
  });

  it('SendTaskHeartbeat', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(
      new CreateActivityCommand({ name: 'task-heartbeat-activity' }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'task-heartbeat',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Work',
          States: { Work: { Type: 'Task', Resource: activityArn, End: true } },
        }),
      }),
    );
    await sfn.send(new StartExecutionCommand({ stateMachineArn, input: '{"job":1}' }));
    const { taskToken, input } = await sfn.send(
      new GetActivityTaskCommand({ activityArn, workerName: 'worker-1' }),
    );
    expect(JSON.parse(input ?? '{}')).toEqual({ job: 1 });
    const res = await sfn.send(new SendTaskHeartbeatCommand({ taskToken }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('SendTaskSuccess', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { activityArn } = await sfn.send(
      new CreateActivityCommand({ name: 'task-success-activity' }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'task-success',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Work',
          States: { Work: { Type: 'Task', Resource: activityArn, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{"job":1}' }),
    );
    const { taskToken, input } = await sfn.send(
      new GetActivityTaskCommand({ activityArn, workerName: 'worker-1' }),
    );
    expect(JSON.parse(input ?? '{}')).toEqual({ job: 1 });
    await sfn.send(new SendTaskSuccessCommand({ taskToken, output: '{"done":true}' }));
    await expect
      .poll(
        async () =>
          (await sfn.send(new DescribeExecutionCommand({ executionArn: executionArn }))).status,
        {
          timeout: 10_000,
        },
      )
      .not.toBe('RUNNING');
    const res = await sfn.send(new DescribeExecutionCommand({ executionArn }));
    expect(res.status).toBe('SUCCEEDED');
    expect(JSON.parse(res.output ?? '{}')).toEqual({ done: true });
  });

  it('StartExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'start-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const res = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, name: 'run-1', input: '{"a":1}' }),
    );
    expect(res.executionArn).toMatch(/:execution:start-machine:run-1$/);
  });

  it('StartSyncExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'sync-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
        type: 'EXPRESS',
      }),
    );
    const res = await sfn.send(new StartSyncExecutionCommand({ stateMachineArn, input: '{}' }));
    expect(res.status).toBe('SUCCEEDED');
    expect(JSON.parse(res.output ?? '{}')).toEqual({ ok: true });
  });

  it('StopExecution', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'stop-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Wait',
          States: { Wait: { Type: 'Wait', Seconds: 3600, End: true } },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '{}' }),
    );
    await sfn.send(new StopExecutionCommand({ executionArn, error: 'Stopped', cause: 'test' }));
    const res = await sfn.send(new DescribeExecutionCommand({ executionArn }));
    expect(res.status).toBe('ABORTED');
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'tag-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    await sfn.send(
      new TagResourceCommand({
        resourceArn: stateMachineArn,
        tags: [{ key: 'env', value: 'test' }],
      }),
    );
    const res = await sfn.send(new ListTagsForResourceCommand({ resourceArn: stateMachineArn }));
    expect(res.tags).toEqual([{ key: 'env', value: 'test' }]);
  });

  it('TestState', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const res = await sfn.send(
      new TestStateCommand({
        definition: JSON.stringify({
          Type: 'Pass',
          Parameters: { 'doubled.$': 'States.MathAdd($.n, $.n)' },
          End: true,
        }),
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        input: '{"n":21}',
      }),
    );
    expect(res.status).toBe('SUCCEEDED');
    expect(JSON.parse(res.output ?? '{}')).toEqual({ doubled: 42 });
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'untag-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
        tags: [
          { key: 'env', value: 'test' },
          { key: 'team', value: 'core' },
        ],
      }),
    );
    await sfn.send(new UntagResourceCommand({ resourceArn: stateMachineArn, tagKeys: ['env'] }));
    const res = await sfn.send(new ListTagsForResourceCommand({ resourceArn: stateMachineArn }));
    expect(res.tags).toEqual([{ key: 'team', value: 'core' }]);
  });

  it('UpdateMapRun', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateRoleCommand({
        RoleName: 'sfn-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'states.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'sfn-role',
        PolicyName: 'map-run',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 'states:*', Resource: '*' }],
        }),
      }),
    );
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'update-map-machine',
        roleArn: Role?.Arn,
        definition: JSON.stringify({
          StartAt: 'Fan',
          States: {
            Fan: {
              Type: 'Map',
              ItemProcessor: {
                ProcessorConfig: { Mode: 'DISTRIBUTED', ExecutionType: 'STANDARD' },
                StartAt: 'Item',
                States: { Item: { Type: 'Wait', Seconds: 3600, End: true } },
              },
              End: true,
            },
          },
        }),
      }),
    );
    const { executionArn } = await sfn.send(
      new StartExecutionCommand({ stateMachineArn, input: '[1]' }),
    );
    await expect
      .poll(async () => (await sfn.send(new ListMapRunsCommand({ executionArn }))).mapRuns ?? [], {
        timeout: 10_000,
      })
      .toHaveLength(1);
    const { mapRuns } = await sfn.send(new ListMapRunsCommand({ executionArn }));
    await sfn.send(
      new UpdateMapRunCommand({ mapRunArn: mapRuns?.[0]?.mapRunArn, maxConcurrency: 5 }),
    );
    const res = await sfn.send(new DescribeMapRunCommand({ mapRunArn: mapRuns?.[0]?.mapRunArn }));
    expect(res.maxConcurrency).toBe(5);
  });

  it('UpdateStateMachine', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'update-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    await sfn.send(
      new UpdateStateMachineCommand({
        stateMachineArn,
        definition: JSON.stringify({
          StartAt: 'Changed',
          States: { Changed: { Type: 'Succeed' } },
        }),
      }),
    );
    const res = await sfn.send(new DescribeStateMachineCommand({ stateMachineArn }));
    expect(JSON.parse(res.definition ?? '{}').StartAt).toBe('Changed');
  });

  it('UpdateStateMachineAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const { stateMachineArn } = await sfn.send(
      new CreateStateMachineCommand({
        name: 'update-alias-machine',
        roleArn: 'arn:aws:iam::000000000000:role/sfn-role',
        definition: JSON.stringify({
          StartAt: 'Done',
          States: { Done: { Type: 'Pass', Result: { ok: true }, End: true } },
        }),
      }),
    );
    const { stateMachineVersionArn } = await sfn.send(
      new PublishStateMachineVersionCommand({ stateMachineArn }),
    );
    const { stateMachineAliasArn } = await sfn.send(
      new CreateStateMachineAliasCommand({
        name: 'live',
        routingConfiguration: [{ stateMachineVersionArn, weight: 100 }],
      }),
    );
    await sfn.send(
      new UpdateStateMachineAliasCommand({ stateMachineAliasArn, description: 'updated' }),
    );
    const res = await sfn.send(new DescribeStateMachineAliasCommand({ stateMachineAliasArn }));
    expect(res.description).toBe('updated');
  });

  it('ValidateStateMachineDefinition', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const sfn = new SFNClient(aws.clientConfig());
    const valid = await sfn.send(
      new ValidateStateMachineDefinitionCommand({
        definition: JSON.stringify({ StartAt: 'A', States: { A: { Type: 'Succeed' } } }),
      }),
    );
    expect(valid.result).toBe('OK');
    const invalid = await sfn.send(
      new ValidateStateMachineDefinitionCommand({
        definition: JSON.stringify({ StartAt: 'Missing', States: { A: { Type: 'Succeed' } } }),
      }),
    );
    expect(invalid.result).toBe('FAIL');
  });
});
