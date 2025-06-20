from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Minimal Test Server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    print("Starting minimal MCP server...")
    mcp.run(transport='http') 