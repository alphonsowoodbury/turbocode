#!/usr/bin/env python3
"""
Claude Code Webhook Server

Runs on the host machine (outside Docker) and receives webhook requests
from the Turbo API to trigger Claude Code responses to comments.

Usage:
    python scripts/claude_webhook_server.py
"""

import asyncio
import json
import logging
import subprocess
from typing import Any

from aiohttp import web

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Host machine port for the webhook server
WEBHOOK_PORT = 9000


async def handle_comment_webhook(request: web.Request) -> web.Response:
    """Handle incoming webhook requests to trigger Claude responses."""
    try:
        data = await request.json()
        issue_id = data.get("issue_id")

        if not issue_id:
            logger.error("Missing issue_id in webhook request")
            return web.json_response({"error": "Missing issue_id"}, status=400)

        logger.info(f"Received webhook for issue {issue_id}")

        # Build the prompt for Claude Code headless mode
        prompt = f"""A user has added a comment to issue {issue_id} in the Turbo project management system.

Please:
1. Use the MCP tool `get_issue` with issue_id: {issue_id} to read the issue details
2. Use the MCP tool `get_issue_comments` with issue_id: {issue_id} to read all comments
3. Analyze the conversation thread and provide a helpful response to the latest user comment
4. Use the MCP tool `add_comment` to post your response with issue_id: {issue_id}

Your response should be:
- Helpful and actionable
- Relevant to the issue context (type, priority, status)
- Professional and concise
- Based on the full conversation thread
- Posted using the add_comment MCP tool (not just printed)
"""

        # Build system prompt with project context
        system_prompt = """You are an AI assistant integrated into Turbo, a project management platform.

**Project Context:**
Turbo is a modern project management system built with:
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- CLI: Typer + Rich
- Integration: Claude Code via MCP (Model Context Protocol)

**Your Role:**
When users comment on issues, you provide expert guidance on:
- Technical implementation details
- Architecture decisions
- Best practices
- Breaking down complex tasks
- Suggesting solutions to problems

**Guidelines:**
- Always read the FULL issue and comment thread first
- Consider the issue type (feature/bug/task/enhancement/documentation/discovery)
- Respect the priority level (low/medium/high/critical)
- Be concise but thorough
- Suggest concrete next steps when appropriate
- If you don't have enough context, ask clarifying questions
"""

        # Call Claude Code in headless mode
        logger.info(f"Calling Claude Code for issue {issue_id}")
        process = await asyncio.create_subprocess_exec(
            "claude",
            "-p",
            prompt,
            "--output-format",
            "json",
            "--append-system-prompt",
            system_prompt,
            "--allowedTools",
            "mcp__turbo__get_issue,mcp__turbo__get_issue_comments,mcp__turbo__add_comment",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            result = json.loads(stdout.decode())
            logger.info(
                f"Claude Code completed for issue {issue_id}: {result.get('subtype')}"
            )
            return web.json_response(
                {
                    "success": True,
                    "issue_id": issue_id,
                    "result": result.get("result"),
                    "cost_usd": result.get("total_cost_usd"),
                }
            )
        else:
            error = stderr.decode()
            logger.error(f"Claude Code error for issue {issue_id}: {error}")
            return web.json_response(
                {"success": False, "error": error}, status=500
            )

    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return web.json_response({"error": "Invalid JSON"}, status=400)
    except FileNotFoundError:
        logger.error("Claude Code CLI not found in PATH")
        return web.json_response(
            {"error": "Claude Code CLI not found. Install claude and ensure it's in PATH."},
            status=500,
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return web.json_response({"error": str(e)}, status=500)


async def health_check(request: web.Request) -> web.Response:
    """Health check endpoint."""
    return web.json_response({"status": "ok", "service": "claude-webhook"})


def main():
    """Start the webhook server."""
    app = web.Application()
    app.router.add_post("/webhook/comment", handle_comment_webhook)
    app.router.add_get("/health", health_check)

    logger.info(f"Starting Claude Code webhook server on port {WEBHOOK_PORT}")
    logger.info(f"Endpoint: http://localhost:{WEBHOOK_PORT}/webhook/comment")
    logger.info("Make sure:")
    logger.info("  1. Claude Code CLI is installed and in PATH")
    logger.info("  2. MCP server is configured in mcp.json")
    logger.info("  3. Turbo API is accessible at http://localhost:8001/api/v1")

    web.run_app(app, host="0.0.0.0", port=WEBHOOK_PORT)


if __name__ == "__main__":
    main()