import { build } from 'esbuild';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';

// 读取 package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// 设置外部依赖 — fhir-core 打包进 CLI
const external = [
  'node:*',
  'node:fs',
  'node:path',
  'node:process',
  'node:url',
];

// 构建通用配置
const baseOptions = {
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: ['es2022'],
  tsconfig: 'tsconfig.json',
  loader: { '.ts': 'ts' },
  resolveExtensions: ['.ts', '.js'],
  external,
  define: {
    'CLI_VERSION': JSON.stringify(pkg.version),
  },
};

// 构建 CLI bin 入口
async function buildBin() {
  console.log('Building CLI binary...');
  mkdirSync('./dist/bin', { recursive: true });
  await build({
    ...baseOptions,
    entryPoints: ['./src/bin/medxai.ts'],
    format: 'esm',
    outfile: './dist/bin/medxai.mjs',
    banner: {
      js: '#!/usr/bin/env node\n',
    },
  });
  console.log('CLI binary built.');
}

// 构建 ESM library (programmatic API)
async function buildESM() {
  console.log('Building ESM library...');
  mkdirSync('./dist/esm', { recursive: true });
  await build({
    ...baseOptions,
    entryPoints: ['./src/index.ts'],
    format: 'esm',
    outfile: './dist/esm/index.mjs',
  });

  writeFileSync(
    './dist/esm/package.json',
    JSON.stringify({ type: 'module', main: 'index.mjs' }, null, 2),
  );
  console.log('ESM library built.');
}

// 主函数
async function main() {
  try {
    await buildBin();
    await buildESM();
    console.log('Build all done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();