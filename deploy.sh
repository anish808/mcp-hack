#!/bin/bash

# Deploy MCP Observability to DigitalOcean
set -e

# Configuration
SERVER_IP="137.184.85.124"
SERVER_USER="root"
DEPLOY_DIR="/opt/mcp-observability"

echo "🚀 Starting efficient deployment to DigitalOcean droplet..."

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy .env.production template and fill in your values:"
    echo "- CLERK_SECRET_KEY"
    echo "- VITE_CLERK_PUBLISHABLE_KEY"
    echo "- Update POSTGRES_PASSWORD"
    exit 1
fi

echo "📋 Preparing deployment bundle..."

# Create a temporary deployment directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Copy only necessary files (excluding node_modules, build artifacts, etc.)
echo "📦 Copying application files..."
rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='test-*' \
    --exclude='examples/hello-world/venv' \
    --exclude='examples/hello-world/.venv' \
    --exclude='**/venv' \
    --exclude='**/.venv' \
    --exclude='**/__pycache__' \
    --exclude='*.pyc' \
    --exclude='coverage' \
    --exclude='*.sqlite' \
    --exclude='*.db' \
    ./ $TEMP_DIR/

echo "🌐 Connecting to server $SERVER_IP..."

# Install Docker and Docker Compose on the server if not already installed
ssh $SERVER_USER@$SERVER_IP << 'EOF'
echo "🔧 Setting up server environment..."

# Update package manager
apt-get update

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose standalone if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Create deployment directory
mkdir -p /opt/mcp-observability
EOF

echo "📤 Efficiently transferring files to server..."

# Use rsync for efficient file transfer (only transfers changed files)
rsync -avz \
    --progress \
    --delete \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='**/venv' \
    --exclude='**/.venv' \
    --exclude='**/__pycache__' \
    $TEMP_DIR/ $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/

echo "🚀 Deploying application..."

# Deploy and start the application
ssh $SERVER_USER@$SERVER_IP << EOF
cd $DEPLOY_DIR

echo "🔄 Stopping existing containers..."
docker-compose -f compose.production.yaml down --remove-orphans || true

echo "🏗️  Building and starting new containers..."
docker-compose -f compose.production.yaml --env-file .env.production up -d --build

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service status..."
docker-compose -f compose.production.yaml ps

echo "📊 Checking logs..."
docker-compose -f compose.production.yaml logs --tail=20

echo "🔥 Setting up firewall rules..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
ufw --force enable || true

echo "✅ Deployment complete!"
echo "🌐 Frontend available at: http://137.184.85.124"
echo "📡 Backend API available at: http://137.184.85.124:3001"
echo ""
echo "🔧 To monitor logs: docker-compose -f compose.production.yaml logs -f"
echo "🔄 To restart services: docker-compose -f compose.production.yaml restart"
echo "🛑 To stop services: docker-compose -f compose.production.yaml down"
EOF

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your application is now live at:"
echo "   Frontend: http://137.184.85.124"
echo "   Backend:  http://137.184.85.124:3001"
echo ""
echo "💡 Next steps:"
echo "   1. Test your application in a browser"
echo "   2. Set up SSL certificates for HTTPS (optional)"
echo "   3. Configure a domain name (optional)" 