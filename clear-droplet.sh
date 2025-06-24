#!/bin/bash

# Clear DigitalOcean Droplet for fresh deployment
set -e

# Configuration
SERVER_IP="137.184.85.124"
SERVER_USER="root"
DEPLOY_DIR="/opt/mcp-observability"

echo "🧹 Clearing DigitalOcean droplet for fresh deployment..."

# Connect to server and clean up
ssh $SERVER_USER@$SERVER_IP << EOF
echo "🛑 Stopping any running containers..."
docker stop \$(docker ps -aq) 2>/dev/null || true

echo "🗑️  Removing all containers..."
docker rm \$(docker ps -aq) 2>/dev/null || true

echo "🖼️  Removing all images..."
docker rmi \$(docker images -q) 2>/dev/null || true

echo "💾 Removing all volumes..."
docker volume rm \$(docker volume ls -q) 2>/dev/null || true

echo "🌐 Removing all networks (except defaults)..."
docker network rm \$(docker network ls --filter type=custom -q) 2>/dev/null || true

echo "📁 Removing deployment directory..."
rm -rf $DEPLOY_DIR

echo "🧹 Cleaning Docker system..."
docker system prune -af --volumes 2>/dev/null || true

echo "📦 Freeing up disk space..."
apt-get autoremove -y
apt-get autoclean

echo "💽 Checking disk space..."
df -h

echo "✅ Droplet cleared and ready for fresh deployment!"
EOF

echo ""
echo "🎉 Droplet has been completely cleared!"
echo "🚀 Ready for fresh deployment. Run: ./deploy.sh" 