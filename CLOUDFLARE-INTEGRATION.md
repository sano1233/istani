# Cloudflare Integration - Automated Deployment & Cache Management

Complete guide for automated Cloudflare CDN integration with ISTANI deployment pipeline.

## 🎯 Overview

This integration provides:

- ✅ **Automated cache purging** on deployment
- ✅ **Manual cache control** via API endpoints
- ✅ **GitHub Actions workflow** for CI/CD integration
- ✅ **Script-based management** for local/manual operations
- ✅ **TypeScript library** for programmatic access

## 📋 Prerequisites

1. **Cloudflare Account** (Free tier works!)
2. **Domain added to Cloudflare**
3. **API Token with permissions:**
   - Zone:Cache Purge (Edit)
   - Zone:Zone (Read)
   - Zone:Zone Settings (Read)

## 🚀 Quick Start

### Step 1: Get Cloudflare Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Copy **Zone ID** from the Overview page (right sidebar)
4. Go to **My Profile → API Tokens**
5. Click **Create Token**
6. Use **"Edit zone DNS"** template or create custom token with:
   - Zone:Cache Purge (Edit)
   - Zone:Zone (Read)
   - Zone:Zone Settings (Read)
7. Copy the **API Token** (save it securely!)
8. Copy your **Account ID** from the URL or Account page

### Step 2: Set Environment Variables

**For Vercel:**

```bash
# Add these in Vercel Dashboard → Settings → Environment Variables
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

**For Local Development:**

```bash
# Add to .env.local
CLOUDFLARE_API_TOKEN=VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-
CLOUDFLARE_ZONE_ID=your_zone_id_here
CLOUDFLARE_ACCOUNT_ID=8a96ac34caf00be04c7fa407efcefa85
NEXT_PUBLIC_SITE_URL=https://istani.org
```

### Step 3: Set GitHub Secrets

For automated workflows, add these secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ZONE_ID`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `NEXT_PUBLIC_SITE_URL`

### Step 4: Test the Integration

```bash
# Verify configuration
node scripts/purge-cloudflare-cache.js --verify

# Test cache purge
node scripts/purge-cloudflare-cache.js
```

## 🛠️ Usage

### 1. Automated Deployment (GitHub Actions)

The cache is **automatically purged** when:

- Code is pushed to `main` branch
- A Vercel deployment succeeds
- Manually triggered via workflow

**Manual Trigger:**

1. Go to **Actions** tab in GitHub
2. Select **"Cloudflare Cache Management"**
3. Click **"Run workflow"**
4. Choose options and run

### 2. Manual Script Execution

```bash
# Purge default pages (recommended after deployment)
node scripts/purge-cloudflare-cache.js

# Purge ALL cache (use with caution!)
node scripts/purge-cloudflare-cache.js --all

# Purge specific files
node scripts/purge-cloudflare-cache.js --files "https://istani.org/,https://istani.org/products"

# Verify configuration only
node scripts/purge-cloudflare-cache.js --verify
```

### 3. API Endpoint (Manual Cache Control)

**Endpoint:** `POST /api/cloudflare/purge`

**Authentication:** Bearer token (uses `ADMIN_REFRESH_TOKEN`)

**Examples:**

```bash
# Purge default pages
curl -X POST https://istani.org/api/cloudflare/purge \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"default"}'

# Purge specific pages
curl -X POST https://istani.org/api/cloudflare/purge \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"files",
    "files":["https://istani.org/","https://istani.org/dashboard"]
  }'

# Purge ALL cache (dangerous!)
curl -X POST https://istani.org/api/cloudflare/purge \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"everything"}'
```

**Get API Documentation:**

```bash
curl https://istani.org/api/cloudflare/purge
```

### 4. Programmatic Usage (TypeScript)

```typescript
import {
  purgeCache,
  purgeEverything,
  purgeFiles,
  purgeTags,
  verifyToken,
  getZoneDetails,
} from '@/lib/cloudflare';

// Purge default pages
await purgeCache();

// Purge specific files
await purgeFiles(['https://istani.org/', 'https://istani.org/products']);

// Purge by cache tags (Enterprise feature)
await purgeTags(['products', 'homepage']);

// Purge everything (use sparingly!)
await purgeEverything();

// Verify API token
const tokenStatus = await verifyToken();
console.log('Token is valid:', tokenStatus.status);

// Get zone information
const zone = await getZoneDetails();
console.log('Domain:', zone.name);
console.log('Status:', zone.status);
```

## 📁 Files Created

### Library

- **`lib/cloudflare.ts`** - TypeScript integration library

### Scripts

- **`scripts/purge-cloudflare-cache.js`** - CLI cache purging tool

### API Endpoints

- **`app/api/cloudflare/purge/route.ts`** - REST API for cache management

### Workflows

- **`.github/workflows/cloudflare-deploy.yml`** - Automated deployment workflow

