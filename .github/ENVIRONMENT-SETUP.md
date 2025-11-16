# Unified Environment Setup

This repository uses a unified GitHub environment called `unified-software-automated-developer-and-deployer` for all automated development and deployment operations.

## Environment URL
[Configure Environment](https://github.com/sano1233/istani/settings/environments/9873530056/edit)

## Required Secrets

The following secrets must be configured in the unified environment:

### 1. GEMINI_API_KEY
- **Purpose**: Google Gemini AI API access
- **Used by**: `ai-brain/gemini-helper.js`
- **Required for**: AI-powered PR analysis and conflict resolution
- **How to obtain**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. ANTHROPIC_API_KEY
- **Purpose**: Anthropic Claude AI API access
- **Used by**: `ai-brain/claude-helper.js`
- **Required for**: AI-powered PR review and analysis
- **How to obtain**: Get from [Anthropic Console](https://console.anthropic.com/)

### 3. QWEN_API_KEY
- **Purpose**: Alibaba Qwen AI API access
- **Used by**: `ai-brain/qwen-helper.js`
- **Required for**: AI-powered PR review and analysis
- **How to obtain**: Get from [Alibaba Cloud DashScope](https://dashscope.aliyuncs.com/)

### 4. GITHUB_TOKEN
- **Purpose**: GitHub API access for PR operations
- **Used by**: GitHub Actions (automatically provided)
- **Required for**: PR checkout, commenting, approving, and merging
- **Note**: This is automatically provided by GitHub Actions, but the environment must have appropriate repository permissions

## Workflows Using This Environment

### AI Brain PR Handler (`.github/workflows/ai-brain.yml`)
- Automatically analyzes PRs using multiple AI models
- Auto-resolves merge conflicts
- Provides AI-powered reviews
- Auto-approves and merges PRs when 2+ AI models approve

## Setup Instructions

1. Navigate to the [environment settings](https://github.com/sano1233/istani/settings/environments/9873530056/edit)
2. Add each secret listed above with their respective API keys
3. Ensure the environment has access to the repository branches that need automation
4. Configure environment protection rules if needed (e.g., required reviewers for production deployments)

## Security Best Practices

- Never commit API keys to the repository
- Rotate API keys regularly
- Monitor API usage to detect unauthorized access
- Use environment protection rules for sensitive operations
- Review environment access logs periodically

## Troubleshooting

If workflows fail with authentication errors:
1. Verify all required secrets are configured
2. Check that API keys are valid and not expired
3. Ensure the environment name matches exactly: `unified-software-automated-developer-and-deployer`
4. Verify repository permissions for the environment

## Adding New Secrets

When adding new integrations that require secrets:
1. Add the secret to this unified environment
2. Update this documentation
3. Reference the secret in workflow files using `${{ secrets.SECRET_NAME }}`
4. Test in a non-production branch first
