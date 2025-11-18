# istani.org Domain Setup - Quick Start Guide

## 🎯 Goal

Configure istani.org to work with your Vercel deployment with zero errors.

---

## 📋 Prerequisites Checklist

- [x] ✅ Application builds successfully (verified)
- [x] ✅ All TypeScript errors fixed (verified)
- [x] ✅ Vercel configuration optimized (verified)
- [ ] ⏳ Vercel account created
- [ ] ⏳ Project deployed to Vercel
- [ ] ⏳ Environment variables configured
- [ ] ⏳ Domain ownership (istani.org)
- [ ] ⏳ Access to domain registrar or DNS provider

---

## 🚀 Method 1: Vercel-Only Setup (Simplest)

### Step 1: Deploy to Vercel First

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Or use the deployment script:

```bash
./deploy-vercel.sh
```

### Step 2: Add Domain in Vercel Dashboard

1. **Open Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Add Domain:**
   - Go to: **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter: `istani.org`
   - Click **"Add"**

3. **Add www subdomain (optional but recommended):**
   - Click **"Add Domain"** again
   - Enter: `www.istani.org`
   - Select: "Redirect to istani.org" (recommended)
   - Click **"Add"**

### Step 3: Configure DNS at Your Registrar

Vercel will show you the required DNS records. Add these at your domain registrar:

**For Root Domain (istani.org):**

```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**For WWW Subdomain:**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Step 4: Verify Configuration

**In Vercel Dashboard:**

- Domain status should show "Valid Configuration" (may take 5-30 minutes)
- SSL certificate will be automatically provisioned

**Test in Terminal:**

```bash
# Check DNS propagation
dig istani.org

# Should return: 76.76.21.21

# Check HTTPS
curl -I https://istani.org
```

---

## 🌐 Method 2: Cloudflare + Vercel (Advanced)

Use this if you want:

- Free CDN and caching
- DDoS protection
- Advanced security features
- Detailed analytics

### Step 1: Add Site to Cloudflare

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com

2. **Add Site:**
   - Click **"Add a Site"**
   - Enter: `istani.org`
   - Select: **Free** plan
   - Click **"Add Site"**

3. **Review DNS Records:**
   - Cloudflare will scan existing DNS records
   - Review and confirm
   - Click **"Continue"**

### Step 2: Update Nameservers

Cloudflare will provide nameservers like:

```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Update at Your Domain Registrar:**

1. Login to your registrar (GoDaddy, Namecheap, etc.)
2. Find DNS/Nameserver settings
3. Replace existing nameservers with Cloudflare's
4. Save changes

**Wait for Propagation:**

- Usually 5-30 minutes
- Can take up to 24-48 hours
- Check status in Cloudflare dashboard

### Step 3: Configure DNS in Cloudflare

**Add these DNS records:**

1. **Root Domain:**

   ```
   Type: A
   Name: @
   IPv4 address: 76.76.21.21
   Proxy status: ✅ Proxied (orange cloud icon)
   TTL: Auto
   ```

2. **WWW Subdomain:**
   ```
   Type: CNAME
   Name: www
   Target: istani.org
   Proxy status: ✅ Proxied (orange cloud icon)
   TTL: Auto
   ```

### Step 4: Configure Cloudflare Settings

**SSL/TLS Settings:**

1. Go to: **SSL/TLS** → **Overview**
2. Set encryption mode: **Full (strict)**
3. Go to: **SSL/TLS** → **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ HTTP Strict Transport Security (HSTS)

**Speed Settings:**

1. Go to: **Speed** → **Optimization**
2. Enable:
   - ✅ Auto Minify: HTML, CSS, JavaScript
   - ✅ Brotli
   - ❌ Rocket Loader (DISABLE - breaks Next.js)

**Caching:**

1. Go to: **Caching** → **Configuration**
2. Set:
   - Caching Level: **Standard**
   - Browser Cache TTL: **4 hours**

**Page Rules (3 free rules):**

1. **Bypass Cache for API:**

   ```
   URL: https://istani.org/api/*
   Settings:
     - Cache Level: Bypass
   ```

2. **Cache Static Assets:**

   ```
   URL: https://istani.org/_next/static/*
   Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
   ```

3. **Force HTTPS:**
   ```
   URL: http://istani.org/*
   Settings:
     - Always Use HTTPS
   ```

### Step 5: Add Domain to Vercel

Even with Cloudflare, you should add the domain to Vercel:

1. Go to Vercel Dashboard → Settings → Domains
2. Add: `istani.org`
3. Vercel will detect it's using Cloudflare
4. Follow any additional verification steps

---

## 🔍 Common DNS Configurations by Registrar

### GoDaddy

1. Login to GoDaddy
2. My Products → Domain → DNS
3. Add/Edit DNS records:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

### Namecheap

1. Login to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add records:
   - A record: `@` → `76.76.21.21` → TTL: Automatic
   - CNAME: `www` → `cname.vercel-dns.com` → TTL: Automatic

### Google Domains

1. Login to Google Domains
2. My Domains → DNS
3. Custom records:
   - A: `@` → `76.76.21.21` → 3600
   - CNAME: `www` → `cname.vercel-dns.com` → 3600

