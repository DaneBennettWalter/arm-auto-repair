# ARM Auto Repair - Deployment Information

## ✅ Successfully Deployed

**Date:** 2026-05-03  
**Status:** Live (HTTP only, SSL pending)

---

## Server Details

**Provider:** DigitalOcean  
**Droplet ID:** 568810958  
**IP Address:** 142.93.68.152  
**Region:** NYC3 (New York)  
**Size:** s-1vcpu-512mb-10gb ($4/month)  
**OS:** Ubuntu 22.04 LTS

---

## URLs

**Direct IP (works now):** http://142.93.68.152  
**Domain (5-10 min for DNS):** http://armautotx.com  
**WWW:** http://www.armautotx.com

---

## DNS Configuration

**Updated via Namecheap API on 2026-05-03**

```
Type: A
Host: @
Value: 142.93.68.152
TTL: 300

Type: A
Host: www
Value: 142.93.68.152
TTL: 300
```

**Propagation Status:** In progress (5-10 minutes typically)

Check DNS: `dig armautotx.com +short`

---

## SSL Certificate (Next Step)

Once DNS propagates (test: `ping armautotx.com` returns 142.93.68.152):

### Option 1: Automated (Recommended)
```bash
ssh root@142.93.68.152 'certbot --nginx -d armautotx.com -d www.armautotx.com --non-interactive --agree-tos -m YOUR_EMAIL_HERE'
```

Replace `YOUR_EMAIL_HERE` with actual email for Let's Encrypt notifications.

### Option 2: Interactive
```bash
ssh root@142.93.68.152
certbot --nginx
# Follow prompts
```

**After SSL is installed:**
- Site will automatically redirect HTTP → HTTPS
- Certificate auto-renews every 90 days
- Test: https://armautotx.com

---

## What's Live

### Pages
- ✅ Homepage (`/`) - Hero, services, certification, service area, contact
- ✅ Services (`/services.html`) - 37 services across 7 categories

### Features
- ✅ Mobile responsive design
- ✅ Click-to-call phone links
- ✅ Contact form (needs Formspree setup)
- ✅ Mobile sticky call button
- ✅ SEO-optimized meta tags
- ✅ Coastal Bend regional coverage

### Still Needed
- ⏳ SSL certificate (after DNS propagates)
- ⏳ Logo image (placeholder in place)
- ⏳ Aerial footage background (optional)
- ⏳ Formspree contact form endpoint

---

## Files Deployed

All files from `/src/` uploaded to `/var/www/armautotx.com/`:

```
/var/www/armautotx.com/
├── index.html
├── services.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── images/
    └── logo.png (placeholder)
```

---

## Nginx Configuration

**Config file:** `/etc/nginx/sites-available/armautotx.com`  
**Enabled:** `/etc/nginx/sites-enabled/armautotx.com` (symlink)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name armautotx.com www.armautotx.com 142.93.68.152;

    root /var/www/armautotx.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Static asset caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

After SSL, Certbot will modify this to add HTTPS and redirects.

---

## Server Access

**SSH:**
```bash
ssh root@142.93.68.152
```

**SSH Key:** `openclaw-arm-auto-repair` (ID: 56075328)  
**Local key:** `~/.ssh/id_rsa`

### Common Commands

**Restart nginx:**
```bash
ssh root@142.93.68.152 'systemctl restart nginx'
```

**Check nginx status:**
```bash
ssh root@142.93.68.152 'systemctl status nginx'
```

**View nginx logs:**
```bash
ssh root@142.93.68.152 'tail -f /var/log/nginx/access.log'
```

**Update website files:**
```bash
cd ~/.openclaw/workspace/arm-auto-repair
scp -r src/* root@142.93.68.152:/var/www/armautotx.com/
```

---

## Monitoring

**DigitalOcean Monitoring:** Enabled  
**Backups:** Disabled (can enable for +$0.80/month)  
**Tags:** `web`, `arm-auto-repair`

---

## Cost

**Monthly:** $4.00  
**Yearly:** $48.00

(Plus domain renewal: ~$15/year via Namecheap)

---

## Next Actions

### Immediate (once DNS propagates - ~10 min)
1. Install SSL certificate:
   ```bash
   ssh root@142.93.68.152 'certbot --nginx -d armautotx.com -d www.armautotx.com --non-interactive --agree-tos -m EMAIL'
   ```

2. Test HTTPS:
   ```bash
   curl -I https://armautotx.com
   ```

### Soon
1. Add ARM logo to `/var/www/armautotx.com/images/logo.png`
2. Set up Formspree for contact form
3. Add aerial footage background image
4. Submit sitemap to Google Search Console
5. Update/create Google Business Profile with new website

### Later
1. Set up uptime monitoring (UptimeRobot free tier)
2. Enable DigitalOcean backups ($0.80/month)
3. Add Google Analytics or Plausible
4. Take real shop photos and replace placeholders

---

## Rollback Plan

If something breaks:

1. **Destroy droplet:**
   ```bash
   source ~/.openclaw/workspace/.env
   curl -X DELETE "https://api.digitalocean.com/v2/droplets/568810958" \
     -H "Authorization: Bearer $DIGITALOCEAN_API_KEY"
   ```

2. **Redeploy:**
   ```bash
   cd ~/.openclaw/workspace/arm-auto-repair
   ./deploy-to-droplet.sh
   ```

---

## Support

- **DigitalOcean:** support.digitalocean.com
- **Namecheap:** namecheap.com/support
- **Let's Encrypt:** community.letsencrypt.org

---

**Last Updated:** 2026-05-03 20:30 EDT  
**GitHub:** https://github.com/DaneBennettWalter/arm-auto-repair
