# aws-emulator-node

> Unofficial [AWS Emulator](https://github.com/aws/aws-emulator) for Node.js.

[AWS Emulator](https://github.com/aws/aws-emulator) **embedded mode**, built into a Node.js native 
addons with [napi-rs](https://napi.rs). The emulator runs inside Node.js process.

```typescript
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import { AwsEmulator } from '@seokju-na/aws-emulator-node';

await using aws = new AwsEmulator({ closeTimeout: 5_000 });

const s3 = new S3Client(aws.clientConfig());
await s3.send(new CreateBucketCommand({ Bucket: 'my-bucket' }));
```

## Install

```sh
npm install -D @seokju-na/aws-emulator-node
yarn add -D @seokju-na/aws-emulator-node
pnpm add -D @seokju-na/aws-emulator-node
```

The native binding (~1GB) is too large for the npm tarball. `postinstall` downloads this
platform's binary from the package version's GitHub release to:

```sh
~/.aws/emulator-node/<version>/aws-emulator-node.<triple>.node
```

To override default directory, set the environment variable.

```sh
SEOKJU_NA_AWS_EMULATOR_NODE_BINDING_DIR=~/my/custom/directory
```

If your package manager skipped the `postinstall` script, the binding is missing and loading the
package throws an error with these same steps. Allow the script, then re-run it:

| Package Manager | Allow the script |
|---|---|
| npm | Runs by default; make sure `ignore-scripts` is not set |
| pnpm | `pnpm approve-builds`, or `onlyBuiltDependencies: ['@seokju-na/aws-emulator-node']` in `pnpm-workspace.yaml` |
| yarn | Add `"dependenciesMeta": { "@seokju-na/aws-emulator-node": { "built": true } }` to `package.json` |

### Platforms

| OS | x64 | arm64 |
|---|---|---|
| macOS | Not Supported| `darwin-arm64` |

Currently, only supports macOS `darwin-arm64` architecture.

## Upstream

The native binding is built from [aws/aws-emulator](https://github.com/aws/aws-emulator)
**v1.0.353** (commit `ca8a89de`), checked out as a git submodule at `vendor/aws-emulator`.
The submodule stays at that upstream commit.

### CloudFront functions with KVS

The KVS patch requires a locally rebuilt native binding; the published v0.1.0 binary does not include it:

```sh
mise exec -- corepack yarn install --immutable
mise exec -- corepack yarn build:native:debug
```

Rust/Cargo and a native C toolchain must be available on `PATH` for the build.
Create a local store with `CreateKeyValueStore`, write its keys through the
`CloudFrontKeyValueStoreClient`, and associate its ARN with the function's
`KeyValueStoreAssociations`. `TestFunction` can then execute the original
`import cf from 'cloudfront'` and read the associated store.
Load `@aws-sdk/signature-v4a` with a side-effect import before using the KVS SDK
client, which requires SigV4a signing.

Each invocation reads a snapshot of the local KVS. Updates are visible on the next
invocation; real AWS KVS data is not imported automatically. Only `cf.kvs()` and
`cf.kvs(id)` with `exists()` and `get()` (default/string/JSON) are supported by this
patch. Other CloudFront helpers, `meta()`, and byte-format reads are not implemented.
The patch covers `TestFunction`, not distribution-triggered function execution.
Other module imports remain unavailable, and the existing execution limits remain in place.

### Patches

| Patch | Change | Reason |
|---|---|---|
| `0001-lambda-getrusage-non-linux.patch` | On non-Linux targets, the Lambda Python runtime counts page faults with `getrusage(RUSAGE_SELF)` instead of `RUSAGE_THREAD`. | `RUSAGE_THREAD` exists only on Linux, so upstream does not compile on macOS. On macOS the count covers the whole process, so the runtime's memory limit is less precise. |
| `0002-cloudfront-function-kvs.patch` | Runs CloudFront functions as JavaScript modules and provides `cloudfront` with `cf.kvs()`, `exists()`, and `get()` (string/JSON). | Upstream's `TestFunction` runtime has no module loader or connection to the local KVS data plane. |

## License

- MIT for this repository's own code. 
- The vendored AWS Emulator keeps its licenses (CC0-1.0, and Apache-2.0 for its `vendor/`), and the native binding statically links many third-party
crates under their own licenses. 
- See [LICENSE](LICENSE) and [NOTICE](NOTICE).
