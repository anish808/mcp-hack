import logging

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Hello World Server")

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    logger.debug("We are going to add two numbers now, this tool was called.")
    return a + b

def main():
    mcp.run(transport='stdio')

if __name__ == "__main__":
   main()
