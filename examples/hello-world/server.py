import logging
import argparse
import os

from mcp.server.fastmcp import FastMCP
from mcp_observability import MCPObservability

mcp = FastMCP("Hello World Server")

# Initialize observability (point to your backend service)
# Use environment variables for Docker, fallback to localhost for local development
# backend_url = os.getenv('BACKEND_URL', 'http://localhost:3001/api')
# api_key = os.getenv('MCP_API_KEY', 'mcp_25abf53b3ba1036df400b6eeca8a3f819583c97f13cce59ce781271f33b50576')  # Set this to your API key from the dashboard

backend_url = os.getenv('BACKEND_URL', 'https://etalesystems.com/api')
api_key = os.getenv('MCP_API_KEY', 'mcp_25abf53b3ba1036df400b6eeca8a3f819583c97f13cce59ce781271f33b50576')  # Set this to your API key from the dashboard

if not api_key:
    logger.warning("MCP_API_KEY environment variable not set. Traces will not be sent to backend.")
    logger.warning("Create an API key in the dashboard and set MCP_API_KEY environment variable.")

obs = MCPObservability(api_url=backend_url, api_key=api_key)

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

@mcp.tool()
@obs.tool_observer("add_numbers")
def add(a: int, b: int) -> int:
    """Add two numbers"""
    logger.debug(f"Adding {a} + {b}")
    return a + b

@mcp.tool()
@obs.tool_observer("multiply_numbers")
def multiply(a: int, b: int) -> int:
    """Multiply two numbers"""
    logger.debug(f"Multiplying {a} * {b}")
    return a * b

@mcp.tool()
@obs.tool_observer("divide_numbers")
def divide(a: int, b: int) -> float:
    """Divide two numbers"""
    logger.debug(f"Dividing {a} / {b}")
    if b == 0:
        raise ValueError("Division by zero is not allowed")
    return a / b

@mcp.tool()
@obs.tool_observer("get_metrics")
def get_observability_metrics() -> dict:
    """Get current observability metrics for all tools"""
    return obs.get_metrics()

def main():
    parser = argparse.ArgumentParser(description="Hello World MCP Server")
    parser.add_argument("--transport", choices=["stdio", "http"], default="stdio", 
                       help="Transport protocol to use (default: stdio)")
    parser.add_argument("--host", default="localhost", 
                       help="Host for HTTP transport (default: localhost)")
    parser.add_argument("--port", type=int, default=8000, 
                       help="Port for HTTP transport (default: 8000)")
    parser.add_argument("--metrics", action="store_true",
                       help="Print metrics before starting server")
    
    args = parser.parse_args()
    
    if args.metrics:
        obs.print_metrics()
    
    logger.info(f"Starting MCP server with {args.transport} transport")
    
    if args.transport == "http":
        logger.info(f"HTTP server will be available at http://{args.host}:{args.port}")
        mcp.run(transport='http')
    else:
        mcp.run(transport='stdio')

if __name__ == "__main__":
    main()
