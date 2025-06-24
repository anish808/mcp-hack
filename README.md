# MCP Observability Platform

## Overview

Open, vendor-agnostic observability and trust layer for Model Context Protocol (MCP) LLM applications. No vendor lock-in, plug-and-play SDKs, and extensible for rate limiting, tool filtering, auth, and traceability.

🚀 **Production Ready**: Available at [https://etalesystems.com](https://etalesystems.com)

## Features
- Trace collection SDKs (Python, TypeScript)
- Node.js/Express backend with Postgres (Prisma)
- React frontend for trace inspection, replay, and filtering
- Extensible schema for future features (auth, rate limiting, tool filtering)

## Quickstart

### Option 1: Use Production (Recommended)

1. **Get API Key**: Visit [https://etalesystems.com](https://etalesystems.com) and create an API key
2. **Install SDK**: 
   ```bash
   # Python
   pip install mcp-hack
   
   # TypeScript/JavaScript
   npm install @mcp-hack/typescript
   ```
3. **Use in your code**: See [Python SDK](sdk/python/README.md) or [TypeScript SDK](sdk/typescript/README.md) documentation

### Option 2: Local Development

1. **Backend**: 
   - `cd backend && npm install`
   - Set up Postgres and .env (see `.env.example`)
   - `npx prisma migrate dev`
   - `npm run dev`

2. **Frontend**: 
   - `cd frontend && npm install`
   - `npm start`

3. **SDK Usage**: Point to `http://localhost:3001` instead of production URL

---

## Architecture

- **SDKs**: Log traces from your MCP/LLM app
- **Backend**: Store and serve traces
- **Frontend**: Inspect, replay, and filter traces

---

## Extending
- Add fields to the trace schema for rate limiting, tool filtering, auth, etc.
- Add new endpoints or UI features as needed.

---

## Examples

See the [Hello World MCP Server](examples/hello-world/) example that demonstrates:
- Basic MCP server with observability
- Math tools (add, multiply, divide)
- Real-time trace collection
- Dashboard integration

## Links

- 🌐 **Dashboard**: [https://etalesystems.com](https://etalesystems.com)
- 📚 **Python SDK**: [PyPI](https://pypi.org/project/mcp-hack/)
- 📚 **TypeScript SDK**: [NPM](https://www.npmjs.com/package/@mcp-hack/typescript)
- 🐙 **Source Code**: [GitHub](https://github.com/anish808/mcp-hack)
