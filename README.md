# MCP Observability Tool

## Overview

Open, vendor-agnostic observability and trust layer for Model Context Protocol (MCP) LLM applications. No vendor lock-in, plug-and-play SDKs, and extensible for rate limiting, tool filtering, auth, and traceability.

## Features
- Trace collection SDKs (Python, TypeScript)
- Node.js/Express backend with Postgres (Prisma)
- React frontend for trace inspection, replay, and filtering
- Extensible schema for future features (auth, rate limiting, tool filtering)

## Quickstart

### 1. Backend
- Install dependencies: `cd backend && npm install`
- Set up Postgres and .env (see `.env.example`)
- Run migrations: `npx prisma migrate dev`
- Start server: `npm run dev`

### 2. Frontend
- Install dependencies: `cd frontend && npm install`
- Start dev server: `npm start`

### 3. SDK Usage
- See `sdk/python/mcp_observability.py` and `sdk/typescript/mcp-observability.ts` for usage examples.

---

## Architecture

- **SDKs**: Log traces from your MCP/LLM app
- **Backend**: Store and serve traces
- **Frontend**: Inspect, replay, and filter traces

---

## Extending
- Add fields to the trace schema for rate limiting, tool filtering, auth, etc.
- Add new endpoints or UI features as needed.