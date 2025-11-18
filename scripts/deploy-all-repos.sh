#!/usr/bin/env bash
set -euo pipefail

# Deploy all connected repositories automatically
# This script triggers deployment for all repositories connected to istani

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
TARGET_REPO="sano1233/istani"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN environment variable is required"
  exit 1
fi

echo "🚀 Deploying all connected repositories..."
echo ""

# Get all repositories
REPOS=$(gh repo list sano1233 --limit 100 --json name --jq '.[].name' 2>/dev/null || echo "")

if [ -z "$REPOS" ]; then
  echo "⚠️  No repositories found or GitHub CLI not authenticated"
  exit 1
fi

# Deploy each repository
for repo in $REPOS; do
  if [ "$repo" = "istani" ]; then
    continue
  fi
  
  echo "📦 Deploying $repo..."
  
  # Trigger deployment workflow if it exists
  gh workflow run "deploy.yml" \
    --repo "sano1233/$repo" \
    --ref main 2>/dev/null || \
  gh workflow run "deploy.yml" \
    --repo "sano1233/$repo" \
    --ref master 2>/dev/null || \
  echo "  ⚠️  No deployment workflow found for $repo"
  
  # Also trigger sync to istani
  gh workflow run "repo-sync.yml" \
    --repo "$TARGET_REPO" \
    --ref main \
    -f source_repo="sano1233/$repo" 2>/dev/null || \
  echo "  ⚠️  Could not trigger sync for $repo"
  
  echo "  ✅ Deployment triggered for $repo"
  echo ""
done

echo "✅ All deployments triggered!"
echo ""
echo "Monitor deployments at:"
echo "  https://github.com/$TARGET_REPO/actions"
