import { Buffer } from 'node:buffer';
import {
  constants,
  createPublicKey,
  createVerify,
  generateKeyPairSync,
  publicEncrypt,
  randomBytes,
} from 'node:crypto';
import {
  CancelKeyDeletionCommand,
  ConnectCustomKeyStoreCommand,
  CreateAliasCommand,
  CreateCustomKeyStoreCommand,
  CreateGrantCommand,
  CreateKeyCommand,
  DecryptCommand,
  DeleteAliasCommand,
  DeleteCustomKeyStoreCommand,
  DeleteImportedKeyMaterialCommand,
  DeriveSharedSecretCommand,
  DescribeCustomKeyStoresCommand,
  DescribeKeyCommand,
  DisableKeyCommand,
  DisableKeyRotationCommand,
  DisconnectCustomKeyStoreCommand,
  EnableKeyCommand,
  EnableKeyRotationCommand,
  EncryptCommand,
  GenerateDataKeyCommand,
  GenerateDataKeyPairCommand,
  GenerateDataKeyPairWithoutPlaintextCommand,
  GenerateDataKeyWithoutPlaintextCommand,
  GenerateMacCommand,
  GenerateRandomCommand,
  GetKeyLastUsageCommand,
  GetKeyPolicyCommand,
  GetKeyRotationStatusCommand,
  GetParametersForImportCommand,
  GetPublicKeyCommand,
  ImportKeyMaterialCommand,
  KMSClient,
  ListAliasesCommand,
  ListGrantsCommand,
  ListKeyPoliciesCommand,
  ListKeyRotationsCommand,
  ListKeysCommand,
  ListResourceTagsCommand,
  ListRetirableGrantsCommand,
  PutKeyPolicyCommand,
  ReEncryptCommand,
  ReplicateKeyCommand,
  RetireGrantCommand,
  RevokeGrantCommand,
  RotateKeyOnDemandCommand,
  ScheduleKeyDeletionCommand,
  SignCommand,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateAliasCommand,
  UpdateCustomKeyStoreCommand,
  UpdateKeyDescriptionCommand,
  UpdatePrimaryRegionCommand,
  VerifyCommand,
  VerifyMacCommand,
} from '@aws-sdk/client-kms';
import { describe, expect, it } from 'vitest';
import { AwsEmulator } from '../../lib/index.js';

