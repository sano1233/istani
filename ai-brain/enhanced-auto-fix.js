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
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (/^<{7}\s|^={7}$|^>{7}\s/m.test(content)) {
        conflictFiles.push(file);
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }
  return conflictFiles;
}

function autoResolveConflict(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const resolved = [];
    let inConflict = false;
    let conflictSide = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/^<{7}/)) {
        inConflict = true;
        conflictSide = 'ours';
        continue;
      }
      
      if (line.match(/^={7}/)) {
        conflictSide = 'theirs';
        continue;
      }
      
      if (line.match(/^>{7}/)) {
        inConflict = false;
        conflictSide = null;
        continue;
      }
      
      if (!inConflict) {
        resolved.push(line);
      } else if (conflictSide === 'theirs') {
        // Prefer incoming changes during auto-resolve
        resolved.push(line);
      }
    }
    
    fs.writeFileSync(filePath, resolved.join('\n'), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

function scanForErrors(files) {
  const errors = [];
  const errorPatterns = [
    { pattern: /console\.(log|error|warn)\(/g, type: 'console', fix: 'remove' },
    { pattern: /debugger;/g, type: 'debugger', fix: 'remove' },
    { pattern: /TODO|FIXME|XXX|HACK/gi, type: 'todo', fix: 'comment' },
    { pattern: /\.then\(/g, type: 'promise', fix: 'async' },
    { pattern: /var\s+\w+/g, type: 'var', fix: 'const/let' },
  ];
  
  files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return;
    }
    
    // Skip node_modules and build directories
    if (filePath.includes('node_modules') || filePath.includes('.next') || 
        filePath.includes('dist') || filePath.includes('.git')) {
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      errorPatterns.forEach(({ pattern, type, fix }) => {
        lines.forEach((line, index) => {
          const matches = line.match(pattern);
          if (matches) {
            errors.push({
              file,
              line: index + 1,
              type,
              fix,
              content: line.trim()
            });
          }
        });
      });
    } catch (e) {
      // Skip files that can't be read
    }
  });
  
  return errors;
}

function fixErrors(errors) {
  const fixes = [];
  const filesToFix = {};
  
  errors.forEach(error => {
    if (!filesToFix[error.file]) {
      filesToFix[error.file] = [];
    }
    filesToFix[error.file].push(error);
  });
  
  Object.keys(filesToFix).forEach(file => {
    const filePath = path.join(projectRoot, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const errorsInFile = filesToFix[file];
      
      errorsInFile.forEach(error => {
        const lineIndex = error.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          let fixedLine = lines[lineIndex];
          
          switch (error.fix) {
            case 'remove':
              if (error.type === 'console') {
                fixedLine = fixedLine.replace(/console\.(log|error|warn)\([^)]*\);?\s*/g, '');
              } else if (error.type === 'debugger') {
                fixedLine = fixedLine.replace(/debugger;?\s*/g, '');
              }
              break;
            case 'comment':
              if (!fixedLine.trim().startsWith('//')) {
                fixedLine = `// ${fixedLine}`;
              }
              break;
            case 'const/let':
              fixedLine = fixedLine.replace(/\bvar\s+/g, 'const ');
              break;
          }
          
          lines[lineIndex] = fixedLine;
          fixes.push({ file, line: error.line, type: error.type });
        }
      });
      
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    } catch (e) {
      console.error(`Error fixing ${file}: ${e.message}`);
    }
  });
  
  return fixes;
}

function runLinter() {
  try {
    execSync('npm run lint -- --fix', { 
      cwd: projectRoot, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return { success: true, message: 'Linting fixes applied' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function runTypeCheck() {
  try {
    execSync('npx tsc --noEmit', { 
      cwd: projectRoot, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, message: 'TypeScript check passed' };
  } catch (e) {
    return { success: false, message: e.stdout || e.message };
  }
}

function main() {
  const [, , command] = process.argv;
  
  if (!command || command === 'help' || command === '--help') {
    console.log('Usage: node ai-brain/enhanced-auto-fix.js <command>');
    console.log('Commands:');
    console.log('  scan      - Scan for issues');
    console.log('  fix       - Auto-fix all issues');
    console.log('  conflicts - Resolve merge conflicts');
    process.exit(0);
  }
  
  const files = listTrackedFiles();
  
  switch (command) {
    case 'scan':
      console.log('\n🔍 Enhanced Auto-Fix System Scan');
      console.log('='.repeat(50));
      
      const conflicts = scanForConflicts(files);
      if (conflicts.length > 0) {
        console.log(`\n⚠️  Merge conflicts detected in ${conflicts.length} file(s):`);
        conflicts.forEach(file => console.log(`   - ${file}`));
      } else {
        console.log('\n✅ No merge conflicts detected.');
      }
      
      const errors = scanForErrors(files);
      if (errors.length > 0) {
        console.log(`\n⚠️  Found ${errors.length} potential issue(s):`);
        const grouped = {};
        errors.forEach(e => {
          if (!grouped[e.type]) grouped[e.type] = [];
          grouped[e.type].push(e);
        });
        Object.keys(grouped).forEach(type => {
          console.log(`\n   ${type.toUpperCase()}: ${grouped[type].length} issue(s)`);
          grouped[type].slice(0, 5).forEach(e => {
            console.log(`     - ${e.file}:${e.line}`);
          });
          if (grouped[type].length > 5) {
            console.log(`     ... and ${grouped[type].length - 5} more`);
          }
        });
      } else {
        console.log('\n✅ No code quality issues detected.');
      }
      
      const lintResult = runLinter();
      console.log(`\n📋 Linter: ${lintResult.success ? '✅' : '⚠️'} ${lintResult.message}`);
      
      const typeResult = runTypeCheck();
      console.log(`📋 TypeScript: ${typeResult.success ? '✅' : '⚠️'} ${typeResult.message.substring(0, 100)}`);
      
      break;
      
    case 'fix':
      console.log('\n🔧 Auto-Fixing Issues...');
      console.log('='.repeat(50));
      
      // Resolve conflicts first
      const conflictFiles = scanForConflicts(files);
      conflictFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (autoResolveConflict(filePath)) {
          console.log(`✅ Resolved conflicts in ${file}`);
        } else {
          console.log(`⚠️  Could not auto-resolve ${file}`);
        }
      });
      
      // Fix code errors
      const codeErrors = scanForErrors(files);
      const fixes = fixErrors(codeErrors);
      console.log(`\n✅ Fixed ${fixes.length} issue(s) in ${new Set(fixes.map(f => f.file)).size} file(s)`);
      
      // Run linter
      const lintFix = runLinter();
      console.log(`📋 Linter: ${lintFix.success ? '✅' : '⚠️'} ${lintFix.message}`);
      
      break;
      
    case 'conflicts':
      console.log('\n🔀 Resolving Merge Conflicts...');
      const conflictsToResolve = scanForConflicts(files);
      conflictsToResolve.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (autoResolveConflict(filePath)) {
          console.log(`✅ Resolved conflicts in ${file}`);
          try {
            execSync(`git add ${file}`, { cwd: projectRoot });
          } catch (e) {
            // Ignore git errors
          }
        }
      });
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
