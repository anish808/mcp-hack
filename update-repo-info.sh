#!/bin/bash

# Script to update repository URLs in both SDKs
# Usage: ./update-repo-info.sh YOUR_GITHUB_USERNAME YOUR_REPO_NAME

if [ $# -ne 2 ]; then
    echo "Usage: $0 <github_username> <repo_name>"
    echo ""
    echo "Example: $0 johndoe mcp-hack"
    echo ""
    echo "This will update all repository URLs from:"
    echo "  https://github.com/yourusername/mcp-observability"
    echo "to:"
    echo "  https://github.com/johndoe/mcp-hack"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2

echo "🔄 Updating repository URLs..."
echo "  Username: $USERNAME"
echo "  Repository: $REPO_NAME"
echo ""

# Backup files first
echo "📋 Creating backups..."
cp sdk/python/pyproject.toml sdk/python/pyproject.toml.bak
cp sdk/typescript/package.json sdk/typescript/package.json.bak
cp sdk/python/README.md sdk/python/README.md.bak
cp sdk/typescript/README.md sdk/typescript/README.md.bak

# Update Python SDK
echo "🐍 Updating Python SDK (pyproject.toml)..."
sed -i.tmp "s/yourusername/$USERNAME/g" sdk/python/pyproject.toml
sed -i.tmp "s/mcp-observability/$REPO_NAME/g" sdk/python/pyproject.toml

echo "🐍 Updating Python README..."
sed -i.tmp "s/yourusername/$USERNAME/g" sdk/python/README.md
sed -i.tmp "s/mcp-observability/$REPO_NAME/g" sdk/python/README.md

# Update TypeScript SDK
echo "📦 Updating TypeScript SDK (package.json)..."
sed -i.tmp "s/yourusername/$USERNAME/g" sdk/typescript/package.json
sed -i.tmp "s/mcp-observability/$REPO_NAME/g" sdk/typescript/package.json

echo "📦 Updating TypeScript README..."
sed -i.tmp "s/yourusername/$USERNAME/g" sdk/typescript/README.md
sed -i.tmp "s/mcp-observability/$REPO_NAME/g" sdk/typescript/README.md

# Clean up temp files
rm sdk/python/pyproject.toml.tmp
rm sdk/typescript/package.json.tmp
rm sdk/python/README.md.tmp
rm sdk/typescript/README.md.tmp

echo ""
echo "✅ Repository URLs updated successfully!"
echo ""
echo "📋 Updated URLs to:"
echo "  https://github.com/$USERNAME/$REPO_NAME"
echo ""
echo "🔍 Please review the changes:"
echo "  - sdk/python/pyproject.toml"
echo "  - sdk/typescript/package.json"
echo "  - Both README files"
echo ""
echo "💾 Backup files created (*.bak) in case you need to revert" 