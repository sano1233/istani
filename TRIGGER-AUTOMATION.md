# Trigger Automation Guide

## 🚀 Quick Start: Create PR and Trigger Auto-Merge

### Step 1: Push Your Branch

```bash
# Ensure you're on the correct branch
git checkout claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m

# Push to remote
git push origin claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m
```

### Step 2: Create Pull Request

1. **Go to GitHub PRs**: https://github.com/sano1233/istani/pulls
2. **Click "New Pull Request"**
3. **Select branches**:
   - Base: `main`
   - Compare: `claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m`
4. **Fill in PR details**:
   - Title: `fix: Resolve all deployment errors and merge automated deploy`
   - Description:

     ```markdown
     ## ✅ All Deployment Errors Resolved

     This PR consolidates all deployment fixes and resolves build errors.

     ### Changes

     - ✅ Fixed missing dependencies (lucide-react, prettier)
     - ✅ Resolved all build errors
     - ✅ Fixed TypeScript type imports
     - ✅ Updated CI/CD workflows for claude/\*\* branches
     - ✅ Fixed SSR issues in checkout page
     - ✅ Updated ESLint configuration
     - ✅ Added comprehensive documentation

     ### Verification

     - ✅ Build passes (26 pages generated)
     - ✅ TypeScript type checking passes
     - ✅ All dependencies installed
     - ✅ CI/CD workflows configured

     ### Ready for Auto-Merge

     - All checks should pass
     - Auto-merge workflows are active
     - Ready for production deployment
     ```

5. **Click "Create Pull Request"**

### Step 3: Trigger Auto-Merge

#### Option A: Automatic (Recommended)

The automated workflows will automatically:

1. Run CI checks
2. Apply auto-fixes
3. Merge when all checks pass

**Just wait!** The workflows run automatically on PR creation.

#### Option B: Manual Trigger via Comment

If you want to manually trigger, add a comment to the PR:

```
/merge
```

Or:

```
/fix
```

#### Option C: Manual Workflow Dispatch

1. Go to **Actions** tab: https://github.com/sano1233/istani/actions
2. Find workflow: **"🔀 Auto-Merge All Open PRs (FREE)"**
3. Click **"Run workflow"**
4. Select branch: `claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m`
5. Click **"Run workflow"**

### Step 4: Monitor Progress

1. **Check PR Status**: https://github.com/sano1233/istani/pulls
2. **View Actions**: https://github.com/sano1233/istani/actions
3. **Check PR Comments**: The bot will comment on progress

## 🔧 Troubleshooting

### PR Not Auto-Merging?

1. **Check CI Status**
   - Go to PR page
   - Look for check status (green ✅ or red ❌)
   - If red, click to see errors

2. **Check Workflow Runs**
   - Go to Actions tab
   - Look for failed workflows
   - Click to see error logs

3. **Common Issues**

   **Issue**: Build fails

   ```bash
   # Fix locally
   npm install
   npm run build
   npm run typecheck

   # Commit and push
   git add .
   git commit -m "fix: Resolve build errors"
   git push
   ```

   **Issue**: TypeScript errors

   ```bash
   # Check types
   npm run typecheck

   # Fix errors, then commit and push
   git add .
   git commit -m "fix: Resolve TypeScript errors"
   git push
   ```

   **Issue**: Linting errors

   ```bash
   # Auto-fix
   npm run lint -- --fix

   # Commit and push
   git add .
   git commit -m "fix: Resolve linting errors"
   git push
   ```

   **Issue**: Merge conflicts

   ```bash
   # Update from main
   git fetch origin
   git merge origin/main

   # Resolve conflicts, then
   git add .
   git commit -m "fix: Resolve merge conflicts"
   git push
   ```

### Workflow Not Running?

1. **Check Workflow File**
   - Ensure `.github/workflows/auto-merge-all-prs.yml` exists
   - Check it's enabled in Actions settings

2. **Check Permissions**
   - Go to Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is enabled

3. **Check Branch Protection**
   - Go to Settings → Branches
   - Ensure `main` branch allows auto-merge

### Environment Variables Missing?

All environment variables are configured at:
https://github.com/sano1233/istani/settings/environments/9873530056/edit

**Required Variables** (already configured):

- ✅ SUPABASE_PROJECT_URL
- ✅ SUPABASE_ANON_PUBLIC
- ✅ SUPABASE_SERVICE_ROLE_SECRECT
- ✅ VERCEL_PROJECT_ID
- ✅ All AI API keys

## 📋 Checklist Before Creating PR

- [ ] Branch is pushed to remote
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] All changes committed
- [ ] Branch is up to date with main (if needed)

## 🎯 Expected Workflow Behavior

1. **PR Created** → CI workflow triggers
2. **CI Runs** → Build, typecheck, lint
3. **Auto-Fix Runs** → ESLint and Prettier fixes applied
4. **Checks Pass** → Auto-merge workflow triggers
5. **PR Merged** → Deployed to production

## 📞 Need More Help?

1. **Check Documentation**:
   - `BRANCH-CONSOLIDATION.md` - Branch details
   - `DEPLOYMENT-STATUS.md` - Deployment status
   - `QUICK-START-CONSOLIDATION.md` - Quick reference

2. **Check Workflow Files**:
   - `.github/workflows/auto-merge-all-prs.yml`
   - `.github/workflows/free-automated-review-merge.yml`
   - `.github/workflows/ci.yml`

3. **GitHub Actions Logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Check logs for specific errors

## 🚀 Quick Commands

```bash
# Push branch
git push origin claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m

# Check PR status (after creating)
gh pr view --web

# Trigger workflow manually
gh workflow run "auto-merge-all-prs.yml" --ref claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m

# Check workflow status
gh run list --workflow=auto-merge-all-prs.yml
```

---

**Last Updated**: 2025-01-27  
**Branch**: `claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m`  
**Status**: ✅ Ready for PR creation and auto-merge
