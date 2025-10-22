---
doc_type: other
project_name: Turbo Code Platform
title: Claude Code Integration
version: '1.0'
---

# Claude Code Integration

Turbo integrates with Claude Code via the Model Context Protocol (MCP) to provide AI-powered project management assistance and automatic responses to comments.

## Features

### 1. MCP Server - Direct AI Access to Turbo
Claude Code can directly interact with your Turbo workspace through MCP tools.

### 2. Auto-Response Comments
When you add a comment to an issue via the UI or CLI, Claude automatically analyzes the issue and conversation thread, then posts an AI response.

## Setup

### Prerequisites
- Claude Code CLI installed (`claude`)
- Turbo API running (`uvicorn turbo.main:app`)
- MCP server configured

### 1. Configure MCP Server

The MCP server configuration should already be in `mcp.json`:

```json
{
  "mcpServers": {
    "turbo": {
      "command": "/path/to/.venv/bin/python",
      "args": ["/path/to/turboCode/turbo/mcp_server.py"],
      "env": {
        "TURBO_API_URL": "http://localhost:8001/api/v1"
      }
    }
  }
}
```

### 2. Configure Auto-Response (Optional)

Copy the example configuration:
```bash
cp .env.claude.example .env
```

Edit `.env`:
```bash
# Enable auto-response to user comments
CLAUDE_AUTO_RESPOND=true

# API URL
TURBO_API_URL=http://localhost:8001/api/v1
```

### 3. Start Services

```bash
# Terminal 1: Start Claude webhook server (on host machine)
python scripts/claude_webhook_server.py

# Terminal 2: Start Turbo API (Docker or local)
docker-compose up -d api
# OR
uvicorn turbo.main:app --reload --port 8001

# Terminal 3: Start Next.js frontend (optional)
cd frontend && npm run dev
```

The MCP server starts automatically when Claude Code connects.

**Important**: The webhook server must run on your **host machine** (not in Docker) because it needs access to the `claude` CLI command.

## Available MCP Tools

### Projects
- `list_projects` - Get all projects with filtering
- `get_project` - Get project details
- `get_project_issues` - Get issues for a project

### Issues
- `list_issues` - Get all issues with filtering
- `get_issue` - Get issue details
- `create_issue` - Create a new issue
- `update_issue` - Update issue details

### Comments
- `add_comment` - Add a comment to an issue
- `get_issue_comments` - Get all comments for an issue

### Discoveries
- `list_discoveries` - Get all discovery issues
- Filter by discovery_status

### Initiatives
- `list_initiatives` - Get all initiatives
- `get_initiative` - Get initiative details
- `get_initiative_issues` - Get issues for an initiative

### Milestones
- `list_milestones` - Get all milestones
- `get_milestone` - Get milestone details
- `get_milestone_issues` - Get issues for a milestone

## Usage Examples

### Via Claude Code CLI

```bash
# Ask Claude about your projects
claude -p "What are my active high-priority projects?"

# Create an issue
claude -p "Create a bug issue in project XYZ for authentication failure"

# Get project status
claude -p "Show me the status of the Claude Code Integration initiative"
```

### Via Comment Auto-Response

1. Open an issue in the Turbo UI
2. Add a comment asking a question or describing a problem
3. Claude automatically:
   - Reads the issue details
   - Analyzes the comment thread
   - Posts a helpful AI response

**Example:**
```
User comment: "I'm not sure how to implement this feature. Should we use REST or GraphQL?"

Claude response: "Based on the project architecture and existing patterns, I recommend using REST for this feature because:
1. Your current API is REST-based
2. The data model is simple and doesn't need complex queries
3. REST has better caching support for this use case

Would you like me to create a detailed implementation plan?"
```

## How It Works

### Comment Auto-Response Flow

```
User adds comment via UI/CLI/API
    ↓
POST /api/v1/comments/ {author_type: "user", ...}
    ↓
Comment saved to database
    ↓
FastAPI BackgroundTask triggered
    ↓
ClaudeWebhookService.trigger_claude_response()
    ↓
HTTP POST to webhook server on host machine
    ↓
Webhook Server (runs on host, outside Docker):
1. Receives webhook request with issue_id
2. Calls `claude -p` in headless mode with prompt
    ↓
Claude Code (via CLI):
1. Uses MCP to read issue/comments
2. Analyzes context
3. Uses add_comment MCP tool to post response
    ↓
AI response appears in issue thread
```

### Infinite Loop Prevention
- Webhook only triggers for `author_type: "user"` comments
- AI comments have `author_type: "ai"`
- AI responses do not trigger additional webhooks

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_AUTO_RESPOND` | `true` | Enable/disable auto-response |
| `TURBO_API_URL` | `http://localhost:8001/api/v1` | Turbo API base URL |

### Disabling Auto-Response

Set in `.env`:
```bash
CLAUDE_AUTO_RESPOND=false
```

Or unset the variable:
```bash
unset CLAUDE_AUTO_RESPOND
```

## Troubleshooting

### Claude Code not found
```
Error: Claude Code CLI not found
```

**Solution:** Ensure `claude` is in your PATH:
```bash
which claude
```

### MCP tools not appearing

**Solution:**
1. Restart Claude Code
2. Verify `mcp.json` configuration
3. Check MCP server logs

### Auto-response not working

**Check:**
1. `CLAUDE_AUTO_RESPOND=true` in `.env`
2. Claude Code CLI is installed
3. Turbo API is running on port 8001
4. Comment has `author_type: "user"`

**View logs:**
```bash
# Check API logs for webhook triggers
docker-compose logs -f turbo-api | grep "Claude response"
```

### API connection errors

**Check:**
- API is running: `curl http://localhost:8001/api/v1/issues/`
- Correct API URL in `.env` and `mcp.json`
- No firewall blocking localhost connections

## Advanced Usage

### Manual Claude Invocation

You can manually trigger Claude analysis without auto-response:

```bash
claude -p "Analyze issue <issue-id> and suggest next steps"
```

### Custom Prompts

Modify the prompt in `turbo/core/services/claude_webhook.py:_build_prompt()` to customize Claude's response style.

### Rate Limiting

To prevent excessive API calls, consider adding rate limiting in the webhook service.

## Development

### Testing MCP Tools

```python
# Test MCP server locally
python turbo/mcp_server.py
```

### Adding New MCP Tools

1. Add tool definition to `turbo/mcp_server.py:list_tools()`
2. Add tool handler to `turbo/mcp_server.py:call_tool()`
3. Update this documentation

### Debugging

Enable debug logging:
```python
# turbo/core/services/claude_webhook.py
logger.setLevel(logging.DEBUG)
```

## Security Considerations

- Comments are stored with author attribution (`author_name`, `author_type`)
- AI responses are clearly marked as `author_type: "ai"`
- Webhook runs in background - does not block API responses
- Claude Code runs with same permissions as the API process

## Future Enhancements

- [ ] Rate limiting for webhook triggers
- [ ] Configurable response delay
- [ ] Custom prompt templates per project
- [ ] Support for multiple AI models
- [ ] Comment reaction/feedback system
- [ ] Thread-aware responses (reply to specific comments)