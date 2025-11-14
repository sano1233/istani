#!/bin/bash
set -e

# Monorepo Merge Script for sano1233/istani
# This script merges all specified repositories into a unified monorepo structure

echo "🚀 Starting monorepo merge process..."

# Define all repositories to merge (cleaned list, no duplicates)
declare -a REPOS=(
    "nextjs-with-supabase"
    "nextjs"
    "next.js"
    "sano1233"
    "hyperswitch"
    "n8n"
    "claude-cookbooks"
    "claude-code-action"
    "claude-code"
    "openai-cookbook"
    "llama.cpp"
    "cli"
    "ollama"
    "mcp-server-cloudflare"
    "codex"
    "supabase-js"
    "supabase-py"
    "node-windows"
    "istani.org"
    "pg_cron"
    "self-hosted-ai-agent-starter-kit"
    "FREE-FITNESS-WORKOUT-GYM-MEAL-CALCULATOR-GUIDE"
    "tabby"
    "ISTANI-Quantum-Shield"
    "roadside-connect-webapp"
    "ClaudeSync"
    "saas-starter"
    "nvm-windows"
    "nestjs-supabase-auth"
    "gemini-cli"
    "hsdhxhrndndnndndhdhjdnndndndndndn"
    "nextjs-subscription-payments"
)

# Create packages directory if it doesn't exist
mkdir -p packages

# Counter for progress
TOTAL=${#REPOS[@]}
CURRENT=0

# Function to merge a single repository
merge_repo() {
    local REPO_NAME=$1
    CURRENT=$((CURRENT + 1))

    echo ""
    echo "[$CURRENT/$TOTAL] Processing: $REPO_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Add remote
    echo "  📡 Adding remote..."
    if git remote | grep -q "^${REPO_NAME}$"; then
        echo "  ⚠️  Remote $REPO_NAME already exists, removing..."
        git remote remove "$REPO_NAME" || true
    fi

    git remote add -f "$REPO_NAME" "https://github.com/sano1233/${REPO_NAME}.git" 2>&1 || {
        echo "  ❌ Failed to add remote for $REPO_NAME (might not exist or be private)"
        return 1
    }

    # Create target directory
    TARGET_DIR="packages/${REPO_NAME}"
    mkdir -p "$TARGET_DIR"

    # Fetch the default branch (try main, master, or use remote HEAD)
    echo "  📥 Fetching repository..."
    REMOTE_BRANCH=$(git remote show "$REPO_NAME" | grep 'HEAD branch' | cut -d' ' -f5)
    if [ -z "$REMOTE_BRANCH" ]; then
        REMOTE_BRANCH="main"
    fi

    echo "  🔀 Merging ${REPO_NAME}/${REMOTE_BRANCH} into ${TARGET_DIR}..."

    # Use subtree merge strategy to preserve history
    git merge -s ours --no-commit --allow-unrelated-histories "${REPO_NAME}/${REMOTE_BRANCH}" 2>&1 || {
        echo "  ⚠️  Merge preparation failed, trying alternative approach..."
    }

    git read-tree --prefix="${TARGET_DIR}/" -u "${REPO_NAME}/${REMOTE_BRANCH}" 2>&1 || {
        echo "  ❌ Failed to read tree for $REPO_NAME"
        git merge --abort 2>/dev/null || true
        return 1
    }

    # Commit this merge
    git commit -m "chore: merge ${REPO_NAME} into packages/${REPO_NAME}

Imported from https://github.com/sano1233/${REPO_NAME}
Branch: ${REMOTE_BRANCH}
Preserves full git history using subtree merge strategy" 2>&1 || {
        echo "  ℹ️  Nothing to commit for $REPO_NAME (might be empty or already merged)"
    }

    echo "  ✅ Successfully merged $REPO_NAME"

    # Clean up remote
    git remote remove "$REPO_NAME"

    return 0
}

# Merge all repositories
SUCCESS_COUNT=0
FAILED_COUNT=0
declare -a FAILED_REPOS

for repo in "${REPOS[@]}"; do
    if merge_repo "$repo"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        FAILED_REPOS+=("$repo")
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Merge Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAILED_COUNT"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "Failed repositories:"
    for failed_repo in "${FAILED_REPOS[@]}"; do
        echo "  - $failed_repo"
    done
fi

echo ""
echo "🎉 Monorepo merge process complete!"
echo ""
echo "Next steps:"
echo "  1. Review the merged code in packages/"
echo "  2. Create a root package.json with workspace configuration"
echo "  3. Run tests and fix any issues"
echo "  4. Commit and push changes"
