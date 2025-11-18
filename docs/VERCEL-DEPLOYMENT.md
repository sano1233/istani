# Vercel Deployment Configuration

## Deployment URL

Production: https://istani.org
Preview: https://istani.org?_vercel_share=LPjODCuWhsoo9xKPbTMaYKPmlghyeueZ

## Configuration

### Build Settings

- **Framework**: Next.js 15
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`
- **Install Command**: `npm install`
- **Output Directory**: `.next` (auto-detected)
- **Node Version**: 20 (auto-detected)

### Regions

- **Primary Region**: `iad1` (US East - Washington, D.C.)

### Cron Jobs

- **Daily Coaching**: Runs at 6:00 AM UTC
  - Path: `/api/cron/daily-coaching`
  - Schedule: `0 6 * * *`

### Security Headers

All routes include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Build Warnings

If you see compilation warnings:

1. **ESLint Warnings**: These are non-blocking and won't prevent deployment
   - Common warnings: `no-console`, `react/no-unescaped-entities`
   - These are acceptable for production

2. **TypeScript Warnings**: Type checking is enabled
   - All type errors must be resolved before deployment
   - Run `npm run typecheck` locally to check

3. **Build Optimization**: 
   - Warnings during build are normal
   - Build completes successfully if no errors
   - Check build logs for specific warnings

## Environment Variables

Required environment variables in Vercel:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Other
- `CRON_SECRET` (for cron job authentication)

## Deployment Process

1. **Automatic Deployments**:
   - Push to `main` branch → Production deployment
   - Push to other branches → Preview deployment

2. **Manual Deployment**:
   ```bash
   vercel --prod
   ```

3. **Preview Deployment**:
   ```bash
   vercel
   ```

## Build Performance

- **Build Time**: ~2-3 minutes
- **Compilation**: Uses SWC for fast compilation
- **Optimizations**: 
  - Image optimization enabled
  - Code splitting enabled
  - Tree shaking enabled
  - Minification enabled

## Troubleshooting

### Build Warnings

If you see warnings like:
```
⚠ Compiled with warnings in 2.5s
```

This is normal and doesn't prevent deployment. Warnings are typically:
- ESLint warnings (non-blocking)
- Deprecation notices (informational)
- Performance suggestions (optimization opportunities)

### Build Failures

If build fails:
1. Check build logs in Vercel dashboard
2. Run `npm run build` locally to reproduce
3. Check TypeScript errors: `npm run typecheck`
4. Check ESLint errors: `npm run lint`

## Monitoring

- **Vercel Analytics**: Enabled
- **Error Tracking**: Check Vercel dashboard
- **Performance**: Monitor in Vercel dashboard

## Related Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Build Configuration](./BUILD-COMPLETE.md)

