#!/bin/bash
set -e

DROPLET_IP="142.93.68.152"
DOMAIN="armautotx.com"
SRC_DIR="$PWD/src"

echo "🚀 Deploying ARM Auto Repair to DigitalOcean Droplet..."

# Wait for SSH to be ready
echo "⏳ Waiting for SSH..."
for i in {1..30}; do
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$DROPLET_IP "echo SSH ready" 2>/dev/null; then
        echo "✅ SSH connection established"
        break
    fi
    echo "   Attempt $i/30..."
    sleep 2
done

# Wait for cloud-init to finish
echo "⏳ Waiting for cloud-init to finish installing nginx..."
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP "cloud-init status --wait" || true

# Upload website files
echo "📤 Uploading website files..."
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP "mkdir -p /var/www/armautotx.com"
scp -o StrictHostKeyChecking=no -r $SRC_DIR/* root@$DROPLET_IP:/var/www/armautotx.com/

# Configure nginx
echo "⚙️  Configuring nginx..."
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP "cat > /etc/nginx/sites-available/armautotx.com << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name armautotx.com www.armautotx.com $DROPLET_IP;

    root /var/www/armautotx.com;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Caching for static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
}
NGINXCONF"

# Enable site
echo "🔗 Enabling site..."
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP "ln -sf /etc/nginx/sites-available/armautotx.com /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"

# Test site
echo "🧪 Testing site..."
if curl -s -o /dev/null -w "%{http_code}" http://$DROPLET_IP | grep -q "200"; then
    echo "✅ Site is live at http://$DROPLET_IP"
else
    echo "⚠️  Site might not be ready yet"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update Namecheap DNS for armautotx.com:"
echo "   Type: A"
echo "   Host: @"
echo "   Value: $DROPLET_IP"
echo ""
echo "2. Add www subdomain:"
echo "   Type: A"
echo "   Host: www"
echo "   Value: $DROPLET_IP"
echo ""
echo "3. Wait 5-10 minutes for DNS propagation, then run:"
echo "   ssh root@$DROPLET_IP 'certbot --nginx -d armautotx.com -d www.armautotx.com --non-interactive --agree-tos -m YOUR_EMAIL'"
echo ""
echo "🌐 Test now: http://$DROPLET_IP"
