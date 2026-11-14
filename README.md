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
| Linux (glibc 2.17+) | `linux-x64-gnu` | `linux-arm64-gnu` |
| Linux (musl, e.g. Alpine) | `linux-x64-musl` | `linux-arm64-musl` |
| Windows | Not Supported | Not Supported |

### GitHub Actions

Every job downloads the ~1GB binding again unless it is cached. Cache the binding directory:

```yaml
- uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0
  with:
    path: ~/.aws/emulator-node
    key: aws-emulator-node-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('**/package-lock.json', '**/pnpm-lock.yaml', '**/yarn.lock') }}
- run: npm ci
```

The key changes with the lockfile, so a new package version is downloaded once and then
reused. On a cache hit, `postinstall` finds the binding and skips the download.


## Upstream

The native binding is built from [aws/aws-emulator](https://github.com/aws/aws-emulator)
**v1.0.353** (commit `ca8a89de`), checked out as a git submodule at `vendor/aws-emulator`.
The submodule stays at that upstream commit.

### Patches

| Patch | Change | Reason |
|---|---|---|
| `0001-lambda-getrusage-non-linux.patch` | On non-Linux targets, the Lambda Python runtime counts page faults with `getrusage(RUSAGE_SELF)` instead of `RUSAGE_THREAD`. | `RUSAGE_THREAD` exists only on Linux, so upstream does not compile on macOS. On macOS the count covers the whole process, so the runtime's memory limit is less precise. |

## License

- MIT for this repository's own code. 
- The vendored AWS Emulator keeps its licenses (CC0-1.0, and Apache-2.0 for its `vendor/`), and the native binding statically links many third-party
crates under their own licenses. 
- See [LICENSE](LICENSE) and [NOTICE](NOTICE).
