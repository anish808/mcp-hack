#!/bin/bash

# Update MCP Observability for custom domain
set -e

echo "🌐 Setting up custom domain for MCP Observability..."

# Get domain name from user
if [ -z "$1" ]; then
    echo "Usage: $0 <your-domain.com>"
    echo "Example: $0 mcp-observability.com"
    exit 1
fi

DOMAIN=$1
SERVER_IP="137.184.85.124"
SERVER_USER="root"
DEPLOY_DIR="/opt/mcp-observability"

echo "📋 Domain: $DOMAIN"
echo "📋 Server: $SERVER_IP"

# 1. Update environment variables for the domain
echo "📝 Creating domain-specific environment file..."
cat > .env.production.domain << EOF
# Database Configuration
POSTGRES_USER=user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=mcp_observability

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_Q6Ju0qj0RBQBaOE36SUAWotKKyrXI34Gp0E4lq249K
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YW11c2VkLW1hY2F3LTI1LmNsZXJrLmFjY291bnRzLmRldiQ

# API URLs (Updated for custom domain)
VITE_API_URL=https://$DOMAIN/api

# Node Environment
NODE_ENV=production
EOF

# 2. Create updated Nginx configuration for the domain
echo "📝 Creating domain-specific Nginx configuration..."
cat > frontend/nginx.domain.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
        return 301 https://\$server_name\$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
        
        # SSL Certificate paths (will be set up with certbot)
        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
        
        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        
        root /usr/share/nginx/html;
        index index.html;

        # Serve frontend
        location / {
            try_files \$uri \$uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend:3001/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }
}
EOF

# Replace domain placeholder
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" frontend/nginx.domain.conf > frontend/nginx.conf.tmp
mv frontend/nginx.conf.tmp frontend/nginx.domain.conf

echo "✅ Domain configuration files created!"
echo ""
echo "📋 Next steps:"
echo "1. Set up DNS in Namecheap (A records pointing to $SERVER_IP)"
echo "2. Wait for DNS propagation (15-30 minutes)"
echo "3. Run: ./setup-ssl.sh $DOMAIN"
echo "4. Run: ./deploy.sh"
echo ""
echo "💡 DNS Records to add in Namecheap:"
echo "   Type: A, Host: @, Value: $SERVER_IP"
echo "   Type: A, Host: www, Value: $SERVER_IP"
EOF 