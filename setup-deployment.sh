#!/bin/bash

echo "🔧 Setting up MCP Observability for production deployment..."

# Create production environment file from template
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from template..."
    cp env.production.template .env.production
    echo "✅ Created .env.production"
    echo ""
    echo "🔑 Please edit .env.production and set your values:"
    echo "   - CLERK_SECRET_KEY (from Clerk dashboard)"
    echo "   - VITE_CLERK_PUBLISHABLE_KEY (from Clerk dashboard)"
    echo "   - POSTGRES_PASSWORD (choose a secure password)"
    echo ""
    echo "📝 Opening .env.production for editing..."
    
    # Try to open with common editors
    if command -v code &> /dev/null; then
        code .env.production
    elif command -v nano &> /dev/null; then
        nano .env.production
    elif command -v vim &> /dev/null; then
        vim .env.production
    else
        echo "Please edit .env.production manually with your preferred editor"
    fi
else
    echo "✅ .env.production already exists"
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "📋 Deployment checklist:"
echo "   ✅ .dockerignore files created (reduces build time)"
echo "   ✅ Production Docker configs created"
echo "   ✅ Nginx config for frontend created"
echo "   ✅ Deployment script created"
echo ""
echo "🔑 Make sure you have:"
echo "   - Filled in your Clerk keys in .env.production"
echo "   - Set a secure POSTGRES_PASSWORD in .env.production"
echo "   - SSH access to your DigitalOcean droplet (137.184.85.124)"
echo ""
echo "🚀 To deploy, run:"
echo "   ./deploy.sh"
echo ""
echo "💡 This will:"
echo "   - Install Docker on your droplet (if needed)"
echo "   - Transfer only necessary files (fast!)"
echo "   - Build and start all services"
echo "   - Set up firewall rules"
echo "   - Make your app available at http://137.184.85.124" 