#!/bin/bash

echo "🧪 Testing MCP Observability Docker Setup"
echo "========================================"

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "Testing $name ($url)... "
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ SUCCESS (attempt $attempt)"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo "❌ FAILED after $max_attempts attempts"
    return 1
}

# Test backend API
test_endpoint "http://localhost:3001/traces" "Backend API"

# Test frontend
test_endpoint "http://localhost:5173/" "Frontend Dashboard"

# Test MCP server
test_endpoint "http://localhost:8000/" "MCP Server"

echo ""
echo "🔄 Testing MCP server functionality..."

# Test add function via HTTP
echo -n "Testing add function... "
if curl -s -X POST "http://localhost:8000/call" \
   -H "Content-Type: application/json" \
   -d '{"method":"add","params":{"a":15,"b":25}}' > /dev/null 2>&1; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
fi

# Test observability metrics
echo -n "Testing metrics function... "
if curl -s -X POST "http://localhost:8000/call" \
   -H "Content-Type: application/json" \
   -d '{"method":"get_observability_metrics","params":{}}' > /dev/null 2>&1; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
fi

echo ""
echo "📊 Checking Docker container health..."
docker-compose ps

echo ""
echo "🎉 Docker test complete!"
echo ""
echo "💡 Next steps:"
echo "1. Configure Claude Desktop: docker-compose --profile tools run --rm claude-config"
echo "2. Visit dashboard: http://localhost:5173"
echo "3. View container logs: docker-compose logs -f" 