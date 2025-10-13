# Turbo MCP Server - Claude Code Integration

## Overview

The Turbo MCP (Model Context Protocol) server enables Claude Code to natively interact with your Turbo project management system. Through MCP, Claude can access projects, issues, discoveries, initiatives, and milestones using natural language.

## Why MCP?

MCP provides several advantages over CLI or API approaches:

- **Native Integration**: Claude automatically discovers available tools
- **Type Safety**: JSON schema validation ensures correct tool usage
- **Natural Language**: Ask Claude questions in plain English
- **Better UX**: No need to memorize commands or API endpoints
- **Future-Proof**: Industry standard protocol for AI-tool integration

## Architecture

```
Claude Code ←→ MCP Protocol ←→ Turbo MCP Server ←→ Turbo API ←→ Database
```

The MCP server runs on stdio (standard input/output) and communicates with the Turbo API to fetch and update data.

## Prerequisites

1. **Turbo API must be running**:
   ```bash
   docker-compose up -d api
   ```

2. **Install MCP package**:
   ```bash
   pip install "turbo[mcp]"
   # Or directly:
   pip install mcp>=1.0.0
   ```

## Quick Setup

### 1. Generate Configuration

Run the configure command to see the configuration you need:

```bash
turbo mcp configure
```

This will display the JSON configuration for Claude Code.

### 2. Configure Claude Code

Create or edit `~/.claude/mcp.json` and add the Turbo MCP server configuration:

```json
{
  "mcpServers": {
    "turbo": {
      "command": "/path/to/your/.venv/bin/python",
      "args": [
        "/path/to/turboCode/turbo/mcp_server.py"
      ],
      "env": {
        "TURBO_API_URL": "http://localhost:8001/api/v1"
      }
    }
  }
}
```

The `turbo mcp configure` command will show you the exact paths for your system.

### 3. Restart Claude Code

After updating the configuration, restart Claude Code to load the MCP server.

### 4. Verify Connection

In Claude Code, ask: "Show me all active projects"

If Claude can see your projects, the MCP server is working correctly.

## CLI Commands

The Turbo CLI provides several commands for working with the MCP server:

### `turbo mcp start`

Start the MCP server manually (usually not needed, as Claude Code starts it automatically):

```bash
turbo mcp start

# Specify custom API port
turbo mcp start --port 8001
```

### `turbo mcp configure`

Show the MCP configuration for Claude Code:

```bash
# Show formatted configuration with instructions
turbo mcp configure

# Output raw JSON for piping
turbo mcp configure --format json
```

### `turbo mcp tools`

List all available MCP tools:

```bash
turbo mcp tools
```

This shows all 14 tools that Claude can use to interact with Turbo.

### `turbo mcp test`

Test the connection to the Turbo API:

```bash
turbo mcp test
```

This verifies that:
- The API is running
- The projects endpoint is accessible
- The issues endpoint is accessible
- The initiatives endpoint is accessible

## Available Tools

The Turbo MCP server exposes 14 tools to Claude:

### Project Management

- **`list_projects`**: Get all projects with optional filtering by status
- **`get_project`**: Get detailed information about a specific project
- **`get_project_issues`**: Get all issues for a specific project

### Issue Management

- **`list_issues`**: Get all issues with filtering by project, status, priority, type, or assignee
- **`get_issue`**: Get detailed information about a specific issue
- **`create_issue`**: Create a new issue with title, description, type, priority, etc.
- **`update_issue`**: Update an issue's details (status, priority, assignee, etc.)

### Discovery Management

- **`list_discoveries`**: Get all discovery issues (research topics) with optional filtering by discovery status

### Initiative Management

- **`list_initiatives`**: Get all initiatives (feature/technology-based groupings)
- **`get_initiative`**: Get detailed information about a specific initiative
- **`get_initiative_issues`**: Get all issues associated with an initiative

### Milestone Management

- **`list_milestones`**: Get all milestones (time/release-based groupings)
- **`get_milestone`**: Get detailed information about a specific milestone
- **`get_milestone_issues`**: Get all issues associated with a milestone

## Example Workflows

### Project Management

```
You: "Show me all active projects"
Claude: [Uses list_projects tool with status filter]

You: "What's the status of the TurboCode project?"
Claude: [Uses get_project tool to fetch details]

You: "List all high priority issues in the TurboCode project"
Claude: [Uses list_issues with project_id and priority filters]
```

### Issue Management

```
You: "Create a new bug issue for authentication failure"
Claude: [Uses create_issue tool with appropriate parameters]

You: "Update issue ABC123 to in_progress status"
Claude: [Uses update_issue tool to change status]

You: "Show me all open issues assigned to me"
Claude: [Uses list_issues with status and assignee filters]
```

### Discovery Research

