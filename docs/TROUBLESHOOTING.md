# Troubleshooting Guide

## Common Issues and Solutions

### Deployment Issues

#### MIDDLEWARE_INVOCATION_FAILED Error

**Symptoms:**
- 500 Internal Server Error
- Error code: `MIDDLEWARE_INVOCATION_FAILED`
- Site not loading

**Causes:**
1. Missing environment variables
2. Middleware crashing
3. Supabase connection issues

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify in Vercel dashboard:
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY

   # Redeploy after adding/updating variables
   ```

2. **Check Middleware Logs**
   ```bash
   # In Vercel dashboard:
   # Functions > Middleware > Logs

   # Look for specific error messages
   ```

3. **Verify Supabase Connection**
   ```bash
   # Test locally first
   curl https://YOUR_PROJECT.supabase.co/rest/v1/

   # Should return API documentation
   ```

**Fixed In:** `middleware.ts` now includes comprehensive error handling

---

#### Build Failures

**Symptoms:**
- Deployment fails during build
- TypeScript errors in build logs
- Missing dependencies

**Solutions:**

1. **TypeScript Errors**
   ```bash
   # Run locally to debug
   npm run typecheck

   # Fix errors shown
   # Common issues:
   # - Missing type definitions
   # - Incorrect imports
   # - Type mismatches
   ```

2. **Missing Dependencies**
   ```bash
   # Ensure package-lock.json is committed
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

3. **Out of Memory**
   ```bash
   # Increase Node memory limit
   # In package.json:
   "scripts": {
     "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
   }
   ```

---

### Database Issues

#### Connection Timeouts

**Symptoms:**
- Slow API responses
- Database connection errors
- Timeout errors

**Solutions:**

