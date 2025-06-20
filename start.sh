#!/bin/bash

set -e

echo "🚀 MCP Observability System Startup"
echo "=================================="

# Function to print colored output
print_step() {
    echo -e "\n🔹 $1"
}

print_success() {
    echo -e "✅ $1"
}

print_info() {
    echo -e "💡 $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

print_step "Starting MCP Observability System..."

# Build and start all services
docker-compose up --build -d

print_step "Waiting for services to be healthy..."
sleep 10

# Check service health
echo -e "\n📊 Service Status:"
docker-compose ps

print_step "Testing service connectivity..."

# Test backend
if curl -f http://localhost:3001/traces > /dev/null 2>&1; then
    print_success "Backend API is responding"
else
    echo "⚠️  Backend API may still be starting up..."
fi

# Test frontend
if curl -f http://localhost:5173/ > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    echo "⚠️  Frontend may still be starting up..."
fi

# Test MCP server
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    print_success "MCP Server is running"
else
    echo "⚠️  MCP Server may still be starting up..."
fi

echo -e "\n🌟 MCP Observability System Started!"
echo "=================================="
print_info "Frontend Dashboard: http://localhost:5173"
print_info "Backend API: http://localhost:3001"
print_info "MCP Server (HTTP): http://localhost:8000"
print_info "Database: postgresql://user:password@localhost:5433/mcp_observability"

echo -e "\n📋 Next Steps:"
echo "1. Install Claude Desktop configuration:"
echo "   docker-compose --profile tools run --rm claude-config"
echo ""
echo "2. Or manually configure Claude Desktop:"
echo "   cd examples/hello-world && python3 install_to_claude.py"
echo ""
echo "3. Restart Claude Desktop to pick up the new MCP server"
echo ""
echo "4. View logs: docker-compose logs -f"
echo "5. Stop system: docker-compose down"

echo -e "\n🔍 View live logs with:"
echo "docker-compose logs -f" 