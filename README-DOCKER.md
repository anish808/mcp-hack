# 🐳 MCP Observability - Docker Quick Start

## One-Command Setup
```bash
# Start everything
./start.sh

# Or manually
docker-compose up --build -d
```

## 🚀 Services Running
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001  
- **MCP Server (HTTP)**: http://localhost:8000
- **Database**: postgresql://user:password@localhost:5433/mcp_observability

## 🔧 Claude Desktop Setup
```bash
# Option 1: Docker helper
docker-compose --profile tools run --rm claude-config

# Option 2: Manual
cd examples/hello-world && python3 install_to_claude.py
```

## 📋 Essential Commands
```bash
# Start system
./start.sh                    # Full startup with health checks
docker-compose up -d          # Start in background
docker-compose up --build -d  # Rebuild and start

# Monitor
docker-compose logs -f        # View all logs
docker-compose ps             # Check status
./test-docker.sh             # Run system tests

# Stop
docker-compose down           # Stop services
docker-compose down -v        # Stop and remove data
```

## 🔍 Testing
```bash
# Test the system
./test-docker.sh

# Manual tests
curl http://localhost:3001/traces  # Backend
curl http://localhost:5173/        # Frontend
curl http://localhost:8000/        # MCP Server
```

## 🛠 What's Included
- **Automatic database migrations** (Prisma)
- **Health checks** for all services
- **Volume mounts** for development
- **Observability SDK** integration
- **Claude Desktop** configuration helper

## ❗ Requirements
- Docker & Docker Compose
- 8GB+ RAM recommended
- Ports 3001, 5173, 8000, 5433 available

For detailed documentation, see `DOCKER.md`. 