import logging
import sys
import os

# Add parent directory to path to import our SDK
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'sdk', 'python'))

from mcp.server.fastmcp import FastMCP
from mcp_observability import MCPObservability

mcp = FastMCP("Hello World Server")

# Initialize observability (point to your backend service)
backend_url = os.getenv('BACKEND_URL', 'http://localhost:3001')
obs = MCPObservability(api_url=backend_url)

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

if __name__ == "__main__":
    logger.info("Starting MCP server with HTTP transport")
    mcp.run(transport='http') 