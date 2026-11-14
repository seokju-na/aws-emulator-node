import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import pkg from '../package.json' with { type: 'json' };
import type * as Native from './native.js';

/** napi `binaryName`: release assets are `<BINARY_NAME>.<triple>.node`. */
const BINARY_NAME = 'aws-emulator-node';
/** Overrides the base directory binaries are installed into and loaded from. */
export const BINDING_DIR_ENV = 'SEOKJU_NA_AWS_EMULATOR_NODE_BINDING_DIR';
const DEFAULT_BINDING_DIR = '~/.aws/emulator-node';

export type NativeBinding = typeof Native;

/**
 * The napi-rs platform triple of this process (`darwin-arm64`, `linux-x64-gnu`, ...), the
 * same suffix `napi build --platform` gives the binary.
 */
export function platformTriple(
  platform: NodeJS.Platform = process.platform,
  arch: NodeJS.Architecture = process.arch,
): string {
  switch (platform) {
    case 'darwin':
      return `darwin-${arch}`;
    case 'linux':
      return `linux-${arch}-${isMusl() ? 'musl' : 'gnu'}`;
    default:
      return `${platform}-${arch}`;
  }
}

function isMusl(): boolean {
  const report = process.report?.getReport() as { header?: { glibcVersionRuntime?: string } };
  return !report?.header?.glibcVersionRuntime;
}

export function bindingFileName(triple: string = platformTriple()): string {
  return `${BINARY_NAME}.${triple}.node`;
}

/** `$SEOKJU_NA_AWS_EMULATOR_NODE_BINDING_DIR`, or `~/.aws/emulator-node`. */
export function bindingDir(env: NodeJS.ProcessEnv = process.env): string {
  const dir = env[BINDING_DIR_ENV] || DEFAULT_BINDING_DIR;
  const expanded = dir === '~' || dir.startsWith('~/') ? path.join(homedir(), dir.slice(1)) : dir;
  return path.resolve(expanded);
}

/** `<bindingDir>/<version>/aws-emulator-node.<triple>.node` */
export function bindingPath(
  version: string = pkg.version,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return path.join(bindingDir(env), version, bindingFileName());
}

/**
 * How to let each package manager run this package's postinstall (which downloads the
 * binding), and how to run it again afterwards.
 */
function postinstallGuide(name: string = pkg.name): string {
  const script = path.join(path.resolve(import.meta.dirname, '..'), 'scripts', 'postinstall.mjs');
  return [
    "The binding is downloaded from GitHub Releases by this package's postinstall script.",
    'If your package manager skipped it, allow it and re-run it:',
    '',
    '  npm   Scripts run by default; check that `ignore-scripts` is not set (.npmrc, --ignore-scripts).',
    `        npm rebuild ${name}`,
    '  pnpm  Dependency scripts are blocked by default (v10+). Approve it with `pnpm approve-builds`,',
    '        or add it to `onlyBuiltDependencies` in pnpm-workspace.yaml:',
    `          onlyBuiltDependencies: ['${name}']`,
    `        pnpm rebuild ${name}`,
    '  yarn  Scripts run by default; check that `enableScripts: false` is not set in .yarnrc.yml,',
    '        or allow just this package in package.json:',
    `          "dependenciesMeta": { "${name}": { "built": true } }`,
    `        yarn rebuild ${name}`,
    '  bun   Dependency scripts are blocked unless trusted:',
    `        bun pm trust ${name}`,
    '',
    'Or run the download directly:',
    `  node ${script}`,
  ].join('\n');
}

let loaded: NativeBinding | undefined;

/**
 * Load the native addon. A binary next to this module (a local `napi build` into `lib/`)
 * wins; otherwise the one postinstall downloaded to {@link bindingPath}.
 */
export function loadNative(): NativeBinding {
  if (loaded) {
    return loaded;
  }

  const candidates = [path.join(import.meta.dirname, bindingFileName()), bindingPath()];
  const file = candidates.find((candidate) => existsSync(candidate));
  if (file === undefined) {
    throw new Error(
      [
        `${pkg.name}: native binding for ${platformTriple()} not found. Looked in:`,
        ...candidates.map((candidate) => `  - ${candidate}`),
        '',
        postinstallGuide(),
      ].join('\n'),
    );
  }

  const module = { exports: {} as NativeBinding };
  process.dlopen(module, file);
  loaded = module.exports;

  return loaded;
}
