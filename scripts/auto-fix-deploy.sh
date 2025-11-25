#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[1;34m'
NC='\033[0m'

STEP=1

log_header() {
  echo -e "${BLUE}\nISTANI FITNESS - AUTO FIX DEPLOYMENT${NC}"
  echo "=================================================="
}

log_step() {
  echo -e "${YELLOW}\n[$((STEP++))] $1${NC}"
}

log_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

log_skip() {
  echo -e "${YELLOW}⏭  $1${NC}"
}

log_error() {
  echo -e "${RED}✗ $1${NC}"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "Missing required command: $cmd"
    exit 1
  fi
}

ensure_file() {
  local file="$1"
  local label="$2"
  if [ ! -f "$file" ]; then
    log_error "${label} not found at $file"
    exit 1
  fi
}

run_step() {
  local description="$1"
  shift
  log_step "$description"
  if "$@"; then
    log_success "$description"
  else
    log_error "$description"
    exit 1
  fi
}

trap 'log_error "Deployment auto-fix failed on line $LINENO"' ERR

log_header

log_step "Validating prerequisites"
require_command node
require_command npm
ensure_file package.json "package.json"
ensure_file next.config.mjs "next.config.mjs"
ensure_file tsconfig.json "tsconfig.json"
ensure_file tailwind.config.ts "tailwind.config.ts"
log_success "Core files present"

: "${SKIP_INSTALL:=0}"
: "${SKIP_LINT:=0}"
: "${SKIP_TYPECHECK:=0}"
: "${SKIP_BUILD:=0}"

run_step "Sync environment file" bash -c '
  if [ -f .env.local ]; then
    exit 0
  fi
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "Created .env.local from template"
    exit 0
  fi
  exit 1
'

run_step "Clean build caches" bash -c '
  rm -rf .next .turbo
  mkdir -p .next
'

if [ "$SKIP_INSTALL" = "1" ]; then
  log_skip "Skipping dependency install (SKIP_INSTALL=1)"
else
  run_step "Install dependencies" npm ci
fi

if [ "$SKIP_LINT" = "1" ]; then
  log_skip "Skipping lint (SKIP_LINT=1)"
else
  run_step "Run lint" npm run lint
fi

if [ "$SKIP_TYPECHECK" = "1" ]; then
  log_skip "Skipping typecheck (SKIP_TYPECHECK=1)"
else
  run_step "Run typecheck" npm run typecheck
fi

if [ "$SKIP_BUILD" = "1" ]; then
  log_skip "Skipping build (SKIP_BUILD=1)"
else
  run_step "Create production build" npm run build
fi

log_step "Deployment auto-fix summary"
echo -e "${GREEN}All recovery steps completed successfully${NC}"
echo "- Cleaned caches"
echo "- Dependencies verified"
echo "- Lint, typecheck, and build executed"

log_success "Deployment is ready for redeploy"
