#!/bin/bash

# Setup worktree for Full Stack App branch
# Branch: claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC

set -e

BRANCH_NAME="claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC"
WORKTREE_NAME="build-full-stack-app"
WORKTREE_PATH="../worktrees/${WORKTREE_NAME}"

echo "🌳 Setting up worktree for Full Stack App..."
echo "Branch: $BRANCH_NAME"
echo "Path: $WORKTREE_PATH"

# Check if branch exists remotely
if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  echo "✅ Branch found remotely"
  # Create worktree from remote branch
  git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "origin/$BRANCH_NAME" 2>/dev/null || \
  git worktree add "$WORKTREE_PATH" "$BRANCH_NAME" 2>/dev/null || \
  git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
else
  echo "⚠️  Branch not found remotely, creating new branch"
  # Create new branch and worktree
  git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
fi

cd "$WORKTREE_PATH"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run typecheck
echo "🔍 Running typecheck..."
npm run typecheck || echo "⚠️  Typecheck had warnings (continuing...)"

# Fix any merge conflicts
echo "🔧 Checking for merge conflicts..."
if grep -r "<<<<<<< " . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next 2>/dev/null; then
  echo "⚠️  Merge conflicts detected. Please resolve them manually."
else
  echo "✅ No merge conflicts found"
fi

echo "✅ Worktree setup complete!"
echo ""
echo "To start development:"
echo "  cd $WORKTREE_PATH"
echo "  npm run dev:turbo"
echo ""
echo "To fix issues:"
echo "  npm run lint:fix"
echo "  npm run typecheck"

