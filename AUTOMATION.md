# 🤖 ISTANI Automated Deployment System

## Overview

The ISTANI repository is equipped with a **fully automated deployment pipeline** that handles PR creation, error resolution, and merging without manual intervention.

## 🚀 Automated Workflows

### 1. **Claude PR Creation** (`claude-create-pr.yml`)

**Trigger**: Push to `claude/**` branches

**What it does:**

- ✅ Automatically creates a PR when Claude pushes code
- ✅ Adds detailed deployment status and labels
- ✅ Posts informative comments about the automation pipeline
- ✅ Integrates seamlessly with auto-merge workflow

**Status**: ✅ Active

---

### 2. **Auto-Merge All PRs** (`auto-merge-all-prs.yml`)

**Trigger**:

- Every 6 hours (cron schedule)
- Manual trigger via workflow_dispatch

**What it does:**

- ✅ Discovers all open PRs
- ✅ Syncs each PR with base branch
- ✅ Applies ESLint auto-fixes
- ✅ Applies Prettier formatting
- ✅ Auto-resolves merge conflicts
- ✅ Runs tests and builds
- ✅ Automatically merges when all checks pass
- ✅ Posts status comments on PRs

**Features**:

- Processes up to 100 PRs
- Runs 3 PRs in parallel
- Squash merge by default
- 100% FREE - No API keys required

**Status**: ✅ Active

---

### 3. **Auto-Resolve Failures** (`auto-resolve-failures.yml`)

**Trigger**:

- When any workflow completes (on failure)
- Every 15 minutes (cron schedule)
- Manual trigger via workflow_dispatch

**What it does:**

- ✅ Detects failed workflow runs in last 24 hours
- ✅ Analyzes failure logs for common patterns
- ✅ Applies automatic fixes:
  - ESLint errors
  - Prettier formatting
  - Merge conflicts
  - Permission issues
  - Dependency issues
  - Network timeouts
- ✅ Retries failed workflow runs
- ✅ Resolves merge conflicts in open PRs
- ✅ Generates detailed status reports

**Failure Patterns Detected**:

1. Missing dependencies (`npm install`)
2. ESLint errors (auto-fix)
3. Prettier formatting (auto-format)
4. Merge conflicts (auto-resolve)
5. Deprecated dependencies (update)
6. Network timeouts (retry with backoff)
7. Permission issues (fix permissions)

**Status**: ✅ Active

---

## 📊 Complete Automation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Developer/Claude pushes to claude/* branch              │
└───────────────────┬─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. claude-create-pr.yml workflow triggers                  │
│     • Creates PR automatically                              │
│     • Adds labels and status comment                        │
└───────────────────┬─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. GitHub Actions CI runs                                  │
│     • npm ci                                                │
│     • npm run format:check                                  │
│     • npm run lint                                          │
│     • npm run typecheck                                     │
│     • npm run build                                         │
└───────────────────┬─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. auto-resolve-failures.yml (if CI fails)                 │
│     • Detects failure                                       │
│     • Analyzes error logs                                   │
│     • Applies auto-fixes                                    │
│     • Commits fixes                                         │
│     • Retries workflow                                      │
└───────────────────┬─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. auto-merge-all-prs.yml (runs every 6 hours)             │
│     • Discovers open PRs                                    │
│     • Syncs with base branch                                │
│     • Applies ESLint/Prettier fixes                         │
│     • Resolves conflicts                                    │
│     • Verifies build and tests                              │
│     • Auto-merges when checks pass                          │
└───────────────────┬─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Vercel deployment triggers                              │
│     • Automatically deploys to production                   │
│     • Uses environment variables from Vercel dashboard      │
│     • Builds with: npm run build                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### GitHub Actions Permissions

All workflows have these permissions:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
  checks: write
  actions: write
