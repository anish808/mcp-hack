#!/bin/bash

# Script to build and publish the Python SDK to PyPI
# Usage: ./publish-python-sdk.sh [--test]

set -e

echo "🐍 Publishing MCP Observability Python SDK"

# Check if we should publish to test PyPI
TEST_PUBLISH=false
if [ "$1" = "--test" ]; then
    TEST_PUBLISH=true
    echo "📋 Publishing to Test PyPI"
else
    echo "📋 Publishing to Production PyPI"
fi

# Create and activate virtual environment (outside the package directory)
echo "🔧 Setting up virtual environment..."
python3 -m venv /tmp/mcp-publish-env
source /tmp/mcp-publish-env/bin/activate

# Navigate to Python SDK directory
cd sdk/python

# Clean up any previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist/ build/ *.egg-info/

# Install build dependencies
echo "📦 Installing build dependencies..."
pip install build twine

# Build the package
echo "🔨 Building package..."
python -m build

# Check the built package
echo "🔍 Checking package..."
twine check dist/*

# Upload to PyPI
if [ "$TEST_PUBLISH" = true ]; then
    echo "⬆️  Uploading to Test PyPI..."
    twine upload --repository testpypi dist/*
    echo "✅ Package uploaded to Test PyPI!"
    echo "📋 Test install with: pip install -i https://test.pypi.org/simple/ mcp-observability"
else
    echo "⬆️  Uploading to Production PyPI..."
    twine upload dist/*
    echo "✅ Package uploaded to Production PyPI!"
    echo "📋 Install with: pip install mcp-observability"
fi

# Deactivate virtual environment
echo "🧹 Cleaning up virtual environment..."
deactivate
rm -rf /tmp/mcp-publish-env

echo "🎉 Python SDK publishing complete!" 