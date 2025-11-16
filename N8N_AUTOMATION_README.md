# 🤖 n8n Automation System for ISTANI

Complete open-source automation using n8n + WordPress + GitHub Actions.

**100% FREE, NO API KEYS REQUIRED (except GitHub token for PR operations)**

---

## 🎯 What This Does

### Auto-Create PRs
- Push to any feature branch → n8n receives webhook → Creates GitHub PR automatically
- WordPress publishes post → n8n receives webhook → Creates PR with post content
- Contact form submission → n8n processes → Optional PR creation for leads

### Auto-Merge PRs
- All CI checks pass → n8n receives webhook → Merges PR automatically
- Configurable merge strategies (squash, merge, rebase)
- HMAC signature verification for security

### WordPress Event Processing
- Contact Form 7 submissions
- User registrations
- Post publications
- Comment approvals

---

## 📁 Files Added

```
istani/
├── compose.n8n.yml                          # Docker Compose overlay for n8n
├── wp-mu-plugins/
│   └── istani-n8n.php                       # WordPress mu-plugin (event bridge)
├── n8n/
│   └── workflows/
│       ├── wp-contact.json                  # Process CF7 submissions
│       ├── wp-user-registered.json          # Process user registrations
│       ├── github-create-pr.json            # Auto-create GitHub PRs
│       └── github-merge-pr.json             # Auto-merge GitHub PRs
├── scripts/
│   └── bootstrap_n8n.sh                     # Setup script
├── .github/workflows/
│   ├── n8n-auto-create-pr.yml              # GitHub Actions → n8n PR creation
│   └── n8n-auto-merge.yml                   # GitHub Actions → n8n auto-merge
└── .env.example                             # Environment variables template
```

---

## 🚀 Quick Start

### 1. Start n8n Services

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set secrets:
# - N8N_ENCRYPTION_KEY (random 32-char string)
# - ISTANI_N8N_SHARED_SECRET (random string for HMAC)
# - GITHUB_TOKEN (personal access token with repo scope)
vim .env

# Start n8n + PostgreSQL
docker compose -f docker-compose.yml -f compose.n8n.yml up -d

# Run bootstrap script (copies WordPress mu-plugin)
bash scripts/bootstrap_n8n.sh
```

### 2. Configure n8n

1. Visit **http://localhost:5678**
2. Create admin account
3. Workflows are auto-imported from `n8n/workflows/`
4. Set environment variables in n8n settings:
   - `GITHUB_TOKEN` - Your GitHub personal access token
   - `GITHUB_REPO` - `sano1233/istani`
   - `N8N_ISTANI_SHARED_SECRET` - Same as in .env

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `N8N_ISTANI_SHARED_SECRET` - Same secret as in .env
- `N8N_WEBHOOK_URL` - Your n8n webhook URL (e.g., `https://n8n.istani.org/webhook/github-create-pr`)
- `N8N_WEBHOOK_URL_MERGE` - Merge webhook URL (e.g., `https://n8n.istani.org/webhook/github-merge-pr`)

For local development:
- `N8N_WEBHOOK_URL`: `http://localhost:5678/webhook/github-create-pr`
- `N8N_WEBHOOK_URL_MERGE`: `http://localhost:5678/webhook/github-merge-pr`

---

## 🔧 How It Works

### Auto-Create PR Flow

```
1. Developer pushes to feature/mybranch
   ↓
2. GitHub Actions workflow triggered (n8n-auto-create-pr.yml)
   ↓
3. Calculate HMAC signature of payload
   ↓
4. Send webhook to n8n (/webhook/github-create-pr)
   ↓
5. n8n verifies HMAC signature
   ↓
6. n8n calls GitHub API to create PR
   ↓
7. PR created: feature/mybranch → main
```

### Auto-Merge PR Flow

```
1. All CI checks complete successfully
   ↓
2. GitHub Actions workflow triggered (n8n-auto-merge.yml)
   ↓
3. Check if PR is eligible for auto-merge:
   - Not a draft
   - No merge conflicts
   - All checks passing
   - Owner or has 'auto-merge' label
   ↓
4. Calculate HMAC signature of payload
   ↓
5. Send webhook to n8n (/webhook/github-merge-pr)
   ↓
6. n8n verifies HMAC signature
   ↓
7. n8n calls GitHub API to merge PR
   ↓
8. PR merged with squash commit
```

