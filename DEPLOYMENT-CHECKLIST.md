# ISTANI Production Deployment Checklist
## $147 Budget - Full Stack Deployment

Use this checklist to ensure all deployment steps are completed correctly.

---

## Pre-Deployment Preparation

### 1. Environment Setup ✓
- [ ] Review `FULL-STACK-DEPLOYMENT-PLAN.md`
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Fill in all environment variables
- [ ] Verify no sensitive data in git
- [ ] Create accounts for all required services

### 2. Service Accounts Required
- [ ] **Vercel** - https://vercel.com/signup
  - [ ] Upgrade to Pro plan ($20/month)
  - [ ] Get API token
- [ ] **Supabase** - https://supabase.com/dashboard
  - [ ] Upgrade project to Pro ($25/month)
  - [ ] Get API keys (anon, service role)
  - [ ] Note project URL
- [ ] **Railway** - https://railway.app
  - [ ] Create account
  - [ ] Add payment method ($30/month budget)
  - [ ] Get API token
- [ ] **Stripe** - https://dashboard.stripe.com
  - [ ] Activate account
  - [ ] Get publishable and secret keys
  - [ ] Set up products
- [ ] **OpenAI** - https://platform.openai.com
  - [ ] Add payment method
  - [ ] Set usage limit to $30/month
  - [ ] Create API key
- [ ] **Cloudflare** - https://dash.cloudflare.com
  - [ ] Add domain
  - [ ] Get zone ID and API token
- [ ] **Sentry** - https://sentry.io
  - [ ] Create project
  - [ ] Get DSN
  - [ ] Upgrade to Developer plan ($26/month)
- [ ] **USDA** - https://fdc.nal.usda.gov/api-key-signup.html
  - [ ] Request free API key
- [ ] **Pexels** - https://www.pexels.com/api/
  - [ ] Register for free API key

---

## Phase 1: Database Setup

### 3. Supabase Configuration
- [ ] Log into Supabase dashboard
- [ ] Upgrade project to Pro tier
- [ ] Enable Point-in-Time Recovery
- [ ] Run `supabase/optimize-production.sql` in SQL Editor
- [ ] Verify all indexes created
- [ ] Enable Row Level Security on all tables
- [ ] Test database connection from local
- [ ] Configure connection pooling
- [ ] Set up daily backups
- [ ] Document database credentials securely

**Verify:**
```bash
# Test connection
psql "postgresql://postgres:PASSWORD@HOST:6543/postgres?sslmode=require" -c "SELECT version();"
```

---

## Phase 2: Vercel Deployment

### 4. Vercel Setup
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Upgrade to Pro in dashboard
- [ ] Set all environment variables:
  ```bash
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  vercel env add SUPABASE_SERVICE_ROLE_KEY production
  vercel env add DATABASE_URL production
  vercel env add STRIPE_SECRET_KEY production
  vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
  vercel env add STRIPE_WEBHOOK_SECRET production
  vercel env add OPENAI_API_KEY production
  vercel env add USDA_API_KEY production
  vercel env add PEXELS_API_KEY production
  vercel env add NEXT_PUBLIC_SENTRY_DSN production
  vercel env add NEXT_PUBLIC_SITE_URL production
  vercel env add CRON_SECRET production
  vercel env add ADMIN_REFRESH_TOKEN production
  vercel env add GITHUB_TOKEN production
  ```

### 5. Deploy to Production
- [ ] Run: `npm run build` locally (verify no errors)
- [ ] Run: `npm run typecheck` (verify no errors)
- [ ] Deploy: `vercel --prod`
- [ ] Verify deployment URL
- [ ] Test deployment: `curl https://[your-deployment].vercel.app/api/health`
- [ ] Configure custom domain in Vercel dashboard
- [ ] Verify SSL certificate

**Verify:**
- [ ] https://istani.vercel.app loads correctly
- [ ] API health check returns 200
- [ ] Environment variables are set
- [ ] Build succeeded with no errors

---

## Phase 3: Cloudflare Setup

