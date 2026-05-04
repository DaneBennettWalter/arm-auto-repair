#!/bin/bash
set -e

# Load environment variables
source ~/.openclaw/workspace/.env

DOMAIN="armautotx.com"
SLD="armautotx"
TLD="com"
DROPLET_IP="142.93.68.152"

echo "🌐 Configuring DNS for $DOMAIN..."
echo ""

# Get current DNS records
echo "📋 Checking current DNS records..."
CURRENT_DNS=$(curl -s "https://api.namecheap.com/xml.response" \
  --data-urlencode "ApiUser=$NAMECHEAP_API_USER" \
  --data-urlencode "ApiKey=$NAMECHEAP_API_KEY" \
  --data-urlencode "UserName=$NAMECHEAP_USER" \
  --data-urlencode "ClientIp=$NAMECHEAP_CLIENT_IP" \
  --data-urlencode "Command=namecheap.domains.dns.getHosts" \
  --data-urlencode "SLD=$SLD" \
  --data-urlencode "TLD=$TLD")

echo "$CURRENT_DNS" | grep -q "Status=\"OK\"" && echo "✅ Current DNS retrieved" || echo "❌ Error getting DNS"

echo ""
echo "🔧 Setting DNS records..."
echo "   @ A → $DROPLET_IP"
echo "   www A → $DROPLET_IP"

# Set new DNS records
SET_DNS=$(curl -s "https://api.namecheap.com/xml.response" \
  --data-urlencode "ApiUser=$NAMECHEAP_API_USER" \
  --data-urlencode "ApiKey=$NAMECHEAP_API_KEY" \
  --data-urlencode "UserName=$NAMECHEAP_USER" \
  --data-urlencode "ClientIp=$NAMECHEAP_CLIENT_IP" \
  --data-urlencode "Command=namecheap.domains.dns.setHosts" \
  --data-urlencode "SLD=$SLD" \
  --data-urlencode "TLD=$TLD" \
  --data-urlencode "HostName1=@" \
  --data-urlencode "RecordType1=A" \
  --data-urlencode "Address1=$DROPLET_IP" \
  --data-urlencode "TTL1=300" \
  --data-urlencode "HostName2=www" \
  --data-urlencode "RecordType2=A" \
  --data-urlencode "Address2=$DROPLET_IP" \
  --data-urlencode "TTL2=300")

if echo "$SET_DNS" | grep -q "Status=\"OK\""; then
    echo "✅ DNS records updated successfully!"
else
    echo "❌ Error updating DNS:"
    echo "$SET_DNS"
    exit 1
fi

echo ""
echo "⏳ DNS propagation typically takes 5-30 minutes"
echo "   You can check status with: dig $DOMAIN +short"
echo ""
echo "🔐 Next: Configure nginx and SSL on the droplet..."

# Configure nginx on droplet
echo ""
echo "🌐 Configuring nginx for $DOMAIN..."

ssh -o StrictHostKeyChecking=no root@$DROPLET_IP << 'ENDSSH'
# Create nginx config for domain
cat > /etc/nginx/sites-available/armautotx.com << 'ENDNGINX'
server {
    listen 80;
    listen [::]:80;
    server_name armautotx.com www.armautotx.com;
    
    root /var/www/html;
    index index.html;
    
    # Serve files
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
ENDNGINX

# Enable the site
ln -sf /etc/nginx/sites-available/armautotx.com /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Nginx configured for domain"
ENDSSH

echo ""
echo "✅ Domain configuration complete!"
echo ""
echo "📋 Status:"
echo "   - DNS: Updated (propagating...)"
echo "   - Nginx: Configured for armautotx.com and www.armautotx.com"
echo "   - HTTP: Ready"
echo "   - HTTPS: Run SSL setup after DNS propagates"
echo ""
echo "🔐 After DNS propagates (5-30 min), run SSL setup:"
echo "   ssh root@$DROPLET_IP 'apt-get update && apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d armautotx.com -d www.armautotx.com --non-interactive --agree-tos -m dane@armautotx.com'"
echo ""
echo "🧪 Test URLs (once DNS propagates):"
echo "   http://armautotx.com"
echo "   http://www.armautotx.com"

