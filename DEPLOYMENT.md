# Deployment Guide - ISTANI Fitness Platform

Complete guide for deploying the ISTANI fitness platform to Vercel with all integrations.

## Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Stripe account set up
- [ ] OpenAI API key obtained
- [ ] All required API keys collected
- [ ] Domain configured (optional)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and set project name
4. Select region closest to your users
5. Set a strong database password
6. Wait for project provisioning (~2 minutes)

### 1.2 Deploy Database Schema

**Option A: Using Supabase Dashboard**

1. Open SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in Table Editor

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

### 1.3 Configure Authentication

1. Go to Authentication → Providers
2. Enable **Email** provider
3. Enable **Google** OAuth (optional):
   - Add Google OAuth client ID and secret
   - Configure authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.vercel.app/auth/callback` (production)

### 1.4 Get API Keys

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Anon/Public Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) - Keep secret!

## Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account or login
3. Complete business verification (for live mode)

### 2.2 Get API Keys

1. Go to Developers → API Keys
2. Copy:
   - **Publishable Key** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - **Secret Key** (`STRIPE_SECRET_KEY`)

### 2.3 Configure Products (Optional)

1. Go to Products catalog
2. Add your fitness products/supplements
3. Set prices and descriptions

*Note: You'll configure webhooks after Vercel deployment*

## Step 3: Get Additional API Keys

### 3.1 OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or login
3. Go to API Keys
4. Create new secret key
5. Copy `OPENAI_API_KEY`

### 3.2 USDA FoodData Central

1. Go to [USDA FDC](https://fdc.nal.usda.gov/api-guide.html)
2. Sign up for API key
3. Copy `USDA_API_KEY`

### 3.3 Pexels (Image API)

1. Go to [pexels.com/api](https://www.pexels.com/api/)
2. Create account and generate API key
3. Copy `PEXELS_API_KEY`

### 3.4 GitHub Token (for repository aggregator)

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`
4. Copy `GITHUB_TOKEN`

### 3.5 Generate Secrets

```bash
# Generate random secrets for:
# CRON_SECRET
openssl rand -base64 32

# ADMIN_REFRESH_TOKEN
openssl rand -base64 32
```

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel auto-detects Next.js configuration

### 4.2 Configure Environment Variables

Add all environment variables in Vercel project settings:

**Supabase**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Stripe**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=(will be added after webhook setup)
```

**AI & APIs**
```
OPENAI_API_KEY=sk-...
USDA_API_KEY=...
PEXELS_API_KEY=...
UNSPLASH_ACCESS_KEY=(optional)
```

**GitHub**
```
GITHUB_TOKEN=ghp_...
```

**App Configuration**
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
CRON_SECRET=<generated-secret>
ADMIN_REFRESH_TOKEN=<generated-secret>
```

### 4.3 Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Copy your deployment URL

## Step 5: Configure Stripe Webhooks

### 5.1 Add Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5.2 Get Webhook Secret

1. Click on your newly created webhook
2. Click "Reveal" under "Signing secret"
3. Copy the webhook secret
4. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Redeploy to apply the new environment variable

## Step 6: Configure Supabase Redirects

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://your-domain.vercel.app`
3. Add Redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

## Step 7: Test Deployment

### 7.1 Basic Functionality

- [ ] Visit homepage loads
- [ ] Static pages render (login, register)
- [ ] Images load correctly

### 7.2 Authentication

- [ ] User can register with email
- [ ] User can login
- [ ] User can logout
- [ ] Google OAuth works (if enabled)
- [ ] Protected routes redirect to login

### 7.3 Database Operations

- [ ] User profile can be updated
- [ ] Workout can be logged
- [ ] Meal can be logged
- [ ] Water intake can be tracked
- [ ] Progress data displays correctly

### 7.4 AI Features

- [ ] AI meal plan generation works
- [ ] AI workout recommendations work
- [ ] Food search returns results

### 7.5 E-Commerce

- [ ] Products display correctly
- [ ] Cart operations work
- [ ] Checkout redirects to Stripe
- [ ] Test payment completes
- [ ] Webhook receives event
- [ ] Order appears in database

### 7.6 API Endpoints

Test each API endpoint:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Food search
curl "https://your-domain.vercel.app/api/food/search?query=apple"

# Image search
curl "https://your-domain.vercel.app/api/images/search?query=fitness"
```

## Step 8: Configure Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### 8.2 Update Environment Variables

```
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
```

### 8.3 Update Supabase & Stripe

- Update redirect URLs in Supabase
- Update webhook URL in Stripe

## Step 9: Set Up Monitoring

### 9.1 Vercel Analytics

1. Enable in Project Settings → Analytics
2. View real-time metrics and Web Vitals

### 9.2 Error Tracking (Recommended)

Consider integrating:
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay
- **PostHog** - Product analytics

### 9.3 Uptime Monitoring

Use services like:
- **UptimeRobot** - Free uptime monitoring
- **Pingdom** - Advanced monitoring

## Step 10: Production Optimizations

### 10.1 Database

- [ ] Enable connection pooling in Supabase
- [ ] Set up database backups
- [ ] Review RLS policies
- [ ] Add database indexes for frequent queries

### 10.2 Performance

- [ ] Enable Vercel Edge caching
- [ ] Configure ISR for static pages
- [ ] Optimize images (already configured)
- [ ] Review bundle size

### 10.3 Security

- [ ] Review environment variable exposure
- [ ] Enable CORS properly
- [ ] Set up rate limiting
- [ ] Review authentication flows
- [ ] Enable HTTPS only

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors
```bash
# Run locally to debug
npm run typecheck
```

**Issue:** Missing environment variables
- Verify all required env vars are set in Vercel
- Check for typos in variable names

### Runtime Errors

**Issue:** Supabase connection fails
- Verify URL and keys are correct
- Check if project is paused (free tier)
- Review CORS settings

**Issue:** Stripe webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret
- Review Stripe logs in dashboard

**Issue:** Images not loading
- Verify API keys for Pexels/Unsplash
- Check Image optimization configuration
- Review CSP headers

### Performance Issues

**Issue:** Slow API responses
- Check Supabase query performance
- Review database indexes
- Consider caching strategies

**Issue:** Large bundle size
- Run `npm run build` and review bundle analysis
- Consider code splitting
- Lazy load components

## Maintenance

### Regular Tasks

- [ ] Monitor error rates in Vercel
- [ ] Review Supabase usage and costs
- [ ] Check Stripe transaction logs
- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Backup database regularly

### Scaling Considerations

As your app grows:
- Upgrade Supabase tier for more connections
- Consider adding Redis for caching
- Enable CDN for static assets
- Review database query performance
- Consider serverless function optimization

## Support

For deployment issues:
- Check Vercel deployment logs
- Review Supabase logs
- Check Stripe webhook logs
- Open GitHub issue with error details

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/payments/checkout)
