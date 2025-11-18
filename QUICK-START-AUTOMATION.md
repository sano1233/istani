# Quick Start: Complete Automation Setup

Get your entire GitHub organization connected to `sano1233/istani` with full automation in 5 minutes!

## 🚀 One-Command Setup

```bash
# Run the complete setup
./scripts/setup-automation.sh
```

This will:
- ✅ Install all dependencies
- ✅ Setup GitHub authentication
- ✅ Create necessary directories
- ✅ Configure automation system
- ✅ Prepare Supabase migrations

## 🔗 Connect All Repositories

```bash
# Connect all your repositories
export GITHUB_TOKEN=your_github_token
node scripts/connect-all-repos.js
```

This will:
- ✅ Set up webhooks for all repositories
- ✅ Enable GitHub Actions
- ✅ Connect to istani repository
- ✅ Save connection status

## ⚙️ Configure Secrets

Add these to GitHub Secrets (`Settings > Secrets and variables > Actions`):

### Required
- `GITHUB_TOKEN` - Auto-generated ✅
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase key

### Optional (for deployments)
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel org ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Optional (for integrations)
- `N8N_WEBHOOK_URL` - Your n8n webhook URL
- `HYPERSWITCH_API_KEY` - HyperSwitch API key

## 🗄️ Setup Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Run: `supabase/migrations/002_automation_tables.sql`
3. Verify tables are created

## ✅ Verify Setup

```bash
# Test auto-fix system
node ai-brain/auto-fix-system.js scan

# Test repository sync
node scripts/sync-repo.js sano1233/your-repo

# Check GitHub Actions
gh workflow list
```

## 🎯 What Happens Next?

Once set up, the system will automatically:

1. **Every 15 minutes**: Sync all repositories to istani
2. **On PR open**: Auto-fix code errors
3. **On conflicts**: Auto-resolve merge conflicts
4. **When ready**: Auto-merge PRs
5. **After merge**: Auto-deploy to production

## 📊 Monitor

- **GitHub Actions**: https://github.com/sano1233/istani/actions
- **Supabase Dashboard**: Check automation tables
- **N8N Dashboard**: View workflow executions (if configured)

## 🆘 Troubleshooting

### "GitHub CLI not authenticated"
```bash
gh auth login
```

### "No repositories found"
```bash
# Verify token has repo access
gh auth status
```

### "Supabase migration failed"
- Check Supabase project is active
- Verify service role key is correct
- Run migration manually in SQL Editor

### "Workflows not triggering"
- Check GitHub Actions are enabled
- Verify webhooks are set up
- Check repository permissions

## 📚 Full Documentation

See [README-AUTOMATION.md](./README-AUTOMATION.md) for complete documentation.

---

**Ready to automate? Run the setup script and you're done! 🎉**
