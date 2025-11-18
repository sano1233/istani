# Complete Automation System

This automation system connects all your GitHub repositories to `sano1233/istani` with full auto-fix, auto-merge, and auto-deploy capabilities.

## Features

### 🔄 Auto-Sync
- Automatically syncs all repositories to `sano1233/istani`
- Runs every 15 minutes via GitHub Actions
- Tracks sync status in Supabase

### 🤖 Auto-Fix
- Automatically detects and fixes code errors
- TypeScript error resolution
- ESLint auto-fixing
- Import path corrections
- Missing dependency installation
- AI-powered complex error resolution

### 🔀 Auto-Merge
- Automatically merges PRs when:
  - All checks pass
  - No conflicts exist
  - Code is mergeable
- Supports squash, merge, and rebase strategies

### 🚀 Auto-Deploy
- Automatically deploys after successful merge
- Supports Vercel deployment
- Triggers Supabase webhooks
- Creates deployment status

### 🔗 Integrations

#### N8N
- Webhook-based workflow automation
- Repository event processing
- Custom automation workflows

#### HyperSwitch
- Unified payment processing
- Webhook handling for payment events
- Multi-repository payment management

#### Supabase
- Event logging
- Sync tracking
- Deployment history
- Payment event storage

## Setup

### 1. Initial Setup

```bash
# Run the setup script
chmod +x scripts/setup-automation.sh
./scripts/setup-automation.sh
```

### 2. GitHub Secrets

Configure these secrets in your repository settings (`Settings > Secrets and variables > Actions`):

- `GITHUB_TOKEN` - Auto-generated, no action needed
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `N8N_WEBHOOK_URL` - Your n8n webhook URL (optional)
- `HYPERSWITCH_API_KEY` - HyperSwitch API key (optional)
- `HYPERSWITCH_WEBHOOK_SECRET` - HyperSwitch webhook secret (optional)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# N8N (optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/github

# HyperSwitch (optional)
HYPERSWITCH_API_KEY=your_hyperswitch_api_key
HYPERSWITCH_API_URL=https://api.hyperswitch.io
HYPERSWITCH_WEBHOOK_SECRET=your_webhook_secret

# GitHub
GITHUB_TOKEN=your_github_token
```

### 4. Supabase Migrations

Run the automation tables migration:

```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/002_automation_tables.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

### 5. N8N Workflow (Optional)

1. Import the workflow:
   - Go to your n8n instance
   - Click "Import from File"
   - Select `n8n-workflows/repo-automation.json`
   - Configure webhook credentials

2. Set up webhook:
   - Copy the webhook URL
   - Add it to GitHub Secrets as `N8N_WEBHOOK_URL`
   - Configure in GitHub repository webhooks

### 6. HyperSwitch Setup (Optional)

```bash
# Setup HyperSwitch integration
node scripts/hyperswitch-integration.js setup

# Create webhook
node scripts/hyperswitch-integration.js webhook https://your-domain.com/api/hyperswitch/webhook
```

## Usage

### Manual Repository Sync

```bash
# Sync a specific repository
node scripts/sync-repo.js sano1233/repo-name

# Sync all repositories (via GitHub Actions)
gh workflow run repo-sync.yml
```

### Manual Auto-Fix

```bash
# Run auto-fix on current repository
node ai-brain/enhanced-auto-fix.js

# Or use the original scanner
node ai-brain/auto-fix-system.js scan
```

### Manual PR Handling

```bash
# Auto-resolve conflicts and merge PR
node ai-brain/pr-handler.js <PR_NUMBER>
```

### Deploy All Repositories

```bash
# Deploy all connected repositories
./scripts/deploy-all-repos.sh
```

## Workflow Details

### Auto-Fix Workflow

1. **Trigger**: PR opened, updated, or ready for review
2. **Actions**:
   - Run linter with auto-fix
   - Fix TypeScript errors
   - Resolve import issues
   - Install missing dependencies
   - Format code
3. **Result**: Commits fixes automatically

### Auto-Resolve Conflicts

1. **Trigger**: PR with merge conflicts
2. **Actions**:
   - Attempts merge with base branch
   - Detects conflicts
   - Uses AI to resolve conflicts
   - Commits resolved code
3. **Result**: PR becomes mergeable

### Auto-Merge

1. **Trigger**: PR is mergeable and checks pass
2. **Actions**:
   - Checks PR status
   - Verifies all checks pass
   - Merges PR (squash by default)
3. **Result**: PR merged to main branch

### Auto-Deploy

1. **Trigger**: PR merged to main/master
2. **Actions**:
   - Builds application
   - Deploys to Vercel
   - Triggers Supabase webhook
   - Creates deployment status
3. **Result**: Application deployed to production

### Repository Sync

1. **Trigger**: Every 15 minutes (cron) or manually
2. **Actions**:
   - Fetches all repositories
   - Clones/updates each repo
   - Syncs files to `synced-repos/` directory
   - Updates sync log
3. **Result**: All repos synced to istani

## Monitoring

### Supabase Dashboard

View automation logs in Supabase:

- `n8n_events` - N8N webhook events
- `repository_syncs` - Repository sync history
- `auto_fixes` - Auto-fix history
- `deployments` - Deployment history
- `hyperswitch_events` - Payment events
- `repository_connections` - Repository connection config

### GitHub Actions

Monitor workflows at:
```
https://github.com/sano1233/istani/actions
```

### N8N Dashboard

View workflow executions in your n8n instance.

## Troubleshooting

### Auto-Fix Not Working

1. Check GitHub Actions logs
2. Verify Node.js version (20+)
3. Check for missing dependencies
4. Review auto-fix logs in Supabase

### Auto-Merge Not Triggering

1. Verify PR is mergeable
2. Check all required checks pass
3. Review GitHub Actions permissions
4. Check workflow conditions

### Deployment Failing

1. Verify Vercel credentials
2. Check build logs
3. Verify environment variables
4. Check deployment status in Supabase

### Repository Sync Issues

1. Verify GitHub token permissions
2. Check repository access
3. Review sync logs in Supabase
4. Check disk space

## Customization

### Change Sync Schedule

Edit `.github/workflows/repo-sync.yml`:

```yaml
schedule:
  - cron: '*/15 * * * *' # Change to your preferred schedule
```

### Customize Auto-Fix Rules

Edit `ai-brain/enhanced-auto-fix.js` to add custom fix logic.

### Customize Merge Strategy

Edit `.github/workflows/auto-fix-and-merge.yml`:

```yaml
gh pr merge $PR_NUMBER --squash --auto  # Change to --merge or --rebase
```

## Security

- All secrets stored in GitHub Secrets
- Webhook signatures verified
- Service role used for Supabase operations
- RLS policies enabled on automation tables

## Support

For issues or questions:
- GitHub Issues: https://github.com/sano1233/istani/issues
- Check logs in Supabase
- Review GitHub Actions logs

---

**Built with ❤️ for automated development workflows**
