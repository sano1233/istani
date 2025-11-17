#!/usr/bin/env node
/**
 * CodeRabbit Full Codebase Review
 * Reviews all TypeScript/JavaScript files in the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common code issues to check for
function analyzeCode(filePath, content) {
  const suggestions = [];
  const lines = content.split('\n');
  const fileName = path.basename(filePath);
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return;
    }
    
    // 1. Console.log without eslint-disable
    if (trimmed.includes('console.log') && !trimmed.includes('eslint-disable')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'console-log',
        message: 'Consider removing console.log or adding eslint-disable comment for production code',
        code: trimmed.substring(0, 80),
        fix: trimmed.replace(/console\.log\(/g, '// eslint-disable-next-line no-console\n        console.log(')
      });
    }
    
    // 2. TODO/FIXME comments
    if (trimmed.match(/TODO|FIXME|XXX|HACK/i) && !trimmed.match(/eslint-disable/)) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'todo-comment',
        message: 'TODO/FIXME comment found - consider addressing before production',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 3. Any type usage
    if (trimmed.includes(': any') && !trimmed.includes('eslint-disable')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'warning',
        type: 'any-type',
        message: 'Avoid using "any" type - use specific types or "unknown"',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 4. Inline styles in React (should use className)
    if (trimmed.includes('style={{') && fileName.endsWith('.tsx')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'inline-style',
        message: 'Consider moving inline styles to CSS classes or Tailwind utilities',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 5. Missing error handling in async functions
    if (trimmed.includes('async') && trimmed.includes('function') && !content.includes('try') && !content.includes('catch')) {
      // Check if function has error handling
      const funcStart = index;
      let braceCount = 0;
      let hasTryCatch = false;
      
      for (let i = funcStart; i < Math.min(funcStart + 50, lines.length); i++) {
        if (lines[i].includes('try')) hasTryCatch = true;
        if (lines[i].includes('catch')) hasTryCatch = true;
        if (lines[i].includes('{')) braceCount++;
        if (lines[i].includes('}')) braceCount--;
        if (braceCount === 0 && i > funcStart) break;
      }
      
      if (!hasTryCatch && content.includes('await')) {
        suggestions.push({
          file: filePath,
          line: lineNum,
          severity: 'warning',
          type: 'missing-error-handling',
          message: 'Async function should have error handling (try/catch)',
          code: trimmed.substring(0, 80)
        });
      }
    }
    
    // 6. Hardcoded strings that should be constants
    if (trimmed.match(/['"](https?:\/\/|api\/|localhost)/) && !trimmed.includes('process.env') && !trimmed.includes('const')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'hardcoded-url',
        message: 'Consider moving hardcoded URL to environment variable or constant',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 7. Missing return type annotations
    if (trimmed.match(/^(export\s+)?(async\s+)?function\s+\w+/) && !trimmed.includes(':')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'missing-return-type',
        message: 'Consider adding explicit return type annotation',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 8. Non-null assertions (!)
    if (trimmed.includes('!') && (trimmed.includes('.') || trimmed.includes('[')) && !trimmed.includes('!==') && !trimmed.includes('!=')) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'warning',
        type: 'non-null-assertion',
        message: 'Non-null assertion (!) can be dangerous - consider proper null checking',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 9. Magic numbers
    if (trimmed.match(/\b\d{3,}\b/) && !trimmed.match(/(px|ms|s|min|hour|day|const|let|var)/i)) {
      suggestions.push({
        file: filePath,
        line: lineNum,
        severity: 'info',
        type: 'magic-number',
        message: 'Consider extracting magic number to a named constant',
        code: trimmed.substring(0, 80)
      });
    }
    
    // 10. Missing JSDoc comments for exported functions
    if (trimmed.includes('export') && trimmed.includes('function') && index > 0) {
      const prevLines = lines.slice(Math.max(0, index - 3), index);
      const hasJSDoc = prevLines.some(l => l.trim().startsWith('/**') || l.trim().startsWith('*'));
      
      if (!hasJSDoc) {
        suggestions.push({
          file: filePath,
          line: lineNum,
          severity: 'info',
          type: 'missing-jsdoc',
          message: 'Consider adding JSDoc comment for exported function',
          code: trimmed.substring(0, 80)
        });
      }
    }
  });
  
  return suggestions;
}

// Get all TypeScript/JavaScript files
function getAllCodeFiles(dir = '.', fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build', '.vercel'].includes(file)) {
        getAllCodeFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function
function main() {
  console.log('🔍 CodeRabbit Full Codebase Review\n');
  
  const files = getAllCodeFiles();
  console.log(`📁 Found ${files.length} files to review\n`);
  
  const allSuggestions = [];
  let filesReviewed = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const suggestions = analyzeCode(file, content);
      
      if (suggestions.length > 0) {
        allSuggestions.push(...suggestions);
        filesReviewed++;
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Review Summary\n`);
  console.log(`Files reviewed: ${filesReviewed}/${files.length}`);
  console.log(`Total suggestions: ${allSuggestions.length}\n`);
  
  // Group by type
  const byType = {};
  allSuggestions.forEach(s => {
    if (!byType[s.type]) byType[s.type] = [];
    byType[s.type].push(s);
  });
  
  console.log('Suggestions by type:\n');
  Object.entries(byType).forEach(([type, items]) => {
    console.log(`  ${type}: ${items.length}`);
  });
  
  // Show top suggestions
  if (allSuggestions.length > 0) {
    console.log('\n\nTop Suggestions:\n');
    allSuggestions.slice(0, 20).forEach((s, i) => {
      console.log(`${i + 1}. ${s.file}:${s.line} [${s.severity.toUpperCase()}]`);
      console.log(`   ${s.message}`);
      console.log(`   ${s.code}\n`);
    });
  } else {
    console.log('\n✅ No issues found!');
  }
  
  // Save suggestions
  const output = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    filesReviewed,
    totalSuggestions: allSuggestions.length,
    suggestionsByType: Object.keys(byType).reduce((acc, key) => {
      acc[key] = byType[key].length;
      return acc;
    }, {}),
    suggestions: allSuggestions
  };
  
  fs.writeFileSync(
    'coderabbit-suggestions.json',
    JSON.stringify(output, null, 2)
  );
  
  console.log('\n💾 Full suggestions saved to: coderabbit-suggestions.json');
  console.log(`\n📈 Summary: ${allSuggestions.length} suggestions across ${filesReviewed} files`);
}

main();
