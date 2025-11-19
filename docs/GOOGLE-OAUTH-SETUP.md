# Google OAuth Setup Guide

## Issue

Error when attempting Google sign-in/sign-up:
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

## Root Cause

The Google OAuth provider is not enabled in Supabase authentication settings.

## Solution

### Step 1: Enable Google Provider in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/kxsmgrlpojdsgvjdodda
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the provider list
4. Click **Enable**

### Step 2: Configure Google OAuth Credentials

You need to create OAuth credentials in Google Cloud Console:

#### A. Create Google Cloud Project (if not already created)

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable **Google+ API** for the project

#### B. Create OAuth 2.0 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:

**Authorized JavaScript origins:**
```
https://istani.org
https://istani-pq0v98wzd-istanis-projects.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://kxsmgrlpojdsgvjdodda.supabase.co/auth/v1/callback
https://istani.org/auth/callback
https://istani-pq0v98wzd-istanis-projects.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 3: Add Credentials to Supabase

1. Return to Supabase Dashboard > Authentication > Providers > Google
2. Paste the **Client ID** from Google
3. Paste the **Client Secret** from Google
4. Click **Save**

### Step 4: Verify Configuration

Test the Google OAuth flow:

1. Visit: https://istani-pq0v98wzd-istanis-projects.vercel.app/login
2. Click "Continue with Google"
3. Should redirect to Google sign-in
4. After sign-in, should redirect back to /dashboard

## Current Implementation

### Login Page

Location: `app/(auth)/login/page.tsx:38-49`

```typescript
async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setError(error.message);
  }
}
```

### Register Page

Location: `app/(auth)/register/page.tsx:44-55`

```typescript
async function handleGoogleSignup() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setError(error.message);
  }
}
```

### Auth Callback

Location: `app/auth/callback/route.ts`

```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## Verification Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Authorized JavaScript origins configured
- [ ] Authorized redirect URIs configured
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Google provider enabled in Supabase
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] Configuration saved
- [ ] Google sign-in tested from /login
- [ ] Google sign-up tested from /register
- [ ] Callback to /dashboard successful

## Alternative: Other OAuth Providers

You can also enable other providers in Supabase:

### GitHub OAuth
1. Create OAuth App: https://github.com/settings/developers
2. Add to Supabase: Authentication > Providers > GitHub

### Facebook OAuth
1. Create Facebook App: https://developers.facebook.com/
2. Add to Supabase: Authentication > Providers > Facebook

### Twitter OAuth
1. Create Twitter App: https://developer.twitter.com/
2. Add to Supabase: Authentication > Providers > Twitter

### Discord OAuth
1. Create Discord App: https://discord.com/developers/applications
2. Add to Supabase: Authentication > Providers > Discord

## Troubleshooting

### Error: "Invalid redirect URI"

**Cause:** Redirect URI not configured in Google Cloud Console

**Fix:** Add all redirect URIs to Google OAuth credentials:
- `https://kxsmgrlpojdsgvjdodda.supabase.co/auth/v1/callback`
- `https://istani.org/auth/callback`
- `https://istani-pq0v98wzd-istanis-projects.vercel.app/auth/callback`

### Error: "Access blocked: This app's request is invalid"

**Cause:** Google+ API not enabled

**Fix:** Enable Google+ API in Google Cloud Console

### Error: "Provider not enabled"

**Cause:** Google provider not enabled in Supabase

**Fix:** Enable Google provider in Supabase Dashboard > Authentication > Providers

### Error: "Invalid credentials"

**Cause:** Wrong Client ID or Client Secret

**Fix:** Verify credentials match those in Google Cloud Console

## Testing

### Manual Test

```bash
# Test login page
curl -I https://istani-pq0v98wzd-istanis-projects.vercel.app/login

# Test register page
curl -I https://istani-pq0v98wzd-istanis-projects.vercel.app/register

# Test auth callback
curl -I https://istani-pq0v98wzd-istanis-projects.vercel.app/auth/callback
```

### Browser Test

1. Open: https://istani-pq0v98wzd-istanis-projects.vercel.app/login
2. Click "Continue with Google"
3. Sign in with Google account
4. Verify redirect to /dashboard
5. Check user created in Supabase Dashboard > Authentication > Users

## Security Considerations

### Production Settings

1. **Restrict redirect URIs** to production domains only
2. **Enable email verification** in Supabase
3. **Configure session timeout** appropriately
4. **Enable MFA** for admin accounts
5. **Monitor OAuth usage** in Google Cloud Console

### Environment Variables

No additional environment variables needed for Google OAuth. Configuration is stored in Supabase.

### Rate Limiting

Google OAuth has rate limits:
- 10 requests per second per user
- 100,000 requests per day per project

Monitor usage in Google Cloud Console.

## References

- Supabase Auth Docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Google Cloud Console: https://console.cloud.google.com/

## Status

**Current Status:** Google OAuth provider NOT enabled

**Action Required:** Enable Google provider in Supabase Dashboard

**Estimated Time:** 10-15 minutes

## Quick Fix Commands

```bash
# No CLI commands available - must configure in Supabase Dashboard

# However, you can verify the auth routes exist:
ls -la app/auth/callback/
ls -la app/(auth)/login/
ls -la app/(auth)/register/
```

## Support

If issues persist after following this guide:

1. Check Supabase logs: Dashboard > Logs > Auth logs
2. Check browser console for client-side errors
3. Verify Google Cloud Console audit logs
4. Contact Supabase support: https://supabase.com/support

Last Updated: 2025-11-19
Status: Configuration Required
