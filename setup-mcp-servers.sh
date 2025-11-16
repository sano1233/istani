#!/usr/bin/env bash
set -euo pipefail

# Bootstrap local MCP-related tooling for the AI Brain workspace. The script
# validates prerequisites before ensuring that npm dependencies are installed
# exactly once per package manifest revision.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_BRAIN_DIR="$REPO_ROOT/ai-brain"
STAMP_FILE="$AI_BRAIN_DIR/node_modules/.install-stamp"

HASH_CMD=""
if command -v sha1sum >/dev/null 2>&1; then
  HASH_CMD="sha1sum"
elif command -v shasum >/dev/null 2>&1; then
  HASH_CMD="shasum"
elif command -v python3 >/dev/null 2>&1; then
  HASH_CMD="python"
else
  echo "[setup-mcp-servers] Neither sha1sum, shasum nor python3 is available for hashing." >&2
  exit 1
fi

if [[ ! -d "$AI_BRAIN_DIR" ]]; then
  echo "[setup-mcp-servers] Expected directory '$AI_BRAIN_DIR' to exist." >&2
  exit 1
fi

if [[ ! -f "$AI_BRAIN_DIR/package.json" ]]; then
  echo "[setup-mcp-servers] package.json missing in '$AI_BRAIN_DIR'." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[setup-mcp-servers] Node.js is required but not available in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[setup-mcp-servers] npm is required but not available in PATH." >&2
  exit 1
fi

compute_signature() {
  pushd "$AI_BRAIN_DIR" >/dev/null
  local signature
  if [[ "$HASH_CMD" == "python" ]]; then
    signature="$(python3 - "$AI_BRAIN_DIR" <<'PY'
import hashlib
import sys
from pathlib import Path

pkg = Path(sys.argv[1]) / "package.json"
lock = pkg.with_name("package-lock.json")

def digest(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(data).hexdigest()

sig = digest(pkg)
if lock.exists():
    sig += "::" + digest(lock)

print(sig, end="")
PY
)"
  else
    signature="$("$HASH_CMD" package.json | awk '{print $1}')"
    if [[ -f package-lock.json ]]; then
      signature+="::$("$HASH_CMD" package-lock.json | awk '{print $1}')"
    fi
  fi
  popd >/dev/null
  echo "$signature"
}

install_dependencies() {
  pushd "$AI_BRAIN_DIR" >/dev/null
  if [[ -f package-lock.json ]]; then
    echo "[setup-mcp-servers] Installing dependencies via npm ci..."
    npm ci --no-audit --no-fund
  else
    echo "[setup-mcp-servers] Installing dependencies via npm install..."
    npm install --no-audit --no-fund
  fi
  local signature
  signature="$(compute_signature)"
  mkdir -p "$(dirname "$STAMP_FILE")"
  printf '%s' "$signature" > "$STAMP_FILE"
  popd >/dev/null
}

current_signature="$(compute_signature)"
if [[ -d "$AI_BRAIN_DIR/node_modules" && -f "$STAMP_FILE" ]]; then
  recorded_signature="$(< "$STAMP_FILE")"
  if [[ "$recorded_signature" == "$current_signature" ]]; then
    echo "[setup-mcp-servers] Dependencies are already up to date."
    exit 0
  fi
fi

install_dependencies

echo "[setup-mcp-servers] AI Brain dependencies are ready."
