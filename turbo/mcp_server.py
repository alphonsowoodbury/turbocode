#!/usr/bin/env python3
"""Turbo MCP Server - Exposes Turbo functionality to Claude Code via Model Context Protocol."""

import asyncio
import os
from typing import Any

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

# Initialize MCP server
app = Server("turbo")

# Turbo API base URL
TURBO_API_URL = os.getenv("TURBO_API_URL", "http://localhost:8001/api/v1")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List all available Turbo tools."""
    return [
        # Project Management Tools
        Tool(
            name="list_projects",
            description="Get all projects with optional filtering. Returns project list with id, name, status, priority, completion percentage, and issue counts.",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["active", "on_hold", "completed", "archived"],
                        "description": "Filter projects by status",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of projects to return",
                    },
                },
            },
        ),
        Tool(
            name="get_project",
            description="Get detailed information about a specific project including stats (total issues, open issues, closed issues, completion rate).",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "UUID of the project",
                    }
                },
                "required": ["project_id"],
            },
        ),
        Tool(
            name="get_project_issues",
            description="Get all issues for a specific project.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "UUID of the project",
                    }
                },
                "required": ["project_id"],
            },
        ),
        # Issue Management Tools
        Tool(
            name="list_issues",
            description="Get all issues with optional filtering. Can filter by project, status, priority, type, assignee. Returns issue list with all details.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {"type": "string", "description": "Filter by project UUID"},
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "Filter by issue status",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Filter by priority level",
                    },
                    "type": {
                        "type": "string",
                        "enum": ["feature", "bug", "task", "enhancement", "documentation", "discovery"],
                        "description": "Filter by issue type",
                    },
                    "assignee": {"type": "string", "description": "Filter by assignee name"},
                    "limit": {"type": "integer", "description": "Maximum number of issues to return"},
                },
            },
        ),
        Tool(
            name="get_issue",
            description="Get detailed information about a specific issue including title, description, status, priority, type, assignee, discovery_status, and timestamps.",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue",
                    }
                },
                "required": ["issue_id"],
            },
        ),
        Tool(
            name="create_issue",
            description="Create a new issue. Returns the created issue with generated ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Issue title"},
                    "description": {"type": "string", "description": "Issue description (supports Markdown)"},
                    "type": {
                        "type": "string",
                        "enum": ["feature", "bug", "task", "enhancement", "documentation", "discovery"],
                        "description": "Issue type",
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "Issue status (default: open)",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Priority level",
                    },
                    "project_id": {"type": "string", "description": "Project UUID (optional for discovery issues)"},
                    "assignee": {"type": "string", "description": "Assignee name (optional)"},
                    "discovery_status": {
                        "type": "string",
                        "enum": ["proposed", "researching", "findings_ready", "approved", "parked", "declined"],
                        "description": "Discovery status (only for discovery issues)",
                    },
                },
                "required": ["title", "description", "type", "priority"],
            },
        ),
        Tool(
            name="update_issue",
            description="Update an issue's details. Only include fields you want to change. Returns the updated issue.",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_id": {"type": "string", "description": "UUID of the issue to update"},
                    "title": {"type": "string"},
                    "description": {"type": "string", "description": "Updated description (supports Markdown)"},
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                    },
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "type": {
                        "type": "string",
                        "enum": ["feature", "bug", "task", "enhancement", "documentation", "discovery"],
                    },
                    "assignee": {"type": "string", "description": "Assignee name"},
                    "discovery_status": {
                        "type": "string",
                        "enum": ["proposed", "researching", "findings_ready", "approved", "parked", "declined"],
                    },
                },
                "required": ["issue_id"],
            },
        ),
        # Discovery Tools
        Tool(
            name="list_discoveries",
            description="Get all discovery issues (type=discovery). Includes discovery status. Useful for finding research topics.",
            inputSchema={
                "type": "object",
                "properties": {
                    "discovery_status": {
                        "type": "string",
                        "enum": ["proposed", "researching", "findings_ready", "approved", "parked", "declined"],
                        "description": "Filter by discovery status",
                    }
                },
            },
        ),
        # Initiative Tools
        Tool(
            name="list_initiatives",
            description="Get all initiatives (feature/technology-based groupings). Returns initiative list with status, dates, and counts.",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["planning", "in_progress", "on_hold", "completed", "cancelled"],
                        "description": "Filter by initiative status",
                    },
                    "project_id": {"type": "string", "description": "Filter by project UUID"},
                },
            },
        ),
        Tool(
            name="get_initiative",
            description="Get detailed information about a specific initiative including name, description, status, dates, and counts.",
            inputSchema={
                "type": "object",
                "properties": {
                    "initiative_id": {
                        "type": "string",
                        "description": "UUID of the initiative",
                    }
                },
                "required": ["initiative_id"],
            },
        ),
        Tool(
            name="get_initiative_issues",
            description="Get all issues associated with an initiative. Useful for understanding what work is part of a feature/technology initiative.",
            inputSchema={
                "type": "object",
                "properties": {
                    "initiative_id": {
                        "type": "string",
                        "description": "UUID of the initiative",
                    }
                },
                "required": ["initiative_id"],
            },
        ),
        # Milestone Tools
        Tool(
            name="list_milestones",
            description="Get all milestones (time/release-based groupings). Returns milestone list with status, dates, and counts.",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["planned", "in_progress", "completed", "cancelled"],
                        "description": "Filter by milestone status",
                    },
                    "project_id": {"type": "string", "description": "Filter by project UUID"},
                },
            },
        ),
        Tool(
            name="get_milestone",
            description="Get detailed information about a specific milestone including name, description, status, dates, and counts.",
            inputSchema={
                "type": "object",
                "properties": {
                    "milestone_id": {
                        "type": "string",
                        "description": "UUID of the milestone",
                    }
                },
                "required": ["milestone_id"],
            },
        ),
        Tool(
            name="get_milestone_issues",
            description="Get all issues associated with a milestone. Useful for tracking what needs to be done for a release.",
            inputSchema={
                "type": "object",
                "properties": {
                    "milestone_id": {
                        "type": "string",
                        "description": "UUID of the milestone",
                    }
                },
                "required": ["milestone_id"],
            },
        ),
        # Comment Tools
        Tool(
            name="add_comment",
            description="Add a comment to an issue. Use author_type='ai' for Claude responses and author_type='user' for user comments.",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue to comment on",
                    },
                    "content": {
                        "type": "string",
                        "description": "Comment content (supports Markdown)",
                    },
                    "author_name": {
                        "type": "string",
                        "description": "Author name (default: 'Claude' for AI)",
                        "default": "Claude",
                    },
                    "author_type": {
                        "type": "string",
                        "enum": ["user", "ai"],
                        "description": "Author type: 'user' or 'ai' (default: 'ai')",
                        "default": "ai",
                    },
                },
                "required": ["issue_id", "content"],
            },
        ),
        Tool(
            name="get_issue_comments",
            description="Get all comments for an issue, ordered chronologically. Returns conversation thread between user and AI.",
            inputSchema={
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue",
                    }
                },
                "required": ["issue_id"],
            },
        ),
        # Literature Tools
        Tool(
            name="list_literature",
            description="Get all literature (articles, podcasts, books, papers) with optional filtering. Returns list with title, type, url, author, source, read status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["article", "podcast", "book", "research_paper"],
                        "description": "Filter by literature type",
                    },
                    "source": {"type": "string", "description": "Filter by source name"},
                    "is_read": {"type": "boolean", "description": "Filter by read status"},
                    "is_favorite": {"type": "boolean", "description": "Filter by favorite status"},
                    "is_archived": {"type": "boolean", "description": "Filter by archived status"},
                    "limit": {"type": "integer", "description": "Maximum number of items to return (default: 100)"},
                    "offset": {"type": "integer", "description": "Number of items to skip (default: 0)"},
                },
            },
        ),
        Tool(
            name="get_literature",
            description="Get detailed information about a specific literature item including full content, metadata, and reading status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "literature_id": {
                        "type": "string",
                        "description": "UUID of the literature item",
                    }
                },
                "required": ["literature_id"],
            },
        ),
        Tool(
            name="fetch_article",
            description="Fetch and save an article from a URL. Uses Reader View technology to extract clean content without ads. Returns the saved article.",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL of the article to fetch",
                    }
                },
                "required": ["url"],
            },
        ),
        Tool(
            name="fetch_rss_feed",
            description="Fetch multiple articles from an RSS feed URL. Extracts all articles and saves them to your literature collection.",
            inputSchema={
                "type": "object",
                "properties": {
                    "feed_url": {
                        "type": "string",
                        "description": "URL of the RSS feed",
                    }
                },
                "required": ["feed_url"],
            },
        ),
        Tool(
            name="mark_literature_read",
            description="Mark a literature item as read. Useful for tracking reading progress.",
            inputSchema={
                "type": "object",
                "properties": {
                    "literature_id": {
                        "type": "string",
                        "description": "UUID of the literature item",
                    }
                },
                "required": ["literature_id"],
            },
        ),
        Tool(
            name="toggle_literature_favorite",
            description="Toggle favorite status of a literature item. Use to save important articles for later.",
            inputSchema={
                "type": "object",
                "properties": {
                    "literature_id": {
                        "type": "string",
                        "description": "UUID of the literature item",
                    }
                },
                "required": ["literature_id"],
            },
        ),
        Tool(
            name="update_literature",
            description="Update a literature item's details. Only include fields you want to change.",
            inputSchema={
                "type": "object",
                "properties": {
                    "literature_id": {"type": "string", "description": "UUID of the literature item"},
                    "title": {"type": "string"},
                    "type": {
                        "type": "string",
                        "enum": ["article", "podcast", "book", "research_paper"],
                    },
                    "tags": {"type": "string", "description": "Comma-separated tags"},
                    "is_archived": {"type": "boolean"},
                    "progress": {"type": "integer", "description": "Reading/listening progress percentage"},
                },
                "required": ["literature_id"],
            },
        ),
        Tool(
            name="delete_literature",
            description="Delete a literature item permanently. Use with caution.",
            inputSchema={
                "type": "object",
                "properties": {
                    "literature_id": {
                        "type": "string",
                        "description": "UUID of the literature item",
                    }
                },
                "required": ["literature_id"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Execute a Turbo tool by calling the Turbo API."""

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Project Management
            if name == "list_projects":
                params = {k: v for k, v in arguments.items() if v is not None}
                response = await client.get(f"{TURBO_API_URL}/projects/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_project":
                project_id = arguments["project_id"]
                response = await client.get(f"{TURBO_API_URL}/projects/{project_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_project_issues":
                project_id = arguments["project_id"]
                response = await client.get(f"{TURBO_API_URL}/projects/{project_id}/issues")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Issue Management
            elif name == "list_issues":
                params = {k: v for k, v in arguments.items() if v is not None}
                response = await client.get(f"{TURBO_API_URL}/issues/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_issue":
                issue_id = arguments["issue_id"]
                response = await client.get(f"{TURBO_API_URL}/issues/{issue_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "create_issue":
                response = await client.post(f"{TURBO_API_URL}/issues/", json=arguments)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "update_issue":
                issue_id = arguments.pop("issue_id")
                response = await client.put(f"{TURBO_API_URL}/issues/{issue_id}", json=arguments)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Discovery
            elif name == "list_discoveries":
                params = {**arguments, "type": "discovery"}
                response = await client.get(f"{TURBO_API_URL}/issues/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Initiatives
            elif name == "list_initiatives":
                params = {k: v for k, v in arguments.items() if v is not None}
                response = await client.get(f"{TURBO_API_URL}/initiatives/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_initiative":
                initiative_id = arguments["initiative_id"]
                response = await client.get(f"{TURBO_API_URL}/initiatives/{initiative_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_initiative_issues":
                initiative_id = arguments["initiative_id"]
                response = await client.get(f"{TURBO_API_URL}/initiatives/{initiative_id}/issues")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Milestones
            elif name == "list_milestones":
                params = {k: v for k, v in arguments.items() if v is not None}
                response = await client.get(f"{TURBO_API_URL}/milestones/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_milestone":
                milestone_id = arguments["milestone_id"]
                response = await client.get(f"{TURBO_API_URL}/milestones/{milestone_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_milestone_issues":
                milestone_id = arguments["milestone_id"]
                response = await client.get(f"{TURBO_API_URL}/milestones/{milestone_id}/issues")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Comments
            elif name == "add_comment":
                # Set defaults for author_name and author_type
                if "author_name" not in arguments:
                    arguments["author_name"] = "Claude"
                if "author_type" not in arguments:
                    arguments["author_type"] = "ai"

                response = await client.post(f"{TURBO_API_URL}/comments/", json=arguments)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_issue_comments":
                issue_id = arguments["issue_id"]
                response = await client.get(f"{TURBO_API_URL}/comments/issue/{issue_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            # Literature
            elif name == "list_literature":
                params = {k: v for k, v in arguments.items() if v is not None}
                response = await client.get(f"{TURBO_API_URL}/literature/", params=params)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "get_literature":
                literature_id = arguments["literature_id"]
                response = await client.get(f"{TURBO_API_URL}/literature/{literature_id}")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "fetch_article":
                url = arguments["url"]
                response = await client.post(
                    f"{TURBO_API_URL}/literature/fetch-url",
                    json={"url": url},
                    timeout=60.0,  # Longer timeout for content extraction
                )
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "fetch_rss_feed":
                feed_url = arguments["feed_url"]
                response = await client.post(
                    f"{TURBO_API_URL}/literature/fetch-feed",
                    json={"url": feed_url},
                    timeout=120.0,  # Longer timeout for multiple articles
                )
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "mark_literature_read":
                literature_id = arguments["literature_id"]
                response = await client.post(f"{TURBO_API_URL}/literature/{literature_id}/read")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "toggle_literature_favorite":
                literature_id = arguments["literature_id"]
                response = await client.post(f"{TURBO_API_URL}/literature/{literature_id}/favorite")
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "update_literature":
                literature_id = arguments.pop("literature_id")
                response = await client.put(f"{TURBO_API_URL}/literature/{literature_id}", json=arguments)
                response.raise_for_status()
                return [TextContent(type="text", text=response.text)]

            elif name == "delete_literature":
                literature_id = arguments["literature_id"]
                response = await client.delete(f"{TURBO_API_URL}/literature/{literature_id}")
                response.raise_for_status()
                return [TextContent(type="text", text="Literature item deleted successfully")]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except httpx.HTTPError as e:
            error_msg = f"Error calling Turbo API: {str(e)}"
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_detail = e.response.json()
                    error_msg = f"API Error: {error_detail}"
                except Exception:
                    error_msg = f"API Error: {e.response.text}"
            return [TextContent(type="text", text=error_msg)]
        except Exception as e:
            return [TextContent(type="text", text=f"Unexpected error: {str(e)}")]


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
