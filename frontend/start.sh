#!/bin/sh

echo "🚀 MCP Observability Dashboard Starting..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "📡 API Backend: $VITE_API_URL"
echo "🔧 Starting Vite dev server..."
npm run dev -- --host 0.0.0.0 