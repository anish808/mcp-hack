#!/bin/bash

echo "🚀 MCP Observability Server Starting..."
echo "📊 Observability SDK available at: $PYTHONPATH"
echo "🔧 Starting server in HTTP mode on port 8000"
echo "📡 Traces will be sent to: $BACKEND_URL"
uv run python server-simple.py 