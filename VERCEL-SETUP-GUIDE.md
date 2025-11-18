# Vercel Deployment & Domain Setup Guide for istani.org

## ✅ Build Status: SUCCESSFUL

The Next.js application builds successfully with no errors. All TypeScript errors have been resolved.

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
cd /workspace
vercel link
```

When prompted:

- **Set up and deploy**: Yes
- **Which scope**: Select your Vercel account/team
- **Link to existing project**: No (or Yes if already created)
- **Project name**: istani-fitness (or your preferred name)
- **Directory**: ./ (current directory)

### 4. Configure Environment Variables

Run this script to add all required environment variables to Vercel:

```bash
# Copy and run this in your terminal

# Supabase Configuration (REQUIRED)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: your-supabase-url (e.g., https://xxxxx.supabase.co)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: your-supabase-anon-key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: your-supabase-service-role-key

# Database (REQUIRED if using Neon)
vercel env add DATABASE_URL production
# Enter: your-neon-database-url

# Stripe (REQUIRED for payments)
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_xxx or pk_test_xxx

vercel env add STRIPE_SECRET_KEY production
# Enter: sk_live_xxx or sk_test_xxx

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter: whsec_xxx

# OpenAI (REQUIRED for AI features)
vercel env add OPENAI_API_KEY production
# Enter: sk-xxx

# Image APIs (REQUIRED for gallery)
vercel env add PEXELS_API_KEY production
# Enter: your-pexels-api-key

vercel env add UNSPLASH_ACCESS_KEY production
# Enter: your-unsplash-access-key (optional)

# Food/Nutrition API (REQUIRED for nutrition tracking)
vercel env add USDA_API_KEY production
# Enter: your-usda-api-key

# Site Configuration
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://istani.org

# Security Tokens
vercel env add CRON_SECRET production
# Enter: a-random-secure-string

vercel env add ADMIN_REFRESH_TOKEN production
# Enter: another-random-secure-string

# Cloudflare (OPTIONAL - for additional CDN features)
vercel env add CLOUDFLARE_API_TOKEN production
# Enter: VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-

vercel env add CLOUDFLARE_ACCOUNT_ID production
# Enter: 8a96ac34caf00be04c7fa407efcefa85

# GitHub (OPTIONAL - for repository features)
vercel env add GITHUB_TOKEN production
# Enter: ghp_xxx
```

### 5. Deploy to Production

```bash
vercel --prod
```

This will:

- Build your application
- Deploy to Vercel's global edge network
- Provide you with a production URL

## 🌐 Domain Configuration: istani.org

### Option A: Add Domain in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Add Domain**
   - Go to Settings → Domains
   - Click "Add Domain"
   - Enter: `istani.org`
   - Click "Add"

3. **Configure DNS**

   Vercel will provide you with DNS records. Add these to your domain registrar or Cloudflare:

   **A Record:**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: Auto or 3600
   ```

   **CNAME Record (for www):**

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto or 3600
   ```

### Option B: Using Cloudflare (Alternative)

If you want to use Cloudflare as your DNS provider:

1. **Add Site to Cloudflare**
   - Go to: https://dash.cloudflare.com
   - Click "Add a Site"
   - Enter: istani.org
   - Choose Free plan
   - Review DNS records

2. **Update Nameservers at Your Registrar**

   Cloudflare will provide you with nameservers like:

   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

   Update these at your domain registrar (e.g., GoDaddy, Namecheap, etc.)

3. **Configure DNS Records in Cloudflare**

   Add these DNS records in Cloudflare dashboard:

   **A Record:**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

   **CNAME Record:**

   ```
   Type: CNAME
   Name: www
   Value: istani.org
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

4. **Cloudflare Settings for Optimal Performance**

   **SSL/TLS:**
   - Mode: Full (strict)
   - Enable "Always Use HTTPS"
   - Enable "Automatic HTTPS Rewrites"

   **Speed:**
   - Enable "Auto Minify" (HTML, CSS, JS)
   - Enable "Brotli"
   - Disable "Rocket Loader" (breaks Next.js)

   **Caching:**
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

   **Page Rules (up to 3 free):**

   ```
   1. https://istani.org/api/*
      - Cache Level: Bypass

   2. https://istani.org/_next/static/*
      - Cache Level: Cache Everything
      - Edge Cache TTL: 1 month

   3. https://istani.org/*
      - Always Use HTTPS
   ```

### Option C: Using Vercel CLI

```bash
# Add domain via CLI
vercel domains add istani.org

# Check domain status
vercel domains ls

# Remove domain if needed
vercel domains rm istani.org
```

