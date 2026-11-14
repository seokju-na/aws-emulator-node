import {
  ActivateEventSourceCommand,
  CancelReplayCommand,
  CreateApiDestinationCommand,
  CreateArchiveCommand,
  CreateConnectionCommand,
  CreateEndpointCommand,
  CreateEventBusCommand,
  CreatePartnerEventSourceCommand,
  DeactivateEventSourceCommand,
  DeauthorizeConnectionCommand,
  DeleteApiDestinationCommand,
  DeleteArchiveCommand,
  DeleteConnectionCommand,
  DeleteEndpointCommand,
  DeleteEventBusCommand,
  DeletePartnerEventSourceCommand,
  DeleteRuleCommand,
  DescribeApiDestinationCommand,
  DescribeArchiveCommand,
  DescribeConnectionCommand,
  DescribeEndpointCommand,
  DescribeEventBusCommand,
  DescribeEventSourceCommand,
  DescribePartnerEventSourceCommand,
  DescribeReplayCommand,
  DescribeRuleCommand,
  DisableRuleCommand,
  EnableRuleCommand,
  EventBridgeClient,
  ListApiDestinationsCommand,
  ListArchivesCommand,
  ListConnectionsCommand,
  ListEndpointsCommand,
  ListEventBusesCommand,
  ListEventSourcesCommand,
  ListPartnerEventSourceAccountsCommand,
  ListPartnerEventSourcesCommand,
  ListReplaysCommand,
  ListRuleNamesByTargetCommand,
  ListRulesCommand,
  ListTagsForResourceCommand,
  ListTargetsByRuleCommand,
  PutEventsCommand,
  PutPartnerEventsCommand,
  PutPermissionCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemovePermissionCommand,
  RemoveTargetsCommand,
  StartReplayCommand,
  TagResourceCommand,
  TestEventPatternCommand,
  UntagResourceCommand,
  UpdateApiDestinationCommand,
  UpdateArchiveCommand,
  UpdateConnectionCommand,
  UpdateEndpointCommand,
  UpdateEventBusCommand,
} from '@aws-sdk/client-eventbridge';
import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  ReceiveMessageCommand,
  SetQueueAttributesCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('eventbridge', () => {
  it.skip('ActivateEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/activate',
        Account: '000000000000',
      }),
    );
    await events.send(
      new DeactivateEventSourceCommand({ Name: 'aws.partner/example.com/activate' }),
    );
    await events.send(new ActivateEventSourceCommand({ Name: 'aws.partner/example.com/activate' }));
    const res = await events.send(
      new DescribeEventSourceCommand({ Name: 'aws.partner/example.com/activate' }),
    );
    expect(res.State).toBe('ACTIVE');
  });

  it('CancelReplay', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'cancel-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    await events.send(
      new StartReplayCommand({
        ReplayName: 'cancel-replay',
        EventSourceArn: ArchiveArn,
        EventStartTime: new Date(Date.now() - 3_600_000),
        EventEndTime: new Date(),
        Destination: { Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default' },
      }),
    );
    const res = await events.send(new CancelReplayCommand({ ReplayName: 'cancel-replay' }));
    expect(res.State).toMatch(/CANCELLING|CANCELLED|COMPLETED/);
  });

  it('CreateApiDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'created-destination-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const { ApiDestinationArn } = await events.send(
      new CreateApiDestinationCommand({
        Name: 'created-destination',
        ConnectionArn,
        InvocationEndpoint: 'https://example.com/webhook',
        HttpMethod: 'POST',
      }),
    );
    expect(ApiDestinationArn).toContain(':api-destination/created-destination/');
  });

  it('CreateArchive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'created-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    expect(ArchiveArn).toContain(':archive/created-archive');
  });

  it('CreateConnection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'created-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    expect(ConnectionArn).toContain(':connection/created-connection/');
  });

  it('CreateEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'created-endpoint-bus' }));
    const west = new EventBridgeClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(new CreateEventBusCommand({ Name: 'created-endpoint-bus' }));
    const created = await events.send(
      new CreateEndpointCommand({
        Name: 'created-endpoint',
        RoutingConfig: {
          FailoverConfig: {
            Primary: {
              HealthCheck: 'arn:aws:route53:::healthcheck/00000000-0000-0000-0000-000000000000',
            },
            Secondary: { Route: 'us-west-2' },
          },
        },
        ReplicationConfig: { State: 'DISABLED' },
        EventBuses: [
          { EventBusArn: 'arn:aws:events:us-east-1:000000000000:event-bus/created-endpoint-bus' },
          { EventBusArn: 'arn:aws:events:us-west-2:000000000000:event-bus/created-endpoint-bus' },
        ],
      }),
    );
    expect(created.Arn).toContain(':endpoint/created-endpoint');
  });

  it('CreateEventBus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const res = await events.send(new CreateEventBusCommand({ Name: 'orders' }));
    expect(res.EventBusArn).toBe('arn:aws:events:us-east-1:000000000000:event-bus/orders');
  });

  it.skip('CreatePartnerEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const res = await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/created',
        Account: '000000000000',
      }),
    );
    expect(res.EventSourceArn).toContain('event-source/aws.partner/example.com/created');
  });

  it.skip('DeactivateEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/deactivate',
        Account: '000000000000',
      }),
    );
    await events.send(
      new DeactivateEventSourceCommand({ Name: 'aws.partner/example.com/deactivate' }),
    );
    const res = await events.send(
      new DescribeEventSourceCommand({ Name: 'aws.partner/example.com/deactivate' }),
    );
    expect(res.State).toBe('DELETED');
  });

  it('DeauthorizeConnection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'deauthorized-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const res = await events.send(
      new DeauthorizeConnectionCommand({ Name: 'deauthorized-connection' }),
    );
    expect(res.ConnectionArn).toBe(ConnectionArn);
    expect(res.ConnectionState).toMatch(/DEAUTHORIZING|DEAUTHORIZED/);
  });

  it('DeleteApiDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'doomed-destination-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const { ApiDestinationArn } = await events.send(
      new CreateApiDestinationCommand({
        Name: 'doomed-destination',
        ConnectionArn,
        InvocationEndpoint: 'https://example.com/webhook',
        HttpMethod: 'POST',
      }),
    );
    await events.send(new DeleteApiDestinationCommand({ Name: 'doomed-destination' }));
    const res = await events.send(new ListApiDestinationsCommand({}));
    expect(res.ApiDestinations ?? []).toHaveLength(0);
    expect(ApiDestinationArn).toBeTruthy();
  });

  it('DeleteArchive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'doomed-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    await events.send(new DeleteArchiveCommand({ ArchiveName: 'doomed-archive' }));
    const res = await events.send(new ListArchivesCommand({}));
    expect(res.Archives ?? []).toHaveLength(0);
    expect(ArchiveArn).toBeTruthy();
  });

  it('DeleteConnection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'doomed-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const res = await events.send(new DeleteConnectionCommand({ Name: 'doomed-connection' }));
    expect(res.ConnectionArn).toBe(ConnectionArn);
  });

  it('DeleteEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'doomed-endpoint-bus' }));
    const west = new EventBridgeClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(new CreateEventBusCommand({ Name: 'doomed-endpoint-bus' }));
    const created = await events.send(
      new CreateEndpointCommand({
        Name: 'doomed-endpoint',
        RoutingConfig: {
          FailoverConfig: {
            Primary: {
              HealthCheck: 'arn:aws:route53:::healthcheck/00000000-0000-0000-0000-000000000000',
            },
            Secondary: { Route: 'us-west-2' },
          },
        },
        ReplicationConfig: { State: 'DISABLED' },
        EventBuses: [
          { EventBusArn: 'arn:aws:events:us-east-1:000000000000:event-bus/doomed-endpoint-bus' },
          { EventBusArn: 'arn:aws:events:us-west-2:000000000000:event-bus/doomed-endpoint-bus' },
        ],
      }),
    );
    await events.send(new DeleteEndpointCommand({ Name: 'doomed-endpoint' }));
    const res = await events.send(new ListEndpointsCommand({}));
    expect(res.Endpoints ?? []).toHaveLength(0);
    expect(created.Name).toBe('doomed-endpoint');
  });

  it('DeleteEventBus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'doomed-bus' }));
    await events.send(new DeleteEventBusCommand({ Name: 'doomed-bus' }));
    const res = await events.send(new ListEventBusesCommand({ NamePrefix: 'doomed' }));
    expect(res.EventBuses ?? []).toHaveLength(0);
  });

  it.skip('DeletePartnerEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/doomed',
        Account: '000000000000',
      }),
    );
    await events.send(
      new DeletePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/doomed',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new ListPartnerEventSourcesCommand({ NamePrefix: 'aws.partner/example.com/doomed' }),
    );
    expect(res.PartnerEventSources ?? []).toHaveLength(0);
  });

  it('DeleteRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'doomed-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(new DeleteRuleCommand({ Name: 'doomed-rule' }));
    const res = await events.send(new ListRulesCommand({}));
    expect(res.Rules ?? []).toHaveLength(0);
    expect(RuleArn).toBeTruthy();
  });

  it('DescribeApiDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'described-destination-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const { ApiDestinationArn } = await events.send(
      new CreateApiDestinationCommand({
        Name: 'described-destination',
        ConnectionArn,
        InvocationEndpoint: 'https://example.com/webhook',
        HttpMethod: 'POST',
      }),
    );
    const res = await events.send(
      new DescribeApiDestinationCommand({ Name: 'described-destination' }),
    );
    expect(res.ApiDestinationArn).toBe(ApiDestinationArn);
    expect(res.HttpMethod).toBe('POST');
  });

  it('DescribeArchive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'described-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    const res = await events.send(new DescribeArchiveCommand({ ArchiveName: 'described-archive' }));
    expect(res.ArchiveArn).toBe(ArchiveArn);
    expect(res.RetentionDays).toBe(1);
  });

  it('DescribeConnection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'described-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const res = await events.send(new DescribeConnectionCommand({ Name: 'described-connection' }));
    expect(res.ConnectionArn).toBe(ConnectionArn);
    expect(res.AuthorizationType).toBe('API_KEY');
  });

  it('DescribeEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'described-endpoint-bus' }));
    const west = new EventBridgeClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(new CreateEventBusCommand({ Name: 'described-endpoint-bus' }));
    const created = await events.send(
      new CreateEndpointCommand({
        Name: 'described-endpoint',
        RoutingConfig: {
          FailoverConfig: {
            Primary: {
              HealthCheck: 'arn:aws:route53:::healthcheck/00000000-0000-0000-0000-000000000000',
            },
            Secondary: { Route: 'us-west-2' },
          },
        },
        ReplicationConfig: { State: 'DISABLED' },
        EventBuses: [
          { EventBusArn: 'arn:aws:events:us-east-1:000000000000:event-bus/described-endpoint-bus' },
          { EventBusArn: 'arn:aws:events:us-west-2:000000000000:event-bus/described-endpoint-bus' },
        ],
      }),
    );
    const res = await events.send(new DescribeEndpointCommand({ Name: 'described-endpoint' }));
    expect(res.Arn).toBe(created.Arn);
  });

  it('DescribeEventBus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'described-bus', Description: 'my bus' }));
    const res = await events.send(new DescribeEventBusCommand({ Name: 'described-bus' }));
    expect(res.Name).toBe('described-bus');
    expect(res.Description).toBe('my bus');
  });

  it.skip('DescribeEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/described',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new DescribeEventSourceCommand({ Name: 'aws.partner/example.com/described' }),
    );
    expect(res.Name).toBe('aws.partner/example.com/described');
  });

  it.skip('DescribePartnerEventSource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/partner-described',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new DescribePartnerEventSourceCommand({ Name: 'aws.partner/example.com/partner-described' }),
    );
    expect(res.Name).toBe('aws.partner/example.com/partner-described');
  });

  it('DescribeReplay', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'describe-replay-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    await events.send(
      new StartReplayCommand({
        ReplayName: 'described-replay',
        EventSourceArn: ArchiveArn,
        EventStartTime: new Date(Date.now() - 3_600_000),
        EventEndTime: new Date(),
        Destination: { Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default' },
      }),
    );
    const res = await events.send(new DescribeReplayCommand({ ReplayName: 'described-replay' }));
    expect(res.EventSourceArn).toBe(ArchiveArn);
  });

  it('DescribeRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'described-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
        Description: 'match my.app',
      }),
    );
    const res = await events.send(new DescribeRuleCommand({ Name: 'described-rule' }));
    expect(res.Arn).toBe(RuleArn);
    expect(res.Description).toBe('match my.app');
    expect(res.State).toBe('ENABLED');
  });

  it('DisableRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'disabled-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(new DisableRuleCommand({ Name: 'disabled-rule' }));
    const res = await events.send(new DescribeRuleCommand({ Name: 'disabled-rule' }));
    expect(res.State).toBe('DISABLED');
    expect(RuleArn).toBeTruthy();
  });

  it('EnableRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'enabled-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
        State: 'DISABLED',
      }),
    );
    await events.send(new EnableRuleCommand({ Name: 'enabled-rule' }));
    const res = await events.send(new DescribeRuleCommand({ Name: 'enabled-rule' }));
    expect(res.State).toBe('ENABLED');
    expect(RuleArn).toBeTruthy();
  });

  it('ListApiDestinations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'listed-destination-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const { ApiDestinationArn } = await events.send(
      new CreateApiDestinationCommand({
        Name: 'listed-destination',
        ConnectionArn,
        InvocationEndpoint: 'https://example.com/webhook',
        HttpMethod: 'POST',
      }),
    );
    const res = await events.send(new ListApiDestinationsCommand({}));
    expect(res.ApiDestinations?.map((destination) => destination.ApiDestinationArn)).toEqual([
      ApiDestinationArn,
    ]);
  });

  it('ListArchives', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'listed-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    const res = await events.send(new ListArchivesCommand({}));
    expect(res.Archives?.map((archive) => archive.ArchiveName)).toEqual(['listed-archive']);
    expect(ArchiveArn).toBeTruthy();
  });

  it('ListConnections', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'listed-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const res = await events.send(new ListConnectionsCommand({}));
    expect(res.Connections?.map((connection) => connection.ConnectionArn)).toEqual([ConnectionArn]);
  });

  it('ListEndpoints', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'listed-endpoint-bus' }));
    const west = new EventBridgeClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(new CreateEventBusCommand({ Name: 'listed-endpoint-bus' }));
    const created = await events.send(
      new CreateEndpointCommand({
        Name: 'listed-endpoint',
        RoutingConfig: {
          FailoverConfig: {
            Primary: {
              HealthCheck: 'arn:aws:route53:::healthcheck/00000000-0000-0000-0000-000000000000',
            },
            Secondary: { Route: 'us-west-2' },
          },
        },
        ReplicationConfig: { State: 'DISABLED' },
        EventBuses: [
          { EventBusArn: 'arn:aws:events:us-east-1:000000000000:event-bus/listed-endpoint-bus' },
          { EventBusArn: 'arn:aws:events:us-west-2:000000000000:event-bus/listed-endpoint-bus' },
        ],
      }),
    );
    const res = await events.send(new ListEndpointsCommand({}));
    expect(res.Endpoints?.map((endpoint) => endpoint.Arn)).toEqual([created.Arn]);
  });

  it('ListEventBuses', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'listed-bus' }));
    const res = await events.send(new ListEventBusesCommand({}));
    expect(res.EventBuses?.map((bus) => bus.Name).sort()).toEqual(['default', 'listed-bus']);
  });

  it.skip('ListEventSources', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/listed',
        Account: '000000000000',
      }),
    );
    const res = await events.send(new ListEventSourcesCommand({}));
    expect(res.EventSources?.map((source) => source.Name)).toEqual([
      'aws.partner/example.com/listed',
    ]);
  });

  it.skip('ListPartnerEventSourceAccounts', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/accounts',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new ListPartnerEventSourceAccountsCommand({
        EventSourceName: 'aws.partner/example.com/accounts',
      }),
    );
    expect(res.PartnerEventSourceAccounts?.[0]?.Account).toBe('000000000000');
  });

  it.skip('ListPartnerEventSources', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/partner-listed',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new ListPartnerEventSourcesCommand({ NamePrefix: 'aws.partner/example.com/' }),
    );
    expect(res.PartnerEventSources).toHaveLength(1);
  });

  it('ListReplays', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'list-replay-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    await events.send(
      new StartReplayCommand({
        ReplayName: 'listed-replay',
        EventSourceArn: ArchiveArn,
        EventStartTime: new Date(Date.now() - 3_600_000),
        EventEndTime: new Date(),
        Destination: { Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default' },
      }),
    );
    const res = await events.send(new ListReplaysCommand({}));
    expect(res.Replays?.map((replay) => replay.ReplayName)).toEqual(['listed-replay']);
  });

  it('ListRuleNamesByTarget', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'by-target-queue' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'by-target-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(
      new PutTargetsCommand({
        Rule: 'by-target-rule',
        Targets: [{ Id: 'queue', Arn: Attributes?.QueueArn }],
      }),
    );
    const res = await events.send(
      new ListRuleNamesByTargetCommand({ TargetArn: Attributes?.QueueArn }),
    );
    expect(res.RuleNames).toEqual(['by-target-rule']);
    expect(RuleArn).toBeTruthy();
  });

  it('ListRules', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'listed-rule-a',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(
      new PutRuleCommand({ Name: 'listed-rule-b', ScheduleExpression: 'rate(5 minutes)' }),
    );
    const res = await events.send(new ListRulesCommand({ NamePrefix: 'listed-rule-' }));
    expect(res.Rules?.map((rule) => rule.Name).sort()).toEqual(['listed-rule-a', 'listed-rule-b']);
    expect(RuleArn).toBeTruthy();
  });

  it('ListTagsForResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'tags-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await events.send(new ListTagsForResourceCommand({ ResourceARN: RuleArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListTargetsByRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'targets-queue' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'targets-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(
      new PutTargetsCommand({
        Rule: 'targets-rule',
        Targets: [{ Id: 'queue', Arn: Attributes?.QueueArn }],
      }),
    );
    const res = await events.send(new ListTargetsByRuleCommand({ Rule: 'targets-rule' }));
    expect(res.Targets?.[0]?.Arn).toBe(Attributes?.QueueArn);
    expect(RuleArn).toBeTruthy();
  });

  it('PutEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'put-events-queue' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'put-events-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
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
                Principal: { Service: 'events.amazonaws.com' },
                Action: 'sqs:SendMessage',
                Resource: Attributes?.QueueArn,
                Condition: { ArnEquals: { 'aws:SourceArn': RuleArn } },
              },
            ],
          }),
        },
      }),
    );
    await events.send(
      new PutTargetsCommand({
        Rule: 'put-events-rule',
        Targets: [{ Id: 'queue', Arn: Attributes?.QueueArn }],
      }),
    );
    const res = await events.send(
      new PutEventsCommand({
        Entries: [
          { Source: 'my.app', DetailType: 'OrderPlaced', Detail: JSON.stringify({ id: 42 }) },
        ],
      }),
    );
    expect(res.FailedEntryCount).toBe(0);
    await expect
      .poll(
        async () =>
          (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queue.QueueUrl }))).Messages?.[0]
            ?.Body,
        { timeout: 10_000 },
      )
      .toContain('"id":42');
  });

  it.skip('PutPartnerEvents', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new CreatePartnerEventSourceCommand({
        Name: 'aws.partner/example.com/partner-events',
        Account: '000000000000',
      }),
    );
    const res = await events.send(
      new PutPartnerEventsCommand({
        Entries: [
          {
            Source: 'aws.partner/example.com/partner-events',
            DetailType: 'PartnerThing',
            Detail: JSON.stringify({ ok: true }),
          },
        ],
      }),
    );
    expect(res.FailedEntryCount).toBe(0);
  });

  it('PutPermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new PutPermissionCommand({
        EventBusName: 'default',
        Action: 'events:PutEvents',
        Principal: '111111111111',
        StatementId: 'allow-other-account',
      }),
    );
    const res = await events.send(new DescribeEventBusCommand({ Name: 'default' }));
    expect(JSON.parse(res.Policy ?? '{}').Statement[0].Sid).toBe('allow-other-account');
  });

  it('PutRule', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'put-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    expect(RuleArn).toBe('arn:aws:events:us-east-1:000000000000:rule/put-rule');
  });

  it('PutTargets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'put-targets-queue' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'put-targets-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    const res = await events.send(
      new PutTargetsCommand({
        Rule: 'put-targets-rule',
        Targets: [{ Id: 'queue', Arn: Attributes?.QueueArn }],
      }),
    );
    expect(res.FailedEntryCount).toBe(0);
    expect(RuleArn).toBeTruthy();
  });

  it('RemovePermission', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(
      new PutPermissionCommand({
        EventBusName: 'default',
        Action: 'events:PutEvents',
        Principal: '111111111111',
        StatementId: 'temp',
      }),
    );
    await events.send(
      new RemovePermissionCommand({ EventBusName: 'default', StatementId: 'temp' }),
    );
    const res = await events.send(new DescribeEventBusCommand({ Name: 'default' }));
    expect(res.Policy ?? '').not.toContain('"temp"');
  });

  it('RemoveTargets', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const sqs = new SQSClient(aws.clientConfig());
    const queue = await sqs.send(new CreateQueueCommand({ QueueName: 'remove-targets-queue' }));
    const { Attributes } = await sqs.send(
      new GetQueueAttributesCommand({ QueueUrl: queue.QueueUrl, AttributeNames: ['QueueArn'] }),
    );
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'remove-targets-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(
      new PutTargetsCommand({
        Rule: 'remove-targets-rule',
        Targets: [{ Id: 'queue', Arn: Attributes?.QueueArn }],
      }),
    );
    const res = await events.send(
      new RemoveTargetsCommand({ Rule: 'remove-targets-rule', Ids: ['queue'] }),
    );
    expect(res.FailedEntryCount).toBe(0);
    const targets = await events.send(
      new ListTargetsByRuleCommand({ Rule: 'remove-targets-rule' }),
    );
    expect(targets.Targets ?? []).toHaveLength(0);
    expect(RuleArn).toBeTruthy();
  });

  it('StartReplay', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'start-replay-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    const res = await events.send(
      new StartReplayCommand({
        ReplayName: 'started-replay',
        EventSourceArn: ArchiveArn,
        EventStartTime: new Date(Date.now() - 3_600_000),
        EventEndTime: new Date(),
        Destination: { Arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default' },
      }),
    );
    expect(res.ReplayArn).toContain(':replay/started-replay');
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'tag-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
      }),
    );
    await events.send(
      new TagResourceCommand({ ResourceARN: RuleArn, Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await events.send(new ListTagsForResourceCommand({ ResourceARN: RuleArn }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TestEventPattern', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const match = await events.send(
      new TestEventPatternCommand({
        EventPattern: JSON.stringify({
          source: ['my.app'],
          detail: { amount: [{ numeric: ['>', 100] }] },
        }),
        Event: JSON.stringify({
          id: '1',
          account: '000000000000',
          source: 'my.app',
          time: '2026-01-01T00:00:00Z',
          region: 'us-east-1',
          resources: [],
          'detail-type': 'Order',
          detail: { amount: 150 },
        }),
      }),
    );
    expect(match.Result).toBe(true);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { RuleArn } = await events.send(
      new PutRuleCommand({
        Name: 'untag-rule',
        EventPattern: JSON.stringify({ source: ['my.app'] }),
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await events.send(new UntagResourceCommand({ ResourceARN: RuleArn, TagKeys: ['env'] }));
    const res = await events.send(new ListTagsForResourceCommand({ ResourceARN: RuleArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UpdateApiDestination', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'updated-destination-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    const { ApiDestinationArn } = await events.send(
      new CreateApiDestinationCommand({
        Name: 'updated-destination',
        ConnectionArn,
        InvocationEndpoint: 'https://example.com/webhook',
        HttpMethod: 'POST',
      }),
    );
    await events.send(
      new UpdateApiDestinationCommand({ Name: 'updated-destination', HttpMethod: 'PUT' }),
    );
    const res = await events.send(
      new DescribeApiDestinationCommand({ Name: 'updated-destination' }),
    );
    expect(res.HttpMethod).toBe('PUT');
    expect(ApiDestinationArn).toBeTruthy();
  });

  it('UpdateArchive', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ArchiveArn } = await events.send(
      new CreateArchiveCommand({
        ArchiveName: 'updated-archive',
        EventSourceArn: 'arn:aws:events:us-east-1:000000000000:event-bus/default',
        RetentionDays: 1,
      }),
    );
    await events.send(
      new UpdateArchiveCommand({ ArchiveName: 'updated-archive', RetentionDays: 7 }),
    );
    const res = await events.send(new DescribeArchiveCommand({ ArchiveName: 'updated-archive' }));
    expect(res.RetentionDays).toBe(7);
    expect(ArchiveArn).toBeTruthy();
  });

  it('UpdateConnection', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    const { ConnectionArn } = await events.send(
      new CreateConnectionCommand({
        Name: 'updated-connection',
        AuthorizationType: 'API_KEY',
        AuthParameters: {
          ApiKeyAuthParameters: { ApiKeyName: 'x-api-key', ApiKeyValue: 'secret' },
        },
      }),
    );
    await events.send(
      new UpdateConnectionCommand({ Name: 'updated-connection', Description: 'rotated key' }),
    );
    const res = await events.send(new DescribeConnectionCommand({ Name: 'updated-connection' }));
    expect(res.Description).toBe('rotated key');
    expect(ConnectionArn).toBeTruthy();
  });

  it('UpdateEndpoint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'updated-endpoint-bus' }));
    const west = new EventBridgeClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await west.send(new CreateEventBusCommand({ Name: 'updated-endpoint-bus' }));
    const created = await events.send(
      new CreateEndpointCommand({
        Name: 'updated-endpoint',
        RoutingConfig: {
          FailoverConfig: {
            Primary: {
              HealthCheck: 'arn:aws:route53:::healthcheck/00000000-0000-0000-0000-000000000000',
            },
            Secondary: { Route: 'us-west-2' },
          },
        },
        ReplicationConfig: { State: 'DISABLED' },
        EventBuses: [
          { EventBusArn: 'arn:aws:events:us-east-1:000000000000:event-bus/updated-endpoint-bus' },
          { EventBusArn: 'arn:aws:events:us-west-2:000000000000:event-bus/updated-endpoint-bus' },
        ],
      }),
    );
    await events.send(
      new UpdateEndpointCommand({ Name: 'updated-endpoint', Description: 'updated' }),
    );
    const res = await events.send(new DescribeEndpointCommand({ Name: 'updated-endpoint' }));
    expect(res.Description).toBe('updated');
    expect(created.Arn).toBeTruthy();
  });

  it('UpdateEventBus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const events = new EventBridgeClient(aws.clientConfig());
    await events.send(new CreateEventBusCommand({ Name: 'updated-bus' }));
    await events.send(
      new UpdateEventBusCommand({ Name: 'updated-bus', Description: 'now described' }),
    );
    const res = await events.send(new DescribeEventBusCommand({ Name: 'updated-bus' }));
    expect(res.Description).toBe('now described');
  });
});