```
You: "List all proposed discoveries"
Claude: [Uses list_discoveries with discovery_status=proposed]

You: "What discoveries need research?"
Claude: [Uses list_discoveries with discovery_status=researching]

You: "Show me the details of discovery XYZ"
Claude: [Uses get_issue with the discovery ID]
```

### Initiative Tracking

```
You: "What initiatives are in progress?"
Claude: [Uses list_initiatives with status=in_progress]

You: "Show me all issues in the Claude Code Integration initiative"
Claude: [Uses get_initiative_issues with initiative_id]

You: "What's the status of the MCP integration initiative?"
Claude: [Uses get_initiative to fetch details]
```

### Milestone Planning

```
You: "What milestones do we have planned?"
Claude: [Uses list_milestones]

You: "Show me what needs to be done for the v1.0 milestone"
Claude: [Uses get_milestone_issues with milestone_id]

You: "How many issues are completed in milestone ABC?"
Claude: [Uses get_milestone to see counts and status]
```

## Advanced Usage

### Custom API URL

If your Turbo API is running on a different port or host, set the `TURBO_API_URL` environment variable:

```json
{
  "mcpServers": {
    "turbo": {
      "command": "/path/to/python",
      "args": ["/path/to/mcp_server.py"],
      "env": {
        "TURBO_API_URL": "http://localhost:9000/api/v1"
      }
    }
  }
}
```

### Multiple Environments

You can configure multiple MCP servers for different environments:

```json
{
  "mcpServers": {
    "turbo-dev": {
      "command": "/path/to/python",
      "args": ["/path/to/mcp_server.py"],
      "env": {
        "TURBO_API_URL": "http://localhost:8001/api/v1"
      }
    },
    "turbo-prod": {
      "command": "/path/to/python",
      "args": ["/path/to/mcp_server.py"],
      "env": {
        "TURBO_API_URL": "http://production-server:8001/api/v1"
      }
    }
  }
}
```

## Troubleshooting

### MCP Server Not Connecting

**Problem**: Claude Code can't see Turbo tools

**Solutions**:
1. Check that the MCP configuration file exists: `cat ~/.claude/mcp.json`
2. Verify the Python path is correct (use absolute path)
3. Verify the mcp_server.py path is correct (use absolute path)
4. Restart Claude Code after configuration changes
5. Check Claude Code logs for MCP errors

### API Connection Errors

**Problem**: MCP server starts but can't connect to Turbo API

**Solutions**:
1. Verify API is running: `docker-compose ps api`
2. Test API directly: `curl http://localhost:8001/api/v1/projects/`
3. Check TURBO_API_URL environment variable
4. Run connection test: `turbo mcp test`

### Tools Not Appearing

**Problem**: MCP server connects but tools don't appear

**Solutions**:
1. Check MCP server logs for errors
2. Verify MCP package is installed: `pip show mcp`
3. Test tool listing: `turbo mcp tools`
4. Try restarting Claude Code

### Permission Denied

**Problem**: Python or mcp_server.py can't be executed

**Solutions**:
1. Make mcp_server.py executable: `chmod +x turbo/mcp_server.py`
2. Use absolute path to Python interpreter
3. Activate virtual environment before testing

## Development

### Adding New Tools

To add new tools to the MCP server, edit `turbo/mcp_server.py`:

1. Add the tool definition in `list_tools()`:

```python
Tool(
    name="my_new_tool",
    description="Description of what this tool does",
    inputSchema={
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "First parameter"},
            "param2": {"type": "integer", "description": "Second parameter"}
        },
        "required": ["param1"]
    }
)
```

2. Add the tool handler in `call_tool()`:

```python
elif name == "my_new_tool":
    param1 = arguments["param1"]
    param2 = arguments.get("param2")
    response = await client.get(f"{TURBO_API_URL}/my-endpoint/{param1}")
    response.raise_for_status()
    return [TextContent(type="text", text=response.text)]
```

3. Test the new tool:

```bash
turbo mcp tools  # Should show your new tool
```

### Testing

Integration tests for the MCP server will be added in `tests/integration/test_mcp_server.py`. These tests will verify:

- MCP server starts correctly
- All tools are registered
- Tools can call the API successfully
- Error handling works correctly

## Security Considerations

- The MCP server runs locally and communicates with your local Turbo API
- All data stays on your machine
- No authentication is required for localhost connections
- For remote API connections, consider adding authentication to the API endpoints

## Performance

- The MCP server uses async HTTP calls for efficiency
- Requests timeout after 30 seconds
- Connection pooling is handled by httpx
- The server is stateless and lightweight

## Further Reading

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Turbo API Documentation](../api/README.md)

## Support

If you encounter issues with the MCP server:

1. Run diagnostics: `turbo mcp test`
2. Check logs in Claude Code
3. Verify API is healthy: `docker-compose ps`
4. Open an issue with diagnostic output
