#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   PRS="39 40 41 44 45 49" ./scripts/merge-prs.sh
# Merges oldest → newest. Requires gh CLI and repo write access.

PRS="${PRS:-${*:-}}"
if [ -z "${PRS}" ]; then
  echo "Set PRS env var or pass PR numbers as args. Example:"
  echo 'PRS="39 40 41 44 45 49" ./scripts/merge-prs.sh'
  exit 1
fi

# Ensure gh is available and authenticated
gh --version >/dev/null
: "${GH_TOKEN:=${GITHUB_TOKEN:-}}"
if ! gh auth status >/dev/null 2>&1; then
  echo "Authenticating gh with GH_TOKEN/GITHUB_TOKEN from env..."
  gh auth login --with-token <<<"${GH_TOKEN}"
fi

for pr in ${PRS}; do
  echo "Merging PR #${pr} (squash + delete branch)…"
  # Squash-merge immediately if mergeable; delete source branch after
  gh pr merge "${pr}" --squash --delete-branch
done

echo "All PRs merged."
