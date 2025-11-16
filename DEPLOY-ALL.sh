#!/usr/bin/env bash
set -euo pipefail

# High-level orchestration script that chains together the common project setup
# and verification tasks used during deployments.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

pushd "$REPO_ROOT" >/dev/null

./setup-mcp-servers.sh
./setup-secrets.sh || echo "[deploy-all] Secrets are not fully configured. Continuing for validation purposes."

node ai-brain/mcp-helper.js status
node ai-brain/auto-fix-system.js scan

popd >/dev/null

echo "[deploy-all] Deployment helper complete."
