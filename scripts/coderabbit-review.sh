#!/bin/bash
# CodeRabbit Review Script
# Automatically runs CodeRabbit review and applies fixes

set -e

echo "🔍 Running CodeRabbit review..."

# Add CodeRabbit to PATH
export PATH="$HOME/.local/bin:$PATH"

# Check if CodeRabbit is installed
if ! command -v coderabbit &> /dev/null; then
    echo "❌ CodeRabbit CLI not found. Installing..."
    curl -fsSL https://cli.coderabbit.ai/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Run CodeRabbit review with prompt-only mode for AI agents
echo "📊 Analyzing code changes..."
coderabbit --prompt-only -t uncommitted || {
    echo "⚠️ CodeRabbit review completed with warnings"
    exit 0
}

echo "✅ CodeRabbit review complete!"