### Cloudflare (as DNS only)

1. Follow Method 2 steps above
2. Set Proxy status based on preference:
   - Proxied (orange): Use Cloudflare CDN
   - DNS only (gray): Direct to Vercel

---

## ✅ Verification Steps

### 1. DNS Propagation Check

**Online Tools:**

- https://dnschecker.org/?domain=istani.org
- https://www.whatsmydns.net/#A/istani.org

**Command Line:**

```bash
# Check A record
dig istani.org +short
# Should return: 76.76.21.21

# Check CNAME for www
dig www.istani.org +short
# Should return: istani.org or cname.vercel-dns.com

# Check nameservers
dig NS istani.org +short
```

### 2. Website Accessibility

**Browser Test:**

```
https://istani.org          → Should load your site
https://www.istani.org      → Should redirect to https://istani.org
http://istani.org           → Should redirect to https://istani.org
```

**Command Line:**

```bash
# Test HTTP redirect to HTTPS
curl -I http://istani.org
# Should show: 301 or 308 redirect to https://istani.org

# Test HTTPS
curl -I https://istani.org
# Should show: HTTP/2 200 OK
```

### 3. SSL Certificate Check

**Browser:**

- Click padlock icon in address bar
- Certificate should be valid
- Issued by: Let's Encrypt or ZeroSSL

**Command Line:**

```bash
# Check SSL certificate
openssl s_client -connect istani.org:443 -servername istani.org 2>/dev/null | openssl x509 -noout -dates

# Check SSL Labs grade
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=istani.org
```

### 4. API Endpoints Test

```bash
# Health check
curl https://istani.org/api/health

# Should return JSON:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "services": { ... }
# }
```

---

## 🐛 Troubleshooting

### Domain shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Cause:** DNS records not propagated yet

**Solution:**

1. Wait 5-30 minutes for DNS propagation
2. Clear DNS cache:

   ```bash
   # Windows
   ipconfig /flushdns

   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches
   ```

3. Try different DNS server (8.8.8.8 or 1.1.1.1)

---

### "NET::ERR_CERT_COMMON_NAME_INVALID"

**Cause:** SSL certificate not provisioned yet

**Solution:**

1. Wait 5-10 minutes for Vercel to provision certificate
2. Check Vercel Dashboard → Settings → Domains for certificate status
3. If using Cloudflare, ensure SSL mode is "Full (strict)"

---

### "502 Bad Gateway" or "504 Gateway Timeout"

**Cause:**

- Vercel deployment failed
- Environment variables missing
- Function timeout

**Solution:**

1. Check Vercel deployment status in dashboard
2. Verify environment variables are set
3. Check function logs: `vercel logs`
4. Redeploy: `vercel --prod`

---

### Mixed Content Warnings

**Cause:** Some resources loading over HTTP instead of HTTPS

**Solution:**

1. Enable "Always Use HTTPS" in Cloudflare (if using)
2. Check that all external resources use HTTPS
3. Add security headers (already configured in vercel.json)

---

### Cloudflare "522" Error

**Cause:** Cloudflare can't connect to origin (Vercel)

**Solution:**

1. Verify A record points to correct IP: 76.76.21.21
2. Temporarily disable Cloudflare proxy (gray cloud)
3. Verify Vercel deployment is working
4. Re-enable proxy (orange cloud)

---

## 📊 Expected Timelines

| Action                         | Expected Time  |
| ------------------------------ | -------------- |
| DNS record updates             | 5-30 minutes   |
| Nameserver changes             | 1-24 hours     |
| SSL certificate provisioning   | 5-10 minutes   |
| Cloudflare activation          | 24-48 hours    |
| Full DNS propagation worldwide | Up to 48 hours |

---

## 🎯 Quick Checklist

### Vercel Setup

- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] Environment variables configured
- [ ] Domain added in Vercel dashboard
- [ ] SSL certificate shows as "Valid"

### DNS Configuration

- [ ] A record: `@` → `76.76.21.21`
- [ ] CNAME: `www` → `cname.vercel-dns.com` or `istani.org`
- [ ] DNS propagation verified
- [ ] `dig istani.org` returns correct IP

### Testing

- [ ] https://istani.org loads correctly
- [ ] https://www.istani.org redirects properly
- [ ] SSL certificate valid (green padlock)
- [ ] API health check works: https://istani.org/api/health

### Optional (Cloudflare)

- [ ] Site added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS records configured with proxy enabled
- [ ] SSL mode set to "Full (strict)"
- [ ] Speed optimizations enabled
- [ ] Page rules configured

---

## 📞 Need Help?

### Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
- **Cloudflare Docs:** https://developers.cloudflare.com/dns/
- **DNS Checker:** https://dnschecker.org
- **SSL Test:** https://www.ssllabs.com/ssltest/

### Support

- **Vercel Support:** support@vercel.com
- **Cloudflare Community:** https://community.cloudflare.com
- **This Project:** See VERCEL-SETUP-GUIDE.md for detailed instructions

---

**Last Updated:** 2025-11-18
**Status:** ✅ Ready for Domain Configuration
**Estimated Setup Time:** 30-60 minutes (+ DNS propagation)
