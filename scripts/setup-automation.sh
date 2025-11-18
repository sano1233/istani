#!/bin/bash

set -e

echo "🚀 Setting up GitHub Automation System"
echo "========================================"

# Create .github directory if it doesn't exist
mkdir -p .github/workflows

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) not found. Installing..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update
    sudo apt install gh -y
fi

# Authenticate with GitHub
echo "🔐 Authenticating with GitHub..."
gh auth status || gh auth login

# Set up repository secrets
echo "📝 Setting up repository secrets..."
echo ""
echo "Please configure the following secrets in your GitHub repository:"
echo "  - GITHUB_TOKEN (automatically set)"
echo "  - VERCEL_TOKEN (optional, for Vercel deployment)"
echo "  - VERCEL_ORG_ID (optional)"
echo "  - VERCEL_PROJECT_ID (optional)"
echo "  - SUPABASE_ACCESS_TOKEN (optional)"
echo "  - SUPABASE_DB_PASSWORD (optional)"
echo "  - SUPABASE_PROJECT_ID (optional)"
echo "  - N8N_WEBHOOK_URL (optional)"
echo "  - HYPERSWITCH_WEBHOOK_URL (optional)"
echo "  - GITHUB_WEBHOOK_SECRET (optional, for webhook verification)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make scripts executable
chmod +x ai-brain/*.js
chmod +x scripts/*.sh 2>/dev/null || true

# Test auto-fix system
echo "🧪 Testing auto-fix system..."
node ai-brain/enhanced-auto-fix.js scan || echo "⚠️  Auto-fix system test skipped"

# Set up webhook (if running on server)
if [ -n "$WEBHOOK_URL" ]; then
    echo "🔗 Setting up GitHub webhook..."
    gh api repos/:owner/:repo/hooks \
        -X POST \
        -f name=web \
        -f active=true \
        -f events[]=pull_request \
        -f events[]=push \
        -f events[]=pull_request_review \
        -f config[url]="$WEBHOOK_URL" \
        -f config[content_type]=json \
        -f config[secret]="$GITHUB_WEBHOOK_SECRET" || echo "⚠️  Webhook setup skipped"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure repository secrets in GitHub Settings > Secrets"
echo "2. Push your changes to trigger workflows"
echo "3. Create a test PR to verify auto-fix and auto-merge"
echo ""
echo "Available commands:"
echo "  - node ai-brain/enhanced-auto-fix.js scan    - Scan for issues"
echo "  - node ai-brain/enhanced-auto-fix.js fix     - Auto-fix issues"
echo "  - node ai-brain/pr-handler.js <pr-number>    - Handle PR"
echo "  - node ai-brain/integrations.js sync         - Sync repositories"
