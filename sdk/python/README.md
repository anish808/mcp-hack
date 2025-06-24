# MCP Observability SDK for Python

Open, vendor-agnostic observability SDK for Model Context Protocol (MCP) applications. No vendor lock-in, plug-and-play integration, and extensible for rate limiting, tool filtering, auth, and traceability.

## Installation

```bash
pip install mcp-hack
```

## Quick Start

```python
import os
from mcp_observability import MCPObservability

# Initialize observability
obs = MCPObservability(
    api_url="http://localhost:3001",  # Your backend URL
    api_key=os.getenv('MCP_API_KEY')  # Get from your dashboard
)

# Add observability to your MCP tools
@mcp.tool()
@obs.tool_observer("add_numbers")
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

# Get metrics
metrics = obs.get_metrics()
print(f"Total calls: {metrics['summary']['total_calls']}")
```

## Features

- 🔍 **Automatic Tool Tracing**: Monitor all MCP tool calls with zero configuration
- 📊 **Rich Metrics**: Execution time, success rates, error tracking
- 🚀 **Non-blocking**: Async trace submission doesn't slow down your tools
- 🔒 **Secure**: API key authentication with environment variable support
- 📈 **Dashboard Integration**: Real-time visualization of your MCP tools

## API Reference

### MCPObservability

Main class for MCP observability.

#### Constructor

```python
MCPObservability(api_url: str, api_key: Optional[str] = None)
```

- `api_url`: URL of your observability backend
- `api_key`: API key for authentication (optional, but required for trace submission)

#### Methods

##### tool_observer(tool_name: Optional[str] = None)

Decorator to add observability to MCP tools.

```python
@obs.tool_observer("my_tool")
def my_tool(param: str) -> str:
    return f"Hello {param}"
```

##### trace(task: str, context: Dict[str, Any], model_output: str, metadata: Optional[Dict[str, Any]] = None)

Send a custom trace to the backend.

```python
obs.trace(
    task="Custom Task",
    context={"user_input": "Hello"},
    model_output="Response",
    metadata={"custom_field": "value"}
)
```

##### get_metrics() -> Dict[str, Any]

Get current metrics snapshot.

```python
metrics = obs.get_metrics()
print(metrics['summary']['total_calls'])
```

##### print_metrics()

Print formatted metrics to console.

```python
obs.print_metrics()
```

## Environment Variables

- `MCP_API_KEY`: Your API key from the observability dashboard
- `BACKEND_URL`: URL of your observability backend (default: http://localhost:3001)

## License

MIT License. See LICENSE file for details.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/anish808/mcp-hack/blob/main/CONTRIBUTING.md).

## Links

- [Documentation](https://github.com/anish808/mcp-hack#readme)
- [GitHub Repository](https://github.com/anish808/mcp-hack)
- [Issue Tracker](https://github.com/anish808/mcp-hack/issues)
- [Dashboard](http://localhost:5173) (when running locally) 