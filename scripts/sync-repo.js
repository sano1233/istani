#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_REPO = process.argv[2] || 'sano1233/istani';
const [owner, repo] = TARGET_REPO.split('/');

if (!owner || !repo) {
  console.error('Invalid repository format. Use: owner/repo');
  process.exit(1);
}

const WORK_DIR = path.join(__dirname, '..', 'temp-sync', repo);
const ISTANI_DIR = path.join(__dirname, '..');

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: options.cwd || ISTANI_DIR,
      ...options 
    });
  } catch (error) {
    console.error(`Error executing: ${command}`);
    console.error(error.message);
    return null;
  }
}

function syncRepository() {
  console.log(`\n🔄 Syncing ${TARGET_REPO}...`);

  // Create temp directory
  if (!fs.existsSync(path.dirname(WORK_DIR))) {
    fs.mkdirSync(path.dirname(WORK_DIR), { recursive: true });
  }

  // Clone or update repository
  if (fs.existsSync(WORK_DIR)) {
    console.log('Updating existing clone...');
    exec(`git pull`, { cwd: WORK_DIR });
  } else {
    console.log('Cloning repository...');
    exec(`git clone https://github.com/${TARGET_REPO}.git ${WORK_DIR}`);
  }

  // Get latest changes
  const latestCommit = exec(`git rev-parse HEAD`, { cwd: WORK_DIR })?.trim();
  const latestMessage = exec(`git log -1 --pretty=%B`, { cwd: WORK_DIR })?.trim();

  // Check if we already have this commit
  const syncLogPath = path.join(ISTANI_DIR, '.sync-log.json');
  let syncLog = {};
  if (fs.existsSync(syncLogPath)) {
    syncLog = JSON.parse(fs.readFileSync(syncLogPath, 'utf8'));
  }

  if (syncLog[repo] === latestCommit) {
    console.log(`✅ ${repo} is already up to date`);
    return;
  }

  // Copy relevant files (excluding node_modules, .git, etc.)
  const excludePatterns = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.env',
    '.env.local',
    'package-lock.json'
  ];

  function shouldExclude(filePath) {
    return excludePatterns.some(pattern => filePath.includes(pattern));
  }

  function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (shouldExclude(srcPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Sync to a subdirectory in istani
  const targetDir = path.join(ISTANI_DIR, 'synced-repos', repo);
  console.log(`Copying files to ${targetDir}...`);
  copyDirectory(WORK_DIR, targetDir);

  // Create sync metadata
  const metadataPath = path.join(targetDir, '.sync-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify({
    source: TARGET_REPO,
    syncedAt: new Date().toISOString(),
    commit: latestCommit,
    message: latestMessage
  }, null, 2));

  // Update sync log
  syncLog[repo] = latestCommit;
  fs.writeFileSync(syncLogPath, JSON.stringify(syncLog, null, 2));

  console.log(`✅ Successfully synced ${repo} (${latestCommit.substring(0, 7)})`);
}

syncRepository();
