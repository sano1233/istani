# 🚀 ISTANI Deployment Checklist

**Branch**: `claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m`
**Status**: All fixes committed and pushed ✅
**Date**: 2025-11-17

---

## ✅ Step 1: Verify PR Creation

The `claude-create-pr.yml` workflow should have automatically created a PR when you pushed.

**Check if PR exists:**
1. Go to: https://github.com/sano1233/istani/pulls
2. Look for a PR from branch `claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m`

**If PR EXISTS** → ✅ Skip to Step 2
**If NO PR** → Create it manually:

### Create PR Manually
1. Visit: https://github.com/sano1233/istani/compare/main...claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m
2. Click "Create pull request"
3. Title: `Fix all deployment errors and prepare for automated deployment`
4. Body: Use the content from AUTOMATION.md or copy below:

```markdown
## Summary
This PR fixes all Vercel deployment errors, GitHub Actions CI failures, and prepares the repository for automated deployment.

## Changes Made
- ✅ Fixed build errors (installed lucide-react)
- ✅ Updated ESLint configuration for Next.js 15
- ✅ Added missing package.json scripts (typecheck, format:check)
- ✅ Enhanced Vercel configuration
- ✅ Updated environment variable templates
- ✅ Added automated PR creation workflow
- ✅ Created comprehensive automation documentation

## Test Results
- ✅ Build: PASSING
- ✅ TypeCheck: PASSING
- ✅ Lint: PASSING (warnings only, non-blocking)

## Automation
This PR will be automatically merged by the auto-merge system once all checks pass.

🤖 Created with Claude Code
```

5. Click "Create pull request"

---

## ✅ Step 2: Wait for CI Checks (or Monitor)

GitHub Actions CI will automatically run:
- `npm ci` - Install dependencies
- `npm run format:check` - Format validation
- `npm run lint` - Linting
- `npm run typecheck` - Type checking
- `npm run build` - Production build

**Monitor Progress:**
- Go to: https://github.com/sano1233/istani/actions
- Watch the CI workflow (should complete in ~2-5 minutes)

**Expected Result**: All checks pass ✅

---

## ✅ Step 3: Trigger Auto-Merge

You have **3 options**:

### Option A: Wait for Automatic Merge (Easiest)
The `auto-merge-all-prs.yml` workflow runs every 6 hours. It will:
- Detect your PR
- Verify all checks pass
- Automatically merge it

**Timeline**: Within 6 hours (next scheduled run)

### Option B: Manually Trigger Auto-Merge (Recommended - Fastest)
1. Go to: https://github.com/sano1233/istani/actions/workflows/auto-merge-all-prs.yml
2. Click **"Run workflow"** button (top right)
3. **Use workflow from**: Select `main`
4. **dry_run**: Select `false`
5. Click **"Run workflow"** (green button)

**Timeline**: ~5-10 minutes

**What it does:**
- Discovers your open PR
- Applies ESLint/Prettier auto-fixes (if needed)
- Resolves any conflicts
- Verifies build passes
- Auto-merges to main

### Option C: Manual Merge (If You Prefer)
1. Go to your PR page
2. Wait for all checks to pass (green checkmarks)
3. Click **"Squash and merge"**
4. Confirm merge

**Timeline**: Immediate (after checks pass)

---

## ✅ Step 4: Connect Vercel to GitHub Repository

After the PR is merged to `main`, set up Vercel deployment:

### 4.1 Import Repository to Vercel
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **`sano1233/istani`**
4. Click **"Import"**

### 4.2 Configure Build Settings
Vercel should auto-detect these settings (verify they match):

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### 4.3 Set Production Branch
- **Production Branch**: `main`

---

## ✅ Step 5: Add Environment Variables in Vercel

**CRITICAL**: Add these environment variables in Vercel dashboard before deploying.

### 5.1 Navigate to Environment Variables
1. In your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left sidebar

### 5.2 Add Required Variables

Copy these from your actual values (replace placeholders):

#### Supabase (Required)
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
⚠️ SECRET - Never expose to browser
```

#### Stripe (Required for payments)
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_... (or pk_live_... for production)
Environment: Production, Preview, Development
```

```
Name: STRIPE_SECRET_KEY
Value: sk_test_... (or sk_live_... for production)
Environment: Production, Preview, Development
⚠️ SECRET
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
Environment: Production, Preview, Development
⚠️ SECRET
```

#### ElevenLabs (For voice agent)
```
Name: NEXT_PUBLIC_ELEVENLABS_AGENT_ID
Value: your-agent-id-from-elevenlabs-dashboard
Environment: Production, Preview, Development
```

```
Name: ELEVENLABS_API_KEY
Value: your-elevenlabs-api-key
Environment: Production, Preview, Development
⚠️ SECRET
```

#### USDA (For nutrition data)
```
Name: USDA_API_KEY
Value: your-usda-api-key
Environment: Production, Preview, Development
Get free key: https://fdc.nal.usda.gov/api-key-signup.html
```

