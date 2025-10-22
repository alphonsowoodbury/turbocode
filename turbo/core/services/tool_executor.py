"""Tool executor for staff member AI tool calls."""

import logging
from typing import Any
from uuid import UUID

import httpx

logger = logging.getLogger(__name__)


class ToolExecutor:
    """Executes MCP tools by calling Turbo API endpoints."""

    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url

    async def execute_tool(self, tool_name: str, tool_input: dict[str, Any]) -> dict[str, Any]:
        """
        Execute a tool and return the result.

        Args:
            tool_name: Name of the tool to execute
            tool_input: Input parameters for the tool

        Returns:
            Tool execution result
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if tool_name == "list_projects":
                    params = {}
                    if "status" in tool_input:
                        params["status"] = tool_input["status"]
                    if "priority" in tool_input:
                        params["priority"] = tool_input["priority"]
                    if "limit" in tool_input:
                        params["limit"] = tool_input["limit"]

                    response = await client.get(f"{self.api_base_url}/projects/", params=params)
                    response.raise_for_status()
                    return {"projects": response.json()}

                elif tool_name == "get_project":
                    project_id = tool_input["project_id"]
                    response = await client.get(f"{self.api_base_url}/projects/{project_id}")
                    response.raise_for_status()
                    return {"project": response.json()}

                elif tool_name == "get_project_issues":
                    project_id = tool_input["project_id"]
                    response = await client.get(f"{self.api_base_url}/projects/{project_id}/issues")
                    response.raise_for_status()
                    return {"issues": response.json()}

                elif tool_name == "list_issues":
                    params = {}
                    if "project_id" in tool_input:
                        params["project_id"] = tool_input["project_id"]
                    if "status" in tool_input:
                        params["status"] = tool_input["status"]
                    if "priority" in tool_input:
                        params["priority"] = tool_input["priority"]
                    if "assignee" in tool_input:
                        params["assignee"] = tool_input["assignee"]
                    if "limit" in tool_input:
                        params["limit"] = tool_input["limit"]

                    response = await client.get(f"{self.api_base_url}/issues/", params=params)
                    response.raise_for_status()
                    return {"issues": response.json()}

                elif tool_name == "get_issue":
                    issue_id = tool_input["issue_id"]
                    response = await client.get(f"{self.api_base_url}/issues/{issue_id}")
                    response.raise_for_status()
                    return {"issue": response.json()}

                elif tool_name == "create_issue":
                    response = await client.post(
                        f"{self.api_base_url}/issues/",
                        json=tool_input
                    )
                    response.raise_for_status()
                    return {"issue": response.json(), "message": "Issue created successfully"}

                elif tool_name == "update_issue":
                    issue_id = tool_input.pop("issue_id")
                    response = await client.put(
                        f"{self.api_base_url}/issues/{issue_id}",
                        json=tool_input
                    )
                    response.raise_for_status()
                    return {"issue": response.json(), "message": "Issue updated successfully"}

                elif tool_name == "list_documents":
                    params = {}
                    if "project_id" in tool_input:
                        params["project_id"] = tool_input["project_id"]
                    if "type" in tool_input:
                        params["type"] = tool_input["type"]
                    if "limit" in tool_input:
                        params["limit"] = tool_input["limit"]

                    response = await client.get(f"{self.api_base_url}/documents/", params=params)
                    response.raise_for_status()
                    return {"documents": response.json()}

                elif tool_name == "get_document":
                    document_id = tool_input["document_id"]
                    response = await client.get(f"{self.api_base_url}/documents/{document_id}")
                    response.raise_for_status()
                    return {"document": response.json()}

                elif tool_name == "search_documents":
                    params = {"query": tool_input["query"]}
                    response = await client.get(f"{self.api_base_url}/documents/search", params=params)
                    response.raise_for_status()
                    return {"documents": response.json()}

                elif tool_name == "semantic_search":
                    payload = {"query": tool_input["query"]}
                    if "entity_types" in tool_input:
                        payload["entity_types"] = tool_input["entity_types"]
                    if "limit" in tool_input:
                        payload["limit"] = tool_input["limit"]
                    if "min_relevance" in tool_input:
                        payload["min_relevance"] = tool_input["min_relevance"]

                    response = await client.post(
                        f"{self.api_base_url}/graph/search",
                        json=payload
                    )
                    response.raise_for_status()
                    return {"results": response.json()}

                else:
                    return {"error": f"Unknown tool: {tool_name}"}

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error executing tool {tool_name}: {e}")
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}", exc_info=True)
            return {"error": str(e)}
