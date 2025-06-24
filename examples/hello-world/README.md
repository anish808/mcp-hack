# MCP Hello World Server with Observability

This example demonstrates how to add observability to an MCP server using the MCP Observability SDK.

## Setup

### 1. Get an API Key

1. Visit [https://etalesystems.com](https://etalesystems.com)
2. Sign in with your Google account
3. Create a new API key from the dashboard
4. Copy your API key

### 2. Set Environment Variable

```bash
export MCP_API_KEY="your_api_key_here"
```

### 3. Install Dependencies

```bash
uv sync
uv venv activate
```

### 4. Run the Server

```bash
uv run mcp dev server.py
```

## Features

This example server includes:

- ✅ **Basic math tools**: add, multiply, divide
- 📊 **Observability**: All tool calls are automatically traced
- 📈 **Metrics**: View real-time metrics at [https://etalesystems.com](https://etalesystems.com)

## Testing

Once running, you can test the tools and view traces in your dashboard at [https://etalesystems.com](https://etalesystems.com).

## Configuration

- `BACKEND_URL`: Backend URL (default: https://etalesystems.com/api)
- `MCP_API_KEY`: Your API key from https://etalesystems.com (required)
