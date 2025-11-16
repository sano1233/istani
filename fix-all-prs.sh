#!/bin/bash
# Script to fix and merge all failed pull requests

cd "$(dirname "$0")"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

# Check if we're in a git repo
if ! git rev-parse --git-dir &> /dev/null; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check for required environment variables
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  Warning: GEMINI_API_KEY not set. AI conflict resolution may not work."
fi

echo "🚀 Starting automated PR fix and merge process..."
echo ""

# Run the fix script
node ai-brain/fix-failed-prs.js