### Configuration

- **`.env.example`** - Environment variable examples
- **`.env.production.template`** - Production configuration template

## 🔒 Security Best Practices

1. **Never commit API tokens** to version control
2. **Rotate tokens regularly** (every 90 days)
3. **Use minimal permissions** - only what's needed
4. **Protect API endpoints** with authentication
5. **Monitor API usage** in Cloudflare dashboard
6. **Use separate tokens** for production and development

## 🐛 Troubleshooting

### Token Verification Fails

**Error:** "Access denied" or "Invalid token"

**Solutions:**

1. Verify token has correct permissions
2. Check token hasn't expired
3. Ensure token is for the correct account
4. Regenerate token if necessary

### Zone ID Not Found

**Error:** "Zone not found" or "Invalid zone ID"

**Solutions:**

1. Verify domain is added to Cloudflare
2. Check Zone ID from Cloudflare dashboard
3. Ensure domain is active (not pending)

### Cache Not Purging

**Error:** Cache purge succeeds but changes don't appear

**Solutions:**

1. Wait 5-10 seconds for propagation
2. Check if browser is caching (hard refresh: Ctrl+Shift+R)
3. Verify correct files are being purged
4. Check Cloudflare caching settings
5. Try "Purge Everything" as a test

### API Endpoint Returns 401

**Error:** "Unauthorized"

**Solutions:**

1. Check `ADMIN_REFRESH_TOKEN` is set
2. Verify Authorization header format: `Bearer TOKEN`
3. Ensure token matches exactly
4. Check token isn't URL encoded

### GitHub Actions Workflow Fails

**Error:** Workflow errors during execution

**Solutions:**

1. Verify all GitHub secrets are set
2. Check secret names match exactly
3. Review workflow logs for specific errors
4. Test locally with same credentials
5. Ensure repository has Actions enabled

## 📊 Monitoring

### Check Cache Performance

1. Go to **Cloudflare Dashboard → Analytics → Caching**
2. Monitor:
   - Cache Hit Ratio (aim for >85%)
   - Bandwidth Saved
   - Requests Cached vs Uncached

### Check API Usage

1. Go to **Cloudflare Dashboard → Analytics → API**
2. Monitor API token usage
3. Check for rate limiting issues

### Verify Purge Operations

```bash
# Run verification
node scripts/purge-cloudflare-cache.js --verify

# Check logs in Cloudflare Dashboard
# Go to: Caching → Configuration → Purge History
```

## 🔄 Deployment Workflow

### Automatic Flow

1. **Developer pushes code** to `main` branch
2. **Vercel builds and deploys** the application
3. **GitHub Actions triggers** on successful deployment
4. **Cloudflare cache is purged** automatically
5. **Fresh content served** globally within seconds

### Manual Flow

1. **Make changes** to application
2. **Deploy to Vercel** (automatic or manual)
3. **Run cache purge script:**
   ```bash
   node scripts/purge-cloudflare-cache.js
   ```
4. **Verify changes** on live site

## 💡 Best Practices

### When to Purge Cache

**Always Purge:**

- After deploying new features
- After fixing critical bugs
- After content updates
- After design changes

**Don't Purge Too Often:**

- Not during active development (use dev mode)
- Not for minor changes
- Not for backend-only changes

### Cache Strategy

**Aggressive Caching:**

```
Static assets (/_next/static/*): 1 month
Images: 1 week
HTML pages: 4 hours
API responses: Do not cache
```

**Development Mode:**
When actively developing, enable Development Mode in Cloudflare:

```typescript
import { setDevelopmentMode } from '@/lib/cloudflare';

// Enable for 3 hours
await setDevelopmentMode(true);
```

## 📚 Additional Resources

- [Cloudflare Cache Documentation](https://developers.cloudflare.com/cache/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cache Purge API Reference](https://developers.cloudflare.com/api/operations/zone-purge)
- [Cloudflare Setup Guide](./cloudflare-setup.md)

## 🎉 Success Metrics

Track these metrics after implementing Cloudflare integration:

- **Page Load Time:** Should decrease by 30-50%
- **Bandwidth Costs:** Should decrease by 50-70%
- **Cache Hit Ratio:** Should be >85%
- **Global Latency:** Sub-100ms in most regions
- **Deployment Time:** Faster with automated purging

## 🆘 Support

### Issues?

1. Check troubleshooting section above
2. Review Cloudflare dashboard logs
3. Test with `--verify` flag
4. Check GitHub Actions logs
5. Open an issue with:
   - Error message
   - Steps to reproduce
   - Environment details

### Need Help?

- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Support](https://support.cloudflare.com/)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**Status:** ✅ Production Ready
**Cost:** $0/month (Free tier)
**Maintenance:** Minimal (token rotation every 90 days)
**Last Updated:** 2025-11-18
