"""Tool registry for Claude API staff members."""

from typing import Any


def get_turbo_tools() -> list[dict[str, Any]]:
    """
    Get tool definitions in Claude API format.

    These tools are available to all staff members and can be filtered
    based on staff capabilities.
    """
    return [
        {
            "name": "list_projects",
            "description": "List all projects in the system with optional filtering by status or priority",
            "input_schema": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["active", "on_hold", "completed", "archived"],
                        "description": "Filter projects by status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Filter projects by priority level"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of projects to return (default: 50)"
                    }
                },
                "required": []
            }
        },
        {
            "name": "get_project",
            "description": "Get detailed information about a specific project including stats and metadata",
            "input_schema": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "UUID of the project to retrieve"
                    }
                },
                "required": ["project_id"]
            }
        },
        {
            "name": "list_issues",
            "description": "List issues with optional filtering by project, status, priority, or assignee",
            "input_schema": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Filter issues by project UUID"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "Filter by issue status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Filter by priority level"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Filter by assignee email"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of issues to return (default: 50)"
                    }
                },
                "required": []
            }
        },
        {
            "name": "get_issue",
            "description": "Get detailed information about a specific issue",
            "input_schema": {
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue to retrieve"
                    }
                },
                "required": ["issue_id"]
            }
        },
        {
            "name": "create_issue",
            "description": "Create a new issue in a project",
            "input_schema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Issue title (clear and concise)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description of the issue with context and requirements"
                    },
                    "project_id": {
                        "type": "string",
                        "description": "UUID of the project this issue belongs to"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["bug", "feature", "task", "enhancement", "documentation", "discovery"],
                        "description": "Type of issue"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Priority level"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "Initial status (default: open)"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "Email of person to assign this issue to (optional)"
                    }
                },
                "required": ["title", "description", "project_id", "type", "priority"]
            }
        },
        {
            "name": "update_issue",
            "description": "Update an existing issue's properties",
            "input_schema": {
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New title"
                    },
                    "description": {
                        "type": "string",
                        "description": "New description"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "New status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "New priority level"
                    },
                    "assignee": {
                        "type": "string",
                        "description": "New assignee email"
                    }
                },
                "required": ["issue_id"]
            }
        },
        {
            "name": "list_documents",
            "description": "List documents with optional filtering by type, format, or project",
            "input_schema": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Filter documents by project UUID"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["specification", "user_guide", "api_doc", "readme", "changelog", "requirements", "design", "other"],
                        "description": "Filter by document type"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of documents to return (default: 50)"
                    }
                },
                "required": []
            }
        },
        {
            "name": "get_document",
            "description": "Get detailed information about a specific document including full content",
            "input_schema": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "UUID of the document to retrieve"
                    }
                },
                "required": ["document_id"]
            }
        },
        {
            "name": "search_documents",
            "description": "Search documents by title and content using keywords",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to match against document title and content"
                    }
                },
                "required": ["query"]
            }
        },
        {
            "name": "semantic_search",
            "description": "Perform semantic search across the knowledge graph to find related entities by meaning (not just keywords)",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language description of what you're looking for"
                    },
                    "entity_types": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["issue", "project", "document", "milestone", "initiative"]
                        },
                        "description": "Types of entities to search (leave empty for all types)"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (default: 10)"
                    },
                    "min_relevance": {
                        "type": "number",
                        "description": "Minimum relevance score 0.0-1.0 (default: 0.7)"
                    }
                },
                "required": ["query"]
            }
        },
        {
            "name": "get_work_queue",
            "description": "Get all issues in the work queue, sorted by priority rank. Lower rank number = higher priority (rank 1 is most important). Only returns issues that have been explicitly ranked.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["open", "in_progress", "review", "testing", "closed"],
                        "description": "Filter by status"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": "Filter by priority level"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of issues to return (default: 100)"
                    },
                    "include_unranked": {
                        "type": "boolean",
                        "description": "Include issues without work_rank (default: false)"
                    }
                },
                "required": []
            }
        },
        {
            "name": "get_next_issue",
            "description": "Get THE next issue to work on. Returns the highest-ranked issue (work_rank=1) that is open or in_progress. Use this when asked 'what should I work on next' or 'work the next issue'. Returns null if no ranked issues exist.",
            "input_schema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        },
        {
            "name": "set_issue_rank",
            "description": "Set the work queue rank for a specific issue. Rank 1 is highest priority. This manually positions an issue in the work queue.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue to rank"
                    },
                    "work_rank": {
                        "type": "integer",
                        "description": "New rank position (1=highest priority)"
                    }
                },
                "required": ["issue_id", "work_rank"]
            }
        },
        {
            "name": "remove_issue_rank",
            "description": "Remove an issue from the work queue by clearing its rank. The issue will no longer appear in the prioritized work queue.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "issue_id": {
                        "type": "string",
                        "description": "UUID of the issue to remove from queue"
                    }
                },
                "required": ["issue_id"]
            }
        },
        {
            "name": "auto_rank_issues",
            "description": "Automatically rank all open/in_progress issues using intelligent scoring based on priority, age, blockers, and dependencies. This will recalculate and assign ranks to all eligible issues.",
            "input_schema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    ]


def filter_tools_by_capabilities(tools: list[dict[str, Any]], capabilities: list[str]) -> list[dict[str, Any]]:
    """
    Filter tools based on staff member capabilities.

    Args:
        tools: Full list of available tools
        capabilities: List of capability strings from staff record

    Returns:
        Filtered list of tools this staff member can access
    """
    # Capability to tool mapping
    capability_tool_map = {
        "team_coordination": ["list_projects", "list_issues", "get_project", "get_issue", "get_work_queue", "get_next_issue"],
        "resource_allocation": ["list_projects", "list_issues", "update_issue", "get_work_queue", "set_issue_rank", "auto_rank_issues"],
        "priority_alignment": ["list_issues", "update_issue", "get_work_queue", "get_next_issue", "set_issue_rank", "auto_rank_issues"],
        "staff_recruitment": [],  # No direct tools - conversational capability
        "cross_functional_analysis": ["semantic_search", "list_documents", "get_document", "search_documents", "get_work_queue"],
        "conflict_resolution": ["list_issues", "get_issue", "get_work_queue"],
        "strategic_planning": ["list_projects", "get_project", "create_issue", "list_documents", "get_work_queue", "get_next_issue", "auto_rank_issues"],
        # Domain expert capabilities (documents, technical work)
        "document_management": ["list_documents", "get_document", "search_documents"],
        "code_review": ["list_issues", "get_issue", "update_issue", "get_work_queue"],
        "architecture": ["list_documents", "search_documents", "semantic_search", "get_work_queue"],
        "testing": ["list_issues", "create_issue", "update_issue", "get_work_queue", "get_next_issue"],
        "design": ["list_documents", "search_documents", "get_work_queue"],
    }

    # Collect all allowed tool names
    allowed_tool_names = set()
    for capability in capabilities:
        if capability in capability_tool_map:
            allowed_tool_names.update(capability_tool_map[capability])

    # If no specific capabilities mapped to tools, give access to read-only tools including work queue
    if not allowed_tool_names:
        allowed_tool_names = {"list_projects", "list_issues", "get_project", "get_issue", "get_work_queue", "get_next_issue"}

    # Filter tools
    return [tool for tool in tools if tool["name"] in allowed_tool_names]