### 6. DNS & CDN Configuration
- [ ] Follow `cloudflare-setup.md` guide
- [ ] Add site to Cloudflare
- [ ] Update nameservers at registrar
- [ ] Configure DNS records (A, CNAME, TXT)
- [ ] Set SSL mode to "Full (strict)"
- [ ] Enable "Always Use HTTPS"
- [ ] Configure page rules (3 rules max)
- [ ] Set up firewall rules (5 rules max)
- [ ] Enable Brotli compression
- [ ] Enable Auto Minify (JS, CSS, HTML)
- [ ] Disable Rocket Loader (breaks Next.js)
- [ ] Wait for DNS propagation (check: https://dnschecker.org)

**Verify:**
- [ ] https://istani.org loads correctly
- [ ] SSL certificate is valid (green padlock)
- [ ] All subdomains resolve
- [ ] Cloudflare badge appears in network tab
- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=istani.org

---

## Phase 4: Railway Deployment

### 7. AI Agent & Monitoring
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Navigate to `ai-agent` directory
- [ ] Initialize: `railway init`
- [ ] Create Redis service in Railway dashboard
- [ ] Set environment variables in Railway:
  - [ ] ANTHROPIC_API_KEY
  - [ ] GITHUB_TOKEN
  - [ ] GITHUB_OWNER=sano1233
  - [ ] GITHUB_REPO=istani
  - [ ] VERCEL_TOKEN
  - [ ] NODE_ENV=production
  - [ ] PORT=3001
- [ ] Deploy: `railway up`
- [ ] Verify deployment
- [ ] Set up Prometheus (optional)
- [ ] Set up Grafana (optional)
- [ ] Import `monitoring/grafana-dashboard.json`

**Verify:**
- [ ] AI agent is running
- [ ] Health check returns 200
- [ ] Redis is accessible
- [ ] Logs show no errors

---

## Phase 5: Stripe Configuration

### 8. Payment Processing
- [ ] Log into Stripe dashboard
- [ ] Switch to live mode
- [ ] Create products:
  - [ ] Coaching sessions
  - [ ] Supplements
  - [ ] Premium meal plans
  - [ ] Workout programs
- [ ] Configure webhook:
  - [ ] URL: `https://istani.org/api/stripe/webhook`
  - [ ] Events: checkout.session.completed, payment_intent.succeeded
  - [ ] Copy webhook secret
  - [ ] Add to Vercel env: `STRIPE_WEBHOOK_SECRET`
- [ ] Test checkout flow
- [ ] Verify webhook handler receives events
- [ ] Test successful payment
- [ ] Test failed payment handling

**Verify:**
- [ ] Test payment in test mode works
- [ ] Webhook events received
- [ ] Order created in database
- [ ] Customer receives confirmation

---

## Phase 6: Monitoring & Logging

### 9. Sentry Error Tracking
- [ ] Install Sentry: `npx @sentry/wizard@latest -i nextjs`
- [ ] Upgrade to Developer plan
- [ ] Configure `sentry.client.config.ts`
- [ ] Configure `sentry.server.config.ts`
- [ ] Configure `sentry.edge.config.ts`
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel
- [ ] Deploy to trigger source map upload
- [ ] Test error reporting
- [ ] Set up alert rules
- [ ] Configure integrations (email, Slack)

**Verify:**
- [ ] Errors appear in Sentry dashboard
- [ ] Source maps uploaded correctly
- [ ] Performance monitoring active
- [ ] Alerts configured

### 10. UptimeRobot Monitoring
- [ ] Sign up at https://uptimerobot.com
- [ ] Create monitors:
  - [ ] HTTPS monitor: https://istani.org (5 min interval)
  - [ ] HTTP monitor: https://istani.org/api/health (5 min interval)
  - [ ] Keyword monitor: Check for "ok" in health response
- [ ] Add alert contacts (email, SMS)
- [ ] Create status page (public)
- [ ] Test notifications

**Verify:**
- [ ] All monitors show "Up"
- [ ] Test notification received
- [ ] Status page accessible

### 11. Better Stack Logging
- [ ] Sign up at https://betterstack.com
- [ ] Create log source
- [ ] Get source token
- [ ] Add to Vercel: `BETTERSTACK_TOKEN`
- [ ] Configure log shipping
- [ ] Set up alert rules
- [ ] Test log ingestion

**Verify:**
- [ ] Logs appearing in dashboard
- [ ] Search functionality works
- [ ] Alerts configured

---

## Phase 7: Final Testing

### 12. Functionality Testing
- [ ] **User Authentication**
  - [ ] Registration works
  - [ ] Email verification (if enabled)
  - [ ] Login works
  - [ ] Logout works
  - [ ] Password reset works
  - [ ] Google OAuth (if enabled)

- [ ] **Workout Tracking**
  - [ ] Create workout log
  - [ ] Edit workout log
  - [ ] Delete workout log
  - [ ] View workout history
  - [ ] View analytics

- [ ] **Nutrition Tracking**
  - [ ] Log meal
  - [ ] Search food database (USDA)
  - [ ] Scan barcode (if implemented)
  - [ ] View nutrition dashboard
  - [ ] Track macros

- [ ] **AI Features**
  - [ ] Generate meal plan (GPT-4)
  - [ ] Generate workout plan
  - [ ] AI coaching messages
  - [ ] Verify OpenAI costs

- [ ] **E-Commerce**
  - [ ] Browse products
  - [ ] Add to cart
  - [ ] Checkout (Stripe)
  - [ ] Order confirmation
  - [ ] View order history

- [ ] **Performance**
  - [ ] Page load time < 3s
  - [ ] API response time < 500ms
  - [ ] Core Web Vitals passing
  - [ ] Images optimized
  - [ ] Lighthouse score > 90

### 13. Security Testing
- [ ] HTTPS enforced everywhere
- [ ] No mixed content warnings
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] SQL injection protection (test inputs)
- [ ] XSS protection (test inputs)
- [ ] CSRF tokens working
- [ ] Environment variables not exposed
- [ ] Security headers present
- [ ] Webhook signatures verified

