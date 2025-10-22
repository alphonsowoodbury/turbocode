---
doc_type: other
project_name: Turbo Code Platform
title: Claude Code Integration Setup
version: '1.0'
---

# Claude Code Integration Setup

## Overview

Turbo uses **two separate Claude Code instances** for different purposes:

1. **`turbo` agents** - Claude Code running INSIDE the Docker container for end-user features
2. **`turbodev` agents** - Your external Claude Code (me!) for development work

This setup allows users to get AI assistance within the app WITHOUT making expensive API calls per request, while you keep using Claude Code for development.

## Architecture

```
┌─────────────────────────────────────────┐
│  Turbo Frontend (React)                 │
│  - Issue Triager Button                 │
│  - Project Health Reports                │
│  - Document Analysis                     │
│  - Resume Optimization                   │
└──────────────┬──────────────────────────┘
               │ HTTP Request
               ▼
┌─────────────────────────────────────────┐
│  Claude Code Service (Docker)           │
│  - Port: 9000                            │
│  - Runs Claude CLI headless              │
│  - 10 specialized subagents              │
└──────────────┬──────────────────────────┘
               │ Uses MCP Tools
               ▼
┌─────────────────────────────────────────┐
│  Turbo API (FastAPI)                    │
│  - 80+ MCP Tools                         │
│  - Projects, Issues, Documents, etc.     │
└─────────────────────────────────────────┘
```

Meanwhile, you use:
```
┌─────────────────────────────────────────┐
│  Your Machine                            │
│  - Claude Code CLI (turbodev agents)     │
│  - Used for: code editing, debugging     │
│  - Full access to codebase               │
└─────────────────────────────────────────┘
```

## Setup Instructions

### 1. Get Your Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Create an account or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### 3. Build and Start Services

```bash
# Build the Claude Code container
docker-compose build claude-code

# Start all services including Claude Code
docker-compose up -d

# Check that Claude Code service is running
docker-compose logs -f claude-code

# Should see: "Starting Claude Code Headless Service on port 9000"
```

### 4. Verify Installation

```bash
# Check health
curl http://localhost:9000/health

# Should return:
# {"status":"healthy","service":"claude-code-headless","authenticated":true}

# List available subagents
curl http://localhost:9000/api/v1/subagents/list

# Should return list of 10 subagents
```

## Available Subagents

### 1. Issue Triager (`issue-triager`)
- Analyzes issues and suggests priority, type, tags
- Identifies dependencies between issues
- Auto-applies intelligent tagging

### 2. Project Manager (`project-manager`)
- Generates project health reports
- Creates milestones and tracks progress
- Suggests task prioritization

### 3. Documentation Curator (`doc-curator`)
- Reviews documents for quality
- Suggests improvements and organization
- Links docs to related entities

### 4. Task Scheduler (`task-scheduler`)
- Analyzes workload and suggests scheduling
- Creates calendar events for deadlines
- Balances priorities across projects

### 5. Knowledge Connector (`knowledge-connector`)
- Semantic search across all entities
- Finds hidden connections and relationships
- Identifies knowledge gaps

### 6. Career Coach (`career-coach`)
- Optimizes resumes for specific jobs
- Analyzes skill gaps
- Tracks job applications

### 7. Learning Curator (`learning-curator`)
- Organizes reading list and podcasts
- Suggests learning paths
- Connects learning to career skills

### 8. Meeting Facilitator (`meeting-facilitator`)
- Creates meeting agendas
- Extracts action items from notes
- Converts discussions to trackable tasks

### 9. Discovery Guide (`discovery-guide`)
- Manages research and exploration work
- Tracks findings and learnings
- Converts discoveries to actionable work

### 10. Blueprint Architect (`blueprint-architect`)
- Creates architecture documentation
- Defines standards and patterns
- Reviews project adherence

## Usage from Frontend

The React frontend can invoke any subagent:

```typescript
import { useSubagent } from "@/hooks/use-subagent";

// In your component
const { invoke, isLoading, data } = useSubagent("issue-triager");

// Invoke the agent
const result = await invoke(
  "Analyze this issue and suggest improvements",
  { issue_id: "some-uuid" }
);

// result.response contains the AI analysis
// result.actions contains suggested changes to apply
```

## Cost Comparison

### Without Claude Code CLI (Direct API):
- Every user action = API call
- $0.015 per 1K input tokens (Claude 3.5 Sonnet)
- 100 users × 10 requests/day = 1000 requests/day
- With 5K tokens average = **$75/day** = **$2,250/month**

### With Claude Code CLI (This Setup):
- Claude Code pricing includes the Claude Pro features
- Predictable monthly cost
- No per-request charges
- **Much more economical for high-volume usage**

## Difference from TurboDev

| Feature | `turbo` (in-container) | `turbodev` (your CLI) |
|---------|------------------------|----------------------|
| **Purpose** | End-user productivity | Development work |
| **Tools Access** | MCP tools only (no code editing) | Full codebase access |
| **Location** | Docker container | Your machine |
| **Use Cases** | Issue triage, project management, documentation | Code editing, debugging, refactoring |
| **Invoked By** | App users via UI | You via terminal |
| **Agent Set** | `turbo` | `turbodev` |

## Troubleshooting

### Claude Code Service Won't Start

```bash
# Check logs
docker-compose logs claude-code

# Common issues:
# 1. Missing API key
echo $ANTHROPIC_API_KEY  # Should not be empty

# 2. Port conflict (9000 already in use)
lsof -i :9000
docker-compose down

# 3. Build issues
docker-compose build --no-cache claude-code
```

### Authentication Errors

```bash
# Verify API key is valid
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"test"}]}'

# Should NOT return 401 Unauthorized
```

### Subagent Not Responding

```bash
# Check if service is healthy
curl http://localhost:9000/health

# Test a simple invocation
curl -X POST http://localhost:9000/api/v1/subagents/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "issue-triager",
    "prompt": "Hello, are you working?",
    "agent_set": "turbo"
  }'
```

## Security Notes

1. **API Key Protection**
   - Never commit `.env` to git
   - API key is only stored in container environment
   - Not exposed to frontend

2. **Rate Limiting**
   - Consider adding rate limits to prevent abuse
   - Monitor usage in Anthropic console

3. **User Consent**
   - Always show users what the AI will do
   - Require approval before applying suggested changes

## Next Steps

1. ✅ Set up `.env` with your API key
2. ✅ Start services: `docker-compose up -d`
3. ✅ Verify health: `curl http://localhost:9000/health`
4. 🔲 Integrate frontend hooks (see React hooks guide)
5. 🔲 Add UI buttons to invoke subagents
6. 🔲 Test with real data

## Support

- **Subagent Registry**: `/subagents/registry.json`
- **Service Logs**: `docker-compose logs -f claude-code`
- **Health Check**: `http://localhost:9000/health`
- **API Docs**: `http://localhost:9000/docs` (when running)