### WordPress Event Flow

```
1. User submits Contact Form 7
   ↓
2. WordPress hook 'wpcf7_mail_sent' fires
   ↓
3. istani-n8n.php plugin captures event
   ↓
4. Calculate HMAC signature
   ↓
5. Send POST to n8n (/webhook/wp-contact)
   ↓
6. n8n verifies signature
   ↓
7. n8n processes contact (email, CRM, etc.)
```

---

## 🔒 Security

### HMAC Signature Verification

All webhooks use HMAC-SHA256 signatures to verify authenticity:

```javascript
// Payload
const body = JSON.stringify(payload);

// Calculate signature
const signature = crypto
  .createHmac('sha256', SHARED_SECRET)
  .update(body)
  .digest('hex');

// Send with header
headers['X-Istani-Signature'] = signature;
```

n8n workflows verify signatures before processing:

```javascript
const crypto = require('crypto');
const sig = headers['x-istani-signature'] || '';
const body = JSON.stringify($json.body || {});
const calc = crypto.createHmac('sha256', secret).update(body).digest('hex');

if (sig !== calc) {
  return [{ ok: false, reason: 'bad-signature' }];
}
```

### Best Practices

1. **Change default secrets** in production
2. **Use HTTPS** for n8n webhook URL (use Cloudflare Tunnel or similar)
3. **Limit GitHub token scope** to only `repo` permissions
4. **Rotate secrets** periodically
5. **Monitor n8n logs** for suspicious activity

---

## 🛠️ Customization

### Add New WordPress Events

Edit `wp-mu-plugins/istani-n8n.php`:

```php
// Example: Track WooCommerce orders
add_action('woocommerce_thankyou', function($order_id) {
  $order = wc_get_order($order_id);
  $payload = array(
    'event' => 'woocommerce_order',
    'order_id' => $order_id,
    'total' => $order->get_total(),
    'items' => $order->get_item_count(),
  );
  istani_n8n_post('wp-order-complete', $payload);
}, 10, 1);
```

### Create n8n Workflow for New Event

1. In n8n UI, create new workflow
2. Add Webhook node with path `/webhook/wp-order-complete`
3. Add Code node to verify HMAC
4. Add processing nodes (email, database, etc.)
5. Export workflow JSON to `n8n/workflows/wp-order-complete.json`

### Customize PR Creation Logic

Edit `.github/workflows/n8n-auto-create-pr.yml`:

```yaml
- name: Extract branch info
  id: branch
  run: |
    # Custom logic to generate PR title/body
    TITLE="feat: $(git log -1 --pretty=%s)"
    BODY=$(git log -1 --pretty=%b)
    echo "title=$TITLE" >> $GITHUB_OUTPUT
    echo "body=$BODY" >> $GITHUB_OUTPUT
```

---

## 📊 Workflows Available

### 1. WP Contact (`wp-contact.json`)
- **Trigger**: Contact Form 7 submission
- **Actions**: Verify signature, echo data
- **Extend to**: Send email, save to CRM, create issue

### 2. WP User Registered (`wp-user-registered.json`)
- **Trigger**: WordPress user registration
- **Actions**: Acknowledge receipt
- **Extend to**: Send welcome email, add to mailing list

### 3. GitHub Create PR (`github-create-pr.json`)
- **Trigger**: n8n webhook from GitHub Actions
- **Actions**: Verify signature, create GitHub PR
- **Requires**: GITHUB_TOKEN environment variable

### 4. GitHub Merge PR (`github-merge-pr.json`)
- **Trigger**: n8n webhook from GitHub Actions
- **Actions**: Verify signature, merge GitHub PR
- **Requires**: GITHUB_TOKEN environment variable

---

## 🧪 Testing

### Test WordPress Events Locally

```bash
# Start WordPress + n8n
docker compose -f docker-compose.yml -f compose.n8n.yml up -d

# Test contact webhook directly
SECRET="your-shared-secret"
PAYLOAD='{"data":{"name":"Test","email":"test@example.com"},"event":"cf7_mail_sent"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:5678/webhook/wp-contact \
  -H "Content-Type: application/json" \
  -H "X-Istani-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test GitHub PR Creation

```bash
# Set your secret
SECRET="your-shared-secret"
PAYLOAD='{"branch":"test/auto-pr","title":"Test PR","body":"Auto-created test","base":"main"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:5678/webhook/github-create-pr \
  -H "Content-Type: application/json" \
  -H "X-Istani-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test Auto-Merge

