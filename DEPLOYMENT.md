# 🚀 ISTANI Deployment Guide

Complete guide for deploying the ISTANI platform and AI agent to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [AI Agent Deployment](#ai-agent-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **GitHub Account** (free)
   - Repository access
   - Actions enabled
   - Secrets management

2. **Anthropic Account** ($20/month recommended)
   - Claude API access
   - API key with sufficient credits

3. **Vercel Account** (free tier available)
   - Team/project created
   - API token generated

4. **Netlify Account** (free tier available)
   - Site created
   - API token generated

### Required Tools

```bash
# Node.js 18+ and npm
node --version  # Should be >= 18
npm --version

# Git
git --version

# Docker (optional, for containerized deployment)
docker --version
docker-compose --version

# Vercel CLI (optional)
npm install -g vercel

# Netlify CLI (optional)
npm install -g netlify-cli
```

---

## Environment Setup

### 1. Generate API Keys

#### Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new key
5. Copy and save securely

#### GitHub Personal Access Token

1. Visit https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (all)
   - `workflow`
   - `write:packages`
   - `admin:repo_hook`
4. Generate and copy token

#### Vercel Token

1. Visit https://vercel.com/account/tokens
2. Create new token
3. Name: "ISTANI AI Agent"
4. Copy token

#### Netlify Token

1. Visit https://app.netlify.com/user/applications#personal-access-tokens
2. Create new access token
3. Description: "ISTANI AI Agent"
4. Copy token

### 2. Configure GitHub Secrets

1. Go to your repository
2. Settings → Secrets and variables → Actions
3. Add the following secrets:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxx
VERCEL_TOKEN=xxx
NETLIFY_AUTH_TOKEN=xxx
NETLIFY_SITE_ID=xxx
```

### 3. Local Environment File

```bash
cd istani/ai-agent
cp .env.example .env
```

Edit `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxx
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=sano1233
GITHUB_REPO=istani
VERCEL_TOKEN=xxx
NETLIFY_TOKEN=xxx
GITHUB_WEBHOOK_SECRET=<generate-with-openssl-rand-hex-32>
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Automatic Deployment

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Link project
   vercel link

   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env`

3. **Auto-Deploy on Push**
   - Vercel automatically deploys on push to main
   - Preview deployments for PRs

#### Manual Deployment

```bash
# Build
npm run build

# Deploy
vercel --prod --token=$VERCEL_TOKEN
```

### Option 2: Netlify (Recommended for Functions)

#### Automatic Deployment

1. **Connect Repository**

   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Initialize
   netlify init

   # Deploy
   netlify deploy --prod
   ```

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

3. **Environment Variables**
   - Site settings → Environment variables
   - Add all required variables

#### Manual Deployment

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --auth=$NETLIFY_TOKEN --site=$NETLIFY_SITE_ID
```

### Option 3: Docker (Recommended for AI Agent)

#### Docker Compose (All-in-One)

```bash
cd istani/ai-agent

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f ai-agent

# Stop
docker-compose down
```

#### Individual Container

```bash
# Build
docker build -t istani-ai-agent -f ai-agent/Dockerfile .

# Run
docker run -d \
  -p 3001:3001 \
  --name istani-agent \
  --env-file ai-agent/.env \
  istani-ai-agent

# Logs
docker logs -f istani-agent

# Stop
docker stop istani-agent
docker rm istani-agent
```

### Option 4: Traditional Server

#### Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Setup

```bash
# Install PM2
npm install -g pm2

# Start AI agent
cd ai-agent
npm install --production
pm2 start server/webhook-server.mjs --name istani-agent

# Save PM2 config
pm2 save
pm2 startup

# View logs
pm2 logs istani-agent

# Monitor
pm2 monit
```

#### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/istani-agent
server {
    listen 80;
    server_name agent.istani.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/istani-agent /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Install SSL with Let's Encrypt
sudo certbot --nginx -d agent.istani.org
```

---

## AI Agent Deployment

### GitHub Webhook Setup

1. **Go to Repository Settings**
   - Settings → Webhooks → Add webhook

2. **Configure Webhook**
   - Payload URL: `https://agent.istani.org/webhook`
   - Content type: `application/json`
   - Secret: Your `GITHUB_WEBHOOK_SECRET`

3. **Select Events**
   - Pull requests
   - Issue comments
   - Pushes
   - Workflow runs

4. **Save**

### Verify Deployment

```bash
# Test health endpoint
curl https://agent.istani.org/health

# Expected response:
{
  "status": "healthy",
  "uptime": 12345,
  "agent": {
    "prsProcessed": 0,
    "buildsSucceeded": 0,
    "buildsFailed": 0,
    "deploymentsSucceeded": 0,
    "deploymentsFailed": 0,
    "securityIssuesFound": 0,
    "codeReviewsCompleted": 0
  }
}
```

### Test with PR

```bash
# Trigger manual processing
curl -X POST https://agent.istani.org/process/123 \
  -H "Content-Type: application/json"

# Or use CLI
cd ai-agent
npm run cli process 123
```

---

## Monitoring & Maintenance

### Dashboard Access

Open monitoring dashboard:

```
https://agent.istani.org/dashboard
```

Or serve locally:

```bash
cd ai-agent/monitoring
npx serve .
```

### Logs

#### Docker

```bash
docker-compose logs -f ai-agent
```

#### PM2

```bash
pm2 logs istani-agent
pm2 monit
```

#### GitHub Actions

- Visit: https://github.com/sano1233/istani/actions

### Metrics to Monitor

1. **PR Processing**
   - Average processing time
   - Success rate
   - Queue length

2. **Builds**
   - Success/failure ratio
   - Build duration
   - Error patterns

3. **Deployments**
   - Deployment frequency
   - Success rate
   - Rollback incidents

4. **Security**
   - Issues detected
   - False positive rate
   - High-severity alerts

5. **System Health**
   - Uptime
   - Memory usage
   - API rate limits

### Alerting

#### Slack Integration

```bash
# Add to .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

#### Discord Integration

```bash
# Add to .env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```

#### Email Notifications

```bash
# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=alerts@istani.org
```

### Backup & Recovery

#### Backup Configuration

```bash
# Backup environment
cp ai-agent/.env ai-agent/.env.backup

# Backup GitHub secrets (manual)
# Document all secret names and where to regenerate them
```

#### Database Backup (if using)

```bash
# Redis backup (if using)
docker exec istani-redis redis-cli SAVE
docker cp istani-redis:/data/dump.rdb ./backup/redis-$(date +%Y%m%d).rdb
```

### Updates

```bash
# Update dependencies
cd ai-agent
npm update

# Update Docker images
docker-compose pull
docker-compose up -d

# Update PM2 process
cd ai-agent
git pull
npm install
pm2 restart istani-agent
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events

**Check:**

- Webhook URL is correct and accessible
- Secret matches `GITHUB_WEBHOOK_SECRET`
- Server is running and port is open
- Firewall allows incoming connections

**Debug:**

```bash
# Check webhook server logs
docker-compose logs -f ai-agent

# Test webhook endpoint
curl -X POST https://agent.istani.org/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### 2. Claude API Errors

**Symptoms:**

- "Invalid API key"
- "Rate limit exceeded"
- "Insufficient credits"

**Solutions:**

- Verify `ANTHROPIC_API_KEY` is correct
- Check API credits at https://console.anthropic.com/
- Implement rate limiting
- Upgrade plan if needed

#### 3. Build Failures

**Check:**

- Dependencies installed correctly
- Node version >= 18
- Build script exists in package.json
- Sufficient disk space

**Debug:**

```bash
# Manual build test
npm ci
npm run build

# Check logs
docker-compose logs ai-agent | grep -i error
```

#### 4. Deployment Failures

**Vercel:**

- Check token validity
- Verify project exists
- Check build logs

**Netlify:**

- Verify site ID
- Check auth token
- Review deploy logs

#### 5. Permission Errors

**GitHub Token:**

- Regenerate token with correct scopes
- Verify token hasn't expired
- Check organization permissions

---

## Performance Optimization

### 1. Caching

Enable Redis for caching:

```bash
# Add to docker-compose.yml (already included)
# Configure in .env
REDIS_URL=redis://redis:6379
```

### 2. Rate Limiting

```bash
# Add to .env
AGENT_MAX_PRS_PER_HOUR=50
AGENT_RATE_LIMIT_DELAY_MS=2000
```

### 3. Horizontal Scaling

```bash
# Scale AI agent workers
docker-compose up -d --scale ai-agent=3
```

### 4. CDN Configuration

Vercel and Netlify include CDN by default. For custom deployments:

```bash
# Use Cloudflare or similar
# Configure caching rules
# Enable compression
```

---

## Security Checklist

- [ ] All secrets stored securely (GitHub Secrets, environment variables)
- [ ] Webhook secret configured and verified
- [ ] API tokens have minimum required permissions
- [ ] SSL/TLS enabled (HTTPS)
- [ ] Firewall configured correctly
- [ ] Rate limiting enabled
- [ ] Regular dependency updates
- [ ] Monitoring and alerting configured
- [ ] Backup procedures in place
- [ ] Incident response plan documented

---

## Support

For deployment assistance:

- 📖 [Main README](README.md)
- 📖 [AI Agent Docs](ai-agent/README.md)
- 🐛 [Report Issue](https://github.com/sano1233/istani/issues)
- 💬 [Discord](https://discord.gg/istani)
- 📧 [Email](mailto:support@istani.org)

---

<div align="center">

**Happy Deploying! 🚀**

Made with ❤️ by the ISTANI Team

</div>
