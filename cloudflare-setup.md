# Cloudflare Setup Guide for ISTANI
## Free Tier - Global CDN & Security

---

## Step 1: Add Site to Cloudflare

1. **Sign up/Login** to [Cloudflare](https://dash.cloudflare.com/)
2. Click **"Add a Site"**
3. Enter domain: `istani.org`
4. Select **Free Plan** ($0/month)
5. Click **"Continue"**

---

## Step 2: Update DNS Records

Cloudflare will scan your existing DNS records. Update them as follows:

### Required DNS Records

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 76.76.21.21 | Proxied (Orange Cloud) | Auto |
| CNAME | www | cname.vercel-dns.com | Proxied (Orange Cloud) | Auto |
| CNAME | ai-agent | ai-agent.up.railway.app | Proxied (Orange Cloud) | Auto |
| CNAME | grafana | grafana.up.railway.app | Proxied (Orange Cloud) | Auto |
| TXT | @ | v=spf1 include:_spf.google.com ~all | DNS Only | Auto |

**Notes:**
- The A record IP (76.76.21.21) is Vercel's anycast IP
- Replace Railway URLs with your actual Railway app URLs
- Orange cloud icon = Proxied through Cloudflare (CDN enabled)
- Grey cloud icon = DNS only (no CDN)

---

## Step 3: Update Nameservers

1. Cloudflare will provide 2 nameservers (example):
   ```
   dana.ns.cloudflare.com
   mark.ns.cloudflare.com
   ```

2. **Update at your domain registrar** (GoDaddy, Namecheap, etc.):
   - Remove old nameservers
   - Add Cloudflare nameservers
   - Save changes

3. **Wait for propagation** (can take 24-48 hours, usually much faster)

4. **Verify** on Cloudflare dashboard - status will change to "Active"

---

## Step 4: SSL/TLS Configuration

### 4.1 SSL/TLS Mode

1. Go to **SSL/TLS** tab
2. Select **"Full (strict)"** mode
   - This ensures end-to-end encryption
   - Vercel provides SSL automatically
   - Cloudflare validates Vercel's certificate

### 4.2 Edge Certificates

1. Go to **SSL/TLS → Edge Certificates**
2. Enable:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Opportunistic Encryption**
   - ✅ **TLS 1.3**
   - ✅ **HTTP/2**
   - ✅ **HTTP/3 (with QUIC)**

### 4.3 Universal SSL Certificate

- Cloudflare auto-provisions a free SSL certificate
- Covers: `istani.org` and `*.istani.org`
- Auto-renews before expiration

---

## Step 5: Speed Optimization

### 5.1 Auto Minify

1. Go to **Speed → Optimization**
2. Enable Auto Minify for:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### 5.2 Brotli Compression

1. Go to **Speed → Optimization**
2. Enable **Brotli** compression

### 5.3 Rocket Loader

1. **Do NOT enable** Rocket Loader
   - Can break Next.js hydration
   - Next.js already optimizes JS loading

---

## Step 6: Caching Configuration

### 6.1 Caching Level

1. Go to **Caching → Configuration**
2. Set **Caching Level**: Standard

### 6.2 Browser Cache TTL

1. Set **Browser Cache TTL**: 4 hours
   - Balances cache performance with update frequency

### 6.3 Page Rules (Optional - 3 free rules)

Create the following page rules:

#### Rule 1: Cache Static Assets
```
URL: istani.org/_next/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

#### Rule 2: Force HTTPS
```
URL: http://istani.org/*
Settings:
- Always Use HTTPS: On
```

#### Rule 3: API Rate Limiting Protection
```
URL: istani.org/api/*
Settings:
- Cache Level: Bypass
- Security Level: High
```

---

## Step 7: Security Settings

### 7.1 Firewall Rules (Free: 5 rules)

#### Rule 1: Block Bad Bots
```
Expression: (cf.threat_score gt 10)
Action: Challenge (CAPTCHA)
```

#### Rule 2: Block Common Exploits
```
Expression:
  (http.request.uri.path contains ".env") or
  (http.request.uri.path contains "wp-admin") or
  (http.request.uri.path contains ".git") or
  (http.request.uri.path contains "phpMyAdmin")
Action: Block
```

#### Rule 3: Rate Limit API
```
Expression: (http.request.uri.path contains "/api/" and cf.threat_score gt 5)
Action: Challenge
```

#### Rule 4: Geo-Blocking (if needed)
```
Expression: (ip.geoip.country in {"XX" "YY"})
Action: Block
Note: Replace XX YY with actual country codes to block
```

### 7.2 Security Level

1. Go to **Security → Settings**
2. Set **Security Level**: Medium
   - Challenges suspicious visitors
   - Doesn't block legitimate traffic

### 7.3 Challenge Passage

1. Set **Challenge Passage**: 30 minutes
   - Visitors who pass challenge stay whitelisted for 30 min

### 7.4 Browser Integrity Check

1. Enable **Browser Integrity Check**
   - Blocks requests from bots that don't have a user agent

---

## Step 8: DDoS Protection

### Free DDoS Protection Included:

- ✅ HTTP DDoS attack mitigation (Layer 7)
- ✅ Network DDoS protection (Layer 3/4)
- ✅ Unmetered mitigation (no bandwidth limits)

**No configuration needed** - automatically active!

---

## Step 9: Analytics

### 9.1 Web Analytics

1. Go to **Analytics → Web Analytics**
2. Enable analytics
3. Add JavaScript snippet to site (Next.js):

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            src='https://static.cloudflareinsights.com/beacon.min.js'
            data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 10: Performance Features

### 10.1 Always Online

1. Go to **Caching → Configuration**
2. Enable **Always Online™**
   - Serves cached version if origin is down

### 10.2 Development Mode

- Enable when deploying updates
- Bypasses cache for 3 hours
- Useful for testing changes

---

## Step 11: Verify Configuration

### Checklist:

- [ ] Nameservers updated and active
- [ ] SSL/TLS set to "Full (strict)"
- [ ] Always Use HTTPS enabled
- [ ] Auto Minify enabled (JS, CSS, HTML)
- [ ] Brotli compression enabled
- [ ] Page rules configured (3 rules)
- [ ] Firewall rules configured (5 rules)
- [ ] Security level set to Medium
- [ ] Browser Integrity Check enabled
- [ ] Web Analytics enabled

### Test Your Setup:

1. **SSL Test**: https://www.ssllabs.com/ssltest/
   - Should get A or A+ rating

2. **Speed Test**: https://www.webpagetest.org/
   - Test from multiple locations

3. **Security Headers**: https://securityheaders.com/
   - Check security header grades

4. **DNS Propagation**: https://dnschecker.org/
   - Verify DNS is propagated globally

---

## Step 12: Additional Optimizations

### 12.1 APO (Automatic Platform Optimization)

**NOT NEEDED for Next.js/Vercel**
- Vercel Edge Network already handles this
- APO costs $5/month
- Skip this feature

### 12.2 Argo Smart Routing

**Optional ($5/month + usage)**
- Routes traffic through fastest network path
- Can reduce latency by 30%
- **Only enable if needed** (exceeds free budget)

### 12.3 Load Balancing

**Optional (starts at $5/month)**
- Multiple origin servers
- Health checks
- Failover
- **Not needed initially** (single Vercel deployment)

---

## Monitoring Cloudflare

### Daily Checks:

1. **Analytics Dashboard**
   - Requests
   - Bandwidth saved
   - Threats mitigated

2. **Security Events**
   - Firewall events
   - Bot attacks blocked
   - Rate limiting triggers

3. **Cache Performance**
   - Cache hit ratio (aim for >85%)
   - Bandwidth saved (aim for >60%)

---

## Cloudflare API (Advanced)

If you want to automate Cloudflare configuration:

### Install CLI:
```bash
npm install -g cloudflare-cli
```

### API Token:
1. Go to **My Profile → API Tokens**
2. Create token with permissions:
   - Zone: Read, Edit
   - DNS: Read, Edit
   - Cache Purge: Purge
3. Save token to `.env.production`:
   ```
   CLOUDFLARE_API_TOKEN=your-token-here
   CLOUDFLARE_ZONE_ID=your-zone-id
   ```

### Purge Cache Programmatically:
```typescript
// lib/cloudflare.ts
export async function purgeCache(files?: string[]) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: files || [process.env.NEXT_PUBLIC_SITE_URL],
      }),
    }
  );
  return response.json();
}
```

---

## Cost: $0/month ✅

Everything above is included in Cloudflare's **Free Plan**:

- ✅ Unlimited bandwidth
- ✅ Unlimited DDoS mitigation
- ✅ Universal SSL
- ✅ Global CDN (200+ cities)
- ✅ Analytics
- ✅ 5 Firewall Rules
- ✅ 3 Page Rules
- ✅ Automatic minification
- ✅ HTTP/2 & HTTP/3
- ✅ IPv6 support

**No credit card required!**

---

## Support

- **Community**: https://community.cloudflare.com/
- **Docs**: https://developers.cloudflare.com/
- **Status**: https://www.cloudflarestatus.com/

---

## Next Steps After Cloudflare Setup

1. **Verify** istani.org loads correctly
2. **Test** all subdomains (www, ai-agent, grafana)
3. **Check** SSL certificate (green padlock)
4. **Monitor** analytics for 24 hours
5. **Review** firewall events
6. **Optimize** cache hit ratio

---

**Setup Time:** ~30 minutes
**Propagation Time:** 1-24 hours
**Monthly Cost:** $0 (FREE!) 🎉

Cloudflare is now protecting and accelerating istani.org!
