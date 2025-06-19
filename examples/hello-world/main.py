from fastmcp import FastMCP

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    # This runs the server, defaulting to STDIO transport
    # mcp.run()

    # To use a different transport, e.g., HTTP:
    mcp.run(transport="streamable-http", host="127.0.0.1", port=9000)