#### Images (Required)
```
Name: PEXELS_API_KEY
Value: your-pexels-api-key
Environment: Production, Preview, Development
Get free key: https://www.pexels.com/api/
```

```
Name: UNSPLASH_ACCESS_KEY
Value: your-unsplash-access-key (optional)
Environment: Production, Preview, Development
Get free key: https://unsplash.com/developers
```

#### Admin (Optional)
```
Name: ADMIN_REFRESH_TOKEN
Value: change-me-to-secure-random-string
Environment: Production, Preview, Development
```

### 5.3 Quick API Key Setup Links

If you don't have API keys yet:

- **Supabase**: Already have project at https://supabase.com/dashboard
- **Stripe**: https://dashboard.stripe.com/apikeys
- **ElevenLabs**: https://elevenlabs.io/app/speech-synthesis
- **USDA FoodData**: https://fdc.nal.usda.gov/api-key-signup.html (FREE)
- **Pexels**: https://www.pexels.com/api/ (FREE)
- **Unsplash**: https://unsplash.com/developers (FREE, optional)

---

## ✅ Step 6: Deploy to Production

After environment variables are set:

### Option A: Automatic Deployment (When PR Merges)
Vercel will automatically deploy when your PR merges to `main`.

**Timeline**: ~2-5 minutes after merge

### Option B: Manual Trigger (If Needed)
1. Go to Vercel dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on latest deployment

---

## ✅ Step 7: Verify Deployment

Once deployed, verify everything works:

### 7.1 Check Deployment Status
1. In Vercel dashboard, check deployment status
2. Should see: **"Ready"** with green checkmark
3. Note your production URL: `https://your-project.vercel.app`

### 7.2 Test Core Features
Visit your production URL and test:

- ✅ Homepage loads
- ✅ User registration/login works (Supabase)
- ✅ Stripe checkout flow works
- ✅ Image gallery loads (Pexels API)
- ✅ Nutrition data works (USDA API)
- ✅ ElevenLabs voice agent works (if integrated)

### 7.3 Check Browser Console
- Open DevTools (F12)
- Check Console for errors
- Verify no API key errors
- Check Network tab for failed requests

---

## ✅ Step 8: Set Up Custom Domain (Optional)

If you have a custom domain:

1. Go to Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `istani.org`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (~24 hours max)

---

## 📊 Checklist Summary

Use this to track your progress:

- [ ] **Step 1**: Verify PR exists (or create manually)
- [ ] **Step 2**: Wait for CI checks to pass (~2-5 min)
- [ ] **Step 3**: Trigger auto-merge (or wait 6 hours)
- [ ] **Step 4**: Import repository to Vercel
- [ ] **Step 5**: Add all environment variables in Vercel
- [ ] **Step 6**: Verify deployment succeeds
- [ ] **Step 7**: Test all features on production URL
- [ ] **Step 8**: Set up custom domain (optional)

---

## 🔧 Troubleshooting

### Build Fails in Vercel
- Check Vercel build logs for specific error
- Verify all environment variables are set
- Ensure `NEXT_PUBLIC_*` variables are spelled correctly
- Check that values don't have trailing spaces

### Supabase Connection Fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` matches your project URL
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public key (not service role)
- Ensure RLS policies are configured in Supabase

### Stripe Payment Fails
- Verify you're using matching keys (both test or both live)
- Check webhook secret matches Stripe dashboard
- Ensure webhook endpoint is configured: `https://your-domain.vercel.app/api/webhooks/stripe`

### Images Don't Load
- Verify `PEXELS_API_KEY` is set correctly
- Check API key is active on Pexels dashboard
- Look for rate limit errors in console

### Auto-Merge Doesn't Trigger
- Manually trigger via: https://github.com/sano1233/istani/actions/workflows/auto-merge-all-prs.yml
- Check workflow logs for errors
- Verify PR is in "open" state with passing checks

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **GitHub Actions**: https://github.com/sano1233/istani/actions

---

## 🎉 Success Criteria

You'll know everything is working when:

✅ PR is merged to `main`
✅ Vercel deployment shows "Ready"
✅ Production URL loads without errors
✅ Can register/login users
✅ Stripe checkout works
✅ All API integrations function
✅ No console errors in browser

---

**Last Updated**: 2025-11-17
**Estimated Total Time**: 15-30 minutes (plus up to 6 hours if waiting for auto-merge)

---

## 🚀 Quick Start (Fastest Path)

**For immediate deployment:**

1. ✅ Create PR manually (if not auto-created): https://github.com/sano1233/istani/compare/main...claude/fix-deployment-errors-012e2iWFeSURxjVPD4mB5D7m
2. ✅ Wait for CI (~2 min)
3. ✅ Trigger auto-merge: https://github.com/sano1233/istani/actions/workflows/auto-merge-all-prs.yml
4. ✅ Import to Vercel: https://vercel.com/new
5. ✅ Add environment variables (see Step 5.2 above)
6. ✅ Deploy and test!

**Total time**: ~15-20 minutes
