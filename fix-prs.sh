#!/bin/bash
# Script to fix and merge conflicting PRs

set -e

# List of PR numbers with conflicts
PRS=(116 113 112 107 78 77 76 75 74 73 71 70 69 65 63 62 61 60 56 54 52 49 45 44)

for pr in "${PRS[@]}"; do
  echo "Processing PR #$pr..."
  
  # Checkout main and update
  git checkout main
  git pull origin main
  
  # Checkout PR branch
  if gh pr checkout "$pr" 2>/dev/null; then
    # Try to merge main
    if git merge main --no-commit --no-ff 2>&1 | grep -q "CONFLICT"; then
      echo "  Conflicts found in PR #$pr"
      
      # Resolve conflicts: accept PR branch version for add/add conflicts
      for file in $(git diff --name-only --diff-filter=UU); do
        # For most files, accept PR branch version
        git checkout --ours "$file" 2>/dev/null || git checkout --theirs "$file"
      done
      
      # For add/add conflicts, accept PR branch version
      for file in $(git diff --name-only --diff-filter=AA); do
        git checkout --ours "$file"
      done
      
      # Commit the merge
      git add -A
      git commit -m "Resolve merge conflicts with main" || true
      
      # Push
      git push origin "$(git branch --show-current)" || git push origin "$(git branch --show-current)" --force-with-lease
      
      echo "  PR #$pr conflicts resolved"
    else
      echo "  PR #$pr has no conflicts or already merged"
    fi
  else
    echo "  Could not checkout PR #$pr"
  fi
  
  echo ""
done

echo "Done processing PRs"