## 🔍 Verification Steps

### 1. Test Build Locally

```bash
cd /workspace
npm run build
npm run start
```

Visit http://localhost:3000 to verify everything works.

### 2. Test Production Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://istani.org/api/health

# Main page
curl -I https://istani.org

# Check SSL
openssl s_client -connect istani.org:443 -servername istani.org
```

### 3. Browser Tests

- [ ] Homepage loads: https://istani.org
- [ ] Dashboard works: https://istani.org/dashboard
- [ ] Authentication: https://istani.org/login
- [ ] API endpoints respond correctly
- [ ] Images load properly
- [ ] SSL certificate is valid (green padlock)

### 4. Performance Check

Run Lighthouse audit:

```bash
npx lighthouse https://istani.org --view
```

Target scores:

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 🐛 Troubleshooting

### Build Fails on Vercel

**Check:**

1. Environment variables are set correctly
2. TypeScript has no errors: `npm run typecheck`
3. Build succeeds locally: `npm run build`

**Common Issues:**

- Missing environment variables → Add them in Vercel dashboard
- TypeScript errors → Fix locally, test build, then deploy
- Dependency issues → Clear cache: `vercel --force`

### Domain Not Working

**DNS Propagation:**

- Can take 24-48 hours
- Check status: https://dnschecker.org/?domain=istani.org
- Use: `dig istani.org` or `nslookup istani.org`

**Common Issues:**

- Wrong DNS records → Double-check A record and CNAME
- Nameservers not updated → Verify at registrar
- SSL not working → Wait for certificate provisioning (5-10 mins)

### 502 Bad Gateway

**Causes:**

1. Serverless function timeout (max 10s on free, 30s on Pro)
2. Memory limit exceeded
3. Environment variables missing

**Solutions:**

- Upgrade to Vercel Pro for longer timeouts
- Optimize slow functions
- Check function logs in Vercel dashboard

### Environment Variables Not Working

**Check:**

1. Variables are added to "Production" environment
2. Variable names match exactly (case-sensitive)
3. No quotes around values (Vercel adds them automatically)
4. Redeploy after adding variables

## 📊 Monitoring

### Vercel Analytics

Enable in dashboard:

- Go to Project → Analytics
- View real-time traffic, performance, Core Web Vitals

### Vercel Logs

```bash
# View deployment logs
vercel logs

# Stream live logs
vercel logs --follow

# View function logs
vercel logs --function=api/health
```

### Custom Monitoring

Add to your API routes for health checks:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
}
```

## 🔐 Security Checklist

- [x] HTTPS enforced (Vercel does this automatically)
- [x] Security headers configured (in vercel.json)
- [x] Environment variables secured (not in code)
- [ ] CORS configured for API routes
- [ ] Rate limiting on API endpoints
- [ ] Supabase Row Level Security enabled
- [ ] Stripe webhook signature verification

## 💰 Cost Estimate

### Vercel Pro

- **Cost:** $20/month
- **Includes:**
  - Unlimited domains
  - Advanced analytics
  - Password protection
  - 1000 GB bandwidth
  - 100 GB-hours function execution

### Cloudflare Free

- **Cost:** $0/month
- **Includes:**
  - Unlimited bandwidth
  - DDoS protection
  - Global CDN
  - Free SSL certificates

**Total:** $20/month (Vercel Pro + Cloudflare Free)

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Cloudflare Docs:** https://developers.cloudflare.com
- **Supabase Docs:** https://supabase.com/docs

## 🎯 Deployment Checklist

- [x] Build completes successfully locally
- [x] TypeScript compilation has no errors
- [x] All dependencies installed
- [ ] Environment variables configured in Vercel
- [ ] Domain added to Vercel project
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Health check endpoint working
- [ ] Database migrations run
- [ ] Stripe webhook configured
- [ ] Monitoring enabled

## 🚨 Emergency Rollback

If something goes wrong:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote a specific deployment
vercel promote [deployment-url]
```

---

## ✅ Current Status

- **Build:** ✅ Successful (no errors)
- **Middleware:** ✅ Fixed (Node.js runtime configured)
- **TypeScript:** ✅ All errors resolved
- **Configuration:** ✅ vercel.json optimized
- **Domain Setup:** ⏳ Pending (follow steps above)

## 📞 Support

If you encounter issues:

1. **Vercel Support:** support@vercel.com
2. **Community:** https://github.com/vercel/next.js/discussions
3. **Discord:** https://discord.gg/vercel

---

**Last Updated:** 2025-11-18
**Status:** Ready for Production Deployment ✅
