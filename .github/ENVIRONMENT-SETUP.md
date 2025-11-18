# Unified Environment Setup

This repository uses a unified GitHub environment called `unified-software-automated-developer-and-deployer` for all automated development and deployment operations.

## Environment URL
[Configure Environment](https://github.com/sano1233/istani/settings/environments/9873530056/edit)

## Required Secrets

All secrets that power the unified agent must live inside the `unified-software-automated-developer-and-deployer` environment. Group them as follows:

### Core LLM Providers
- `GEMINI_API_KEY` – Google Gemini via AI Studio.
- `ANTHROPIC_API_KEY` – Claude 3.5 access.
- `OPENAI_API_KEY` – GPT-4.1/GPT-4o.
- `QWEN_API_KEY`, `QWEN3_CODER_API_KEY`, `QWEN_2_5_CODER_32_INSTRUCT_API_KEY` – DashScope (standard, Qwen3, and 2.5 Coder variants).
- `DEEPSEEK_API_KEY`, `TNG_TECH_DEEP_SEEK_API_KEY` – DeepSeek public and enterprise tenants.
- `MISTRAL_AI_API_KEY`, `MISTRAL_AI_DEV_STRALL_API_KEY` – Mistral production and developer (Strall) workspaces.
- `COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY`, `GLM_4_5_API_KEY`, `GROK_X_API_KEY`, `X_API_KEY` – partner LLMs and streaming inputs.

### Agentic / Coding / Voice Partners
- `ELEVEN_LABS_API_KEY`, `HERMES_LLAMA_API_KEY` – Voice and fine-tuned Llama models.
- `AGENTICA_API_KEY`, `AGENTICA_DEEP_CODER_API_KEY` – Agentica unified automation + deep coder routes.
- `CODE_RABBIT_API_KEY` – CodeRabbit PR review assistant.
- `KIMI_DEV_MOONSHOT_API_KEY`, `MICROSOFT_AI_CODER_API_KEY`, `MINIMAX_API_KEY`, `NVIDIA_NEMATRON_NANO_API_KEY` – additional coding copilots.
- `COHERE_API_KEY`, `HUGGINGFACE_API_KEY` – legacy inference fallbacks.

### Deployment & GitHub
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` – deploy previews and production promotions.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` – backend storage access.
- `GITHUB_TOKEN` – main PAT (automatically supplied to workflows but still declared for environment scoping).
- `GITHUB_API_KEY` – alias exported for Cursor/Vercel compatibility (should mirror `GITHUB_TOKEN`).

> 💡 Run `./setup-secrets.sh` locally to see a full checklist of the 30+ keys and confirm your `.env.local` matches the GitHub environment.

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
