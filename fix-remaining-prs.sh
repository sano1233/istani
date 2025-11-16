#!/bin/bash
set -e

PRS=(101 75 74 73 71 70 69 65 63 62 61 60 56 54 52 49 45 44)

for pr in "${PRS[@]}"; do
  echo "Processing PR #$pr..."
  git checkout main
  git pull origin main
  if gh pr checkout "$pr" 2>/dev/null; then
    if git merge main --no-commit --no-ff 2>&1 | grep -q "CONFLICT"; then
      for f in $(git diff --name-only --diff-filter=UU); do
        git checkout --ours "$f" 2>/dev/null || git checkout --theirs "$f"
      done
      for f in $(git diff --name-only --diff-filter=AA); do
        git checkout --ours "$f"
      done
      git add -A
      git commit -m "Resolve merge conflicts with main" || true
      BRANCH=$(git branch --show-current)
      git push origin "$BRANCH" --force-with-lease || true
      echo "  PR #$pr fixed"
    else
      echo "  PR #$pr has no conflicts"
    fi
  fi
done