describe('kms', () => {
  it('CancelKeyDeletion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new ScheduleKeyDeletionCommand({ KeyId: KeyMetadata?.KeyId, PendingWindowInDays: 7 }),
    );
    await kms.send(new CancelKeyDeletionCommand({ KeyId: KeyMetadata?.KeyId }));
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.KeyState).toBe('Disabled');
  });

  it.skip('ConnectCustomKeyStore', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'connect-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    await expect(
      kms.send(new ConnectCustomKeyStoreCommand({ CustomKeyStoreId })),
    ).resolves.toBeDefined();
  });

  it('CreateAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateAliasCommand({ AliasName: 'alias/app', TargetKeyId: KeyMetadata?.KeyId }),
    );
    const res = await kms.send(new DescribeKeyCommand({ KeyId: 'alias/app' }));
    expect(res.KeyMetadata?.KeyId).toBe(KeyMetadata?.KeyId);
  });

  it.skip('CreateCustomKeyStore', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'created-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    expect(CustomKeyStoreId).toBeTruthy();
  });

  it('CreateGrant', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new CreateGrantCommand({
        KeyId: KeyMetadata?.KeyId,
        GranteePrincipal: 'arn:aws:iam::000000000000:role/grantee',
        Operations: ['Encrypt', 'Decrypt'],
      }),
    );
    expect(res.GrantId).toBeTruthy();
    expect(res.GrantToken).toBeTruthy();
  });

  it('CreateKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const res = await kms.send(
      new CreateKeyCommand({
        Description: 'app key',
        KeyUsage: 'ENCRYPT_DECRYPT',
        KeySpec: 'SYMMETRIC_DEFAULT',
      }),
    );
    expect(res.KeyMetadata?.Arn).toContain(':key/');
    expect(res.KeyMetadata?.Description).toBe('app key');
    expect(res.KeyMetadata?.KeyState).toBe('Enabled');
  });

  it('Decrypt', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const { CiphertextBlob } = await kms.send(
      new EncryptCommand({ KeyId: KeyMetadata?.KeyId, Plaintext: Buffer.from('secret data') }),
    );
    const res = await kms.send(new DecryptCommand({ CiphertextBlob }));
    expect(Buffer.from(res.Plaintext ?? []).toString()).toBe('secret data');
    expect(res.KeyId).toBe(KeyMetadata?.Arn);
  });

  it('DeleteAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateAliasCommand({ AliasName: 'alias/doomed', TargetKeyId: KeyMetadata?.KeyId }),
    );
    await kms.send(new DeleteAliasCommand({ AliasName: 'alias/doomed' }));
    await expect(kms.send(new DescribeKeyCommand({ KeyId: 'alias/doomed' }))).rejects.toThrow();
  });

  it.skip('DeleteCustomKeyStore', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'doomed-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    await kms.send(new DeleteCustomKeyStoreCommand({ CustomKeyStoreId }));
    const res = await kms.send(new DescribeCustomKeyStoresCommand({}));
    expect(res.CustomKeyStores ?? []).toHaveLength(0);
  });

  it('DeleteImportedKeyMaterial', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ Origin: 'EXTERNAL' }));
    const params = await kms.send(
      new GetParametersForImportCommand({
        KeyId: KeyMetadata?.KeyId,
        WrappingAlgorithm: 'RSAES_OAEP_SHA_256',
        WrappingKeySpec: 'RSA_2048',
      }),
    );
    const wrapped = publicEncrypt(
      {
        key: createPublicKey({
          key: Buffer.from(params.PublicKey ?? []),
          format: 'der',
          type: 'spki',
        }),
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      randomBytes(32),
    );
    await kms.send(
      new ImportKeyMaterialCommand({
        KeyId: KeyMetadata?.KeyId,
        ImportToken: params.ImportToken,
        EncryptedKeyMaterial: wrapped,
        ExpirationModel: 'KEY_MATERIAL_DOES_NOT_EXPIRE',
      }),
    );
    await kms.send(new DeleteImportedKeyMaterialCommand({ KeyId: KeyMetadata?.KeyId }));
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.KeyState).toBe('PendingImport');
  });

  it.skip('DeriveSharedSecret', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'ECC_NIST_P256', KeyUsage: 'KEY_AGREEMENT' }),
    );
    const peer = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const res = await kms.send(
      new DeriveSharedSecretCommand({
        KeyId: KeyMetadata?.KeyId,
        KeyAgreementAlgorithm: 'ECDH',
        PublicKey: peer.publicKey.export({ format: 'der', type: 'spki' }),
      }),
    );
    expect(res.SharedSecret?.length).toBe(32);
  });

  it.skip('DescribeCustomKeyStores', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'described-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    const res = await kms.send(new DescribeCustomKeyStoresCommand({ CustomKeyStoreId }));
    expect(res.CustomKeyStores?.[0]?.CustomKeyStoreName).toBe('described-store');
  });

  it('DescribeKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ Description: 'described' }));
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.Arn }));
    expect(res.KeyMetadata?.Description).toBe('described');
    expect(res.KeyMetadata?.KeyManager).toBe('CUSTOMER');
  });

  it('DisableKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(new DisableKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.Enabled).toBe(false);
    await expect(
      kms.send(new EncryptCommand({ KeyId: KeyMetadata?.KeyId, Plaintext: Buffer.from('x') })),
    ).rejects.toThrow();
  });

  it('DisableKeyRotation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(new EnableKeyRotationCommand({ KeyId: KeyMetadata?.KeyId }));
    await kms.send(new DisableKeyRotationCommand({ KeyId: KeyMetadata?.KeyId }));
    const res = await kms.send(new GetKeyRotationStatusCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyRotationEnabled).toBe(false);
  });

  it.skip('DisconnectCustomKeyStore', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'disconnect-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    await kms.send(new ConnectCustomKeyStoreCommand({ CustomKeyStoreId }));
    await kms.send(new DisconnectCustomKeyStoreCommand({ CustomKeyStoreId }));
    const res = await kms.send(new DescribeCustomKeyStoresCommand({ CustomKeyStoreId }));
    expect(res.CustomKeyStores?.[0]?.ConnectionState).toBe('DISCONNECTED');
  });

  it('EnableKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(new DisableKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    await kms.send(new EnableKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.Enabled).toBe(true);
  });

  it('EnableKeyRotation', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new EnableKeyRotationCommand({ KeyId: KeyMetadata?.KeyId, RotationPeriodInDays: 180 }),
    );
    const res = await kms.send(new GetKeyRotationStatusCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyRotationEnabled).toBe(true);
    expect(res.RotationPeriodInDays).toBe(180);
  });

  it('Encrypt', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new EncryptCommand({
        KeyId: KeyMetadata?.KeyId,
        Plaintext: Buffer.from('hello'),
        EncryptionContext: { purpose: 'test' },
      }),
    );
    expect(res.CiphertextBlob?.length).toBeGreaterThan(5);
    expect(res.EncryptionAlgorithm).toBe('SYMMETRIC_DEFAULT');
    await expect(
      kms.send(new DecryptCommand({ CiphertextBlob: res.CiphertextBlob })),
    ).rejects.toThrow();
  });

  it('GenerateDataKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new GenerateDataKeyCommand({ KeyId: KeyMetadata?.KeyId, KeySpec: 'AES_256' }),
    );
    expect(res.Plaintext).toHaveLength(32);
    const decrypted = await kms.send(new DecryptCommand({ CiphertextBlob: res.CiphertextBlob }));
    expect(Buffer.from(decrypted.Plaintext ?? []).equals(Buffer.from(res.Plaintext ?? []))).toBe(
      true,
    );
  });

  it('GenerateDataKeyPair', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new GenerateDataKeyPairCommand({ KeyId: KeyMetadata?.KeyId, KeyPairSpec: 'ECC_NIST_P256' }),
    );
    expect(res.PublicKey?.length).toBeGreaterThan(0);
    expect(res.PrivateKeyPlaintext?.length).toBeGreaterThan(0);
    expect(res.PrivateKeyCiphertextBlob?.length).toBeGreaterThan(0);
  });

  it('GenerateDataKeyPairWithoutPlaintext', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new GenerateDataKeyPairWithoutPlaintextCommand({
        KeyId: KeyMetadata?.KeyId,
        KeyPairSpec: 'RSA_2048',
      }),
    );
    expect(res.PublicKey?.length).toBeGreaterThan(0);
    expect(res.PrivateKeyCiphertextBlob?.length).toBeGreaterThan(0);
  });

  it('GenerateDataKeyWithoutPlaintext', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new GenerateDataKeyWithoutPlaintextCommand({ KeyId: KeyMetadata?.KeyId, NumberOfBytes: 16 }),
    );
    const decrypted = await kms.send(new DecryptCommand({ CiphertextBlob: res.CiphertextBlob }));
    expect(decrypted.Plaintext).toHaveLength(16);
  });

  it('GenerateMac', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'HMAC_256', KeyUsage: 'GENERATE_VERIFY_MAC' }),
    );
    const res = await kms.send(
      new GenerateMacCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('message'),
        MacAlgorithm: 'HMAC_SHA_256',
      }),
    );
    expect(res.Mac).toHaveLength(32);
  });

  it('GenerateRandom', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const res = await kms.send(new GenerateRandomCommand({ NumberOfBytes: 64 }));
    expect(res.Plaintext).toHaveLength(64);
  });

  it('GetKeyLastUsage', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(new EncryptCommand({ KeyId: KeyMetadata?.KeyId, Plaintext: Buffer.from('x') }));
    const res = await kms.send(new GetKeyLastUsageCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyId).toBe(KeyMetadata?.KeyId);
    expect(res.KeyCreationDate).toBeInstanceOf(Date);
  });

  it('GetKeyPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(new GetKeyPolicyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(JSON.parse(res.Policy ?? '{}').Statement.length).toBeGreaterThan(0);
    expect(res.PolicyName).toBe('default');
  });

  it('GetKeyRotationStatus', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(new GetKeyRotationStatusCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyRotationEnabled).toBe(false);
  });

  it('GetParametersForImport', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ Origin: 'EXTERNAL' }));
    const res = await kms.send(
      new GetParametersForImportCommand({
        KeyId: KeyMetadata?.KeyId,
        WrappingAlgorithm: 'RSAES_OAEP_SHA_256',
        WrappingKeySpec: 'RSA_2048',
      }),
    );
    expect(res.ImportToken?.length).toBeGreaterThan(0);
    expect(res.PublicKey?.length).toBeGreaterThan(0);
  });

  it('GetPublicKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'RSA_2048', KeyUsage: 'SIGN_VERIFY' }),
    );
    const res = await kms.send(new GetPublicKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    const key = createPublicKey({
      key: Buffer.from(res.PublicKey ?? []),
      format: 'der',
      type: 'spki',
    });
    expect(key.asymmetricKeyType).toBe('rsa');
    expect(res.SigningAlgorithms).toContain('RSASSA_PSS_SHA_256');
  });

  it('ImportKeyMaterial', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ Origin: 'EXTERNAL' }));
    const params = await kms.send(
      new GetParametersForImportCommand({
        KeyId: KeyMetadata?.KeyId,
        WrappingAlgorithm: 'RSAES_OAEP_SHA_256',
        WrappingKeySpec: 'RSA_2048',
      }),
    );
    const wrapped = publicEncrypt(
      {
        key: createPublicKey({
          key: Buffer.from(params.PublicKey ?? []),
          format: 'der',
          type: 'spki',
        }),
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      randomBytes(32),
    );
    await kms.send(
      new ImportKeyMaterialCommand({
        KeyId: KeyMetadata?.KeyId,
        ImportToken: params.ImportToken,
        EncryptedKeyMaterial: wrapped,
        ExpirationModel: 'KEY_MATERIAL_DOES_NOT_EXPIRE',
      }),
    );
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.KeyState).toBe('Enabled');
  });

  it('ListAliases', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateAliasCommand({ AliasName: 'alias/listed', TargetKeyId: KeyMetadata?.KeyId }),
    );
    const res = await kms.send(new ListAliasesCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Aliases?.map((alias) => alias.AliasName)).toEqual(['alias/listed']);
  });

  it('ListGrants', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateGrantCommand({
        KeyId: KeyMetadata?.KeyId,
        GranteePrincipal: 'arn:aws:iam::000000000000:role/grantee',
        Operations: ['Decrypt'],
        Name: 'listed-grant',
      }),
    );
    const res = await kms.send(new ListGrantsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Grants?.map((grant) => grant.Name)).toEqual(['listed-grant']);
  });

  it('ListKeyPolicies', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(new ListKeyPoliciesCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.PolicyNames).toEqual(['default']);
  });

  it('ListKeyRotations', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(new RotateKeyOnDemandCommand({ KeyId: KeyMetadata?.KeyId }));
    await expect
      .poll(
        async () =>
          (await kms.send(new ListKeyRotationsCommand({ KeyId: KeyMetadata?.KeyId }))).Rotations ??
          [],
        { timeout: 10_000 },
      )
      .toHaveLength(1);
    const res = await kms.send(new ListKeyRotationsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Rotations?.[0]?.RotationType).toBe('ON_DEMAND');
  });

  it('ListKeys', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    await kms.send(new CreateKeyCommand({}));
    await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(new ListKeysCommand({}));
    expect(res.Keys).toHaveLength(2);
  });

  it('ListResourceTags', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ Tags: [{ TagKey: 'team', TagValue: 'core' }] }),
    );
    const res = await kms.send(new ListResourceTagsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Tags).toEqual([{ TagKey: 'team', TagValue: 'core' }]);
  });

  it('ListRetirableGrants', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateGrantCommand({
        KeyId: KeyMetadata?.KeyId,
        GranteePrincipal: 'arn:aws:iam::000000000000:role/grantee',
        RetiringPrincipal: 'arn:aws:iam::000000000000:role/retirer',
        Operations: ['Decrypt'],
      }),
    );
    const res = await kms.send(
      new ListRetirableGrantsCommand({
        RetiringPrincipal: 'arn:aws:iam::000000000000:role/retirer',
      }),
    );
    expect(res.Grants).toHaveLength(1);
  });

  it('PutKeyPolicy', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const policy = await kms.send(new GetKeyPolicyCommand({ KeyId: KeyMetadata?.KeyId }));
    const document = JSON.parse(policy.Policy ?? '{}');
    document.Statement.push({
      Sid: 'allow-reader',
      Effect: 'Allow',
      Principal: { AWS: 'arn:aws:iam::000000000000:root' },
      Action: 'kms:Decrypt',
      Resource: '*',
    });
    await kms.send(
      new PutKeyPolicyCommand({ KeyId: KeyMetadata?.KeyId, Policy: JSON.stringify(document) }),
    );
    const res = await kms.send(new GetKeyPolicyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Policy).toContain('allow-reader');
  });

  it('ReEncrypt', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const source = await kms.send(new CreateKeyCommand({}));
    const destination = await kms.send(new CreateKeyCommand({}));
    const { CiphertextBlob } = await kms.send(
      new EncryptCommand({ KeyId: source.KeyMetadata?.KeyId, Plaintext: Buffer.from('move me') }),
    );
    const res = await kms.send(
      new ReEncryptCommand({ CiphertextBlob, DestinationKeyId: destination.KeyMetadata?.KeyId }),
    );
    expect(res.KeyId).toBe(destination.KeyMetadata?.Arn);
    const decrypted = await kms.send(new DecryptCommand({ CiphertextBlob: res.CiphertextBlob }));
    expect(Buffer.from(decrypted.Plaintext ?? []).toString()).toBe('move me');
  });

  it('ReplicateKey', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ MultiRegion: true }));
    const res = await kms.send(
      new ReplicateKeyCommand({ KeyId: KeyMetadata?.KeyId, ReplicaRegion: 'us-west-2' }),
    );
    expect(res.ReplicaKeyMetadata?.Arn).toContain(':us-west-2:');
    expect(res.ReplicaKeyMetadata?.MultiRegionConfiguration?.MultiRegionKeyType).toBe('REPLICA');
  });

  it('RetireGrant', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const { GrantToken } = await kms.send(
      new CreateGrantCommand({
        KeyId: KeyMetadata?.KeyId,
        GranteePrincipal: 'arn:aws:iam::000000000000:role/grantee',
        RetiringPrincipal: 'arn:aws:iam::000000000000:root',
        Operations: ['Decrypt'],
      }),
    );
    await kms.send(new RetireGrantCommand({ GrantToken }));
    const res = await kms.send(new ListGrantsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Grants ?? []).toHaveLength(0);
  });

  it('RevokeGrant', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const { GrantId } = await kms.send(
      new CreateGrantCommand({
        KeyId: KeyMetadata?.KeyId,
        GranteePrincipal: 'arn:aws:iam::000000000000:role/grantee',
        Operations: ['Decrypt'],
      }),
    );
    await kms.send(new RevokeGrantCommand({ KeyId: KeyMetadata?.KeyId, GrantId }));
    const res = await kms.send(new ListGrantsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Grants ?? []).toHaveLength(0);
  });

  it('RotateKeyOnDemand', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(new RotateKeyOnDemandCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyId).toBe(KeyMetadata?.Arn);
  });

  it('ScheduleKeyDeletion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    const res = await kms.send(
      new ScheduleKeyDeletionCommand({ KeyId: KeyMetadata?.KeyId, PendingWindowInDays: 7 }),
    );
    expect(res.KeyState).toBe('PendingDeletion');
    expect(res.DeletionDate).toBeInstanceOf(Date);
  });

  it('Sign', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'ECC_NIST_P256', KeyUsage: 'SIGN_VERIFY' }),
    );
    const res = await kms.send(
      new SignCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('document'),
        SigningAlgorithm: 'ECDSA_SHA_256',
      }),
    );
    const publicKey = await kms.send(new GetPublicKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    const valid = createVerify('sha256')
      .update('document')
      .verify(
        createPublicKey({
          key: Buffer.from(publicKey.PublicKey ?? []),
          format: 'der',
          type: 'spki',
        }),
        Buffer.from(res.Signature ?? []),
      );
    expect(valid).toBe(true);
  });

  it('TagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new TagResourceCommand({
        KeyId: KeyMetadata?.KeyId,
        Tags: [{ TagKey: 'env', TagValue: 'test' }],
      }),
    );
    const res = await kms.send(new ListResourceTagsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Tags).toEqual([{ TagKey: 'env', TagValue: 'test' }]);
  });

  it('UntagResource', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({
        Tags: [
          { TagKey: 'env', TagValue: 'test' },
          { TagKey: 'team', TagValue: 'core' },
        ],
      }),
    );
    await kms.send(new UntagResourceCommand({ KeyId: KeyMetadata?.KeyId, TagKeys: ['env'] }));
    const res = await kms.send(new ListResourceTagsCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.Tags).toEqual([{ TagKey: 'team', TagValue: 'core' }]);
  });

  it('UpdateAlias', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const first = await kms.send(new CreateKeyCommand({}));
    const second = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new CreateAliasCommand({ AliasName: 'alias/moving', TargetKeyId: first.KeyMetadata?.KeyId }),
    );
    await kms.send(
      new UpdateAliasCommand({ AliasName: 'alias/moving', TargetKeyId: second.KeyMetadata?.KeyId }),
    );
    const res = await kms.send(new DescribeKeyCommand({ KeyId: 'alias/moving' }));
    expect(res.KeyMetadata?.KeyId).toBe(second.KeyMetadata?.KeyId);
  });

  it.skip('UpdateCustomKeyStore', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { CustomKeyStoreId } = await kms.send(
      new CreateCustomKeyStoreCommand({
        CustomKeyStoreName: 'update-store',
        CustomKeyStoreType: 'EXTERNAL_KEY_STORE',
        XksProxyConnectivity: 'PUBLIC_ENDPOINT',
        XksProxyUriEndpoint: 'https://xks.example.com',
        XksProxyUriPath: '/kms/xks/v1',
        XksProxyAuthenticationCredential: {
          AccessKeyId: 'ABCDEFGHIJKLMNOPQRST',
          RawSecretAccessKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
        },
      }),
    );
    await kms.send(
      new UpdateCustomKeyStoreCommand({ CustomKeyStoreId, NewCustomKeyStoreName: 'renamed-store' }),
    );
    const res = await kms.send(new DescribeCustomKeyStoresCommand({ CustomKeyStoreId }));
    expect(res.CustomKeyStores?.[0]?.CustomKeyStoreName).toBe('renamed-store');
  });

  it('UpdateKeyDescription', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({}));
    await kms.send(
      new UpdateKeyDescriptionCommand({ KeyId: KeyMetadata?.KeyId, Description: 'renamed' }),
    );
    const res = await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }));
    expect(res.KeyMetadata?.Description).toBe('renamed');
  });

  it('UpdatePrimaryRegion', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(new CreateKeyCommand({ MultiRegion: true }));
    await kms.send(
      new ReplicateKeyCommand({ KeyId: KeyMetadata?.KeyId, ReplicaRegion: 'us-west-2' }),
    );
    const replica = new KMSClient({ ...aws.clientConfig(), region: 'us-west-2' });
    await expect
      .poll(
        async () =>
          (await replica.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }))).KeyMetadata
            ?.KeyState,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('Enabled');
    await kms.send(
      new UpdatePrimaryRegionCommand({ KeyId: KeyMetadata?.KeyId, PrimaryRegion: 'us-west-2' }),
    );
    await expect
      .poll(
        async () =>
          (await kms.send(new DescribeKeyCommand({ KeyId: KeyMetadata?.KeyId }))).KeyMetadata
            ?.MultiRegionConfiguration?.PrimaryKey?.Region,
        { timeout: 30_000, interval: 500 },
      )
      .toBe('us-west-2');
  });

  it('Verify', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'RSA_2048', KeyUsage: 'SIGN_VERIFY' }),
    );
    const { Signature } = await kms.send(
      new SignCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('document'),
        SigningAlgorithm: 'RSASSA_PSS_SHA_256',
      }),
    );
    const res = await kms.send(
      new VerifyCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('document'),
        Signature,
        SigningAlgorithm: 'RSASSA_PSS_SHA_256',
      }),
    );
    expect(res.SignatureValid).toBe(true);
  });

  it('VerifyMac', async () => {
    await using aws = new AwsEmulator({ telemetry: false, closeTimeout: 5_000 });
    const kms = new KMSClient(aws.clientConfig());
    const { KeyMetadata } = await kms.send(
      new CreateKeyCommand({ KeySpec: 'HMAC_256', KeyUsage: 'GENERATE_VERIFY_MAC' }),
    );
    const { Mac } = await kms.send(
      new GenerateMacCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('message'),
        MacAlgorithm: 'HMAC_SHA_256',
      }),
    );
    const res = await kms.send(
      new VerifyMacCommand({
        KeyId: KeyMetadata?.KeyId,
        Message: Buffer.from('message'),
        MacAlgorithm: 'HMAC_SHA_256',
        Mac,
      }),
    );
    expect(res.MacValid).toBe(true);
  });
});
