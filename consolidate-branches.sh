#!/bin/bash
# Branch Consolidation Script
# Consolidates deployment fixes from multiple branches

set -e

echo "🔄 Starting branch consolidation..."
echo ""

# Current branch
CURRENT_BRANCH="claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m"
SECURITY_BRANCH="origin/claude/autonomous-ai-security-platform-011CUhoctN7H6j1ZM87hSVL5"
MONOREPO_BRANCH="origin/claude/monorepo-merge-workflow-01ASPQMcF3b9oq9zhDaDj1d9"
SETUP_BRANCH="origin/claude/setup-fitai-saas-01HWSfPbYTAt398rWVmwNLmG"

# Ensure we're on the current branch
echo "📍 Checking out $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH" 2>/dev/null || echo "Already on $CURRENT_BRANCH"

# Fetch latest
echo "📥 Fetching latest from origin..."
git fetch origin

# Function to attempt merge
merge_branch() {
    local branch_name=$1
    local branch_ref=$2
    
    echo ""
    echo "🔄 Attempting to merge $branch_name..."
    
    if git merge --no-commit --no-ff "$branch_ref" 2>&1; then
        echo "✅ Successfully merged $branch_name"
        return 0
    else
        echo "⚠️  Merge conflicts detected for $branch_name"
        echo "   Resolving conflicts..."
        
        # Try to resolve common conflicts
        git checkout --ours package.json 2>/dev/null || true
        git checkout --ours package-lock.json 2>/dev/null || true
        git checkout --ours .github/workflows/ci.yml 2>/dev/null || true
        
        if git commit --no-edit 2>&1; then
            echo "✅ Conflicts resolved for $branch_name"
            return 0
        else
            echo "❌ Could not auto-resolve conflicts for $branch_name"
            git merge --abort 2>/dev/null || true
            return 1
        fi
    fi
}

# Merge branches one by one
echo ""
echo "🔀 Merging branches..."

# Merge setup-fitai-saas (most similar to current)
if merge_branch "setup-fitai-saas" "$SETUP_BRANCH"; then
    echo "✅ Merged setup-fitai-saas"
fi

# Merge monorepo-merge-workflow
if merge_branch "monorepo-merge-workflow" "$MONOREPO_BRANCH"; then
    echo "✅ Merged monorepo-merge-workflow"
fi

# Merge autonomous-ai-security-platform (may have more conflicts)
if merge_branch "autonomous-ai-security-platform" "$SECURITY_BRANCH"; then
    echo "✅ Merged autonomous-ai-security-platform"
fi

# Verify build
echo ""
echo "🔨 Verifying build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful!"
else
    echo "⚠️  Build failed - please review and fix"
    exit 1
fi

# Verify typecheck
echo ""
echo "🔍 Verifying TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ TypeScript check passed!"
else
    echo "⚠️  TypeScript errors detected - please review"
fi

echo ""
echo "✅ Branch consolidation complete!"
echo "📝 Review changes with: git log --oneline --graph"
echo "🚀 Push with: git push origin $CURRENT_BRANCH"