**Security scan:**
```bash
# Test security headers
curl -I https://istani.org
```

Expected headers:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

### 14. Load Testing (Optional)
```bash
# Install artillery
npm i -g artillery

# Simple load test
artillery quick --count 10 --num 50 https://istani.org
```

- [ ] Server handles load
- [ ] Response times acceptable
- [ ] No errors under load
- [ ] Database connections stable

---

## Phase 8: Post-Deployment

### 15. Monitoring Setup
- [ ] Open Grafana dashboard
- [ ] Verify all metrics flowing
- [ ] Set up alert channels
- [ ] Test alert notifications
- [ ] Document runbooks for common issues

### 16. Cost Tracking
- [ ] Run: `node scripts/track-costs.js`
- [ ] Review cost report
- [ ] Verify within budget ($147/month)
- [ ] Set up daily cost tracking cron job:
  ```bash
  # Add to Railway or use Vercel Cron
  0 9 * * * cd /app && node scripts/track-costs.js
  ```

### 17. Documentation
- [ ] Update README.md with production URLs
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document incident response process
- [ ] Create developer onboarding guide

### 18. Team Communication
- [ ] Announce deployment to team
- [ ] Share status page URL
- [ ] Share Grafana dashboard URL
- [ ] Share Sentry project URL
- [ ] Schedule post-deployment review

---

## Phase 9: 24-Hour Monitoring

### 19. Day 1 Checklist
**Hour 1:**
- [ ] Check Sentry for errors
- [ ] Review Vercel analytics
- [ ] Check UptimeRobot status
- [ ] Review Grafana dashboards
- [ ] Monitor OpenAI usage

**Hour 6:**
- [ ] Review error rates
- [ ] Check performance metrics
- [ ] Verify backup ran successfully
- [ ] Review cost tracking
- [ ] Check user feedback

**Hour 24:**
- [ ] Comprehensive error review
- [ ] Performance analysis
- [ ] Cost review
- [ ] User metrics analysis
- [ ] Plan optimizations

---

## Phase 10: Week 1 Tasks

### 20. Weekly Review
- [ ] Monday: Review weekend metrics
- [ ] Tuesday: Optimize slow queries
- [ ] Wednesday: Review costs vs budget
- [ ] Thursday: Performance tuning
- [ ] Friday: Weekly retrospective
- [ ] Saturday/Sunday: Monitor only

### 21. Optimization
- [ ] Identify slow API endpoints
- [ ] Optimize database queries
- [ ] Reduce OpenAI token usage
- [ ] Improve cache hit rate
- [ ] Optimize images
- [ ] Review bundle size

---

## Emergency Procedures

### If Something Goes Wrong:

**API Down:**
1. Check Vercel deployment status
2. Review recent commits
3. Check Sentry for errors
4. Rollback if needed: `vercel rollback`

**Database Issues:**
1. Check Supabase dashboard
2. Review slow queries
3. Check connection pool
4. Scale if needed

**High Costs:**
1. Run cost tracking script
2. Identify expensive service
3. Review usage patterns
4. Implement cost controls

**Security Incident:**
1. Review Cloudflare security events
2. Check access logs
3. Rotate compromised keys
4. Update security rules

---

## Success Criteria

### Deployment Complete When:
- ✅ All services deployed and running
- ✅ All tests passing
- ✅ Monitoring active and alerting
- ✅ SSL/HTTPS working
- ✅ Zero critical errors in first hour
- ✅ Performance metrics meeting targets
- ✅ Costs within budget
- ✅ Team trained and documentation complete

---

## Rollback Plan

If deployment fails:

1. **Vercel:**
   ```bash
   vercel rollback
   ```

2. **Railway:**
   ```bash
   railway rollback
   ```

3. **Database:**
   - Restore from Supabase backup
   - Revert migrations if needed

4. **DNS:**
   - Keep old DNS records ready
   - TTL set low for quick changes

---

## Contact Information

**Service Support:**
- Vercel: support@vercel.com
- Supabase: support@supabase.com
- Railway: Discord community
- Stripe: support@stripe.com
- Cloudflare: community.cloudflare.com

**On-Call:**
- Primary: [Your contact]
- Secondary: [Backup contact]
- Escalation: [Manager contact]

---

## Deployment Sign-Off

**Deployed by:** _______________
**Date:** _______________
**Time:** _______________
**Verified by:** _______________
**Deployment ID:** _______________

**Notes:**
_________________________________________
_________________________________________
_________________________________________

---

**🎉 Congratulations on deploying ISTANI to production!**

Remember to monitor closely for the first 48 hours and optimize based on real usage patterns.
