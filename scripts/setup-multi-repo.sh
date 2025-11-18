#!/bin/bash

set -e

echo "🚀 Setting up Multi-Repository Automation"
echo "==========================================="

# Configuration
TARGET_REPOS=(
  "sano1233/istani"
  # Add more repositories here
)

SOURCE_REPO="${GITHUB_REPOSITORY:-$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')}"

echo "Source Repository: $SOURCE_REPO"
echo "Target Repositories:"
for repo in "${TARGET_REPOS[@]}"; do
  echo "  - $repo"
done

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) not found. Installing..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update
    sudo apt install gh -y
fi

# Authenticate
echo "🔐 Authenticating with GitHub..."
gh auth status || gh auth login

# Setup workflows for each target repository
for TARGET_REPO in "${TARGET_REPOS[@]}"; do
    echo ""
    echo "📦 Setting up $TARGET_REPO..."
    echo "----------------------------------------"
    
    # Clone or update repository
    REPO_NAME=$(echo $TARGET_REPO | cut -d'/' -f2)
    if [ -d "/tmp/$REPO_NAME" ]; then
        echo "Updating existing clone..."
        cd "/tmp/$REPO_NAME"
        git pull || true
    else
        echo "Cloning repository..."
        gh repo clone "$TARGET_REPO" "/tmp/$REPO_NAME" || {
            echo "⚠️  Could not clone $TARGET_REPO, skipping..."
            continue
        }
        cd "/tmp/$REPO_NAME"
    fi
    
    # Copy workflow files
    echo "Copying workflow files..."
    mkdir -p .github/workflows
    
    # Copy workflows from source (if they exist)
    if [ -d "$(pwd)/../../.github/workflows" ]; then
        cp -r "$(pwd)/../../.github/workflows/"* .github/workflows/ 2>/dev/null || true
    fi
    
    # Update repo-sync.yml with correct target
    if [ -f ".github/workflows/repo-sync.yml" ]; then
        sed -i "s|target_repo:.*|target_repo: $TARGET_REPO|g" .github/workflows/repo-sync.yml || true
    fi
    
    # Commit and push changes
    git config user.name "GitHub Actions Bot" || true
    git config user.email "actions@github.com" || true
    
    git add .github/workflows/ || true
    git commit -m "🤖 Add automation workflows" || echo "No changes to commit"
    git push || echo "Could not push changes"
    
    echo "✅ $TARGET_REPO setup complete"
    cd - > /dev/null
done

echo ""
echo "✅ Multi-repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure secrets in each repository"
echo "2. Enable GitHub Actions in repository settings"
echo "3. Test workflows by creating a PR"
