# 🤖 GitHub Automation Quick Reference

## Workflow Files

### 1. `auto-fix.yml`
- **When**: PR opened/updated, push to main/master/develop
- **What**: Auto-fixes linting, formatting, TypeScript errors
- **Auto-commits**: Yes (if fixes found)

### 2. `auto-merge.yml`
- **When**: PR ready, reviews submitted, checks complete
- **What**: Auto-merges PRs when conditions met
- **Requirements**: All checks pass, PR approved/mergeable

### 3. `auto-deploy.yml`
- **When**: Push to main/master
- **What**: Deploys to Vercel, Supabase, triggers webhooks
- **Integrations**: n8n, Hyperswitch, Supabase

### 4. `repo-sync.yml`
- **When**: Push to main/master, hourly schedule
- **What**: Syncs code to target repositories
- **Target**: sano1233/istani (configurable)

### 5. `sync-from-repos.yml`
- **When**: Repository dispatch, manual trigger
- **What**: Syncs FROM other repositories TO this one
- **Use case**: Multi-repo synchronization

### 6. `ci.yml`
- **When**: PR opened/updated, push
- **What**: Runs tests, linting, type checking, build
- **Purpose**: Quality assurance

## Scripts

### Enhanced Auto-Fix (`ai-brain/enhanced-auto-fix.js`)
```bash
node ai-brain/enhanced-auto-fix.js scan      # Scan for issues
node ai-brain/enhanced-auto-fix.js fix        # Fix all issues
node ai-brain/enhanced-auto-fix.js conflicts  # Resolve conflicts
```

### PR Handler (`ai-brain/pr-handler.js`)
```bash
node ai-brain/pr-handler.js <pr-number>      # Process PR
```

### Integrations (`ai-brain/integrations.js`)
```bash
node ai-brain/integrations.js n8n <event>           # Notify n8n
node ai-brain/integrations.js hyperswitch <event>  # Notify Hyperswitch
node ai-brain/integrations.js sync [repos...]      # Sync repos
node ai-brain/integrations.js deploy [sha] [ref]   # Deploy
```

## Environment Variables

### Required
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions

### Optional (for deployments)
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
- `N8N_WEBHOOK_URL`
- `HYPERSWITCH_WEBHOOK_URL`
- `GITHUB_WEBHOOK_SECRET`

## Setup Checklist

- [ ] Run `npm run setup:automation`
- [ ] Configure GitHub Secrets
- [ ] Enable GitHub Actions in repository settings
- [ ] Set workflow permissions (read/write)
- [ ] Configure branch protection rules
- [ ] Test with a sample PR
- [ ] Verify webhook endpoints (if using)
- [ ] Configure target repositories for sync

## Troubleshooting

**Workflow not running?**
- Check Actions tab for errors
- Verify workflow file syntax (YAML)
- Check repository settings > Actions

**Auto-merge not working?**
- Verify branch protection rules
- Check PR mergeability status
- Ensure all required checks pass

**Deployment failing?**
- Verify service credentials
- Check webhook URLs
- Review deployment logs

**Sync not working?**
- Verify GitHub token permissions
- Check repository names
- Ensure target repos exist

## Support

See [AUTOMATION.md](../../AUTOMATION.md) for detailed documentation.
