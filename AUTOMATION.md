# 🤖 GitHub Automation System

Complete automation system for auto-fixing, auto-merging, and auto-deploying across all repositories connected to `sano1233/istani`.

## Features

- ✅ **Auto-Fix Code Errors**: Automatically fixes linting, formatting, and TypeScript errors
- ✅ **Auto-Resolve Conflicts**: Intelligently resolves merge conflicts using AI
- ✅ **Auto-Merge PRs**: Automatically merges PRs when checks pass and approvals are received
- ✅ **Auto-Deploy**: Deploys to Vercel, Supabase, and triggers webhooks for n8n and Hyperswitch
- ✅ **Repository Sync**: Syncs code across multiple GitHub repositories
- ✅ **Integration Support**: Works with n8n, Hyperswitch, and Supabase

## Quick Start

### 1. Setup

```bash
npm run setup:automation
```

Or manually:

```bash
chmod +x scripts/setup-automation.sh
./scripts/setup-automation.sh
```

### 2. Configure Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

**Required:**
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

**Optional (for deployments):**
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SUPABASE_ACCESS_TOKEN` - Supabase access token
- `SUPABASE_DB_PASSWORD` - Supabase database password
- `SUPABASE_PROJECT_ID` - Supabase project ID
- `N8N_WEBHOOK_URL` - n8n webhook URL for notifications
- `HYPERSWITCH_WEBHOOK_URL` - Hyperswitch webhook URL
- `GITHUB_WEBHOOK_SECRET` - Secret for webhook verification

### 3. Usage

#### Auto-Fix Code Issues

```bash
# Scan for issues
npm run auto-fix:scan

# Auto-fix all issues
npm run auto-fix
```

#### Handle Pull Requests

```bash
# Process a specific PR
npm run pr:handle <pr-number>
```

#### Sync Repositories

```bash
# Sync to default repository (sano1233/istani)
npm run integrations:sync

# Sync to specific repositories
node ai-brain/integrations.js sync sano1233/repo1 sano1233/repo2
```

#### Deploy

```bash
# Trigger deployment with integrations
npm run integrations:deploy
```

## GitHub Actions Workflows

### 1. Auto Fix (`auto-fix.yml`)

**Triggers:**
- Pull requests (opened, synchronized, reopened)
- Pushes to main/master/develop
- Manual workflow dispatch

**Actions:**
- Runs ESLint with auto-fix
- Checks TypeScript errors
- Formats code with Prettier
- Runs enhanced auto-fix system
- Commits fixes automatically

### 2. Auto Merge (`auto-merge.yml`)

**Triggers:**
- Pull requests (opened, synchronized, reopened, ready_for_review)
- PR reviews submitted
- Check suites completed

**Actions:**
- Runs tests and linting
- Builds the project
- Checks PR status and mergeability
- Auto-merges when conditions are met
- Handles conflicts automatically

### 3. Auto Deploy (`auto-deploy.yml`)

**Triggers:**
- Pushes to main/master
- Manual workflow dispatch

**Actions:**
- Builds the project
- Deploys to Vercel (if configured)
- Deploys Supabase migrations (if configured)
- Triggers n8n webhook
- Triggers Hyperswitch webhook
- Creates deployment status

### 4. Repository Sync (`repo-sync.yml`)

**Triggers:**
- Pushes to main/master
- Scheduled (every hour)
- Manual workflow dispatch

**Actions:**
- Syncs code to target repositories
- Supports multiple target repositories via matrix strategy

## Integration Scripts

### Integration Manager (`ai-brain/integrations.js`)

Handles communication with external services:

```javascript
const IntegrationManager = require('./ai-brain/integrations');

const manager = new IntegrationManager();

// Notify n8n
await manager.notifyN8N('pr_merged', { prNumber: 123 });

// Notify Hyperswitch
await manager.notifyHyperswitch('deployment', { sha: 'abc123' });

// Deploy Supabase migration
await manager.deploySupabaseMigration('migration.sql');

