#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const srcDir = join(root, 'src');
let violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) checkFile(p);
  }
}

function checkFile(path) {
  const content = readFileSync(path, 'utf8');
  const isClient = /['\"]use client['\"];?/.test(content.split('\n', 3).join('\n'));
  if (!isClient) return;
  const forbidden = /process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/g;
  let m;
  while ((m = forbidden.exec(content))) {
    violations.push({ path, match: m[0] });
  }
}

try {
  walk(srcDir);
  if (violations.length) {
    console.error('Found forbidden env usage in client components:');
    for (const v of violations) {
      console.error(` - ${v.path}: ${v.match}`);
    }
    process.exit(1);
  } else {
    console.log('No client-side secret leaks detected.');
  }
} catch (e) {
  console.error('check-client-env failed:', e.message);
  process.exit(2);
}

