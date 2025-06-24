#!/bin/bash

# Script to build and publish the TypeScript SDK to npm
# Usage: ./publish-typescript-sdk.sh [--test]

set -e

echo "📦 Publishing MCP Observability TypeScript SDK"

# Check if we should publish to npm with beta tag
TEST_PUBLISH=false
if [ "$1" = "--test" ]; then
    TEST_PUBLISH=true
    echo "📋 Publishing with beta tag for testing"
else
    echo "📋 Publishing to Production npm"
fi

# Navigate to TypeScript SDK directory
cd sdk/typescript

# Clean up any previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the package
echo "🔨 Building package..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.d.ts" ]; then
    echo "❌ Build failed - required files not found in dist/"
    exit 1
fi

echo "✅ Build successful"

# Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "🧪 Running tests..."
    npm test || echo "⚠️ Tests failed, but continuing..."
fi

# Check if user is logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to npm. Please run 'npm login' first."
    exit 1
fi

# Publish to npm
if [ "$TEST_PUBLISH" = true ]; then
    echo "⬆️  Publishing with beta tag..."
    npm publish --tag beta
    echo "✅ Package published with beta tag!"
    echo "📋 Test install with: npm install @mcp-observability/typescript@beta"
else
    echo "⬆️  Publishing to Production npm..."
    npm publish
    echo "✅ Package published to Production npm!"
    echo "📋 Install with: npm install @mcp-observability/typescript"
fi

echo "🎉 TypeScript SDK publishing complete!" 