```

### Vercel Configuration

Location: `vercel.json`

```json
{
  "git": {
    "productionBranch": "main"
  },
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### Environment Variables Required

**In Vercel Dashboard** (for deployment):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ElevenLabs (Voice Agent)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_API_KEY=your-api-key

# USDA (Nutrition Data)
USDA_API_KEY=your-usda-key

# Images
PEXELS_API_KEY=your-pexels-key
UNSPLASH_ACCESS_KEY=your-unsplash-key (optional)

# Admin
ADMIN_REFRESH_TOKEN=your-admin-token
```

---

## 🎯 Benefits of This Setup

### 1. **Zero Manual Intervention**

- PRs are created automatically
- Errors are fixed automatically
- PRs are merged automatically
- Deployments happen automatically

### 2. **Always Up-to-Date**

- Code is automatically formatted (Prettier)
- Linting errors are auto-fixed (ESLint)
- Conflicts are auto-resolved
- Failed runs are automatically retried

### 3. **Cost-Effective**

- 100% FREE automation
- No paid API keys required
- Uses only GitHub Actions free tier
- Vercel free tier for hosting

### 4. **Robust Error Handling**

- Detects 7+ common failure patterns
- Automatically applies fixes
- Retries with exponential backoff
- Detailed logging and reporting

### 5. **High Velocity**

- Code goes from commit to production in minutes
- Multiple PRs processed in parallel
- Continuous integration and deployment
- No bottlenecks or manual approval delays

---

## 📈 Monitoring and Status

### Check Workflow Status

View all workflow runs at:

```
https://github.com/sano1233/istani/actions
```

### View PR Status

All PRs will have automated comments showing:

- ✅ Which checks have passed
- ⏳ Which checks are pending
- ❌ Which checks failed (with auto-fix attempts)
- 🔄 Merge status and next steps

### Manual Triggers

**Trigger Auto-Merge Manually**:

1. Go to: https://github.com/sano1233/istani/actions/workflows/auto-merge-all-prs.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Set dry_run: `false`
5. Click "Run workflow"

**Trigger Error Resolution Manually**:

1. Go to: https://github.com/sano1233/istani/actions/workflows/auto-resolve-failures.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"

---

## 🔒 Security

### Secrets Management

- All API keys stored in Vercel environment variables
- GitHub secrets used for workflow tokens
- No secrets committed to repository
- `.env.local` in `.gitignore`

### Auto-Fix Safety

- Only applies non-destructive fixes
- Preserves git history
- Creates new commits (never force pushes)
- Posts detailed logs of all changes

---

## 🚦 Current Status

| Component         | Status     | Details                      |
| ----------------- | ---------- | ---------------------------- |
| Build             | ✅ Passing | No errors                    |
| TypeCheck         | ✅ Passing | No type errors               |
| Lint              | ✅ Passing | Warnings only (non-blocking) |
| Auto-PR Creation  | ✅ Active  | For claude/\* branches       |
| Auto-Merge        | ✅ Active  | Runs every 6 hours           |
| Auto-Fix          | ✅ Active  | Runs every 15 minutes        |
| Vercel Deployment | ✅ Ready   | Configured and waiting       |

---

## 📝 Next Steps

1. **Set Environment Variables in Vercel**
   - Add all required keys from `.env.example`
   - Verify Supabase connection
   - Test Stripe integration
   - Configure ElevenLabs agent

2. **Connect Vercel to Repository**
   - Import `sano1233/istani` in Vercel dashboard
   - Select production branch: `main`
   - Auto-deploy will activate on merge

3. **Monitor First Deployment**
   - Watch for auto-merge to complete (max 6 hours)
   - Verify Vercel deployment succeeds
   - Test production URL
   - Verify all features work

---

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Review auto-merge comments on PRs
3. Verify environment variables in Vercel
4. Check Vercel deployment logs
5. Manually trigger workflows if needed

---

**Last Updated**: 2025-11-17
**System Status**: ✅ Fully Operational
**Automation Level**: 100% Automated
**Cost**: 100% FREE
