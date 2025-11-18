#!/bin/bash

# Cursor Worktree Management Script
# Manage multiple worktrees for parallel development

set -e

COMMAND=${1:-"list"}

case "$COMMAND" in
  list)
    echo "📋 Active worktrees:"
    git worktree list
    ;;
  
  create)
    BRANCH_NAME=${2:-"cursor/$(date +%Y%m%d-%H%M%S)"}
    WORKTREE_PATH=${3:-"../worktrees/${BRANCH_NAME##*/}"}
    
    echo "🌳 Creating worktree: $BRANCH_NAME"
    bash scripts/setup-cursor-worktree.sh "$BRANCH_NAME" "$WORKTREE_PATH"
    ;;
  
  remove)
    WORKTREE_PATH=${2}
    if [ -z "$WORKTREE_PATH" ]; then
      echo "❌ Please provide worktree path"
      echo "Usage: $0 remove <worktree-path>"
      exit 1
    fi
    
    echo "🗑️  Removing worktree: $WORKTREE_PATH"
    git worktree remove "$WORKTREE_PATH" --force
    echo "✅ Worktree removed"
    ;;
  
  prune)
    echo "🧹 Pruning worktrees..."
    git worktree prune
    echo "✅ Pruning complete"
    ;;
  
  dev)
    WORKTREE_PATH=${2:-"."}
    cd "$WORKTREE_PATH"
    echo "🚀 Starting dev server in worktree: $WORKTREE_PATH"
    npm run dev:turbo
    ;;
  
  *)
    echo "Cursor Worktree Manager"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list              - List all active worktrees"
    echo "  create [branch]   - Create a new worktree"
    echo "  remove <path>     - Remove a worktree"
    echo "  prune             - Prune stale worktrees"
    echo "  dev [path]        - Start dev server in worktree"
    echo ""
    exit 1
    ;;
esac