1. **Check Supabase Status**
   - Visit [Supabase Status Page](https://status.supabase.com)
   - Check if your region has issues

2. **Verify Connection Pooling**
   ```typescript
   // Ensure using server-side client properly
   import { createClient } from '@/lib/supabase/server';

   const supabase = await createClient();
   ```

3. **Optimize Queries**
   ```typescript
   // Bad - fetching too much data
   const { data } = await supabase.from('users').select('*');

   // Good - select only needed columns
   const { data } = await supabase.from('users').select('id, name, email');
   ```

---

#### Row Level Security (RLS) Issues

**Symptoms:**
- "permission denied for table" errors
- Data not visible to authenticated users
- Updates failing silently

**Solutions:**

1. **Check RLS Policies**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'your_table';

   -- Verify policies exist for SELECT, INSERT, UPDATE, DELETE
   ```

2. **Test with Service Role**
   ```typescript
   // Temporarily use service role to verify data exists
   const { data } = await supabaseAdmin
     .from('users')
     .select('*');

   // If data shows, RLS is the issue
   ```

3. **Fix Missing Policies**
   ```sql
   -- Add policy for users to read their own data
   CREATE POLICY "Users can read own data"
     ON users FOR SELECT
     USING (auth.uid() = id);

   -- Add policy for users to update their own data
   CREATE POLICY "Users can update own data"
     ON users FOR UPDATE
     USING (auth.uid() = id);
   ```

---

### Authentication Issues

#### Login Not Working

**Symptoms:**
- Login button doesn't work
- Redirect loops
- "Invalid login credentials" errors

**Solutions:**

1. **Check Site URL Configuration**
   ```bash
   # In Vercel:
   NEXT_PUBLIC_SITE_URL=https://your-domain.com

   # In Supabase Dashboard:
   # Authentication > URL Configuration
   # Site URL: https://your-domain.com
   ```

2. **Verify Redirect URLs**
   ```bash
   # In Supabase Dashboard:
   # Authentication > URL Configuration
   # Redirect URLs:
   # - https://your-domain.com/auth/callback
   # - http://localhost:3000/auth/callback (for development)
   ```

3. **Check Email Templates**
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Verify confirmation email is enabled
   - Test email delivery

---

#### Session Persistence Issues

**Symptoms:**
- Users logged out randomly
- Session lost on page refresh
- "Session expired" errors

**Solutions:**

1. **Check Cookie Settings**
   ```typescript
   // Ensure middleware is handling cookies correctly
   // Already implemented in lib/supabase/middleware.ts
   ```

2. **Verify Domain**
   ```bash
   # Cookies must match domain
   NEXT_PUBLIC_SITE_URL=https://your-exact-domain.com
   ```

3. **Check Browser Settings**
   - Ensure cookies are enabled
   - Check for browser extensions blocking cookies
   - Try in incognito mode

---

### Stripe Integration Issues

#### Webhook Not Receiving Events

**Symptoms:**
- Payments succeed but orders not created
- Webhook showing errors in Stripe dashboard
- 500 errors on webhook endpoint

**Solutions:**

1. **Verify Webhook URL**
   ```bash
   # In Stripe Dashboard:
   # Developers > Webhooks
   # Endpoint URL: https://your-domain.com/api/webhooks/stripe
   ```

2. **Check Webhook Secret**
   ```bash
   # In Vercel environment variables:
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Must match the secret shown in Stripe dashboard
   ```

3. **Test Webhook Locally**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Trigger test event
   stripe trigger payment_intent.succeeded
   ```

---

#### Payment Intent Failed

**Symptoms:**
- Payment fails during checkout
- "Payment intent creation failed" errors

**Solutions:**

1. **Check Stripe API Keys**
   ```bash
   # Verify in Vercel:
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)

   # Ensure using correct key for environment
   ```

2. **Verify Minimum Amount**
   ```typescript
   // Stripe has minimum amounts per currency
   // USD: $0.50 minimum
   const amount = Math.max(50, priceInCents);
   ```

3. **Check Card Details**
   - Use Stripe test cards for testing
   - Verify card has sufficient funds
   - Check for declined payments in Stripe dashboard

---

### Rate Limiting Issues

#### 429 Too Many Requests

**Symptoms:**
- API returns 429 status
- "Rate limit exceeded" error
- Requests blocked

**Solutions:**

1. **Check Rate Limit Configuration**
   ```typescript
   // In lib/rate-limit.ts
   // Adjust limits based on your needs:

   const limiters = {
     strict: new RateLimiter({
       interval: 60 * 1000,
       uniqueTokenPerInterval: 10,
     }),
     standard: new RateLimiter({
       interval: 60 * 1000,
       uniqueTokenPerInterval: 30,
     }),
     // ...
   };
   ```

2. **Implement Backoff**
   ```typescript
   async function fetchWithRetry(url: string, retries = 3) {
     for (let i = 0; i < retries; i++) {
       const response = await fetch(url);

       if (response.status === 429) {
         const retryAfter = response.headers.get('Retry-After');
         await new Promise(r => setTimeout(r, (retryAfter || 60) * 1000));
         continue;
       }

       return response;
     }
     throw new Error('Rate limit exceeded');
   }
   ```

3. **Use Authentication**
   ```typescript
   // Authenticated users get higher limits
   export const POST = createApiHandler(
     async (context) => {
       // Implementation
     },
     {
       requireAuth: true, // Higher limits for authenticated users
     },
   );
   ```

---

### Performance Issues

#### Slow Page Load

**Symptoms:**
- Pages take >5 seconds to load
- Poor Lighthouse scores
- Slow Time to Interactive

**Solutions:**

1. **Check Bundle Size**
   ```bash
   npm run build

   # Review output for large bundles
   # Look for:
   # - Unusually large page bundles
   # - Duplicate dependencies
   ```

2. **Optimize Images**
   ```typescript
   // Use Next.js Image component
   import Image from 'next/image';

   <Image
     src="/large-image.jpg"
     alt="Description"
     width={800}
     height={600}
     quality={75} // Reduce quality if needed
   />
   ```

3. **Implement Code Splitting**
   ```typescript
   import dynamic from 'next/dynamic';

   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>,
   });
   ```

4. **Add Caching**
   ```typescript
   // In API routes
   export async function GET() {
     const response = NextResponse.json({ data });
     response.headers.set('Cache-Control', 'public, max-age=3600');
     return response;
   }
   ```

---

#### Slow Database Queries

**Symptoms:**
- API routes timing out
- Slow dashboard loading
- High database CPU usage

**Solutions:**

1. **Add Indexes**
   ```sql
   -- Check query performance
   EXPLAIN ANALYZE
   SELECT * FROM orders WHERE user_id = 'xxx';

   -- Add index if sequential scan
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

2. **Optimize Queries**
   ```typescript
   // Bad - N+1 queries
   const users = await supabase.from('users').select('*');
   for (const user of users.data) {
     const orders = await supabase.from('orders').eq('user_id', user.id).select('*');
   }

   // Good - Join
   const usersWithOrders = await supabase
     .from('users')
     .select('*, orders(*)');
   ```

3. **Use Pagination**
   ```typescript
   import { validatePagination } from '@/lib/validation';

   const { page, limit, offset } = validatePagination(
     searchParams.get('page'),
     searchParams.get('limit'),
   );

   const { data } = await supabase
     .from('items')
     .select('*')
     .range(offset, offset + limit - 1);
   ```

---

### Development Issues

#### Local Development Not Working

**Symptoms:**
- `npm run dev` fails
- Environment variables not loading
- Module not found errors

**Solutions:**

1. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node Version**
   ```bash
   node --version
   # Should be >= 18.0.0

   # Use nvm to switch versions
   nvm use 18
   ```

3. **Verify Environment Variables**
   ```bash
   # Create .env.local if missing
   cp .env.local.example .env.local

   # Edit .env.local with your values
   # Restart dev server after changes
   ```

---

#### Hot Reload Not Working

**Symptoms:**
- Changes not reflected in browser
- Need to restart server for changes
- Stale cache

**Solutions:**

1. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Disable Browser Cache**
   - Open DevTools
   - Network tab
   - Check "Disable cache"

3. **Check File Watchers**
   ```bash
   # On Linux, increase file watch limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

---

## Getting Additional Help

If none of these solutions work:

1. **Check Logs**
   - Vercel: Functions > Logs
   - Supabase: Logs section
   - Browser: Console and Network tabs

2. **Search Issues**
   - [GitHub Issues](https://github.com/sano1233/istani/issues)
   - Stack Overflow
   - Next.js Discussions

3. **Create an Issue**
   - Include error messages
   - Describe steps to reproduce
   - Provide environment details
   - Share relevant code snippets

4. **Review Documentation**
   - [DEPLOYMENT.md](../DEPLOYMENT.md)
   - [API_EXAMPLES.md](API_EXAMPLES.md)
   - [PERFORMANCE.md](PERFORMANCE.md)
   - [SECURITY.md](../SECURITY.md)

---

## Emergency Rollback

If production is broken:

1. **Revert to Previous Deployment**
   ```bash
   # In Vercel dashboard:
   # Deployments > Find last working deployment
   # Click "..." > Promote to Production
   ```

2. **Rollback Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Check Environment Variables**
   - Ensure no variables were accidentally deleted
   - Verify all required variables are set

4. **Monitor**
   - Watch error rates in Vercel Analytics
   - Check health endpoint: `/api/health`
   - Monitor database performance in Supabase
