#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

if [ -f package-lock.json ]; then
  echo "Installing dependencies with npm ci..."
  npm ci
else
  echo "Installing dependencies with npm install..."
  npm install
fi

echo "Running tests..."
npm test

echo "Building production bundle..."
npm run build

if [ -d istani-rebuild/assets ]; then
  echo "Build artifacts are available in istani-rebuild/assets"
else
  echo "Warning: expected build output directory 'istani-rebuild/assets' not found."
fi
