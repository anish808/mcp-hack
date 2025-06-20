# 🐳 MCP Observability - Docker Setup

This guide will help you run the entire MCP Observability system using Docker containers.

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)
```bash
# From the root project directory
./start.sh
```

### Option 2: Manual Docker Compose
```bash
# From the root project directory
docker-compose up --build -d
```

## 📋 System Architecture

The containerized system includes:

- **PostgreSQL Database** (port 5433)
- **Backend API** (port 3001) - Node.js/Express with Prisma ORM
- **Frontend Dashboard** (port 5173) - React with Vite
- **MCP Server** (port 8000) - Python server with observability
- **Claude Desktop Configuration Helper** - Optional service for setup

## 🔧 Services Overview

### PostgreSQL Database
- **Port**: 5433 (mapped from container port 5432)
- **Credentials**: user/password/mcp_observability
- **Health Check**: Validates database connectivity
- **Data Persistence**: Uses Docker volume `postgres_data`

### Backend API
- **Port**: 3001
- **Endpoints**: `/traces` for receiving observability data
- **Auto-migrations**: Runs Prisma migrations on startup
- **Dependencies**: Waits for PostgreSQL to be healthy

### Frontend Dashboard
- **Port**: 5173
- **Environment**: Points to backend at `http://localhost:3001`
- **Features**: Real-time traces, metrics, and analytics
- **Dependencies**: Waits for backend to be healthy

### MCP Server
- **Port**: 8000 (HTTP mode for testing)
- **Tools**: `add`, `multiply`, `divide`, `get_observability_metrics`
- **Observability**: Sends traces to backend automatically
- **SDK**: Includes the MCP observability Python SDK

## 📝 Configuration

### Environment Variables

The system uses these key environment variables:

```yaml
# Database
DATABASE_URL: "postgresql://user:password@postgres:5432/mcp_observability"

# Backend
PORT: 3001

# Frontend
VITE_API_URL: "http://localhost:3001"

# MCP Server
PYTHONPATH: "/app/sdk/python"
```

### Volume Mounts

For development, source code is mounted into containers:
- `./backend:/app` - Backend source code
- `./frontend:/app` - Frontend source code
- `./examples/hello-world:/app/examples/hello-world` - MCP server code
- `./sdk:/app/sdk` - Observability SDK

## 🔗 Claude Desktop Integration

### Option 1: Using Docker Helper
```bash
docker-compose --profile tools run --rm claude-config
```

### Option 2: Manual Configuration
```bash
cd examples/hello-world
python3 install_to_claude.py
```

After running either option:
1. Restart Claude Desktop
2. Test the integration by asking Claude to:
   - "Add 15 and 25"
   - "Multiply 7 by 9"
   - "Show me observability metrics"

## 📊 Accessing the System

Once started, access these URLs:

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **MCP Server (HTTP)**: http://localhost:8000
- **Database**: postgresql://user:password@localhost:5433/mcp_observability

## 🔍 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mcp-server
docker-compose logs -f postgres
```

### Check Service Status
```bash
docker-compose ps
```

### Health Checks
All services include health checks that verify:
- PostgreSQL: Database connectivity
- Backend: API endpoint availability
- Frontend: Web server response
- MCP Server: HTTP endpoint response

### Manual Testing

Test the MCP server directly:
```bash
# Test HTTP endpoint
curl http://localhost:8000/

# Test backend traces endpoint
curl -X POST http://localhost:3001/traces \
  -H "Content-Type: application/json" \
  -d '{"task":"test","context":{},"model_output":"test"}'
```

## 🛠 Development Workflow

### Making Changes

1. **Backend Changes**: Edit files in `./backend/src/` - changes auto-reload
2. **Frontend Changes**: Edit files in `./frontend/src/` - hot reload enabled
3. **MCP Server Changes**: Edit `./examples/hello-world/server.py` - restart container
4. **SDK Changes**: Edit `./sdk/python/mcp_observability.py` - restart MCP server

### Rebuilding Containers
```bash
# Rebuild all containers
docker-compose build

# Rebuild specific service
docker-compose build backend
```

### Database Operations
```bash
# Reset database
docker-compose down -v  # Removes volumes
docker-compose up -d postgres

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev
```

## 🏃‍♂️ Commands Reference

### Start System
```bash
./start.sh                          # Recommended startup
docker-compose up -d                 # Start in background
docker-compose up                    # Start with logs
docker-compose up --build -d         # Rebuild and start
```

### Stop System
```bash
docker-compose down                  # Stop services
docker-compose down -v               # Stop and remove volumes
```

### Maintenance
```bash
docker-compose pull                  # Update base images
docker-compose build --no-cache      # Force rebuild
docker system prune                  # Clean up Docker
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   # Kill the process or change ports in compose.yaml
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   # Verify database is healthy
   docker-compose ps
   ```

3. **Frontend Can't Connect to Backend**
   - Verify `VITE_API_URL` in compose.yaml
   - Check backend health: `curl http://localhost:3001/traces`

4. **MCP Server Not Responding**
   ```bash
   # Check server logs
   docker-compose logs mcp-server
   # Test HTTP endpoint
   curl http://localhost:8000/
   ```

### Reset Everything
```bash
docker-compose down -v
docker system prune -f
./start.sh
```

## 📈 Performance Tips

1. **Use Docker BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Prune Regularly** to free disk space:
   ```bash
   docker system prune -f
   ```

3. **Optimize for Development** by commenting out unused services in compose.yaml

4. **Use Multi-stage Builds** for production deployments

## 🚀 Production Deployment

For production deployment:

1. Change database credentials
2. Use environment-specific configs
3. Set up proper logging and monitoring
4. Use production database (not the Docker postgres)
5. Configure proper CORS settings
6. Set up SSL/TLS termination
7. Use container orchestration (Kubernetes, ECS, etc.)

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are healthy: `docker-compose ps`
3. Test individual components manually
4. Check Docker and Docker Compose versions
5. Ensure sufficient system resources (CPU, RAM, disk) 