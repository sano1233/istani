# ISTANI Fitness Enterprise - Deployment Guide

Complete guide to deploying the ISTANI Fitness application to production.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - [supabase.com](https://supabase.com)
2. **Vercel Account** - [vercel.com](https://vercel.com) (or your preferred hosting platform)
3. **Stripe Account** - [stripe.com](https://stripe.com) (for subscriptions)
4. **GitHub Repository** - Your forked/cloned repo with admin access

## Part 1: Database Setup (Supabase)

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: ISTANI Fitness
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for provisioning (~2 minutes)

### 1.2 Run Database Migrations

Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/20250114_001_initial_schema.sql`
4. Paste into the query editor and click "Run"
5. Repeat for `supabase/migrations/20250114_002_seed_data.sql`

Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 1.3 Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" and "Reset password" emails
4. Configure auth settings:
   - **Site URL**: `https://your-domain.com` (or localhost for testing)
   - **Redirect URLs**: Add your production and development URLs

### 1.4 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for environment variables):
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Part 2: Stripe Setup (Payment Processing)

### 2.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification

### 2.2 Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Create three products:

**Pro Plan:**
- Name: ISTANI Pro
- Description: Complete fitness platform with AI coaching
- Price: $19/month recurring

**Elite Plan:**
- Name: ISTANI Elite
- Description: Premium tier with 1-on-1 coaching
- Price: $49/month recurring

3. Copy the Price IDs for environment variables

### 2.3 Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret**: `STRIPE_WEBHOOK_SECRET`

### 2.4 Get Stripe API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Publishable key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key**: `STRIPE_SECRET_KEY` (never expose this!)

## Part 3: Deployment to Vercel

### 3.1 Prepare Environment Variables

Create a `.env.local` file in `packages/istani-fitness-app/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3.2 Deploy to Vercel

Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Root Directory**: `packages/istani-fitness-app`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables from `.env.local`
6. Click "Deploy"

Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to fitness app
cd packages/istani-fitness-app

# Deploy
vercel

# Follow prompts and add environment variables
```

### 3.3 Configure Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` and Supabase Site URL

## Part 4: Post-Deployment Setup

### 4.1 Test Authentication

1. Visit your deployed site
2. Click "Sign Up" and create a test account
3. Check email for verification
4. Verify you can log in successfully
5. Check Supabase Dashboard → **Authentication** → **Users** to confirm user creation

### 4.2 Test Database

1. Log in to your deployed app
2. Navigate to Dashboard
3. Verify that you can see the dashboard
4. Check Supabase Dashboard → **Table Editor** to confirm user records

### 4.3 Test Subscription Flow (Stripe)

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Click "Upgrade to Pro" in the app
3. Complete checkout with test card
4. Verify webhook received in Stripe Dashboard
5. Confirm subscription status updates in database

### 4.4 Configure GitHub Secrets

For automated deployments via GitHub Actions:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Get Vercel credentials:
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
cd packages/istani-fitness-app
vercel link

# Get org and project IDs (check .vercel/project.json)
cat .vercel/project.json
```

## Part 5: Monitoring & Maintenance

### 5.1 Set Up Error Monitoring

1. Create a [Sentry](https://sentry.io) account
2. Install Sentry SDK:
```bash
npm install @sentry/nextjs
```
3. Configure Sentry in `next.config.ts`
4. Add `NEXT_PUBLIC_SENTRY_DSN` to environment variables

### 5.2 Configure Analytics

1. Add [Vercel Analytics](https://vercel.com/analytics):
```bash
npm install @vercel/analytics
```

2. Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 5.3 Database Backups

Supabase automatically backs up your database daily. To configure:

1. Go to **Database** → **Backups** in Supabase
2. Enable Point-in-Time Recovery (PITR) for production
3. Configure backup retention (7-30 days recommended)

### 5.4 Security Checklist

- [ ] All API keys stored in environment variables (not in code)
- [ ] Supabase RLS policies tested and working
- [ ] Stripe webhook signature verification enabled
- [ ] HTTPS enforced on all pages
- [ ] Content Security Policy configured
- [ ] Rate limiting enabled for API routes
- [ ] Database connection pooling configured

## Part 6: Troubleshooting

### Common Issues

**Build Fails:**
- Check all environment variables are set
- Verify Node.js version is 18+
- Clear `.next` folder and rebuild

**Database Connection Issues:**
- Verify Supabase URL and keys are correct
- Check database is not paused (free tier)
- Ensure RLS policies allow your queries

**Stripe Webhook Not Receiving:**
- Verify webhook URL is publicly accessible
- Check webhook signing secret is correct
- Review Stripe Dashboard → **Events** for errors

**Authentication Redirects Fail:**
- Update Site URL in Supabase auth settings
- Add all redirect URLs to allowed list
- Check middleware is properly configured

## Part 7: Scaling Considerations

### Performance Optimization

1. **Enable Vercel Edge Functions** for auth middleware
2. **Configure ISR** (Incremental Static Regeneration) for public pages
3. **Add Redis caching** for frequently accessed data
4. **Enable CDN** for static assets

### Database Optimization

When you reach 100+ concurrent users:

1. Upgrade Supabase plan for connection pooling
2. Add database indexes for slow queries
3. Consider read replicas for analytics queries
4. Implement database query caching

### Cost Estimation

**Free Tier (Testing):**
- Supabase: Free (up to 500MB database)
- Vercel: Free (hobby plan)
- Stripe: No monthly fee (2.9% + 30¢ per transaction)

**Production (~1000 users):**
- Supabase Pro: $25/month
- Vercel Pro: $20/month
- Stripe: Transaction fees only
- **Total: ~$45/month + transaction fees**

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

## Next Steps

After deployment:

1. Set up monitoring and alerts
2. Configure automated database backups
3. Implement feature flags for gradual rollouts
4. Add A/B testing for subscription pricing
5. Set up staging environment for testing

---

**Deployment Checklist:**

- [ ] Supabase project created and migrations run
- [ ] Authentication configured and tested
- [ ] Stripe products and webhooks configured
- [ ] Environment variables set in Vercel
- [ ] Application deployed and accessible
- [ ] Custom domain configured (optional)
- [ ] GitHub Actions secrets configured
- [ ] Monitoring tools set up
- [ ] Database backups enabled
- [ ] Security checklist completed
- [ ] Test user account created and verified
- [ ] Stripe test transaction completed

**Congratulations! Your ISTANI Fitness Enterprise application is now live! 🎉**
