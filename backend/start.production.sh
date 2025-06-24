#!/bin/sh

echo "🚀 MCP Observability Backend Starting (Production)..."
echo "📊 Database: $DATABASE_URL"
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "🔄 Running database migrations..."
npx prisma migrate deploy
echo "✅ Database ready!"
echo "🌐 Starting production server on port $PORT"
npm start 