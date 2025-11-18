#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

function listTrackedFiles() {
  try {
    const output = execSync('git ls-files', { cwd: projectRoot, encoding: 'utf8' });
    return output.split('\n').map(line => line.trim()).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function scanForConflicts(files) {
  const conflictFiles = [];
  for (const file of files) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (/^<{7}\s|^={7}$|^>{7}\s/m.test(content)) {
      conflictFiles.push(file);
    }
  }
  return conflictFiles;
}

function scanForTodos(files) {
  const todoMatches = [];
  const patterns = [
    /\/\/\s*(TODO|FIXME)/i,
    /#\s*(TODO|FIXME)/i,
    /<!--\s*(TODO|FIXME)/i,
    /\/\*\s*(TODO|FIXME)/i,
    /\*\s*(TODO|FIXME)/i,
    /--\s*(TODO|FIXME)/i
  ];
  files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (patterns.some(pattern => pattern.test(line))) {
        todoMatches.push({ file, line: index + 1, content: line.trim() });
      }
    });
  });
  return todoMatches;
}

function scanUnstagedChanges() {
  try {
    const output = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim();
    return output ? output.split('\n') : [];
  } catch (error) {
    return [];
  }
}

function printScanReport() {
  console.log('\nAuto Fix System Scan');
  console.log('---------------------');

  const files = listTrackedFiles();
  if (files.length === 0) {
    console.log('No tracked files found or git command unavailable.');
    return;
  }

  const conflicts = scanForConflicts(files);
  if (conflicts.length === 0) {
    console.log('No merge conflicts detected.');
  } else {
    console.log('Merge conflicts detected in:');
    conflicts.forEach(file => console.log(`  - ${file}`));
  }

  const todos = scanForTodos(files);
  if (todos.length === 0) {
    console.log('No TODO/FIXME markers detected.');
  } else {
    console.log('\nTODO/FIXME markers:');
    todos.slice(0, 20).forEach(match => {
      console.log(`  - ${match.file}:${match.line} -> ${match.content}`);
    });
    if (todos.length > 20) {
      console.log(`  ...and ${todos.length - 20} more`);
    }
  }

  const unstaged = scanUnstagedChanges();
  if (unstaged.length === 0) {
    console.log('\nWorking tree clean.');
  } else {
    console.log('\nUnstaged changes:');
    unstaged.forEach(line => console.log(`  ${line}`));
  }
}

async function autoFix() {
  console.log('\n🔧 Starting auto-fix process...\n');
  
  // Use enhanced auto-fix if available
  try {
    const EnhancedAutoFix = require('./enhanced-auto-fix');
    const autoFix = new EnhancedAutoFix();
    await autoFix.scanAndFix();
  } catch (e) {
    console.log('Using basic auto-fix...');
    printScanReport();
  }
}

function fixTypescript() {
  console.log('\n📝 Fixing TypeScript errors...\n');
  try {
    execSync('npx tsc --noEmit 2>&1 | head -20', { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'inherit'
    });
  } catch (error) {
    // Errors are expected, they're what we're trying to fix
  }
}

function main() {
  const [, , command] = process.argv;
  if (!command || command === 'help' || command === '--help') {
    console.log('Usage: node ai-brain/auto-fix-system.js <command>');
    console.log('Commands:');
    console.log('  scan        Inspect the repository for common issues.');
    console.log('  fix         Automatically fix detected issues.');
    console.log('  typescript  Check TypeScript errors.');
    process.exit(0);
  }

  switch (command) {
    case 'scan':
      printScanReport();
      break;
    case 'fix':
      autoFix();
      break;
    case 'typescript':
      fixTypescript();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
