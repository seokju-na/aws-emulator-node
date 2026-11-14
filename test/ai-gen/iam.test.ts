import { Buffer } from 'node:buffer';
import {
  AcceptDelegationRequestCommand,
  AcquireRoleCommand,
  AddClientIDToOpenIDConnectProviderCommand,
  AddRoleToInstanceProfileCommand,
  AddUserToGroupCommand,
  AssociateDelegationRequestCommand,
  AttachGroupPolicyCommand,
  AttachRolePolicyCommand,
  AttachUserPolicyCommand,
  ChangePasswordCommand,
  CreateAccessKeyCommand,
  CreateAccountAliasCommand,
  CreateDelegationRequestCommand,
  CreateGroupCommand,
  CreateInstanceProfileCommand,
  CreateLoginProfileCommand,
  CreateOpenIDConnectProviderCommand,
  CreatePolicyCommand,
  CreatePolicyVersionCommand,
  CreateRoleCommand,
  CreateSAMLProviderCommand,
  CreateServiceLinkedRoleCommand,
  CreateServiceSpecificCredentialCommand,
  CreateUserCommand,
  CreateVirtualMFADeviceCommand,
  DeactivateMFADeviceCommand,
  DeleteAccessKeyCommand,
  DeleteAccountAliasCommand,
  DeleteAccountPasswordPolicyCommand,
  DeleteGroupCommand,
  DeleteGroupPolicyCommand,
  DeleteInstanceProfileCommand,
  DeleteLoginProfileCommand,
  DeleteOpenIDConnectProviderCommand,
  DeletePolicyCommand,
  DeletePolicyVersionCommand,
  DeleteRoleCommand,
  DeleteRolePermissionsBoundaryCommand,
  DeleteRolePolicyCommand,
  DeleteSAMLProviderCommand,
  DeleteServerCertificateCommand,
  DeleteServiceLinkedRoleCommand,
  DeleteServiceSpecificCredentialCommand,
  DeleteSigningCertificateCommand,
  DeleteSSHPublicKeyCommand,
  DeleteUserCommand,
  DeleteUserPermissionsBoundaryCommand,
  DeleteUserPolicyCommand,
  DeleteVirtualMFADeviceCommand,
  DetachGroupPolicyCommand,
  DetachRolePolicyCommand,
  DetachUserPolicyCommand,
  DisableOrganizationsRootCredentialsManagementCommand,
  DisableOrganizationsRootSessionsCommand,
  DisableOutboundWebIdentityFederationCommand,
  EnableMFADeviceCommand,
  EnableOrganizationsRootCredentialsManagementCommand,
  EnableOrganizationsRootSessionsCommand,
  EnableOutboundWebIdentityFederationCommand,
  GenerateCredentialReportCommand,
  GenerateOrganizationsAccessReportCommand,
  GenerateServiceLastAccessedDetailsCommand,
  GetAccessKeyLastUsedCommand,
  GetAccountAuthorizationDetailsCommand,
  GetAccountPasswordPolicyCommand,
  GetAccountPropertiesCommand,
  GetAccountSummaryCommand,
  GetContextKeysForCustomPolicyCommand,
  GetContextKeysForPrincipalPolicyCommand,
  GetCredentialReportCommand,
  GetDelegationRequestCommand,
  GetGroupCommand,
  GetGroupPolicyCommand,
  GetHumanReadableSummaryCommand,
  GetInstanceProfileCommand,
  GetLoginProfileCommand,
  GetMFADeviceCommand,
  GetOpenIDConnectProviderCommand,
  GetOrganizationsAccessReportCommand,
  GetOutboundWebIdentityFederationInfoCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetRoleCommand,
  GetRolePolicyCommand,
  GetRoleTemplateVersionCommand,
  GetSAMLProviderCommand,
  GetServerCertificateCommand,
  GetServiceLastAccessedDetailsCommand,
  GetServiceLastAccessedDetailsWithEntitiesCommand,
  GetServiceLinkedRoleDeletionStatusCommand,
  GetSSHPublicKeyCommand,
  GetUserCommand,
  GetUserPolicyCommand,
  IAMClient,
  ListAccessKeysCommand,
  ListAccountAliasesCommand,
  ListAttachedGroupPoliciesCommand,
  ListAttachedRolePoliciesCommand,
  ListAttachedUserPoliciesCommand,
  ListDelegationRequestsCommand,
  ListEntitiesForPolicyCommand,
  ListGroupPoliciesCommand,
  ListGroupsCommand,
  ListGroupsForUserCommand,
  ListInstanceProfilesCommand,
  ListInstanceProfilesForRoleCommand,
  ListInstanceProfileTagsCommand,
  ListMFADevicesCommand,
  ListMFADeviceTagsCommand,
  ListOpenIDConnectProvidersCommand,
  ListOpenIDConnectProviderTagsCommand,
  ListOrganizationsFeaturesCommand,
  ListPoliciesCommand,
  ListPoliciesGrantingServiceAccessCommand,
  ListPolicyTagsCommand,
  ListPolicyVersionsCommand,
  ListRolePoliciesCommand,
  ListRolesCommand,
  ListRoleTagsCommand,
  ListSAMLProvidersCommand,
  ListSAMLProviderTagsCommand,
  ListServerCertificatesCommand,
  ListServerCertificateTagsCommand,
  ListServiceSpecificCredentialsCommand,
  ListSigningCertificatesCommand,
  ListSSHPublicKeysCommand,
  ListUserPoliciesCommand,
  ListUsersCommand,
  ListUserTagsCommand,
  ListVirtualMFADevicesCommand,
  PutAccountPropertiesCommand,
  PutGroupPolicyCommand,
  PutRolePermissionsBoundaryCommand,
  PutRolePolicyCommand,
  PutUserPermissionsBoundaryCommand,
  PutUserPolicyCommand,
  RejectDelegationRequestCommand,
  RemoveClientIDFromOpenIDConnectProviderCommand,
  RemoveRoleFromInstanceProfileCommand,
  RemoveUserFromGroupCommand,
  ResetServiceSpecificCredentialCommand,
  ResyncMFADeviceCommand,
  SendDelegationTokenCommand,
  SetDefaultPolicyVersionCommand,
  SetSecurityTokenServicePreferencesCommand,
  SimulateCustomPolicyCommand,
  SimulatePrincipalPolicyCommand,
  TagInstanceProfileCommand,
  TagMFADeviceCommand,
  TagOpenIDConnectProviderCommand,
  TagPolicyCommand,
  TagRoleCommand,
  TagSAMLProviderCommand,
  TagServerCertificateCommand,
  TagUserCommand,
  UntagInstanceProfileCommand,
  UntagMFADeviceCommand,
  UntagOpenIDConnectProviderCommand,
  UntagPolicyCommand,
  UntagRoleCommand,
  UntagSAMLProviderCommand,
  UntagServerCertificateCommand,
  UntagUserCommand,
  UpdateAccessKeyCommand,
  UpdateAccountPasswordPolicyCommand,
  UpdateAssumeRolePolicyCommand,
  UpdateDelegationRequestCommand,
  UpdateGroupCommand,
  UpdateLoginProfileCommand,
  UpdateOpenIDConnectProviderThumbprintCommand,
  UpdateRoleCommand,
  UpdateRoleDescriptionCommand,
  UpdateSAMLProviderCommand,
  UpdateServerCertificateCommand,
  UpdateServiceSpecificCredentialCommand,
  UpdateSigningCertificateCommand,
  UpdateSSHPublicKeyCommand,
  UpdateUserCommand,
  UploadServerCertificateCommand,
  UploadSigningCertificateCommand,
  UploadSSHPublicKeyCommand,
} from '@aws-sdk/client-iam';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('iam', () => {
  it('AcceptDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    await iam.send(new AcceptDelegationRequestCommand({ DelegationRequestId }));
    const res = await iam.send(new GetDelegationRequestCommand({ DelegationRequestId }));
    expect(res.DelegationRequest?.State).toBe('ACCEPTED');
  });

  it('AcquireRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await expect(
      iam.send(new AcquireRoleCommand({ TemplateArn: 'arn:aws:iam::aws:role-template/ReadOnly' })),
    ).rejects.toThrow(/Role template not found/);
  });

  it('AddClientIDToOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://add-client.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    await iam.send(
      new AddClientIDToOpenIDConnectProviderCommand({
        OpenIDConnectProviderArn,
        ClientID: 'second-client',
      }),
    );
    const res = await iam.send(new GetOpenIDConnectProviderCommand({ OpenIDConnectProviderArn }));
    expect(res.ClientIDList?.sort()).toEqual(['my-client', 'second-client']);
  });

  it('AddRoleToInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'web-profile' }));
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'web-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new AddRoleToInstanceProfileCommand({
        InstanceProfileName: 'web-profile',
        RoleName: 'web-role',
      }),
    );
    const res = await iam.send(
      new GetInstanceProfileCommand({ InstanceProfileName: 'web-profile' }),
    );
    expect(res.InstanceProfile?.Roles?.map((role) => role.RoleName)).toEqual(['web-role']);
  });

  it('AddUserToGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'alice' }));
    await iam.send(new CreateGroupCommand({ GroupName: 'devs' }));
    await iam.send(new AddUserToGroupCommand({ GroupName: 'devs', UserName: 'alice' }));
    const res = await iam.send(new GetGroupCommand({ GroupName: 'devs' }));
    expect(res.Users?.map((user) => user.UserName)).toEqual(['alice']);
  });

  it('AssociateDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    const res = await iam.send(new AssociateDelegationRequestCommand({ DelegationRequestId }));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('AttachGroupPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-attach' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'group-attach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachGroupPolicyCommand({ GroupName: 'group-attach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedGroupPoliciesCommand({ GroupName: 'group-attach' }));
    expect(res.AttachedPolicies?.map((policy) => policy.PolicyArn)).toEqual([Policy?.Arn]);
  });

  it('AttachRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-attach',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'role-attach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachRolePolicyCommand({ RoleName: 'role-attach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedRolePoliciesCommand({ RoleName: 'role-attach' }));
    expect(res.AttachedPolicies?.map((policy) => policy.PolicyArn)).toEqual([Policy?.Arn]);
  });

  it('AttachUserPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-attach' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'user-attach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachUserPolicyCommand({ UserName: 'user-attach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedUserPoliciesCommand({ UserName: 'user-attach' }));
    expect(res.AttachedPolicies?.map((policy) => policy.PolicyArn)).toEqual([Policy?.Arn]);
  });

  it('ChangePassword', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'changer' }));
    await iam.send(
      new CreateLoginProfileCommand({ UserName: 'changer', Password: 'Initial-Passw0rd!' }),
    );
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'changer',
        PolicyName: 'self-service',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 'iam:ChangePassword', Resource: '*' }],
        }),
      }),
    );
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'changer' }));
    const asUser = new IAMClient({
      ...aws.clientConfig(),
      credentials: {
        accessKeyId: AccessKey?.AccessKeyId ?? '',
        secretAccessKey: AccessKey?.SecretAccessKey ?? '',
      },
    });
    await asUser.send(
      new ChangePasswordCommand({
        OldPassword: 'Initial-Passw0rd!',
        NewPassword: 'Changed-Passw0rd!',
      }),
    );
    const res = await iam.send(new GetLoginProfileCommand({ UserName: 'changer' }));
    expect(res.LoginProfile?.UserName).toBe('changer');
  });

  it('CreateAccessKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'key-owner' }));
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'key-owner' }));
    expect(AccessKey?.AccessKeyId).toMatch(/^[A-Z0-9]{20}$/);
    expect(AccessKey?.SecretAccessKey).toBeTruthy();
    expect(AccessKey?.Status).toBe('Active');
  });

  it('CreateAccountAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateAccountAliasCommand({ AccountAlias: 'my-company' }));
    const res = await iam.send(new ListAccountAliasesCommand({}));
    expect(res.AccountAliases).toEqual(['my-company']);
  });

  it('CreateDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    expect(DelegationRequestId).toBeTruthy();
  });

  it('CreateGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new CreateGroupCommand({ GroupName: 'admins', Path: '/ops/' }));
    expect(res.Group?.Arn).toBe('arn:aws:iam::000000000000:group/ops/admins');
  });

  it('CreateInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new CreateInstanceProfileCommand({ InstanceProfileName: 'created-profile' }),
    );
    expect(res.InstanceProfile?.Arn).toBe(
      'arn:aws:iam::000000000000:instance-profile/created-profile',
    );
  });

  it('CreateLoginProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'console-user' }));
    const res = await iam.send(
      new CreateLoginProfileCommand({
        UserName: 'console-user',
        Password: 'Initial-Passw0rd!',
        PasswordResetRequired: true,
      }),
    );
    expect(res.LoginProfile?.PasswordResetRequired).toBe(true);
  });

  it('CreateOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://token.actions.githubusercontent.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    expect(OpenIDConnectProviderArn).toBe(
      'arn:aws:iam::000000000000:oidc-provider/token.actions.githubusercontent.com',
    );
  });

  it('CreatePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'created-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
        Description: 'read objects',
      }),
    );
    expect(Policy?.Arn).toBe('arn:aws:iam::000000000000:policy/created-policy');
    expect(Policy?.DefaultVersionId).toBe('v1');
  });

  it('CreatePolicyVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'versioned-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new CreatePolicyVersionCommand({
        PolicyArn: Policy?.Arn,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
        SetAsDefault: true,
      }),
    );
    expect(res.PolicyVersion?.VersionId).toBe('v2');
    expect(res.PolicyVersion?.IsDefaultVersion).toBe(true);
  });

  it('CreateRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new CreateRoleCommand({
        RoleName: 'created-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
        MaxSessionDuration: 7200,
      }),
    );
    expect(res.Role?.Arn).toBe('arn:aws:iam::000000000000:role/created-role');
    expect(res.Role?.MaxSessionDuration).toBe(7200);
  });

  it('CreateSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'created-idp',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    expect(SAMLProviderArn).toBe('arn:aws:iam::000000000000:saml-provider/created-idp');
  });

  it('CreateServiceLinkedRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateServiceLinkedRoleCommand({ AWSServiceName: 'elasticbeanstalk.amazonaws.com' }),
    );
    expect(Role?.Path).toBe('/aws-service-role/elasticbeanstalk.amazonaws.com/');
  });

  it('CreateServiceSpecificCredential', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'git-user' }));
    const { ServiceSpecificCredential } = await iam.send(
      new CreateServiceSpecificCredentialCommand({
        UserName: 'git-user',
        ServiceName: 'codecommit.amazonaws.com',
      }),
    );
    expect(ServiceSpecificCredential?.ServiceName).toBe('codecommit.amazonaws.com');
    expect(ServiceSpecificCredential?.ServicePassword).toBeTruthy();
  });

  it('CreateUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new CreateUserCommand({ UserName: 'created-user', Tags: [{ Key: 'team', Value: 'core' }] }),
    );
    expect(res.User?.Arn).toBe('arn:aws:iam::000000000000:user/created-user');
  });

  it('CreateVirtualMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'my-mfa' }),
    );
    expect(VirtualMFADevice?.SerialNumber).toBe('arn:aws:iam::000000000000:mfa/my-mfa');
    expect(VirtualMFADevice?.Base32StringSeed?.length).toBeGreaterThan(0);
  });

  it.skip('DeactivateMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'mfa-off' }));
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-off' }),
    );
    await iam.send(
      new DeactivateMFADeviceCommand({
        UserName: 'mfa-off',
        SerialNumber: VirtualMFADevice?.SerialNumber,
      }),
    );
  });

  it('DeleteAccessKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'delete-key' }));
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'delete-key' }));
    await iam.send(
      new DeleteAccessKeyCommand({ UserName: 'delete-key', AccessKeyId: AccessKey?.AccessKeyId }),
    );
    const res = await iam.send(new ListAccessKeysCommand({ UserName: 'delete-key' }));
    expect(res.AccessKeyMetadata).toEqual([]);
  });

  it('DeleteAccountAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateAccountAliasCommand({ AccountAlias: 'doomed-alias' }));
    await iam.send(new DeleteAccountAliasCommand({ AccountAlias: 'doomed-alias' }));
    const res = await iam.send(new ListAccountAliasesCommand({}));
    expect(res.AccountAliases).toEqual([]);
  });

  it('DeleteAccountPasswordPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new UpdateAccountPasswordPolicyCommand({ MinimumPasswordLength: 12 }));
    await iam.send(new DeleteAccountPasswordPolicyCommand({}));
    await expect(iam.send(new GetAccountPasswordPolicyCommand({}))).rejects.toThrow();
  });

  it('DeleteGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'doomed-group' }));
    await iam.send(new DeleteGroupCommand({ GroupName: 'doomed-group' }));
    await expect(iam.send(new GetGroupCommand({ GroupName: 'doomed-group' }))).rejects.toThrow();
  });

  it('DeleteGroupPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-inline-delete' }));
    await iam.send(
      new PutGroupPolicyCommand({
        GroupName: 'group-inline-delete',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new DeleteGroupPolicyCommand({ GroupName: 'group-inline-delete', PolicyName: 'inline' }),
    );
    const res = await iam.send(new ListGroupPoliciesCommand({ GroupName: 'group-inline-delete' }));
    expect(res.PolicyNames).toEqual([]);
  });

  it('DeleteInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'doomed-profile' }));
    await iam.send(new DeleteInstanceProfileCommand({ InstanceProfileName: 'doomed-profile' }));
    await expect(
      iam.send(new GetInstanceProfileCommand({ InstanceProfileName: 'doomed-profile' })),
    ).rejects.toThrow();
  });

  it('DeleteLoginProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'no-console' }));
    await iam.send(
      new CreateLoginProfileCommand({ UserName: 'no-console', Password: 'Initial-Passw0rd!' }),
    );
    await iam.send(new DeleteLoginProfileCommand({ UserName: 'no-console' }));
    await expect(
      iam.send(new GetLoginProfileCommand({ UserName: 'no-console' })),
    ).rejects.toThrow();
  });

  it('DeleteOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://doomed.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    await iam.send(new DeleteOpenIDConnectProviderCommand({ OpenIDConnectProviderArn }));
    const res = await iam.send(new ListOpenIDConnectProvidersCommand({}));
    expect(res.OpenIDConnectProviderList ?? []).toHaveLength(0);
  });

  it('DeletePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'doomed-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(new DeletePolicyCommand({ PolicyArn: Policy?.Arn }));
    await expect(iam.send(new GetPolicyCommand({ PolicyArn: Policy?.Arn }))).rejects.toThrow();
  });

  it('DeletePolicyVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'prune-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new CreatePolicyVersionCommand({
        PolicyArn: Policy?.Arn,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(new DeletePolicyVersionCommand({ PolicyArn: Policy?.Arn, VersionId: 'v2' }));
    const res = await iam.send(new ListPolicyVersionsCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Versions?.map((version) => version.VersionId)).toEqual(['v1']);
  });

  it('DeleteRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'doomed-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(new DeleteRoleCommand({ RoleName: 'doomed-role' }));
    await expect(iam.send(new GetRoleCommand({ RoleName: 'doomed-role' }))).rejects.toThrow();
  });

  it('DeleteRolePermissionsBoundary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'bounded-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'role-boundary',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutRolePermissionsBoundaryCommand({
        RoleName: 'bounded-role',
        PermissionsBoundary: Policy?.Arn,
      }),
    );
    await iam.send(new DeleteRolePermissionsBoundaryCommand({ RoleName: 'bounded-role' }));
    const res = await iam.send(new GetRoleCommand({ RoleName: 'bounded-role' }));
    expect(res.Role?.PermissionsBoundary).toBeUndefined();
  });

  it('DeleteRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-inline-delete',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'role-inline-delete',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new DeleteRolePolicyCommand({ RoleName: 'role-inline-delete', PolicyName: 'inline' }),
    );
    const res = await iam.send(new ListRolePoliciesCommand({ RoleName: 'role-inline-delete' }));
    expect(res.PolicyNames).toEqual([]);
  });

  it('DeleteSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'doomed-idp',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    await iam.send(new DeleteSAMLProviderCommand({ SAMLProviderArn }));
    const res = await iam.send(new ListSAMLProvidersCommand({}));
    expect(res.SAMLProviderList ?? []).toHaveLength(0);
  });

  it.skip('DeleteSSHPublicKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssh-delete' }));
    const { SSHPublicKey } = await iam.send(
      new UploadSSHPublicKeyCommand({
        UserName: 'ssh-delete',
        SSHPublicKeyBody:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMmVSOrBc0bJI4WK7UIFa8Sty1Ss+fhTuLEuA6Azw1f4ecG5lu27j49uXVpg6caXLVDNxpkP6Fu3+7awwJHD3Ign2+bDZ0XGvrVC8ib/V2z1wKRwCcxPKG3m0aUK+K53kvupwOEUJTt0hmVlt+VqsoU8sfKR/DvHTUhbFyn/QI+TMQZqLKc/w90RSo2+EKSYy/d4ycUUKdP+g9uIq24x+FLxWOiT3KY4whVhbisktCaedwn37/sP45PM9kDkL4a79Xv7SZ04YhJVDVt1+1DLQBYTxgVvGBRfwd7WquhjGtGXi39CbTRA779XxRG1CsLiXOW5EF4c/+/C+WLW60EbgX test',
      }),
    );
    await iam.send(
      new DeleteSSHPublicKeyCommand({
        UserName: 'ssh-delete',
        SSHPublicKeyId: SSHPublicKey?.SSHPublicKeyId,
      }),
    );
    const res = await iam.send(new ListSSHPublicKeysCommand({ UserName: 'ssh-delete' }));
    expect(res.SSHPublicKeys ?? []).toHaveLength(0);
  });

  it('DeleteServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'doomed-cert',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    await iam.send(new DeleteServerCertificateCommand({ ServerCertificateName: 'doomed-cert' }));
    const res = await iam.send(new ListServerCertificatesCommand({}));
    expect(res.ServerCertificateMetadataList).toEqual([]);
  });

  it('DeleteServiceLinkedRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateServiceLinkedRoleCommand({ AWSServiceName: 'elasticbeanstalk.amazonaws.com' }),
    );
    const res = await iam.send(new DeleteServiceLinkedRoleCommand({ RoleName: Role?.RoleName }));
    expect(res.DeletionTaskId).toBeTruthy();
  });

  it('DeleteServiceSpecificCredential', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssc-delete' }));
    const { ServiceSpecificCredential } = await iam.send(
      new CreateServiceSpecificCredentialCommand({
        UserName: 'ssc-delete',
        ServiceName: 'codecommit.amazonaws.com',
      }),
    );
    await iam.send(
      new DeleteServiceSpecificCredentialCommand({
        UserName: 'ssc-delete',
        ServiceSpecificCredentialId: ServiceSpecificCredential?.ServiceSpecificCredentialId,
      }),
    );
    const res = await iam.send(
      new ListServiceSpecificCredentialsCommand({ UserName: 'ssc-delete' }),
    );
    expect(res.ServiceSpecificCredentials ?? []).toHaveLength(0);
  });

  it('DeleteSigningCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'sign-delete' }));
    const { Certificate } = await iam.send(
      new UploadSigningCertificateCommand({
        UserName: 'sign-delete',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
      }),
    );
    await iam.send(
      new DeleteSigningCertificateCommand({
        UserName: 'sign-delete',
        CertificateId: Certificate?.CertificateId,
      }),
    );
    const res = await iam.send(new ListSigningCertificatesCommand({ UserName: 'sign-delete' }));
    expect(res.Certificates).toEqual([]);
  });

  it('DeleteUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'doomed-user' }));
    await iam.send(new DeleteUserCommand({ UserName: 'doomed-user' }));
    await expect(iam.send(new GetUserCommand({ UserName: 'doomed-user' }))).rejects.toThrow();
  });

  it('DeleteUserPermissionsBoundary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'bounded-user' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'user-boundary',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutUserPermissionsBoundaryCommand({
        UserName: 'bounded-user',
        PermissionsBoundary: Policy?.Arn,
      }),
    );
    await iam.send(new DeleteUserPermissionsBoundaryCommand({ UserName: 'bounded-user' }));
    const res = await iam.send(new GetUserCommand({ UserName: 'bounded-user' }));
    expect(res.User?.PermissionsBoundary).toBeUndefined();
  });

  it('DeleteUserPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-inline-delete' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'user-inline-delete',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new DeleteUserPolicyCommand({ UserName: 'user-inline-delete', PolicyName: 'inline' }),
    );
    const res = await iam.send(new ListUserPoliciesCommand({ UserName: 'user-inline-delete' }));
    expect(res.PolicyNames).toEqual([]);
  });

  it.skip('DeleteVirtualMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'doomed-mfa' }),
    );
    await iam.send(
      new DeleteVirtualMFADeviceCommand({ SerialNumber: VirtualMFADevice?.SerialNumber }),
    );
  });

  it('DetachGroupPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-detach' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'group-detach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachGroupPolicyCommand({ GroupName: 'group-detach', PolicyArn: Policy?.Arn }),
    );
    await iam.send(
      new DetachGroupPolicyCommand({ GroupName: 'group-detach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedGroupPoliciesCommand({ GroupName: 'group-detach' }));
    expect(res.AttachedPolicies ?? []).toHaveLength(0);
  });

  it('DetachRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-detach',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'role-detach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachRolePolicyCommand({ RoleName: 'role-detach', PolicyArn: Policy?.Arn }),
    );
    await iam.send(
      new DetachRolePolicyCommand({ RoleName: 'role-detach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedRolePoliciesCommand({ RoleName: 'role-detach' }));
    expect(res.AttachedPolicies ?? []).toHaveLength(0);
  });

  it('DetachUserPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-detach' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'user-detach-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachUserPolicyCommand({ UserName: 'user-detach', PolicyArn: Policy?.Arn }),
    );
    await iam.send(
      new DetachUserPolicyCommand({ UserName: 'user-detach', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListAttachedUserPoliciesCommand({ UserName: 'user-detach' }));
    expect(res.AttachedPolicies ?? []).toHaveLength(0);
  });

  it.skip('DisableOrganizationsRootCredentialsManagement', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new DisableOrganizationsRootCredentialsManagementCommand({}));
    expect(res.EnabledFeatures).toBeDefined();
  });

  it.skip('DisableOrganizationsRootSessions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new DisableOrganizationsRootSessionsCommand({}));
    expect(res.EnabledFeatures).toBeDefined();
  });

  it('DisableOutboundWebIdentityFederation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new EnableOutboundWebIdentityFederationCommand({}));
    await iam.send(new DisableOutboundWebIdentityFederationCommand({}));
    await expect(iam.send(new GetOutboundWebIdentityFederationInfoCommand({}))).rejects.toThrow(
      /disabled/,
    );
  });

  it('EnableMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'mfa-user' }));
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-user' }),
    );
    const seed = Buffer.from(VirtualMFADevice?.Base32StringSeed ?? []).toString();
    expect(seed.length).toBeGreaterThan(0);
    await expect(
      iam.send(
        new EnableMFADeviceCommand({
          UserName: 'mfa-user',
          SerialNumber: VirtualMFADevice?.SerialNumber,
          AuthenticationCode1: '000000',
          AuthenticationCode2: '000000',
        }),
      ),
    ).rejects.toThrow(/authentication code/i);
  });

  it.skip('EnableOrganizationsRootCredentialsManagement', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new EnableOrganizationsRootCredentialsManagementCommand({}));
    expect(res.EnabledFeatures).toBeDefined();
  });

  it.skip('EnableOrganizationsRootSessions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new EnableOrganizationsRootSessionsCommand({}));
    expect(res.EnabledFeatures).toBeDefined();
  });

  it('EnableOutboundWebIdentityFederation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new EnableOutboundWebIdentityFederationCommand({}));
    expect(res.IssuerIdentifier).toBeTruthy();
  });

  it('GenerateCredentialReport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'reported' }));
    const res = await iam.send(new GenerateCredentialReportCommand({}));
    expect(res.State).toMatch(/STARTED|INPROGRESS|COMPLETE/);
  });

  it('GenerateOrganizationsAccessReport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await expect(
      iam.send(new GenerateOrganizationsAccessReportCommand({ EntityPath: 'o-a1b2c3d4e5/r-ab12' })),
    ).rejects.toThrow();
  });

  it('GenerateServiceLastAccessedDetails', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'accessed-user' }));
    const { JobId } = await iam.send(
      new GenerateServiceLastAccessedDetailsCommand({
        Arn: 'arn:aws:iam::000000000000:user/accessed-user',
      }),
    );
    expect(JobId).toBeTruthy();
  });

  it('GetAccessKeyLastUsed', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'last-used' }));
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'last-used' }));
    const res = await iam.send(
      new GetAccessKeyLastUsedCommand({ AccessKeyId: AccessKey?.AccessKeyId }),
    );
    expect(res.UserName).toBe('last-used');
  });

  it('GetAccountAuthorizationDetails', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'detail-user' }));
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'detail-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const res = await iam.send(
      new GetAccountAuthorizationDetailsCommand({ Filter: ['User', 'Role'] }),
    );
    expect(res.UserDetailList?.map((user) => user.UserName)).toContain('detail-user');
    expect(res.RoleDetailList?.map((role) => role.RoleName)).toContain('detail-role');
  });

  it('GetAccountPasswordPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UpdateAccountPasswordPolicyCommand({ MinimumPasswordLength: 14, RequireSymbols: true }),
    );
    const res = await iam.send(new GetAccountPasswordPolicyCommand({}));
    expect(res.PasswordPolicy?.MinimumPasswordLength).toBe(14);
    expect(res.PasswordPolicy?.RequireSymbols).toBe(true);
  });

  it('GetAccountProperties', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new GetAccountPropertiesCommand({}));
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it.skip('GetAccountSummary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'summary-user' }));
    const res = await iam.send(new GetAccountSummaryCommand({}));
    expect(res.SummaryMap?.Users).toBe(1);
  });

  it('GetContextKeysForCustomPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new GetContextKeysForCustomPolicyCommand({
        PolicyInputList: [
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: 's3:GetObject',
                Resource: '*',
                Condition: { StringEquals: { 'aws:PrincipalTag/team': 'core' } },
              },
            ],
          }),
        ],
      }),
    );
    expect(res.ContextKeyNames).toEqual(['aws:PrincipalTag/team']);
  });

  it('GetContextKeysForPrincipalPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'context-user' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'context-user',
        PolicyName: 'conditional',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: 's3:*',
              Resource: '*',
              Condition: { Bool: { 'aws:SecureTransport': 'true' } },
            },
          ],
        }),
      }),
    );
    const res = await iam.send(
      new GetContextKeysForPrincipalPolicyCommand({
        PolicySourceArn: 'arn:aws:iam::000000000000:user/context-user',
      }),
    );
    expect(res.ContextKeyNames).toEqual(['aws:SecureTransport']);
  });

  it('GetCredentialReport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'report-user' }));
    await iam.send(new GenerateCredentialReportCommand({}));
    await expect
      .poll(async () => (await iam.send(new GenerateCredentialReportCommand({}))).State, {
        timeout: 10_000,
      })
      .toBe('COMPLETE');
    const res = await iam.send(new GetCredentialReportCommand({}));
    expect(Buffer.from(res.Content ?? []).toString()).toContain('report-user');
  });

  it('GetDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    const res = await iam.send(new GetDelegationRequestCommand({ DelegationRequestId }));
    expect(res.DelegationRequest?.Description).toBe('temporary access');
  });

  it('GetGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'get-group' }));
    await iam.send(new CreateUserCommand({ UserName: 'member' }));
    await iam.send(new AddUserToGroupCommand({ GroupName: 'get-group', UserName: 'member' }));
    const res = await iam.send(new GetGroupCommand({ GroupName: 'get-group' }));
    expect(res.Group?.GroupName).toBe('get-group');
    expect(res.Users).toHaveLength(1);
  });

  it('GetGroupPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-inline-get' }));
    await iam.send(
      new PutGroupPolicyCommand({
        GroupName: 'group-inline-get',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new GetGroupPolicyCommand({ GroupName: 'group-inline-get', PolicyName: 'inline' }),
    );
    expect(JSON.parse(decodeURIComponent(res.PolicyDocument ?? '{}')).Statement[0].Action).toBe(
      's3:GetObject',
    );
  });

  it('GetHumanReadableSummary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    const res = await iam.send(
      new GetHumanReadableSummaryCommand({
        EntityArn: `arn:aws:iam::000000000000:delegation-request/${DelegationRequestId}`,
      }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('GetInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'get-profile' }));
    const res = await iam.send(
      new GetInstanceProfileCommand({ InstanceProfileName: 'get-profile' }),
    );
    expect(res.InstanceProfile?.InstanceProfileName).toBe('get-profile');
  });

  it('GetLoginProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'login-user' }));
    await iam.send(
      new CreateLoginProfileCommand({ UserName: 'login-user', Password: 'Initial-Passw0rd!' }),
    );
    const res = await iam.send(new GetLoginProfileCommand({ UserName: 'login-user' }));
    expect(res.LoginProfile?.CreateDate).toBeInstanceOf(Date);
  });

  it('GetMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'get-mfa' }),
    );
    await expect(
      iam.send(new GetMFADeviceCommand({ SerialNumber: VirtualMFADevice?.SerialNumber })),
    ).rejects.toThrow();
  });

  it('GetOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://get.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    const res = await iam.send(new GetOpenIDConnectProviderCommand({ OpenIDConnectProviderArn }));
    expect(res.Url).toBe('get.example.com');
    expect(res.ThumbprintList).toEqual(['0123456789abcdef0123456789abcdef01234567']);
  });

  it('GetOrganizationsAccessReport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await expect(
      iam.send(
        new GetOrganizationsAccessReportCommand({ JobId: '00000000-0000-0000-0000-000000000000' }),
      ),
    ).rejects.toThrow();
  });

  it('GetOutboundWebIdentityFederationInfo', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new EnableOutboundWebIdentityFederationCommand({}));
    const res = await iam.send(new GetOutboundWebIdentityFederationInfoCommand({}));
    expect(res.JwtVendingEnabled).toBe(true);
  });

  it('GetPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'get-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new GetPolicyCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Policy?.PolicyName).toBe('get-policy');
  });

  it('GetPolicyVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'get-version-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new GetPolicyVersionCommand({ PolicyArn: Policy?.Arn, VersionId: 'v1' }),
    );
    expect(
      JSON.parse(decodeURIComponent(res.PolicyVersion?.Document ?? '{}')).Statement[0].Action,
    ).toBe('s3:GetObject');
  });

  it('GetRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'get-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
        Description: 'described role',
      }),
    );
    const res = await iam.send(new GetRoleCommand({ RoleName: 'get-role' }));
    expect(res.Role?.Description).toBe('described role');
  });

  it('GetRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-inline-get',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'role-inline-get',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new GetRolePolicyCommand({ RoleName: 'role-inline-get', PolicyName: 'inline' }),
    );
    expect(JSON.parse(decodeURIComponent(res.PolicyDocument ?? '{}')).Statement[0].Action).toBe(
      's3:GetObject',
    );
  });

  it('GetRoleTemplateVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await expect(
      iam.send(
        new GetRoleTemplateVersionCommand({
          TemplateArn: 'arn:aws:iam::aws:role-template/ReadOnly',
        }),
      ),
    ).rejects.toThrow(/cannot be found/);
  });

  it('GetSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'get-idp',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    const res = await iam.send(new GetSAMLProviderCommand({ SAMLProviderArn }));
    expect(res.SAMLMetadataDocument).toContain('idp.example.com');
  });

  it('GetSSHPublicKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssh-get' }));
    const { SSHPublicKey } = await iam.send(
      new UploadSSHPublicKeyCommand({
        UserName: 'ssh-get',
        SSHPublicKeyBody:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMmVSOrBc0bJI4WK7UIFa8Sty1Ss+fhTuLEuA6Azw1f4ecG5lu27j49uXVpg6caXLVDNxpkP6Fu3+7awwJHD3Ign2+bDZ0XGvrVC8ib/V2z1wKRwCcxPKG3m0aUK+K53kvupwOEUJTt0hmVlt+VqsoU8sfKR/DvHTUhbFyn/QI+TMQZqLKc/w90RSo2+EKSYy/d4ycUUKdP+g9uIq24x+FLxWOiT3KY4whVhbisktCaedwn37/sP45PM9kDkL4a79Xv7SZ04YhJVDVt1+1DLQBYTxgVvGBRfwd7WquhjGtGXi39CbTRA779XxRG1CsLiXOW5EF4c/+/C+WLW60EbgX test',
      }),
    );
    const res = await iam.send(
      new GetSSHPublicKeyCommand({
        UserName: 'ssh-get',
        SSHPublicKeyId: SSHPublicKey?.SSHPublicKeyId,
        Encoding: 'SSH',
      }),
    );
    expect(res.SSHPublicKey?.SSHPublicKeyBody).toMatch(/^ssh-rsa /);
  });

  it('GetServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'get-cert',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    const res = await iam.send(
      new GetServerCertificateCommand({ ServerCertificateName: 'get-cert' }),
    );
    expect(res.ServerCertificate?.CertificateBody).toContain('BEGIN CERTIFICATE');
  });

  it('GetServiceLastAccessedDetails', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'details-user' }));
    const { JobId } = await iam.send(
      new GenerateServiceLastAccessedDetailsCommand({
        Arn: 'arn:aws:iam::000000000000:user/details-user',
      }),
    );
    const res = await iam.send(new GetServiceLastAccessedDetailsCommand({ JobId }));
    expect(res.JobStatus).toMatch(/IN_PROGRESS|COMPLETED/);
  });

  it('GetServiceLastAccessedDetailsWithEntities', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'entities-group' }));
    const { JobId } = await iam.send(
      new GenerateServiceLastAccessedDetailsCommand({
        Arn: 'arn:aws:iam::000000000000:group/entities-group',
      }),
    );
    const res = await iam.send(
      new GetServiceLastAccessedDetailsWithEntitiesCommand({ JobId, ServiceNamespace: 's3' }),
    );
    expect(res.JobStatus).toMatch(/IN_PROGRESS|COMPLETED/);
  });

  it('GetServiceLinkedRoleDeletionStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Role } = await iam.send(
      new CreateServiceLinkedRoleCommand({ AWSServiceName: 'elasticbeanstalk.amazonaws.com' }),
    );
    const { DeletionTaskId } = await iam.send(
      new DeleteServiceLinkedRoleCommand({ RoleName: Role?.RoleName }),
    );
    const res = await iam.send(new GetServiceLinkedRoleDeletionStatusCommand({ DeletionTaskId }));
    expect(res.Status).toMatch(/NOT_STARTED|IN_PROGRESS|SUCCEEDED/);
  });

  it('GetUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'get-user' }));
    const res = await iam.send(new GetUserCommand({ UserName: 'get-user' }));
    expect(res.User?.Arn).toBe('arn:aws:iam::000000000000:user/get-user');
  });

  it('GetUserPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-inline-get' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'user-inline-get',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new GetUserPolicyCommand({ UserName: 'user-inline-get', PolicyName: 'inline' }),
    );
    expect(JSON.parse(decodeURIComponent(res.PolicyDocument ?? '{}')).Statement[0].Action).toBe(
      's3:GetObject',
    );
  });

  it('ListAccessKeys', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'list-keys' }));
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'list-keys' }));
    const res = await iam.send(new ListAccessKeysCommand({ UserName: 'list-keys' }));
    expect(res.AccessKeyMetadata?.map((key) => key.AccessKeyId)).toEqual([AccessKey?.AccessKeyId]);
  });

  it('ListAccountAliases', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(new ListAccountAliasesCommand({}));
    expect(res.AccountAliases).toEqual([]);
  });

  it('ListAttachedGroupPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-list-attached' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'group-list-attached-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachGroupPolicyCommand({ GroupName: 'group-list-attached', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(
      new ListAttachedGroupPoliciesCommand({ GroupName: 'group-list-attached' }),
    );
    expect(res.AttachedPolicies?.[0]?.PolicyName).toBe('group-list-attached-policy');
  });

  it('ListAttachedRolePolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-list-attached',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'role-list-attached-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachRolePolicyCommand({ RoleName: 'role-list-attached', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(
      new ListAttachedRolePoliciesCommand({ RoleName: 'role-list-attached' }),
    );
    expect(res.AttachedPolicies?.[0]?.PolicyName).toBe('role-list-attached-policy');
  });

  it('ListAttachedUserPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-list-attached' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'user-list-attached-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachUserPolicyCommand({ UserName: 'user-list-attached', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(
      new ListAttachedUserPoliciesCommand({ UserName: 'user-list-attached' }),
    );
    expect(res.AttachedPolicies?.[0]?.PolicyName).toBe('user-list-attached-policy');
  });

  it.skip('ListDelegationRequests', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        OwnerAccountId: '000000000000',
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    await iam.send(new AssociateDelegationRequestCommand({ DelegationRequestId }));
    const { DelegationRequest } = await iam.send(
      new GetDelegationRequestCommand({ DelegationRequestId }),
    );
    const res = await iam.send(
      new ListDelegationRequestsCommand({ OwnerId: DelegationRequest?.OwnerId }),
    );
    expect(res.DelegationRequests?.map((request) => request.DelegationRequestId)).toEqual([
      DelegationRequestId,
    ]);
  });

  it('ListEntitiesForPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'entities-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(new CreateUserCommand({ UserName: 'entity-user' }));
    await iam.send(
      new AttachUserPolicyCommand({ UserName: 'entity-user', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(new ListEntitiesForPolicyCommand({ PolicyArn: Policy?.Arn }));
    expect(res.PolicyUsers?.map((user) => user.UserName)).toEqual(['entity-user']);
  });

  it('ListGroupPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-inline-list' }));
    await iam.send(
      new PutGroupPolicyCommand({
        GroupName: 'group-inline-list',
        PolicyName: 'a',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutGroupPolicyCommand({
        GroupName: 'group-inline-list',
        PolicyName: 'b',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListGroupPoliciesCommand({ GroupName: 'group-inline-list' }));
    expect(res.PolicyNames).toEqual(['a', 'b']);
  });

  it('ListGroups', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'list-a' }));
    await iam.send(new CreateGroupCommand({ GroupName: 'list-b' }));
    const res = await iam.send(new ListGroupsCommand({}));
    expect(res.Groups?.map((group) => group.GroupName)).toEqual(['list-a', 'list-b']);
  });

  it('ListGroupsForUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'grouped' }));
    await iam.send(new CreateGroupCommand({ GroupName: 'g1' }));
    await iam.send(new CreateGroupCommand({ GroupName: 'g2' }));
    await iam.send(new AddUserToGroupCommand({ GroupName: 'g1', UserName: 'grouped' }));
    await iam.send(new AddUserToGroupCommand({ GroupName: 'g2', UserName: 'grouped' }));
    const res = await iam.send(new ListGroupsForUserCommand({ UserName: 'grouped' }));
    expect(res.Groups?.map((group) => group.GroupName).sort()).toEqual(['g1', 'g2']);
  });

  it('ListInstanceProfileTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateInstanceProfileCommand({
        InstanceProfileName: 'instanceprofile-listtags',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(
      new ListInstanceProfileTagsCommand({ InstanceProfileName: 'instanceprofile-listtags' }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListInstanceProfiles', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'profile-a' }));
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'profile-b' }));
    const res = await iam.send(new ListInstanceProfilesCommand({}));
    expect(res.InstanceProfiles?.map((profile) => profile.InstanceProfileName)).toEqual([
      'profile-a',
      'profile-b',
    ]);
  });

  it('ListInstanceProfilesForRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'role-profile' }));
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'profiled-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new AddRoleToInstanceProfileCommand({
        InstanceProfileName: 'role-profile',
        RoleName: 'profiled-role',
      }),
    );
    const res = await iam.send(
      new ListInstanceProfilesForRoleCommand({ RoleName: 'profiled-role' }),
    );
    expect(res.InstanceProfiles?.map((profile) => profile.InstanceProfileName)).toEqual([
      'role-profile',
    ]);
  });

  it.skip('ListMFADeviceTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-tags' }),
    );
    const res = await iam.send(
      new ListMFADeviceTagsCommand({ SerialNumber: VirtualMFADevice?.SerialNumber }),
    );
    expect(res.Tags).toEqual([]);
  });

  it.skip('ListMFADevices', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'mfa-list' }));
    const res = await iam.send(new ListMFADevicesCommand({ UserName: 'mfa-list' }));
    expect(res.MFADevices).toEqual([]);
  });

  it('ListOpenIDConnectProviderTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://openidconnectprovider-listtags.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(
      new ListOpenIDConnectProviderTagsCommand({ OpenIDConnectProviderArn }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListOpenIDConnectProviders', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://listed.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    const res = await iam.send(new ListOpenIDConnectProvidersCommand({}));
    expect(res.OpenIDConnectProviderList?.map((provider) => provider.Arn)).toEqual([
      OpenIDConnectProviderArn,
    ]);
  });

  it('ListOrganizationsFeatures', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await expect(iam.send(new ListOrganizationsFeaturesCommand({}))).rejects.toThrow(
      /no organization/,
    );
  });

  it('ListPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'local-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListPoliciesCommand({ Scope: 'Local' }));
    expect(res.Policies?.map((policy) => policy.Arn)).toEqual([Policy?.Arn]);
  });

  it('ListPoliciesGrantingServiceAccess', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'granted-user' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 's3-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new AttachUserPolicyCommand({ UserName: 'granted-user', PolicyArn: Policy?.Arn }),
    );
    const res = await iam.send(
      new ListPoliciesGrantingServiceAccessCommand({
        Arn: 'arn:aws:iam::000000000000:user/granted-user',
        ServiceNamespaces: ['s3'],
      }),
    );
    expect(
      res.PoliciesGrantingServiceAccess?.[0]?.Policies?.map((policy) => policy.PolicyName),
    ).toEqual(['s3-policy']);
  });

  it('ListPolicyTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'policy-listtags',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(new ListPolicyTagsCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListPolicyVersions', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'list-version-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new CreatePolicyVersionCommand({
        PolicyArn: Policy?.Arn,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListPolicyVersionsCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Versions?.map((version) => version.VersionId).sort()).toEqual(['v1', 'v2']);
  });

  it('ListRolePolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-inline-list',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'role-inline-list',
        PolicyName: 'a',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'role-inline-list',
        PolicyName: 'b',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListRolePoliciesCommand({ RoleName: 'role-inline-list' }));
    expect(res.PolicyNames).toEqual(['a', 'b']);
  });

  it('ListRoleTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-listtags',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(new ListRoleTagsCommand({ RoleName: 'role-listtags' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListRoles', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-a',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-b',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const res = await iam.send(new ListRolesCommand({}));
    expect(res.Roles?.map((role) => role.RoleName)).toEqual(['role-a', 'role-b']);
  });

  it('ListSAMLProviderTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'samlprovider-listtags',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(new ListSAMLProviderTagsCommand({ SAMLProviderArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListSAMLProviders', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'listed-idp',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    const res = await iam.send(new ListSAMLProvidersCommand({}));
    expect(res.SAMLProviderList?.map((provider) => provider.Arn)).toEqual([SAMLProviderArn]);
  });

  it('ListSSHPublicKeys', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssh-list' }));
    const { SSHPublicKey } = await iam.send(
      new UploadSSHPublicKeyCommand({
        UserName: 'ssh-list',
        SSHPublicKeyBody:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMmVSOrBc0bJI4WK7UIFa8Sty1Ss+fhTuLEuA6Azw1f4ecG5lu27j49uXVpg6caXLVDNxpkP6Fu3+7awwJHD3Ign2+bDZ0XGvrVC8ib/V2z1wKRwCcxPKG3m0aUK+K53kvupwOEUJTt0hmVlt+VqsoU8sfKR/DvHTUhbFyn/QI+TMQZqLKc/w90RSo2+EKSYy/d4ycUUKdP+g9uIq24x+FLxWOiT3KY4whVhbisktCaedwn37/sP45PM9kDkL4a79Xv7SZ04YhJVDVt1+1DLQBYTxgVvGBRfwd7WquhjGtGXi39CbTRA779XxRG1CsLiXOW5EF4c/+/C+WLW60EbgX test',
      }),
    );
    const res = await iam.send(new ListSSHPublicKeysCommand({ UserName: 'ssh-list' }));
    expect(res.SSHPublicKeys?.map((key) => key.SSHPublicKeyId)).toEqual([
      SSHPublicKey?.SSHPublicKeyId,
    ]);
  });

  it('ListServerCertificateTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'servercertificate-listtags',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
        Tags: [{ Key: 'team', Value: 'core' }],
      }),
    );
    const res = await iam.send(
      new ListServerCertificateTagsCommand({ ServerCertificateName: 'servercertificate-listtags' }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListServerCertificates', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'listed-cert',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    const res = await iam.send(new ListServerCertificatesCommand({}));
    expect(res.ServerCertificateMetadataList?.map((cert) => cert.ServerCertificateName)).toEqual([
      'listed-cert',
    ]);
  });

  it('ListServiceSpecificCredentials', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssc-list' }));
    const { ServiceSpecificCredential } = await iam.send(
      new CreateServiceSpecificCredentialCommand({
        UserName: 'ssc-list',
        ServiceName: 'codecommit.amazonaws.com',
      }),
    );
    const res = await iam.send(new ListServiceSpecificCredentialsCommand({ UserName: 'ssc-list' }));
    expect(
      res.ServiceSpecificCredentials?.map((credential) => credential.ServiceSpecificCredentialId),
    ).toEqual([ServiceSpecificCredential?.ServiceSpecificCredentialId]);
  });

  it('ListSigningCertificates', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'sign-list' }));
    const { Certificate } = await iam.send(
      new UploadSigningCertificateCommand({
        UserName: 'sign-list',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
      }),
    );
    const res = await iam.send(new ListSigningCertificatesCommand({ UserName: 'sign-list' }));
    expect(res.Certificates?.map((cert) => cert.CertificateId)).toEqual([
      Certificate?.CertificateId,
    ]);
  });

  it('ListUserPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-inline-list' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'user-inline-list',
        PolicyName: 'a',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'user-inline-list',
        PolicyName: 'b',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListUserPoliciesCommand({ UserName: 'user-inline-list' }));
    expect(res.PolicyNames).toEqual(['a', 'b']);
  });

  it('ListUserTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateUserCommand({ UserName: 'user-listtags', Tags: [{ Key: 'team', Value: 'core' }] }),
    );
    const res = await iam.send(new ListUserTagsCommand({ UserName: 'user-listtags' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('ListUsers', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-a' }));
    await iam.send(new CreateUserCommand({ UserName: 'user-b' }));
    const res = await iam.send(new ListUsersCommand({}));
    expect(res.Users?.map((user) => user.UserName)).toEqual(['emulator', 'user-a', 'user-b']);
  });

  it('ListVirtualMFADevices', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'listed-mfa' }),
    );
    const res = await iam.send(
      new ListVirtualMFADevicesCommand({ AssignmentStatus: 'Unassigned' }),
    );
    expect(res.VirtualMFADevices?.map((device) => device.SerialNumber)).toEqual([
      VirtualMFADevice?.SerialNumber,
    ]);
  });

  it('PutAccountProperties', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new PutAccountPropertiesCommand({ Properties: { 'RoleManager/Enabled': 'true' } }),
    );
    expect(res.$metadata.httpStatusCode).toBe(200);
  });

  it('PutGroupPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'group-inline' }));
    await iam.send(
      new PutGroupPolicyCommand({
        GroupName: 'group-inline',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListGroupPoliciesCommand({ GroupName: 'group-inline' }));
    expect(res.PolicyNames).toEqual(['inline']);
  });

  it('PutRolePermissionsBoundary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'boundary-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'boundary-policy-role',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutRolePermissionsBoundaryCommand({
        RoleName: 'boundary-role',
        PermissionsBoundary: Policy?.Arn,
      }),
    );
    const res = await iam.send(new GetRoleCommand({ RoleName: 'boundary-role' }));
    expect(res.Role?.PermissionsBoundary?.PermissionsBoundaryArn).toBe(Policy?.Arn);
  });

  it('PutRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-inline',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new PutRolePolicyCommand({
        RoleName: 'role-inline',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListRolePoliciesCommand({ RoleName: 'role-inline' }));
    expect(res.PolicyNames).toEqual(['inline']);
  });

  it('PutUserPermissionsBoundary', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'boundary-user' }));
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'boundary-policy-user',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new PutUserPermissionsBoundaryCommand({
        UserName: 'boundary-user',
        PermissionsBoundary: Policy?.Arn,
      }),
    );
    const res = await iam.send(new GetUserCommand({ UserName: 'boundary-user' }));
    expect(res.User?.PermissionsBoundary?.PermissionsBoundaryArn).toBe(Policy?.Arn);
  });

  it('PutUserPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-inline' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'user-inline',
        PolicyName: 'inline',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(new ListUserPoliciesCommand({ UserName: 'user-inline' }));
    expect(res.PolicyNames).toEqual(['inline']);
  });

  it('RejectDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    await iam.send(new RejectDelegationRequestCommand({ DelegationRequestId, Notes: 'no thanks' }));
    const res = await iam.send(new GetDelegationRequestCommand({ DelegationRequestId }));
    expect(res.DelegationRequest?.State).toBe('REJECTED');
  });

  it('RemoveClientIDFromOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://remove-client.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    await iam.send(
      new RemoveClientIDFromOpenIDConnectProviderCommand({
        OpenIDConnectProviderArn,
        ClientID: 'my-client',
      }),
    );
    const res = await iam.send(new GetOpenIDConnectProviderCommand({ OpenIDConnectProviderArn }));
    expect(res.ClientIDList ?? []).toEqual([]);
  });

  it('RemoveRoleFromInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateInstanceProfileCommand({ InstanceProfileName: 'remove-profile' }));
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'removed-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new AddRoleToInstanceProfileCommand({
        InstanceProfileName: 'remove-profile',
        RoleName: 'removed-role',
      }),
    );
    await iam.send(
      new RemoveRoleFromInstanceProfileCommand({
        InstanceProfileName: 'remove-profile',
        RoleName: 'removed-role',
      }),
    );
    const res = await iam.send(
      new GetInstanceProfileCommand({ InstanceProfileName: 'remove-profile' }),
    );
    expect(res.InstanceProfile?.Roles).toEqual([]);
  });

  it('RemoveUserFromGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'leaver' }));
    await iam.send(new CreateGroupCommand({ GroupName: 'team' }));
    await iam.send(new AddUserToGroupCommand({ GroupName: 'team', UserName: 'leaver' }));
    await iam.send(new RemoveUserFromGroupCommand({ GroupName: 'team', UserName: 'leaver' }));
    const res = await iam.send(new GetGroupCommand({ GroupName: 'team' }));
    expect(res.Users).toEqual([]);
  });

  it('ResetServiceSpecificCredential', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssc-reset' }));
    const { ServiceSpecificCredential } = await iam.send(
      new CreateServiceSpecificCredentialCommand({
        UserName: 'ssc-reset',
        ServiceName: 'codecommit.amazonaws.com',
      }),
    );
    const res = await iam.send(
      new ResetServiceSpecificCredentialCommand({
        UserName: 'ssc-reset',
        ServiceSpecificCredentialId: ServiceSpecificCredential?.ServiceSpecificCredentialId,
      }),
    );
    expect(res.ServiceSpecificCredential?.ServicePassword).not.toBe(
      ServiceSpecificCredential?.ServicePassword,
    );
  });

  it.skip('ResyncMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'mfa-resync' }));
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-resync' }),
    );
    await iam.send(
      new ResyncMFADeviceCommand({
        UserName: 'mfa-resync',
        SerialNumber: VirtualMFADevice?.SerialNumber,
        AuthenticationCode1: '000000',
        AuthenticationCode2: '000000',
      }),
    );
  });

  it.skip('SendDelegationToken', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    await iam.send(new SendDelegationTokenCommand({ DelegationRequestId }));
  });

  it('SetDefaultPolicyVersion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'default-version-policy',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new CreatePolicyVersionCommand({
        PolicyArn: Policy?.Arn,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(new SetDefaultPolicyVersionCommand({ PolicyArn: Policy?.Arn, VersionId: 'v2' }));
    const res = await iam.send(new GetPolicyCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Policy?.DefaultVersionId).toBe('v2');
  });

  it.skip('SetSecurityTokenServicePreferences', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new SetSecurityTokenServicePreferencesCommand({ GlobalEndpointTokenVersion: 'v2Token' }),
    );
  });

  it('SimulateCustomPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const res = await iam.send(
      new SimulateCustomPolicyCommand({
        PolicyInputList: [
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
          }),
        ],
        ActionNames: ['s3:GetObject', 's3:PutObject'],
      }),
    );
    expect(
      res.EvaluationResults?.map((result) => [result.EvalActionName, result.EvalDecision]),
    ).toEqual([
      ['s3:GetObject', 'allowed'],
      ['s3:PutObject', 'implicitDeny'],
    ]);
  });

  it('SimulatePrincipalPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'simulated' }));
    await iam.send(
      new PutUserPolicyCommand({
        UserName: 'simulated',
        PolicyName: 'read',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    const res = await iam.send(
      new SimulatePrincipalPolicyCommand({
        PolicySourceArn: 'arn:aws:iam::000000000000:user/simulated',
        ActionNames: ['s3:GetObject', 's3:DeleteObject'],
      }),
    );
    expect(res.EvaluationResults?.map((result) => result.EvalDecision)).toEqual([
      'allowed',
      'implicitDeny',
    ]);
  });

  it('TagInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateInstanceProfileCommand({ InstanceProfileName: 'instanceprofile-tag' }),
    );
    await iam.send(
      new TagInstanceProfileCommand({
        InstanceProfileName: 'instanceprofile-tag',
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
    const res = await iam.send(
      new ListInstanceProfileTagsCommand({ InstanceProfileName: 'instanceprofile-tag' }),
    );
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it.skip('TagMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-tag' }),
    );
    await iam.send(
      new TagMFADeviceCommand({
        SerialNumber: VirtualMFADevice?.SerialNumber,
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
  });

  it('TagOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://openidconnectprovider-tag.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    await iam.send(
      new TagOpenIDConnectProviderCommand({
        OpenIDConnectProviderArn,
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
    const res = await iam.send(
      new ListOpenIDConnectProviderTagsCommand({ OpenIDConnectProviderArn }),
    );
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TagPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'policy-tag',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
      }),
    );
    await iam.send(
      new TagPolicyCommand({ PolicyArn: Policy?.Arn, Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await iam.send(new ListPolicyTagsCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TagRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-tag',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new TagRoleCommand({ RoleName: 'role-tag', Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await iam.send(new ListRoleTagsCommand({ RoleName: 'role-tag' }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TagSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'samlprovider-tag',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    await iam.send(
      new TagSAMLProviderCommand({ SAMLProviderArn, Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await iam.send(new ListSAMLProviderTagsCommand({ SAMLProviderArn }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TagServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'servercertificate-tag',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    await iam.send(
      new TagServerCertificateCommand({
        ServerCertificateName: 'servercertificate-tag',
        Tags: [{ Key: 'env', Value: 'test' }],
      }),
    );
    const res = await iam.send(
      new ListServerCertificateTagsCommand({ ServerCertificateName: 'servercertificate-tag' }),
    );
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('TagUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'user-tag' }));
    await iam.send(
      new TagUserCommand({ UserName: 'user-tag', Tags: [{ Key: 'env', Value: 'test' }] }),
    );
    const res = await iam.send(new ListUserTagsCommand({ UserName: 'user-tag' }));
    expect(res.Tags).toEqual([{ Key: 'env', Value: 'test' }]);
  });

  it('UntagInstanceProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateInstanceProfileCommand({
        InstanceProfileName: 'instanceprofile-untag',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(
      new UntagInstanceProfileCommand({
        InstanceProfileName: 'instanceprofile-untag',
        TagKeys: ['env'],
      }),
    );
    const res = await iam.send(
      new ListInstanceProfileTagsCommand({ InstanceProfileName: 'instanceprofile-untag' }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it.skip('UntagMFADevice', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { VirtualMFADevice } = await iam.send(
      new CreateVirtualMFADeviceCommand({ VirtualMFADeviceName: 'mfa-untag' }),
    );
    await iam.send(
      new UntagMFADeviceCommand({ SerialNumber: VirtualMFADevice?.SerialNumber, TagKeys: ['env'] }),
    );
  });

  it('UntagOpenIDConnectProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://openidconnectprovider-untag.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(
      new UntagOpenIDConnectProviderCommand({ OpenIDConnectProviderArn, TagKeys: ['env'] }),
    );
    const res = await iam.send(
      new ListOpenIDConnectProviderTagsCommand({ OpenIDConnectProviderArn }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UntagPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { Policy } = await iam.send(
      new CreatePolicyCommand({
        PolicyName: 'policy-untag',
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(new UntagPolicyCommand({ PolicyArn: Policy?.Arn, TagKeys: ['env'] }));
    const res = await iam.send(new ListPolicyTagsCommand({ PolicyArn: Policy?.Arn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UntagRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'role-untag',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(new UntagRoleCommand({ RoleName: 'role-untag', TagKeys: ['env'] }));
    const res = await iam.send(new ListRoleTagsCommand({ RoleName: 'role-untag' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UntagSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'samlprovider-untag',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(new UntagSAMLProviderCommand({ SAMLProviderArn, TagKeys: ['env'] }));
    const res = await iam.send(new ListSAMLProviderTagsCommand({ SAMLProviderArn }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UntagServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'servercertificate-untag',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(
      new UntagServerCertificateCommand({
        ServerCertificateName: 'servercertificate-untag',
        TagKeys: ['env'],
      }),
    );
    const res = await iam.send(
      new ListServerCertificateTagsCommand({ ServerCertificateName: 'servercertificate-untag' }),
    );
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UntagUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateUserCommand({
        UserName: 'user-untag',
        Tags: [
          { Key: 'env', Value: 'test' },
          { Key: 'team', Value: 'core' },
        ],
      }),
    );
    await iam.send(new UntagUserCommand({ UserName: 'user-untag', TagKeys: ['env'] }));
    const res = await iam.send(new ListUserTagsCommand({ UserName: 'user-untag' }));
    expect(res.Tags).toEqual([{ Key: 'team', Value: 'core' }]);
  });

  it('UpdateAccessKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'rotate-key' }));
    const { AccessKey } = await iam.send(new CreateAccessKeyCommand({ UserName: 'rotate-key' }));
    await iam.send(
      new UpdateAccessKeyCommand({
        UserName: 'rotate-key',
        AccessKeyId: AccessKey?.AccessKeyId,
        Status: 'Inactive',
      }),
    );
    const res = await iam.send(new ListAccessKeysCommand({ UserName: 'rotate-key' }));
    expect(res.AccessKeyMetadata?.[0]?.Status).toBe('Inactive');
  });

  it('UpdateAccountPasswordPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UpdateAccountPasswordPolicyCommand({
        MinimumPasswordLength: 16,
        RequireNumbers: true,
        MaxPasswordAge: 90,
      }),
    );
    const res = await iam.send(new GetAccountPasswordPolicyCommand({}));
    expect(res.PasswordPolicy?.MaxPasswordAge).toBe(90);
  });

  it('UpdateAssumeRolePolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'trust-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new UpdateAssumeRolePolicyCommand({
        RoleName: 'trust-role',
        PolicyDocument: JSON.stringify({
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
    const res = await iam.send(new GetRoleCommand({ RoleName: 'trust-role' }));
    expect(decodeURIComponent(res.Role?.AssumeRolePolicyDocument ?? '')).toContain(
      'lambda.amazonaws.com',
    );
  });

  it('UpdateDelegationRequest', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { DelegationRequestId } = await iam.send(
      new CreateDelegationRequestCommand({
        Description: 'temporary access',
        Permissions: { PolicyTemplateArn: 'arn:aws:iam::aws:delegation-template/S3ReadOnly' },
        RequestorWorkflowId: 'workflow-1',
        NotificationChannel: 'arn:aws:sns:us-east-1:000000000000:delegations',
        SessionDuration: 3600,
      }),
    );
    await iam.send(new UpdateDelegationRequestCommand({ DelegationRequestId, Notes: 'reviewed' }));
    const res = await iam.send(new GetDelegationRequestCommand({ DelegationRequestId }));
    expect(res.DelegationRequest?.Notes).toBe('reviewed');
  });

  it('UpdateGroup', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateGroupCommand({ GroupName: 'old-group' }));
    await iam.send(new UpdateGroupCommand({ GroupName: 'old-group', NewGroupName: 'new-group' }));
    const res = await iam.send(new GetGroupCommand({ GroupName: 'new-group' }));
    expect(res.Group?.GroupName).toBe('new-group');
  });

  it('UpdateLoginProfile', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'reset-user' }));
    await iam.send(
      new CreateLoginProfileCommand({ UserName: 'reset-user', Password: 'Initial-Passw0rd!' }),
    );
    await iam.send(
      new UpdateLoginProfileCommand({ UserName: 'reset-user', PasswordResetRequired: true }),
    );
    const res = await iam.send(new GetLoginProfileCommand({ UserName: 'reset-user' }));
    expect(res.LoginProfile?.PasswordResetRequired).toBe(true);
  });

  it('UpdateOpenIDConnectProviderThumbprint', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { OpenIDConnectProviderArn } = await iam.send(
      new CreateOpenIDConnectProviderCommand({
        Url: 'https://thumb.example.com',
        ClientIDList: ['my-client'],
        ThumbprintList: ['0123456789abcdef0123456789abcdef01234567'],
      }),
    );
    await iam.send(
      new UpdateOpenIDConnectProviderThumbprintCommand({
        OpenIDConnectProviderArn,
        ThumbprintList: ['ffffffffffffffffffffffffffffffffffffffff'],
      }),
    );
    const res = await iam.send(new GetOpenIDConnectProviderCommand({ OpenIDConnectProviderArn }));
    expect(res.ThumbprintList).toEqual(['ffffffffffffffffffffffffffffffffffffffff']);
  });

  it('UpdateRole', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'update-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    await iam.send(
      new UpdateRoleCommand({
        RoleName: 'update-role',
        Description: 'updated',
        MaxSessionDuration: 10800,
      }),
    );
    const res = await iam.send(new GetRoleCommand({ RoleName: 'update-role' }));
    expect(res.Role?.MaxSessionDuration).toBe(10800);
  });

  it('UpdateRoleDescription', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new CreateRoleCommand({
        RoleName: 'describe-role',
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            },
          ],
        }),
      }),
    );
    const res = await iam.send(
      new UpdateRoleDescriptionCommand({ RoleName: 'describe-role', Description: 'new words' }),
    );
    expect(res.Role?.Description).toBe('new words');
  });

  it('UpdateSAMLProvider', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    const { SAMLProviderArn } = await iam.send(
      new CreateSAMLProviderCommand({
        Name: 'update-idp',
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    const res = await iam.send(
      new UpdateSAMLProviderCommand({
        SAMLProviderArn,
        SAMLMetadataDocument:
          '<?xml version="1.0"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://idp.example.com/saml"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>MIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYxMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dChGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTHq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYDVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYCeLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAjz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEcALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3ePEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.com/sso"/></md:IDPSSODescriptor></md:EntityDescriptor>',
      }),
    );
    expect(res.SAMLProviderArn).toBe(SAMLProviderArn);
  });

  it.skip('UpdateSSHPublicKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssh-update' }));
    const { SSHPublicKey } = await iam.send(
      new UploadSSHPublicKeyCommand({
        UserName: 'ssh-update',
        SSHPublicKeyBody:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMmVSOrBc0bJI4WK7UIFa8Sty1Ss+fhTuLEuA6Azw1f4ecG5lu27j49uXVpg6caXLVDNxpkP6Fu3+7awwJHD3Ign2+bDZ0XGvrVC8ib/V2z1wKRwCcxPKG3m0aUK+K53kvupwOEUJTt0hmVlt+VqsoU8sfKR/DvHTUhbFyn/QI+TMQZqLKc/w90RSo2+EKSYy/d4ycUUKdP+g9uIq24x+FLxWOiT3KY4whVhbisktCaedwn37/sP45PM9kDkL4a79Xv7SZ04YhJVDVt1+1DLQBYTxgVvGBRfwd7WquhjGtGXi39CbTRA779XxRG1CsLiXOW5EF4c/+/C+WLW60EbgX test',
      }),
    );
    await iam.send(
      new UpdateSSHPublicKeyCommand({
        UserName: 'ssh-update',
        SSHPublicKeyId: SSHPublicKey?.SSHPublicKeyId,
        Status: 'Inactive',
      }),
    );
  });

  it('UpdateServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'old-cert',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    await iam.send(
      new UpdateServerCertificateCommand({
        ServerCertificateName: 'old-cert',
        NewServerCertificateName: 'new-cert',
      }),
    );
    const res = await iam.send(
      new GetServerCertificateCommand({ ServerCertificateName: 'new-cert' }),
    );
    expect(res.ServerCertificate?.ServerCertificateMetadata?.ServerCertificateName).toBe(
      'new-cert',
    );
  });

  it('UpdateServiceSpecificCredential', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssc-update' }));
    const { ServiceSpecificCredential } = await iam.send(
      new CreateServiceSpecificCredentialCommand({
        UserName: 'ssc-update',
        ServiceName: 'codecommit.amazonaws.com',
      }),
    );
    await iam.send(
      new UpdateServiceSpecificCredentialCommand({
        UserName: 'ssc-update',
        ServiceSpecificCredentialId: ServiceSpecificCredential?.ServiceSpecificCredentialId,
        Status: 'Inactive',
      }),
    );
    const res = await iam.send(
      new ListServiceSpecificCredentialsCommand({ UserName: 'ssc-update' }),
    );
    expect(res.ServiceSpecificCredentials?.[0]?.Status).toBe('Inactive');
  });

  it('UpdateSigningCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'sign-update' }));
    const { Certificate } = await iam.send(
      new UploadSigningCertificateCommand({
        UserName: 'sign-update',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
      }),
    );
    await iam.send(
      new UpdateSigningCertificateCommand({
        UserName: 'sign-update',
        CertificateId: Certificate?.CertificateId,
        Status: 'Inactive',
      }),
    );
    const res = await iam.send(new ListSigningCertificatesCommand({ UserName: 'sign-update' }));
    expect(res.Certificates?.[0]?.Status).toBe('Inactive');
  });

  it('UpdateUser', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'old-name' }));
    await iam.send(
      new UpdateUserCommand({
        UserName: 'old-name',
        NewUserName: 'new-name',
        NewPath: '/renamed/',
      }),
    );
    const res = await iam.send(new GetUserCommand({ UserName: 'new-name' }));
    expect(res.User?.Path).toBe('/renamed/');
  });

  it('UploadSSHPublicKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'ssh-upload' }));
    const { SSHPublicKey } = await iam.send(
      new UploadSSHPublicKeyCommand({
        UserName: 'ssh-upload',
        SSHPublicKeyBody:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMmVSOrBc0bJI4WK7UIFa8Sty1Ss+fhTuLEuA6Azw1f4ecG5lu27j49uXVpg6caXLVDNxpkP6Fu3+7awwJHD3Ign2+bDZ0XGvrVC8ib/V2z1wKRwCcxPKG3m0aUK+K53kvupwOEUJTt0hmVlt+VqsoU8sfKR/DvHTUhbFyn/QI+TMQZqLKc/w90RSo2+EKSYy/d4ycUUKdP+g9uIq24x+FLxWOiT3KY4whVhbisktCaedwn37/sP45PM9kDkL4a79Xv7SZ04YhJVDVt1+1DLQBYTxgVvGBRfwd7WquhjGtGXi39CbTRA779XxRG1CsLiXOW5EF4c/+/C+WLW60EbgX test',
      }),
    );
    expect(SSHPublicKey?.Fingerprint).toBeTruthy();
    expect(SSHPublicKey?.Status).toBe('Active');
  });

  it('UploadServerCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(
      new UploadServerCertificateCommand({
        ServerCertificateName: 'uploaded-cert',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
        PrivateKey:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoT2HddC9UTs3qOsUfdZSvD0nwDlNAyWrvOUsupCae+SBvdCq\ng4sXIIjtFM5/BLt7VMwWOkNpmNnnp6jCGqq3IHbZeZu+L+B+jU8Mtsk70o00uPk7\ncjhmMK68TsYz9p4LHgBTLVv7T01hPoNRI9V+mRAI4u0JBRQrhFP50KEYiqJDUmnq\n0/TmXeeM3UcGJvnZd66HhZ7s5F6Mj2nplLJ+r5OdSi7NbFjw80hBFMerssjAPmd/\n2vFUYH+2vdSaA59sE5JC2N+RG2DxLMJbgBI3n5fSRORIBglyxFMKNVPdtPXwdmw9\nRT/CIcPewyOnEsYXsxEjD1f19ItffhOU4twHiwIDAQABAoIBAEiCgwhYdsqw9rbg\nALcWSt6cIeQv4JIpvrGT3imIHfDZMf9Kd2PwiNX4vaU9t6FJLo1Tuis5ZaN3WtXq\n7l9PpkrTJ7mocD7XlhG2GuGYXW6yUaNdcX5MHqiF6+kA+R1OtXEodD9RvhJLmg+i\nvjp/KA9tRpHGRughyfAYU5+e0oqE9wxHy9GguoNUHmDAwdN25Ndu9BDHamKqZp7e\n1w8ynOtg0T4CZmueYgS8x7B7DHnhj2QORi46lgo7hm7r/qAngOZa6XrzAM7uGZ6a\naX7DTUasr3ihjzs736TUJmxhHHcgW4ClI5cbTB/YyTjkQmpUa/sQVwZGVxe9v+7S\ntxlZWwECgYEA1YDq8nguS0pgROr4Qlf5C7Vxh9KNu2CJgGBhp/xs0muy4whfhQfy\nH+hg8fj0BGIgeoFQzD4cbMm0lFZCtccyVhl8vPcScB3c1lRakGpKy7ZughYCHhjd\nQRM1wMSi6/9eiDsjfrLt7TtXNs7gFmDlCZggJY0kVWonsivU6MnAIb8CgYEAwVWJ\nUsCQ2rGPU7eqeAc2y2kemfgKSVT0YFMelJUhbtqNF2IpBmTqc1fol0NF68oA3Ffu\nli3rYdlZ3ESqO/cpQTfTyYOak8U9Jq/ta830WKUdKysfPxREsu/C2kCJ9AAcqmCG\nahrOm2eh8gP9j3TOy0K4r3vU3bVKu6p5RSYHtTUCgYAGTO2iBiXnluRMZFq7Knlw\n/QPCrFX+Z5TnMvDu0iYr932p8X9QH7HneyYRPfWFg5fNxa8qt9KC61jm37zMPHqh\ny9LAiNIEeP0hXg/mHxzh8hpEwH2DgdxVpUl6zNK6ACk7//LGNGWNEKk8NtKqFmXr\n6I9aTFX8J0vQmDaKQBnpZQKBgQCWtCR9WxoPP0WoTo0VTxpJaUGvZ4gtLYno5CH8\nVFthW/+LcLrl/xg6nRXzgz8n06jkGa8jZdwLxC+l4eiJIdsIuYnflTSTZ7aJR63c\n0QhdaSfZlJ2gwB3lFbxgANsIVmYB8YgVgZv3y8qTKsUmZDkmfHYWZILD6CO/Md2i\nJ0ju2QKBgEjhM7hkqhzxKy2UGPm/zx+C1oRCPYmjxOg8EjGlccGdWPoSaH2kwnvb\nPggVutlV2FtaDO0hhgKcRxogntJUH6h9bS1LjkYPniNL1pw0eRKA8jUjxeov1Ydu\n8YJ2vIK0U0HenFVT6Han8XHo5DOLGPZ88LjQRRlkpZbVWA64ys6b\n-----END RSA PRIVATE KEY-----',
      }),
    );
    const res = await iam.send(
      new GetServerCertificateCommand({ ServerCertificateName: 'uploaded-cert' }),
    );
    expect(res.ServerCertificate?.ServerCertificateMetadata?.Arn).toBe(
      'arn:aws:iam::000000000000:server-certificate/uploaded-cert',
    );
  });

  it('UploadSigningCertificate', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const iam = new IAMClient(aws.clientConfig());
    await iam.send(new CreateUserCommand({ UserName: 'sign-upload' }));
    const { Certificate } = await iam.send(
      new UploadSigningCertificateCommand({
        UserName: 'sign-upload',
        CertificateBody:
          '-----BEGIN CERTIFICATE-----\nMIIC7DCCAdSgAwIBAgIUY7oIyTgZiNl/tbw9ndh89Liw6ywwDQYJKoZIhvcNAQEL\nBQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wHhcNMjYxMTE0MTEzODA1WhcNMzYx\nMTExMTEzODA1WjAWMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAKE9h3XQvVE7N6jrFH3WUrw9J8A5TQMlq7zlLLqQ\nmnvkgb3QqoOLFyCI7RTOfwS7e1TMFjpDaZjZ56eowhqqtyB22Xmbvi/gfo1PDLbJ\nO9KNNLj5O3I4ZjCuvE7GM/aeCx4AUy1b+09NYT6DUSPVfpkQCOLtCQUUK4RT+dCh\nGIqiQ1Jp6tP05l3njN1HBib52Xeuh4We7ORejI9p6ZSyfq+TnUouzWxY8PNIQRTH\nq7LIwD5nf9rxVGB/tr3UmgOfbBOSQtjfkRtg8SzCW4ASN5+X0kTkSAYJcsRTCjVT\n3bT18HZsPUU/wiHD3sMjpxLGF7MRIw9X9fSLX34TlOLcB4sCAwEAAaMyMDAwHQYD\nVR0OBBYEFEwn2ip4pmk+SivhvpdmRZGE97WbMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQELBQADggEBAHNLRN7g79YVjZGhbmoZWChf36BmZnIn85kRcgdl0dYC\neLtjlGRmejpgjsmBG9Rmy/IrLfTry7PVisAVzJQJBzYUuoaK5VwESJmOG/sO1NAj\nz+bLF+CvKORHS+AoKXnqsg18wC17/EXfJr0SfySGdaaZ15t89N4TOrKTqvl5aWEc\nALlpjirq0/r/3ywKxlQKza3yiRrnCxk3yIvouha0UH+SaN3raCE5YWub9flbOj3e\nPEv7r/cU0BCfEQqLa0JEaJC67ON5tdeATjsZ7ZN5Ui/PymxxfL2V2cwBgdrupAuF\n1OnlaK0Ubu5lOXTLIzS45bic26PkXzXa/5V1G2BfEvk=\n-----END CERTIFICATE-----',
      }),
    );
    expect(Certificate?.Status).toBe('Active');
    expect(Certificate?.CertificateBody).toContain('BEGIN CERTIFICATE');
  });
});