```bash
SECRET="your-shared-secret"
PAYLOAD='{"pr_number":123,"merge_method":"squash","commit_title":"Test merge"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:5678/webhook/github-merge-pr \
  -H "Content-Type: application/json" \
  -H "X-Istani-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 🌐 Production Deployment

### Option 1: Cloudflare Tunnel (Recommended)

```bash
# Install cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/

# Create tunnel
cloudflared tunnel create istani-n8n

# Configure tunnel
cat > config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: /path/to/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: n8n.istani.org
    service: http://localhost:5678
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run istani-n8n
```

Update GitHub secrets:
- `N8N_WEBHOOK_URL`: `https://n8n.istani.org/webhook/github-create-pr`
- `N8N_WEBHOOK_URL_MERGE`: `https://n8n.istani.org/webhook/github-merge-pr`

### Option 2: Reverse Proxy (nginx/Caddy)

```nginx
# nginx config
server {
    listen 443 ssl http2;
    server_name n8n.istani.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔍 Troubleshooting

### n8n workflows not triggering

1. Check n8n is running: `docker ps | grep n8n`
2. Check workflows are active in n8n UI
3. Verify webhook URLs in GitHub secrets
4. Check n8n logs: `docker logs n8n`

### WordPress events not reaching n8n

1. Verify mu-plugin is copied: `docker exec wordpress ls /var/www/html/wp-content/mu-plugins/`
2. Check WordPress error log
3. Test webhook manually (see Testing section)
4. Verify n8n is reachable from WordPress container: `docker exec wordpress ping n8n`

### HMAC signature verification failing

1. Ensure same secret in all places (.env, n8n env, GitHub secrets)
2. Check payload format matches exactly (JSON stringify, no extra whitespace)
3. Verify header name: `X-Istani-Signature`

### GitHub PR creation failing

1. Verify GITHUB_TOKEN has `repo` scope
2. Check token is set in n8n environment
3. Verify GITHUB_REPO format: `owner/repo`
4. Check n8n logs for API errors

---

## 💡 Tips & Tricks

### Monitor all webhooks

Create a catch-all workflow in n8n:

```json
{
  "name": "Monitor All Webhooks",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "monitor",
        "responseMode": "lastNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "jsCode": "console.log('Webhook received:', $json); return [$json];"
      },
      "name": "Log",
      "type": "n8n-nodes-base.code"
    }
  ]
}
```

### Auto-label PRs based on branch name

Modify `n8n/workflows/github-create-pr.json` to add labels:

```javascript
// After creating PR, add labels
const labels = [];
if (branch.includes('fix/')) labels.push('bug');
if (branch.includes('feat/')) labels.push('feature');
if (branch.includes('docs/')) labels.push('documentation');

if (labels.length > 0) {
  // Call GitHub API to add labels
}
```

### Send Slack notifications

Add Slack node to any n8n workflow:

1. Install Slack app credentials in n8n
2. Add Slack node after webhook processing
3. Send formatted message with event details

---

## 📚 Resources

- **n8n Documentation**: https://docs.n8n.io/
- **n8n GitHub**: https://github.com/n8n-io/n8n
- **WordPress Hooks**: https://developer.wordpress.org/reference/hooks/
- **GitHub REST API**: https://docs.github.com/en/rest
- **HMAC Authentication**: https://www.okta.com/identity-101/hmac/

---

## 🎉 What You Get

✅ **Auto-Create PRs** - Push to feature branch → PR created automatically
✅ **Auto-Merge PRs** - All checks pass → PR merged automatically
✅ **WordPress Events** - CF7, users, posts, comments → n8n processing
✅ **HMAC Security** - All webhooks verified with signatures
✅ **100% Open Source** - No proprietary services, no vendor lock-in
✅ **No API Keys** - Only need GitHub token for PR operations
✅ **Fully Customizable** - Add workflows for any event
✅ **Self-Hosted** - Complete control over your data

**Your ISTANI platform now has enterprise-grade automation with n8n! 🚀**

---

**Repository**: `sano1233/istani`
**n8n Version**: latest (auto-updates from n8nio/n8n:latest)
**License**: MIT (n8n: Fair-code, Apache 2.0 with commons clause)
