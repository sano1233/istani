#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '..');
const aiBrainDir = __dirname;

function formatHeader(title) {
  const line = '-'.repeat(title.length);
  return `\n${title}\n${line}`;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        return acc;
      }
      const [rawKey, ...rest] = trimmed.split('=');
      const key = rawKey.trim();
      const value = rest
        .join('=')
        .trim()
        .replace(/^['"]|['"]$/g, '');
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
}

function maskValue(value) {
  if (!value) {
    return '';
  }
  const normalized = value.trim();
  if (!normalized) {
    return '';
  }
  if (normalized.length <= 4) {
    return '***';
  }
  return `${normalized.slice(0, 4)}…`;
}

function detectEnvStatus() {
  const required = ['GEMINI_API_KEY', 'ANTHROPIC_API_KEY', 'QWEN_API_KEY'];
  const envFile = path.join(projectRoot, '.env.local');
  const fileValues = parseEnvFile(envFile);
  return required.map((name) => ({
    name,
    exported: Boolean(process.env[name]),
    configured: Boolean(fileValues[name]),
    preview: maskValue(fileValues[name] || ''),
  }));
}

function digestFile(filePath) {
  return crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex');
}

function computeDependencySignature() {
  const pkgPath = path.join(aiBrainDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  let signature = digestFile(pkgPath);
  const lockPath = path.join(aiBrainDir, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    signature += `::${digestFile(lockPath)}`;
  }
  return signature;
}

function detectDependencyStatus() {
  const pkgPath = path.join(aiBrainDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { error: 'package.json missing' };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const status = deps.map((dep) => {
    const depPath = path.join(aiBrainDir, 'node_modules', dep);
    return { name: dep, installed: fs.existsSync(depPath) };
  });

  const installStampPath = path.join(aiBrainDir, 'node_modules', '.install-stamp');
  let installState = null;
  const currentSignature = computeDependencySignature();
  if (currentSignature) {
    if (fs.existsSync(installStampPath)) {
      const recordedSignature = fs.readFileSync(installStampPath, 'utf8').trim();
      installState = {
        recorded: true,
        upToDate: recordedSignature === currentSignature,
        recordedSignature,
        currentSignature,
      };
    } else {
      installState = {
        recorded: false,
        upToDate: false,
        recordedSignature: null,
        currentSignature,
      };
    }
  }

  return { dependencies: status, installState };
}

function getNodeVersion() {
  try {
    const output = execSync('node --version', { encoding: 'utf8' }).trim();
    return output;
  } catch (error) {
    return 'unknown';
  }
}

function getNpmVersion() {
  try {
    const output = execSync('npm --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const lines = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.toLowerCase().startsWith('npm warn'));
    return lines.pop() || 'unknown';
  } catch (error) {
    return 'npm CLI not available';
  }
}

function getGhVersion() {
  try {
    const output = execSync('gh --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .split('\n')[0]
      .trim();
    return output;
  } catch (error) {
    return 'gh CLI not available';
  }
}

function printStatus() {
  console.log(formatHeader('AI Brain Environment Status'));
  console.log(`Project root: ${projectRoot}`);
  console.log(`Node version: ${getNodeVersion()}`);
  console.log(`npm version: ${getNpmVersion()}`);
  console.log(`GitHub CLI: ${getGhVersion()}`);

  const envStatus = detectEnvStatus();
  console.log(formatHeader('Environment Variables'));
  envStatus.forEach((entry) => {
    if (entry.exported) {
      console.log(`${entry.name}: exported in current shell`);
    } else if (entry.configured) {
      const preview = entry.preview ? ` (preview: ${entry.preview})` : '';
      console.log(`${entry.name}: configured in .env.local${preview}`);
    } else {
      console.log(`${entry.name}: missing`);
    }
  });

  const dependencyStatus = detectDependencyStatus();
  if (dependencyStatus.error) {
    console.log(formatHeader('Dependencies'));
    console.log(`Error: ${dependencyStatus.error}`);
  } else {
    console.log(formatHeader('Dependencies'));
    dependencyStatus.dependencies.forEach((dep) => {
      console.log(`${dep.name}: ${dep.installed ? 'installed' : 'missing'}`);
    });
    if (dependencyStatus.installState) {
      if (dependencyStatus.installState.upToDate) {
        console.log('Install stamp: dependencies match current manifest.');
      } else if (dependencyStatus.installState.recorded) {
        console.log('Install stamp: mismatch detected, run setup-mcp-servers.sh.');
      } else {
        console.log('Install stamp: not recorded, run setup-mcp-servers.sh.');
      }
    }
  }

  const envFile = path.join(projectRoot, '.env.local');
  console.log(formatHeader('Config Files'));
  console.log(
    `${path.relative(projectRoot, envFile)}: ${fs.existsSync(envFile) ? 'present' : 'missing'}`,
  );
}

function main() {
  const [, , command] = process.argv;
  if (!command || command === 'help' || command === '--help') {
    console.log('Usage: node ai-brain/mcp-helper.js <command>');
    console.log('Commands:\n  status   Print environment readiness information.');
    process.exit(0);
  }

  switch (command) {
    case 'status':
      printStatus();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
