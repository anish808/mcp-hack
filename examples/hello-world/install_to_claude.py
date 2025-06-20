#!/usr/bin/env python3
"""
One-command installer for MCP Observability Demo to Claude Desktop
"""
import json
import os
import sys

def install_to_claude():
    """Install the observability demo server to Claude Desktop"""
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    
    config = {
        "mcpServers": {
            "observability-demo": {
                "command": "/opt/homebrew/bin/uv",
                "args": [
                    "run",
                    "--project",
                    current_dir,
                    "python", 
                    f"{current_dir}/server.py"
                ],
                "env": {
                    "PYTHONPATH": f"{project_root}/sdk/python"
                }
            }
        }
    }
    
    config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    
    # Load existing config if it exists
    existing_config = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                existing_config = json.load(f)
            print(f"📝 Found existing Claude Desktop config")
        except:
            print(f"⚠️  Existing config file found but couldn't read it, will overwrite")
    
    # Merge configs
    if "mcpServers" not in existing_config:
        existing_config["mcpServers"] = {}
    
    existing_config["mcpServers"]["observability-demo"] = config["mcpServers"]["observability-demo"]
    
    # Write config
    with open(config_path, 'w') as f:
        json.dump(existing_config, f, indent=2)
    
    print(f"✅ Installed observability-demo to Claude Desktop!")
    print(f"📍 Config location: {config_path}")
    print(f"🔧 Project path: {current_dir}")
    print(f"📊 SDK path: {project_root}/sdk/python")
    print()
    print("Next steps:")
    print("1. 🔄 Restart Claude Desktop completely")
    print("2. 🚀 Start backend: cd backend && npm run dev")
    print("3. 📊 Start dashboard: cd frontend && npm run dev")
    print("4. 💬 Test in Claude Desktop: 'Add 15 and 25'")

def uninstall_from_claude():
    """Remove the observability demo from Claude Desktop"""
    config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")
    
    if not os.path.exists(config_path):
        print("❌ No Claude Desktop config found")
        return
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        if "mcpServers" in config and "observability-demo" in config["mcpServers"]:
            del config["mcpServers"]["observability-demo"]
            
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            print("✅ Removed observability-demo from Claude Desktop")
            print("🔄 Restart Claude Desktop to apply changes")
        else:
            print("❌ observability-demo not found in Claude Desktop config")
    
    except Exception as e:
        print(f"❌ Error updating config: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "uninstall":
        uninstall_from_claude()
    else:
        install_to_claude() 