#!/bin/bash

# Setup SSL certificates with Let's Encrypt
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <your-domain.com>"
    echo "Example: $0 mcp-observability.com"
    exit 1
fi

DOMAIN=$1
SERVER_IP="137.184.85.124"
SERVER_USER="root"

echo "🔒 Setting up SSL certificates for $DOMAIN..."

# Check if DNS is propagated
echo "🔍 Checking DNS propagation..."
RESOLVED_IP=$(dig +short $DOMAIN || echo "")
if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
    echo "⚠️  Warning: DNS not fully propagated yet"
    echo "   Domain $DOMAIN resolves to: $RESOLVED_IP"
    echo "   Expected: $SERVER_IP"
    echo ""
    echo "Please wait for DNS propagation before continuing."
    echo "You can check DNS status at: https://dnschecker.org"
    exit 1
fi

echo "✅ DNS propagation confirmed!"

# Install and configure SSL on the server
ssh $SERVER_USER@$SERVER_IP << EOF
echo "📦 Installing Certbot..."
apt-get update
apt-get install -y snapd
snap install core; snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

echo "🔒 Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo "🔄 Setting up auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo "✅ SSL certificate installed successfully!"
EOF

echo ""
echo "🎉 SSL setup complete!"
echo "📋 Next steps:"
echo "1. Update your .env.production file with the domain"
echo "2. Update Nginx configuration to use the domain"
echo "3. Deploy: ./deploy.sh"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN" 