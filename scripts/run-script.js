#!/usr/bin/env node

/**
 * Cross-platform script runner
 * Automatically detects OS and runs appropriate script (PowerShell on Windows, Bash on Unix)
 * Compatible with Amazon Q and other AI coding assistants
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const scriptName = process.argv[2];
const args = process.argv.slice(3);

if (!scriptName) {
  console.error('❌ Script name is required');
  console.log('Usage: node run-script.js <script-name> [args...]');
  process.exit(1);
}

// Map script names to actual files
const scriptMap = {
  'setup-cursor-worktree': 'setup-cursor-worktree',
  'manage-worktrees': 'manage-worktrees',
  'setup-neon-comments-worktree': 'setup-neon-comments-worktree',
  'setup-full-stack-worktree': 'setup-full-stack-worktree',
  'clean-amazon-q-logs': 'clean-amazon-q-logs',
  'docker-build': 'docker-build',
  'docker-run': 'docker-run',
  'docker-up': 'docker-up',
  'agents-dev': 'agents-dev',
  'logs-clear': 'logs-clear',
  'logs-archive': 'logs-archive',
};

const baseScriptName = scriptMap[scriptName] || scriptName;
const scriptsDir = path.join(__dirname);

let command;
let scriptPath;

// Special handling for scripts with arguments
const scriptsWithArgs = ['docker-build', 'docker-run', 'docker-up'];
if (scriptsWithArgs.includes(scriptName)) {
  if (isWindows) {
    scriptPath = path.join(scriptsDir, `${baseScriptName}.ps1`);
    if (fs.existsSync(scriptPath)) {
      // Handle PowerShell switch parameters
      const argsStr = args.length > 0 ? ` ${args.map(a => a.startsWith('-') ? a : `"${a}"`).join(' ')}` : '';
      command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"${argsStr}`;
    } else {
      console.error(`❌ PowerShell script not found: ${scriptPath}`);
      process.exit(1);
    }
  } else {
    scriptPath = path.join(scriptsDir, `${baseScriptName}.sh`);
    if (fs.existsSync(scriptPath)) {
      const argsStr = args.length > 0 ? ` ${args.map(a => `"${a}"`).join(' ')}` : '';
      command = `bash "${scriptPath}"${argsStr}`;
    } else {
      console.error(`❌ Bash script not found: ${scriptPath}`);
      process.exit(1);
    }
  }
} else {
  if (isWindows) {
    // PowerShell on Windows
    scriptPath = path.join(scriptsDir, `${baseScriptName}.ps1`);
    if (fs.existsSync(scriptPath)) {
      const argsStr = args.length > 0 ? ` ${args.join(' ')}` : '';
      command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"${argsStr}`;
    } else {
      console.error(`❌ PowerShell script not found: ${scriptPath}`);
      process.exit(1);
    }
  } else {
    // Bash on Unix-like systems
    scriptPath = path.join(scriptsDir, `${baseScriptName}.sh`);
    if (fs.existsSync(scriptPath)) {
      const argsStr = args.length > 0 ? ` ${args.map(a => `"${a}"`).join(' ')}` : '';
      command = `bash "${scriptPath}"${argsStr}`;
    } else {
      console.error(`❌ Bash script not found: ${scriptPath}`);
      process.exit(1);
    }
  }
}

try {
  execSync(command, { stdio: 'inherit', cwd: process.cwd() });
} catch (error) {
  process.exit(error.status || 1);
}

