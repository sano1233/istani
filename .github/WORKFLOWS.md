# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for the ISTANI monorepo.

## Active Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:** Push to `main`, `develop`, or `claude/**` branches; Pull requests to `main` or `develop`

**Jobs:**
- **Lint and Type Check**: Runs linting and type checking across all packages
- **Build Packages**: Builds all packages using Turborepo, uploads build artifacts
- **Test**: Runs test suites across all packages
- **Fitness App Build**: Specifically builds the ISTANI Fitness App with Next.js

**Requirements:** None (uses placeholder env vars for builds)

### 2. Deploy Fitness App (`deploy-fitness-app.yml`)

**Triggers:** Push to `main` branch (only when fitness app files change); Manual workflow dispatch

**Jobs:**
- **Deploy**: Deploys the fitness app to Vercel production environment

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID for fitness app
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

**Setup Instructions:**
1. Create a Vercel account and project
2. Link the `packages/istani-fitness-app` directory to Vercel
3. Get your Vercel token from: https://vercel.com/account/tokens
4. Get Org and Project IDs by running: `vercel link` in the project directory
5. Add all secrets to GitHub repository settings

## Disabled Workflows

### AI Brain PR Handler (`ai-brain.yml`)

**Status:** Disabled (manual trigger only)

**Reason:** The required `ai-brain/pr-handler.js` file is not yet implemented

**To Enable:**
1. Create the `ai-brain/` directory in repository root
2. Implement `ai-brain/pr-handler.js` with PR analysis logic
3. Change workflow trigger from `workflow_dispatch` to `pull_request`

## Dependabot Configuration

Dependabot is configured to automatically update dependencies:

- **npm packages**: Root and fitness app packages updated weekly
- **GitHub Actions**: Actions updated weekly
- **Grouping**: Dependencies grouped by type for cleaner PRs

## Package-Specific Workflows

The following packages have their own `.github/workflows/` directories, but these workflows are **inactive** because GitHub Actions only reads workflows from the repository root:

- `packages/n8n/.github/workflows/` (43 workflows)
- `packages/claude-code-action/.github/workflows/` (11 workflows)
- `packages/claude-code/.github/workflows/` (14 workflows)
- `packages/cli/.github/workflows/` (15 workflows)
- `packages/ollama/.github/workflows/` (5+ workflows)

These workflows were preserved from the original repositories for reference but are not executed in the monorepo context.

## Adding New Workflows

To add new workflows:

1. Create workflow file in `.github/workflows/`
2. Use Node.js 20 for consistency
3. Leverage Turborepo for build orchestration
4. Add required secrets to repository settings
5. Test with manual workflow dispatch first
6. Document in this file

## Troubleshooting

### Build Failures

- **Missing dependencies**: Run `npm ci` in workflow
- **Build errors**: Check Turborepo configuration in `turbo.json`
- **Type errors**: Enable `typescript.ignoreBuildErrors` in Next.js config (already done)

### Deployment Failures

- **Vercel errors**: Verify all secrets are correctly set
- **Build timeouts**: Increase Vercel timeout in project settings
- **Environment variables**: Ensure all required env vars are in Vercel project settings

### Security Alerts

Dependabot will automatically create PRs for security vulnerabilities. Review and merge these promptly.

GitHub detected the following vulnerabilities in dependencies (as of latest push):
- 1 critical
- 4 moderate
- 2 low

View details at: https://github.com/sano1233/istani/security/dependabot
