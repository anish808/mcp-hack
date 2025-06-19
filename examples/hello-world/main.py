import asyncio
import logging

from fastmcp import FastMCP
from http.cookiejar import debug

mcp = FastMCP("Demo 🚀")

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    logger.debug("We are going to add two numbers now, this tool was called.")
    return a + b


async def main():
    await mcp.run_http_async(host="0.0.0.0", port=9000, log_level="debug", path="/mcp")

if __name__ == "__main__":
   asyncio.run(main())
