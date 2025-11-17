# Environment Variables Configuration for Vercel

## Required Environment Variables

Add these to your Vercel project settings at:
https://vercel.com/[your-username]/istani/settings/environment-variables

### Supabase (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### USDA API (Required for Nutrition Features)
```bash
# Get free API key from: https://fdc.nal.usda.gov/api-key-signup.html
# Or use DEMO_KEY for testing (rate limited)
NEXT_PUBLIC_USDA_API_KEY=DEMO_KEY
```

### Stripe (Required for Payments)
```bash
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://istani.org
```

### Optional - Image APIs
```bash
PEXELS_API_KEY=your-pexels-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

### Optional - Admin
```bash
ADMIN_REFRESH_TOKEN=your-admin-token
```

## How to Add in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (istani)
3. Click "Settings" tab
4. Click "Environment Variables" in sidebar
5. Add each variable above:
   - Key: Variable name (e.g., NEXT_PUBLIC_SUPABASE_URL)
   - Value: Your actual value
   - Environment: Check "Production", "Preview", and "Development"
6. Click "Save"
7. Redeploy your site for changes to take effect

## How to Add in Netlify

1. Go to https://app.netlify.com
2. Select your site
3. Go to Site settings → Environment variables
4. Click "Add a variable"
5. Add each variable above
6. Click "Save"
7. Trigger a new deploy

## How to Add in Cloudflare Pages

1. Go to Cloudflare Dashboard
2. Select Pages project
3. Go to Settings → Environment variables
4. Add each variable above
5. Set for both "Production" and "Preview"
6. Click "Save"
7. Redeploy

## Testing Locally

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local

# Then edit .env.local with your actual values
nano .env.local
```

## Verification

After adding environment variables, verify they're working:

```bash
# In Vercel deployment logs, you should see:
✓ Environment variables loaded
✓ Supabase client initialized
✓ USDA API configured
✓ Stripe configured
```

## Troubleshooting

**Problem:** "Supabase URL not defined"
**Solution:** Make sure NEXT_PUBLIC_SUPABASE_URL is set and starts with "https://"

**Problem:** "USDA API not working"
**Solution:**
- Use "DEMO_KEY" for testing (limited to 30 requests/hour)
- Get free API key from https://fdc.nal.usda.gov/api-key-signup.html

**Problem:** "Changes not reflecting"
**Solution:** Redeploy your site after adding environment variables
