# Deployment Guide - ARM Auto Repair Website

## Pre-Deployment Checklist

### 1. Logo Setup
- [ ] Add logo file to `/src/images/logo.png`
- [ ] Optimize logo (recommended: 500x500px, WebP format with PNG fallback)
- [ ] Create favicon (16x16, 32x32, 180x180 for Apple)

### 2. Aerial Footage
- [ ] Extract still from YouTube video: https://www.youtube.com/watch?v=t7uc4SevP10
- [ ] Optimize image (WebP, ~1920x1080, under 500KB)
- [ ] Add to `/src/images/hero-bg.jpg` or `.webp`
- [ ] Update CSS in `styles.css` line 324:
  ```css
  .hero-background {
      background-image: url('../images/hero-bg.webp');
  }
  ```

### 3. Contact Form
- [ ] Sign up at formspree.io
- [ ] Create form
- [ ] Update form action in `index.html` (line 240)
- [ ] Test form submission

### 4. Content Verification
- [ ] Verify phone number: (361) 220-1629
- [ ] Verify address: 601 E Main St, Robstown, TX 78380
- [ ] Update business hours if needed (currently: M-F 8-6, Sat 8-2, Sun Closed)

---

## Deployment Option 1: DigitalOcean App Platform (Recommended)

### Why DigitalOcean?
- Simple static site hosting
- Automatic SSL
- Deploy from GitHub
- $5/month
- We already have API key

### Steps:

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Create DigitalOcean App**
   ```bash
   # Using DigitalOcean API
   source ~/.openclaw/workspace/.env
   
   curl -X POST "https://api.digitalocean.com/v2/apps" \
     -H "Authorization: Bearer $DIGITALOCEAN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "spec": {
         "name": "arm-auto-repair",
         "region": "nyc",
         "static_sites": [{
           "name": "web",
           "source_dir": "/src",
           "github": {
             "repo": "DaneBennettWalter/arm-auto-repair",
             "branch": "main"
           },
           "routes": [{
             "path": "/"
           }]
         }]
       }
     }'
   ```

3. **Configure Domain**
   - DigitalOcean will give you a URL like: `arm-auto-repair-xxxxx.ondigitalocean.app`
   - Note this URL for DNS setup

4. **Update Namecheap DNS**
   - Log into Namecheap
   - Go to armautotx.com DNS settings
   - Add CNAME record:
     - Host: `@` or `www`
     - Value: `arm-auto-repair-xxxxx.ondigitalocean.app`
     - TTL: Automatic
   - Or use A records (DigitalOcean will provide IPs)

5. **Add Custom Domain in DigitalOcean**
   - In App Platform dashboard
   - Add domain: `armautotx.com` and `www.armautotx.com`
   - SSL will be automatic

---

## Deployment Option 2: Namecheap Shared Hosting

### Why Namecheap?
- Domain + hosting in one place
- Simple cPanel interface
- Cheaper (~$3-5/month)
- Good for small sites

### Steps:

1. **Purchase Hosting**
   - Log into Namecheap
   - Buy hosting plan (Stellar or Stellar Plus)
   - Link to armautotx.com domain

2. **Upload Files via cPanel**
   - Log into cPanel (Namecheap will email credentials)
   - Go to File Manager
   - Navigate to `public_html`
   - Upload all files from `/src/`:
     - index.html
     - services.html
     - css/ folder
     - js/ folder
     - images/ folder

3. **SSL Certificate**
   - In cPanel, go to "SSL/TLS Status"
   - Enable AutoSSL for armautotx.com
   - Wait 10-15 minutes for cert to activate

4. **Test**
   - Visit https://armautotx.com
   - Test mobile responsive
   - Test contact form
   - Check SSL (green padlock)

---

## Post-Deployment Tasks

### 1. Google Search Console
```bash
# Create sitemap.xml
cat > sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://armautotx.com/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://armautotx.com/services.html</loc>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
EOF
```

- Go to [search.google.com/search-console](https://search.google.com/search-console)
- Add property: armautotx.com
- Verify ownership (DNS or file upload)
- Submit sitemap: `https://armautotx.com/sitemap.xml`

### 2. Google Business Profile
- Go to [business.google.com](https://business.google.com)
- Claim/update ARM Auto Repair listing
- Add:
  - Website: armautotx.com
  - Photos (logo, shop, work)
  - Services
  - Hours
  - Description

### 3. Analytics (Optional)
- Create Google Analytics account
- Get tracking code
- Add to bottom of `<head>` in both HTML files
- Or use Plausible for privacy-focused analytics

### 4. Testing
- [ ] Test on real iPhone
- [ ] Test on real Android
- [ ] Click-to-call works
- [ ] Contact form works
- [ ] All links work
- [ ] Images load
- [ ] Performance: Run Lighthouse in Chrome DevTools

---

## Performance Optimization

### Image Optimization
```bash
# Convert logo to WebP (if you have imagemagick)
convert logo.png -quality 85 logo.webp

# Or use online tool: squoosh.app
```

### Lighthouse Audit
1. Open site in Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Run audit
5. Target: 90+ on all metrics

---

## DNS Configuration Reference

### Namecheap DNS for DigitalOcean:

**If using CNAME:**
```
Type    Host    Value
CNAME   @       arm-auto-repair-xxxxx.ondigitalocean.app
CNAME   www     arm-auto-repair-xxxxx.ondigitalocean.app
```

**If using A records:**
```
Type    Host    Value
A       @       <DigitalOcean IP>
A       www     <DigitalOcean IP>
```

---

## Troubleshooting

### DNS not working
- Wait 24-48 hours for propagation (usually faster)
- Check DNS with: `dig armautotx.com`
- Clear browser cache

### SSL not working
- Wait 15 minutes after DNS propagation
- Check certificate status in hosting dashboard
- Force HTTPS in .htaccess (if using Namecheap)

### Images not loading
- Check file paths (case-sensitive on Linux servers)
- Verify images uploaded to correct directory
- Check browser console for 404 errors

### Contact form not working
- Verify Formspree endpoint is correct
- Check Formspree dashboard for submissions
- Test with different email
- Check spam folder

---

## Maintenance

### Regular Updates
- Monthly: Check for broken links
- Quarterly: Update service descriptions if offerings change
- Annually: Refresh photos, update testimonials

### Backups
- DigitalOcean: Automatic backups included
- Namecheap: Download files via cPanel monthly

### Monitoring
- Set up uptime monitoring (UptimeRobot free tier)
- Check Google Analytics monthly
- Monitor Google Business Profile reviews

---

## Support

If issues arise during deployment:
- DigitalOcean: support.digitalocean.com
- Namecheap: namecheap.com/support
- Formspree: formspree.io/help

## Next Steps After Launch

1. [ ] Share URL with customers
2. [ ] Add to business cards
3. [ ] Update social media
4. [ ] List on local directories
5. [ ] Consider Google Ads for immediate traffic
