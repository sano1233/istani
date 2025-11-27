# Cloudflare Integration Guide

This document explains how to use the Cloudflare integration for cache management and CDN operations.

## ✅ Token Verification

Your Cloudflare API token has been verified and is **active**:

- **Token ID**: `cf546ae4539814801697d12fdc591a2b`
- **Status**: `active`
- **Account ID**: `8a96ac34caf00be04c7fa407efcefa85`

## Configuration

### Environment Variables

Add these to your Vercel environment variables:

```bash
CLOUDFLARE_API_TOKEN=VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-
CLOUDFLARE_ACCOUNT_ID=8a96ac34caf00be04c7fa407efcefa85
CLOUDFLARE_ZONE_ID=your_zone_id_here  # Get from Cloudflare dashboard
CLOUDFLARE_PURGE_SECRET=your_random_secret_here  # Generate with: openssl rand -hex 32
```

### Getting Your Zone ID

**Option 1: Cloudflare Dashboard**

1. Go to https://dash.cloudflare.com
2. Select your domain (istani.org)
3. Scroll to the right sidebar
4. Copy the **Zone ID**

**Option 2: API (if no IP restrictions)**

```bash
export CLOUDFLARE_API_TOKEN=VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-
./scripts/cloudflare-setup.sh
```

**Option 3: Manual API Call**

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-" \
  -H "Content-Type: application/json"
```

## API Endpoints

### 1. Verify Configuration

Test your Cloudflare setup:

```bash
curl -X GET "https://istani.org/api/cloudflare/verify" \
  -H "CLOUDFLARE_PURGE_SECRET: your-secret-here"
```

**Response:**

```json
{
  "success": true,
  "token": {
    "id": "cf546ae4539814801697d12fdc591a2b",
    "status": "active"
  },
  "zone": {
    "id": "your-zone-id",
    "name": "istani.org",
    "status": "active"
  },
  "message": "Token verified and zone accessible"
}
```

### 2. Purge Cache

Purge specific files or entire cache:

**Purge specific files:**

```bash
curl -X POST "https://istani.org/api/cloudflare/purge" \
  -H "CLOUDFLARE_PURGE_SECRET: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://istani.org/",
      "https://istani.org/_next/static/chunks/main.js"
    ]
  }'
```

**Purge everything:**

```bash
curl -X POST "https://istani.org/api/cloudflare/purge" \
  -H "CLOUDFLARE_PURGE_SECRET: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{
    "purgeEverything": true
  }'
```

**Purge by tags:**

```bash
curl -X POST "https://istani.org/api/cloudflare/purge" \
  -H "CLOUDFLARE_PURGE_SECRET: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["product", "workout"]
  }'
```

## Programmatic Usage

### In Next.js API Routes

```typescript
import { purgeCache, purgeFiles, purgeEverything } from '@/lib/cloudflare';

// Purge specific files
await purgeFiles(['https://istani.org/', 'https://istani.org/products']);

// Purge everything
await purgeEverything();

// Custom purge options
await purgeCache({
  tags: ['product', 'workout'],
  hosts: ['istani.org'],
});
```

### After Deployments

Add to your deployment workflow to automatically purge cache:

```typescript
// app/api/deploy/route.ts
import { purgeEverything } from '@/lib/cloudflare';

export async function POST(request: Request) {
  // Verify deployment webhook secret
  const secret = request.headers.get('x-vercel-signature');
  // ... verify secret ...

  // Purge Cloudflare cache after deployment
  try {
    await purgeEverything();
    return Response.json({ success: true, message: 'Cache purged' });
  } catch (error) {
    console.error('Cache purge failed:', error);
    return Response.json({ error: 'Cache purge failed' }, { status: 500 });
  }
}
```

## Security

The purge endpoints are protected by `CLOUDFLARE_PURGE_SECRET`. Always:

1. Generate a strong random secret: `openssl rand -hex 32`
2. Store it securely in environment variables
3. Never commit it to version control
4. Use HTTPS for all API calls

## Integration Files

- **Library**: `lib/cloudflare.ts` - Core Cloudflare API functions
- **Purge API**: `app/api/cloudflare/purge/route.ts` - Cache purge endpoint
- **Verify API**: `app/api/cloudflare/verify/route.ts` - Configuration verification
- **Setup Script**: `scripts/cloudflare-setup.sh` - Helper script for configuration

## Troubleshooting

### Token IP Restrictions

If you see `"Cannot use the access token from location"`:

- Your token has IP restrictions (this is normal for security)
- Use the Cloudflare dashboard to get the Zone ID manually
- The token will still work from your Vercel deployment

### Zone ID Not Found

1. Verify your domain is added to Cloudflare
2. Check you're using the correct account
3. Get Zone ID from dashboard: https://dash.cloudflare.com

### Cache Not Purging

1. Verify `CLOUDFLARE_ZONE_ID` is set correctly
2. Check `CLOUDFLARE_API_TOKEN` has "Cache Purge" permission
3. Verify the purge secret matches in your request header
4. Check Cloudflare dashboard for purge history

## Next Steps

1. ✅ Token verified and active
2. ⏳ Get Zone ID from Cloudflare dashboard
3. ⏳ Generate `CLOUDFLARE_PURGE_SECRET`
4. ⏳ Add all variables to Vercel
5. ⏳ Test verification endpoint
6. ⏳ Test cache purge endpoint
7. ⏳ Set up automatic cache purge on deployments

## Resources

- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [Cache Purge API](https://developers.cloudflare.com/api/operations/zone-purge-cache)
- [Dashboard](https://dash.cloudflare.com)
- [Setup Guide](./cloudflare-setup.md)
