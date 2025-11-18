#!/bin/bash
# Automated PR creation script

echo "🚀 Creating Pull Request..."
echo ""
echo "Branch: claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC"
echo "Target: main"
echo ""

# Try to create PR using gh CLI
if command -v gh &> /dev/null; then
    gh pr create \
        --base main \
        --head claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC \
        --title "feat: Add comprehensive enterprise features to ISTANI fitness platform" \
        --body-file .pr-body.md
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Pull Request created successfully!"
        echo ""
        echo "🔄 Enabling auto-merge..."
        PR_NUMBER=$(gh pr list --head claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC --json number --jq '.[0].number')
        if [ ! -z "$PR_NUMBER" ]; then
            gh pr merge $PR_NUMBER --auto --squash
            echo "✅ Auto-merge enabled!"
        fi
    fi
else
    echo "❌ GitHub CLI (gh) not found."
    echo ""
    echo "📋 Manual PR creation:"
    echo "   URL: https://github.com/sano1233/istani/compare/main...claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC"
    echo ""
    echo "Or install gh CLI:"
    echo "   https://cli.github.com/"
fi