// Sync repositories
await manager.syncRepositories('source/repo', ['target/repo1', 'target/repo2']);
```

### Enhanced Auto-Fix (`ai-brain/enhanced-auto-fix.js`)

Comprehensive code quality and conflict resolution:

```bash
# Scan for issues
node ai-brain/enhanced-auto-fix.js scan

# Fix all issues
node ai-brain/enhanced-auto-fix.js fix

# Resolve conflicts
node ai-brain/enhanced-auto-fix.js conflicts
```

**Features:**
- Detects merge conflicts
- Auto-resolves conflicts intelligently
- Finds and fixes code quality issues
- Removes console.log statements
- Converts var to const/let
- Comments out TODO/FIXME markers
- Runs linter and type checker

### PR Handler (`ai-brain/pr-handler.js`)

Complete PR processing pipeline:

```bash
node ai-brain/pr-handler.js <pr-number>
```

**Process:**
1. Analyzes PR status and mergeability
2. Auto-resolves conflicts if present
3. Runs auto-fix system
4. Performs AI review (if helpers available)
5. Auto-approves and merges if conditions met
6. Notifies integrations

## Webhook Handler

The webhook handler at `/app/api/webhooks/github/route.ts` processes GitHub webhook events:

- `pull_request` - Handles PR events
- `push` - Triggers deployments
- `pull_request_review` - Checks for approvals
- `check_run` - Monitors check status

## Connecting Multiple Repositories

### Method 1: GitHub Actions Matrix

Edit `.github/workflows/repo-sync.yml`:

```yaml
strategy:
  matrix:
    target_repo:
      - sano1233/istani
      - sano1233/other-repo-1
      - sano1233/other-repo-2
```

### Method 2: Integration Script

```bash
node ai-brain/integrations.js sync sano1233/repo1 sano1233/repo2 sano1233/repo3
```

### Method 3: Environment Variables

Set `SYNC_TARGET_REPOS` environment variable:

```bash
export SYNC_TARGET_REPOS="sano1233/repo1,sano1233/repo2"
```

## Configuration

### Repository Settings

1. **Enable GitHub Actions**: Settings > Actions > General
2. **Set workflow permissions**: Allow read/write permissions
3. **Configure branch protection**: Require status checks for auto-merge

### Branch Protection Rules

For auto-merge to work, configure branch protection:

1. Go to Settings > Branches
2. Add rule for main/master branch
3. Require:
   - Status checks to pass
   - At least 1 approval (or disable if using AI approval)
   - Allow auto-merge

## Troubleshooting

### Auto-fix not working

- Check GitHub Actions logs
- Verify workflow permissions
- Ensure `GITHUB_TOKEN` has write access

### Auto-merge not triggering

- Verify branch protection rules
- Check PR mergeability status
- Ensure all required checks pass
- Verify PR is not in draft mode

### Deployment failing

- Check deployment service credentials
- Verify webhook URLs are correct
- Check service availability

### Repository sync failing

- Verify GitHub token has access to target repositories
- Check repository names are correct
- Ensure target repositories exist

## Advanced Usage

### Custom Auto-Fix Rules

Edit `ai-brain/enhanced-auto-fix.js` to add custom error detection patterns:

```javascript
const errorPatterns = [
  { pattern: /your-pattern/g, type: 'custom', fix: 'your-fix-strategy' },
];
```

### Custom Integration Handlers

Extend `IntegrationManager` class in `ai-brain/integrations.js`:

```javascript
class CustomIntegrationManager extends IntegrationManager {
  async customHandler(event, data) {
    // Your custom logic
  }
}
```

### Scheduled Tasks

Add cron jobs to workflows for scheduled tasks:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

## Security Considerations

- Never commit secrets to the repository
- Use GitHub Secrets for sensitive data
- Verify webhook signatures
- Limit workflow permissions to minimum required
- Review auto-merge conditions carefully

## Support

For issues or questions:
- Check GitHub Actions logs
- Review workflow files
- Test scripts locally first
- Open an issue on GitHub

---

**Built with ❤️ for automated development workflows**
