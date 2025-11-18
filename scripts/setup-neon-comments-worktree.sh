#!/bin/bash

# Setup worktree for Neon Comments integration branch
# Branch: claude/setup-neon-comments-01EvegQGSSGcFAdMDxQEZAwe

set -e

BRANCH_NAME="claude/setup-neon-comments-01EvegQGSSGcFAdMDxQEZAwe"
WORKTREE_NAME="setup-neon-comments"
WORKTREE_PATH="../worktrees/${WORKTREE_NAME}"

echo "🌳 Setting up worktree for Neon Comments integration..."
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

# Check for Neon Comments setup
if [ -f "package.json" ]; then
  # Check if @neondatabase/serverless or neon comments packages are needed
  if ! grep -q "@neondatabase" package.json && ! grep -q "neon" package.json; then
    echo "📝 Neon Comments packages not found in package.json"
    echo "💡 You may need to install:"
    echo "   npm install @neondatabase/serverless"
    echo "   # or"
    echo "   npm install neon-comments"
  fi
fi

# Run typecheck
echo "🔍 Running typecheck..."
npm run typecheck || echo "⚠️  Typecheck had warnings (continuing...)"

echo "✅ Worktree setup complete!"
echo ""
echo "To start development:"
echo "  cd $WORKTREE_PATH"
echo "  npm run dev:turbo"
echo ""
echo "Neon Comments Integration Resources:"
echo "  - Neon Database: https://neon.tech"
echo "  - Neon Serverless: https://neon.tech/docs/serverless/serverless-driver"
echo "  - Comments System: Consider using Neon for real-time comments"

