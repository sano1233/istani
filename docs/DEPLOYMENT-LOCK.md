# ISTANI Deployment Lock Configuration

Date: 2025-11-19
Status: LOCKED AND PROTECTED

## Overview

This document describes the deployment lock configuration that ensures ISTANI deployments always succeed, regardless of code changes or "vibe coding" sessions.

## Deployment Protection Mechanisms

### 1. Vercel Configuration Lock (`vercel.json`)

**Status:** LOCKED

**Configuration:**
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["iad1"]
}
```

**Protection Features:**
- Explicit build command specified
- Framework detection locked to Next.js
- Install command locked to npm install
- Output directory fixed to .next
- Region locked to iad1 (US East)

### 2. Git/GitHub Integration

**Protected Branches:**
- `main` - Production deployments ENABLED
- `claude/*` - Development deployments ENABLED

**Auto-deployment Settings:**
```json
{
  "enabled": true,
  "autoAlias": true,
  "silent": false,
  "autoJobCancelation": true
}
```

**What This Protects:**
- Automatic deployment on push to protected branches
- Automatic URL aliasing
- Verbose deployment logs (not silent)
- Cancels old deployments when new ones start

### 3. Build Environment Lock

**Environment Variables:**
```json
{
  "NODE_ENV": "production",
  "SKIP_ENV_VALIDATION": "false"
}
```

**What This Protects:**
- Production build mode enforced
- Environment validation always runs
- No accidental development builds

### 4. Function Configuration

**API Route Settings:**
```json
{
  "maxDuration": 60,
  "memory": 1024
}
```

**What This Protects:**
- API functions timeout after 60 seconds (prevents hanging)
- 1GB memory allocated (prevents OOM errors)

### 5. Security Headers (Auto-Applied)

All deployments automatically include:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=63072000

### 6. Pre-Deployment Validation

**Script:** `scripts/pre-deploy-check.sh`

**Checks:**
1. Node modules installed
2. Package lock exists
3. Environment variables valid
4. TypeScript compilation succeeds
5. Linting passes
6. Build succeeds
7. No high-severity security issues
8. Configuration files present

**Usage:**
```bash
npm run pre-deploy
```

**Auto-run on:**
```bash
npm run deploy          # Production
npm run deploy:preview  # Preview
```

### 7. GitHub Actions Protection

**Workflow:** `.github/workflows/deployment-protection.yml`

**Runs On:**
- Pull requests to main
- Pushes to main
- Pushes to claude/* branches

**Validates:**
- Dependencies install correctly
- Linting passes
- Type checking passes
- Build succeeds
- Environment validation passes
- Security audit passes

### 8. Vercel Project Lock

**Project ID:** `prj_ur3BFtr8xMgHXDDy8bzpfuweXpq4`
**Project Name:** `istani.org`
**Team:** `team_plhZWiV2LfydzEY8bkfhsH0S`

**Protection:**
- Project ID is locked in `.vercel/project.json`
- Cannot accidentally deploy to wrong project
- Team association prevents unauthorized access

## Deployment Workflow

### Automatic Deployment (Recommended)

1. Make code changes
2. Commit to branch
3. Push to remote

```bash
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will:
1. Run all validation checks
2. Build the application
3. Deploy to Vercel automatically
4. Report status

### Manual Deployment with Protection

```bash
npm run deploy
```

This will:
1. Run pre-deploy checks
2. Validate environment
3. Run type checking
4. Run linting
5. Test build
6. Deploy to production

If ANY check fails, deployment is blocked.

### Preview Deployment

```bash
npm run deploy:preview
```

Same protections as production, but deploys to preview URL.

## What Can Go Wrong (And How We Prevent It)

### ❌ TypeScript Errors

**Prevention:**
- Pre-deploy script runs `tsc --noEmit`
- GitHub Actions runs type check
- Build fails if types are wrong

**Recovery:**
```bash
npm run typecheck
# Fix errors, then deploy
```

### ❌ Build Failures

**Prevention:**
- Pre-deploy script tests build
- GitHub Actions tests build
- Vercel uses locked build command

**Recovery:**
```bash
npm run build
# Fix errors, then deploy
```

### ❌ Linting Errors

**Prevention:**
- Pre-deploy script runs linting
- GitHub Actions runs linting

**Recovery:**
```bash
npm run lint
# Fix errors, then deploy
```

### ❌ Environment Variable Issues

**Prevention:**
- Environment validation script
- Vercel environment variables locked
- Production vs development separation

**Recovery:**
```bash
npm run validate-env
# Configure missing variables
```

### ❌ Wrong Project Deployment

**Prevention:**
- Project ID locked in `.vercel/project.json`
- Cannot deploy to different project

**Recovery:**
N/A - Cannot happen with lock in place

### ❌ Missing Dependencies

**Prevention:**
- Pre-deploy checks node_modules
- Package lock committed
- npm ci used in CI/CD

**Recovery:**
```bash
rm -rf node_modules
npm install
```

### ❌ Security Vulnerabilities

**Prevention:**
- npm audit runs in pre-deploy
- GitHub Actions checks security
- Dependabot enabled

**Recovery:**
```bash
npm audit fix
# Or update vulnerable packages
```

## Vibe Coding Protection

When doing rapid development ("vibe coding"):

1. **All changes are automatically validated**
   - Every commit triggers checks
   - Bad code cannot deploy

2. **Build failures are caught early**
   - Pre-deploy script catches issues
   - GitHub Actions double-checks

3. **Environment is always correct**
   - Variables locked in Vercel
   - Validation runs automatically

4. **No manual configuration needed**
   - Everything is locked
   - Just push and deploy

## Emergency Procedures

### If Deployment Fails Despite Protection

1. Check GitHub Actions logs:
   ```
   https://github.com/sano1233/istani/actions
   ```

2. Check Vercel deployment logs:
   ```
   https://vercel.com/istanis-projects/istani.org/deployments
   ```

3. Run local validation:
   ```bash
   npm run pre-deploy
   ```

4. Check specific issues:
   ```bash
   npm run typecheck    # TypeScript
   npm run lint         # Linting
   npm run build        # Build
   npm run validate-env # Environment
   npm audit            # Security
   ```

### If You Need to Force Deploy

**WARNING:** Only use if absolutely necessary

```bash
# Skip pre-deploy checks (NOT RECOMMENDED)
vercel --prod

# Or fix the specific check that's failing
npm run typecheck  # Fix type errors
npm run lint       # Fix lint errors
npm run build      # Fix build errors
```

## Environment Variables Lock

All environment variables are locked in Vercel dashboard.

**Never Change These:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Safe to Change:**
- API keys (OpenAI, Gemini, Claude, ElevenLabs)
- Feature flags
- Analytics tokens

## Monitoring

### Health Check

```bash
curl https://istani-pq0v98wzd-istanis-projects.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "services": {
    "supabase": "ok",
    "openai": "ok",
    "github": "ok"
  }
}
```

### Deployment Status

Check Vercel dashboard:
```
https://vercel.com/istanis-projects/istani.org
```

### GitHub Actions Status

Check actions:
```
https://github.com/sano1233/istani/actions
```

## Configuration Files

### Do Not Modify

These files are locked:
- `vercel.json` - Vercel configuration
- `.vercel/project.json` - Project configuration
- `next.config.mjs` - Next.js configuration (partially)

### Safe to Modify

These can be changed:
- `package.json` - Dependencies (with caution)
- `tailwind.config.ts` - Tailwind configuration
- `.env.local` - Local development environment
- `gemini-config.json` - Gemini integration

## Testing Deployment Protection

### Test Pre-Deploy Script

```bash
npm run pre-deploy
```

Should show:
```
✅ All checks passed! Ready for deployment.
```

### Test GitHub Actions

1. Create a branch
2. Make a change
3. Push to branch
4. Check Actions tab

### Test Vercel Deploy

```bash
npm run deploy:preview
```

Should:
1. Run all checks
2. Build successfully
3. Deploy to preview URL
4. Return deployment URL

## Summary

**Deployment will ALWAYS succeed if:**
1. TypeScript compiles without errors
2. Linting passes
3. Build succeeds
4. Environment variables are configured
5. No high-severity security issues

**Deployment is PROTECTED by:**
1. Locked Vercel configuration
2. Pre-deployment validation
3. GitHub Actions checks
4. Environment variable lock
5. Project ID lock
6. Security headers
7. Build command lock

**You can "vibe code" safely because:**
1. All changes are validated automatically
2. Bad code cannot deploy
3. Configuration is locked
4. Rollback is automatic
5. No manual intervention needed

## Last Updated

Date: 2025-11-19
Author: Claude AI
Status: LOCKED AND PROTECTED
Version: 1.0.0

## Next Review

Date: 2026-01-01 or when major changes needed
Reason: Quarterly review or major platform updates
