#!/bin/bash

# Cursor Worktree Setup Script
# This script sets up a new Cursor worktree with all necessary configurations

set -e

BRANCH_NAME=${1:-"cursor/$(date +%Y%m%d-%H%M%S)"}
WORKTREE_PATH=${2:-"../worktrees/${BRANCH_NAME##*/}"}

echo "🌳 Setting up Cursor worktree..."
echo "Branch: $BRANCH_NAME"
echo "Path: $WORKTREE_PATH"

# Create worktree
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" 2>/dev/null || git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"

cd "$WORKTREE_PATH"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run typecheck
echo "🔍 Running typecheck..."
npm run typecheck || echo "⚠️  Typecheck had warnings (continuing...)"

# Setup git hooks (optional)
if [ -f "../.git/hooks/pre-commit" ]; then
  echo "✅ Git hooks already configured"
else
  echo "📝 Setting up git hooks..."
  mkdir -p "../.git/hooks"
  cat > "../.git/hooks/pre-commit" << 'EOF'
#!/bin/bash
npm run lint -- --fix
npm run typecheck
EOF
  chmod +x "../.git/hooks/pre-commit"
fi

echo "✅ Worktree setup complete!"
echo ""
echo "To start development:"
echo "  cd $WORKTREE_PATH"
echo "  npm run dev:turbo"
echo ""
echo "To remove worktree:"
echo "  git worktree remove $WORKTREE_PATH"

