import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const outDir = resolve(projectRoot, 'istani-rebuild/assets');

async function ensureCleanOutput() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
}

async function buildBundle() {
  await ensureCleanOutput();

  await build({
    entryPoints: [resolve(projectRoot, 'src/istani-rebuild/index.jsx')],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'esm',
    target: ['es2019'],
    outfile: resolve(outDir, 'app.js'),
    jsx: 'automatic',
    logLevel: 'info'
  });
}

try {
  await buildBundle();
  console.log('✅ Built ISTANI Rebuild bundle successfully.');
} catch (error) {
  console.error('❌ Failed to build ISTANI Rebuild bundle.');
  console.error(error);
  process.exitCode = 1;
}
