# Token Configuration Guide

## 🔐 Secure Token Setup

This guide explains how to securely configure tokens and API keys for the istani.org platform.

## GitHub Token Setup

### For Local Development

1. **Create a `.env.local` file** (if it doesn't exist):
   ```bash
   cp .env.example .env.local
   ```

2. **Add your GitHub token**:
   ```bash
   GITHUB_TOKEN=CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF
   ```

3. **Verify it's in `.gitignore`** (it should be):
   - `.env.local` is already in `.gitignore`
   - Never commit tokens to git!

### For GitHub Actions

The repository aggregator workflow uses `secrets.GITHUB_TOKEN` by default, which is automatically provided by GitHub Actions.

If you need to use a Personal Access Token instead:

1. **Go to GitHub Secrets**:
   - Navigate to: https://github.com/sano1233/istani/settings/secrets/actions

2. **Add a new secret**:
   - Name: `GITHUB_TOKEN` (or `GITHUB_PAT`)
   - Value: `CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF`

3. **Update the workflow** (if needed):
   ```yaml
   env:
     GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

### For Vercel Deployment

1. **Go to Vercel Project Settings**:
   - Navigate to your project settings
   - Go to Environment Variables

2. **Add the token**:
   - Key: `GITHUB_TOKEN`
   - Value: `CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF`
   - Environment: Production, Preview, Development

## Testing the Token

### Test Locally

```bash
# Set the token
export GITHUB_TOKEN=CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF

# Test the repository aggregator
npm run aggregate

# Or test authentication
curl -H "Authorization: token CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF" https://api.github.com/user
```

### Verify Token Permissions

The token should have these scopes:
- `repo` - Full control of private repositories
- `read:org` - Read org and team membership

## Security Best Practices

### ✅ DO:
- Store tokens in environment variables
- Use `.env.local` for local development
- Add tokens to GitHub Secrets for CI/CD
- Use different tokens for different environments
- Rotate tokens regularly
- Use fine-grained tokens with minimal permissions

### ❌ DON'T:
- Commit tokens to git
- Share tokens in chat/email
- Use tokens in client-side code
- Hardcode tokens in source files
- Use the same token everywhere

## Token Usage Locations

### Repository Aggregator
- **Script**: `scripts/aggregateRepos.js`
- **Environment Variable**: `GITHUB_TOKEN`
- **Usage**: Fetches repository metadata, commits, and issues

### GitHub Actions Workflow
- **File**: `.github/workflows/aggregate-repos.yml`
- **Secret**: `secrets.GITHUB_TOKEN`
- **Usage**: Automated repository aggregation

## Environment Variables Reference

### Required for Repository Aggregator
```bash
GITHUB_TOKEN=CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF
```

### Other Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kxsmgrlpojdsgvjdodda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Other
CRON_SECRET=your_cron_secret
```

## Quick Setup Commands

```bash
# Create .env.local
cat > .env.local << EOF
GITHUB_TOKEN=CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF
NEXT_PUBLIC_SUPABASE_URL=https://kxsmgrlpojdsgvjdodda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF

# Verify it's ignored by git
git check-ignore .env.local

# Test the token
export GITHUB_TOKEN=CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF
npm run aggregate
```

## Troubleshooting

### Token Not Working?

1. **Check token format**:
   - Should be a long string of characters
   - No spaces or quotes needed

2. **Verify permissions**:
   - Token needs `repo` scope for private repos
   - Token needs `read:org` for organization repos

3. **Check rate limits**:
   ```bash
   curl -H "Authorization: token CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF" \
        https://api.github.com/rate_limit
   ```

4. **Test authentication**:
   ```bash
   curl -H "Authorization: token CjPDxxAcQnFU9bmKYJWidxHEFloK9g46rUtslyfF" \
        https://api.github.com/user
   ```

### Token Expired?

1. Generate a new token at: https://github.com/settings/tokens
2. Update in all locations:
   - `.env.local` (local)
   - GitHub Secrets (CI/CD)
   - Vercel Environment Variables (deployment)

## Next Steps

1. ✅ Configure the token in `.env.local` for local development
2. ✅ Add to GitHub Secrets for CI/CD (if needed)
3. ✅ Add to Vercel Environment Variables for deployment
4. ✅ Test the repository aggregator: `npm run aggregate`
5. ✅ Verify the token works with a test API call

---

**Important**: Never commit this token to git! Always use environment variables or secrets management.
