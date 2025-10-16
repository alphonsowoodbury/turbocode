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

import httpx
from aiohttp import web

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Host machine port for the webhook server
WEBHOOK_PORT = 9000

# Turbo API URL (Docker uses host.docker.internal, host uses localhost)
TURBO_API_URL = "http://localhost:8001/api/v1"


async def fetch_mentor_context(mentor_id: str) -> dict[str, Any]:
    """Fetch mentor details and conversation history from API.

    Args:
        mentor_id: UUID of the mentor

    Returns:
        Dict with mentor info and formatted conversation history
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Fetch mentor details
        mentor_response = await client.get(f"{TURBO_API_URL}/mentors/{mentor_id}")
        mentor_response.raise_for_status()
        mentor = mentor_response.json()

        # Fetch conversation history (last 20 messages)
        messages_response = await client.get(
            f"{TURBO_API_URL}/mentors/{mentor_id}/messages",
            params={"limit": 20}
        )
        messages_response.raise_for_status()
        messages_data = messages_response.json()
        messages = messages_data.get("messages", [])

        # Format conversation history
        conversation_lines = []
        for msg in messages:
            role = "User" if msg["role"] == "user" else "Mentor"
            conversation_lines.append(f"**{role}:** {msg['content']}\n")

        conversation_history = "\n".join(conversation_lines) if conversation_lines else "_No previous conversation_"

        return {
            "mentor": mentor,
            "conversation_history": conversation_history,
            "message_count": len(messages),
        }


def build_entity_prompt(entity_type: str, entity_id: str, extra_context: dict[str, Any] | None = None) -> tuple[str, str, list[str]]:
    """Build entity-specific prompt, system prompt, and allowed tools.

    Args:
        entity_type: Type of entity (issue, project, milestone, initiative, literature, blueprint)
        entity_id: UUID of the entity

    Returns:
        Tuple of (user_prompt, system_prompt, allowed_tools)
    """
    # Common system prompt with project context
    base_system_prompt = """You are an AI assistant integrated into Turbo, a project management platform.

**Project Context:**
Turbo is a modern project management system built with:
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- CLI: Typer + Rich
- Integration: Claude Code via MCP (Model Context Protocol)

**Guidelines:**
- Always read the FULL entity and comment thread first
- Be concise but thorough
- Suggest concrete next steps when appropriate
- If you don't have enough context, ask clarifying questions
"""

    if entity_type == "issue":
        user_prompt = f"""A user has @mentioned you in a comment on issue {entity_id}.

Please:
1. Use the MCP tool `get_issue` with issue_id: {entity_id} to read the issue details
2. Use the MCP tool `get_issue_comments` with issue_id: {entity_id} to read all comments
3. Analyze the conversation thread and provide a helpful response to the latest user comment
4. Use the MCP tool `add_comment` to post your response with issue_id: {entity_id}

Your response should be:
- Helpful and actionable
- Relevant to the issue context (type, priority, status)
- Professional and concise
- Based on the full conversation thread
- Posted using the add_comment MCP tool (not just printed)
"""
        system_prompt = base_system_prompt + """
**Your Role for Issues:**
When users comment on issues, you provide expert guidance on:
- Technical implementation details
- Architecture decisions
- Best practices
- Breaking down complex tasks
- Suggesting solutions to problems

**Issue-Specific Context:**
- Consider the issue type (feature/bug/task/enhancement/documentation/discovery)
- Respect the priority level (low/medium/high/critical)
- Check current status (open/in_progress/review/testing/closed)
"""
        allowed_tools = ["mcp__turbo__get_issue", "mcp__turbo__get_issue_comments", "mcp__turbo__add_comment"]

    elif entity_type == "project":
        user_prompt = f"""A user has @mentioned you in a comment on project {entity_id}.

Please:
1. Use the MCP tool `get_project` with project_id: {entity_id} to read the project details
2. Use the MCP tool `get_entity_comments` with entity_type: "project" and entity_id: {entity_id} to read all comments
3. Analyze the project status and respond to the user's question
4. Use the MCP tool `add_comment` to post your response with entity_type: "project" and entity_id: {entity_id}

Your response should provide insights on:
- Project progress and completion status
- Overall health and any blockers
- Strategic recommendations
- Resource allocation suggestions
"""
        system_prompt = base_system_prompt + """
**Your Role for Projects:**
You help with project-level strategic planning and oversight:
- Assess overall project health
- Review completion percentage and milestones
- Suggest process improvements
- Identify dependencies and risks
- Recommend resource allocation
"""
        allowed_tools = ["mcp__turbo__get_project", "mcp__turbo__get_entity_comments", "mcp__turbo__add_comment"]

    elif entity_type == "milestone":
        user_prompt = f"""A user has @mentioned you in a comment on milestone {entity_id}.

Please:
1. Use the MCP tool `get_milestone` with milestone_id: {entity_id} to read the milestone details
2. Use the MCP tool `get_milestone_issues` with milestone_id: {entity_id} to see associated issues
3. Use the MCP tool `get_entity_comments` with entity_type: "milestone" and entity_id: {entity_id} to read all comments
4. Use the MCP tool `add_comment` to post your response with entity_type: "milestone" and entity_id: {entity_id}

Your response should address:
- Milestone progress toward due date
- Risk assessment for on-time delivery
- Blocking issues or dependencies
- Recommendations for achieving milestone goals
"""
        system_prompt = base_system_prompt + """
**Your Role for Milestones:**
You help with milestone planning and tracking:
- Monitor progress toward due dates
- Identify risks to on-time delivery
- Review associated issues and their status
- Suggest actions to keep milestones on track
- Coordinate across dependencies
"""
        allowed_tools = ["mcp__turbo__get_milestone", "mcp__turbo__get_milestone_issues", "mcp__turbo__get_entity_comments", "mcp__turbo__add_comment"]

    elif entity_type == "initiative":
        user_prompt = f"""A user has @mentioned you in a comment on initiative {entity_id}.

Please:
1. Use the MCP tool `get_initiative` with initiative_id: {entity_id} to read the initiative details
2. Use the MCP tool `get_initiative_issues` with initiative_id: {entity_id} to see associated issues
3. Use the MCP tool `get_entity_comments` with entity_type: "initiative" and entity_id: {entity_id} to read all comments
4. Use the MCP tool `add_comment` to post your response with entity_type: "initiative" and entity_id: {entity_id}

Your response should provide guidance on:
- Initiative scope and strategic alignment
- Technical approach and architecture
- Implementation roadmap
- Success criteria and metrics
"""
        system_prompt = base_system_prompt + """
**Your Role for Initiatives:**
You help with feature/technology initiative planning:
- Define scope and technical approach
- Break down into actionable issues
- Identify technical dependencies
- Recommend architecture patterns
- Set success criteria
"""
        allowed_tools = ["mcp__turbo__get_initiative", "mcp__turbo__get_initiative_issues", "mcp__turbo__get_entity_comments", "mcp__turbo__add_comment"]

    elif entity_type == "literature":
        user_prompt = f"""A user has @mentioned you in a comment on a literature item {entity_id}.

Please:
1. Use the MCP tool `get_literature` with literature_id: {entity_id} to read the article/podcast/book details
2. Use the MCP tool `get_entity_comments` with entity_type: "literature" and entity_id: {entity_id} to read all comments
3. Analyze the content and respond to the user's question
4. Use the MCP tool `add_comment` to post your response with entity_type: "literature" and entity_id: {entity_id}

Your response should provide:
- Key insights from the literature
- Connections to their projects or work
- Actionable takeaways
- Related concepts or further reading
"""
        system_prompt = base_system_prompt + """
**Your Role for Literature:**
You help users extract value from articles, podcasts, books, and papers:
- Summarize key concepts
- Connect ideas to their projects
- Suggest practical applications
- Recommend related resources
- Facilitate knowledge sharing
"""
        allowed_tools = ["mcp__turbo__get_literature", "mcp__turbo__get_entity_comments", "mcp__turbo__add_comment"]

    elif entity_type == "blueprint":
        user_prompt = f"""A user has @mentioned you in a comment on a blueprint {entity_id}.

Please:
1. Use the MCP tool `get_blueprint` with blueprint_id: {entity_id} to read the blueprint details
2. Use the MCP tool `get_entity_comments` with entity_type: "blueprint" and entity_id: {entity_id} to read all comments
3. Analyze the blueprint and respond to the user's question
4. Use the MCP tool `add_comment` to post your response with entity_type: "blueprint" and entity_id: {entity_id}

Your response should provide:
- Technical guidance on the blueprint
- Architecture recommendations
- Implementation suggestions
- Risk assessment
"""
        system_prompt = base_system_prompt + """
**Your Role for Blueprints:**
You help with technical blueprints and architecture planning:
- Review technical designs
- Suggest architectural patterns
- Identify potential issues
- Recommend best practices
- Guide implementation strategy
"""
        allowed_tools = ["mcp__turbo__get_blueprint", "mcp__turbo__get_entity_comments", "mcp__turbo__add_comment"]

    elif entity_type == "mentor":
        # Extract pre-fetched context
        mentor = extra_context.get("mentor", {}) if extra_context else {}
        conversation_history = extra_context.get("conversation_history", "_No previous conversation_") if extra_context else "_No previous conversation_"

        mentor_name = mentor.get("name", "Unknown")
        mentor_persona = mentor.get("persona", "")
        mentor_workspace = mentor.get("workspace", "personal")

        user_prompt = f"""A user has sent a message to their mentor "{mentor_name}".

## Mentor Persona
{mentor_persona}

## Workspace
{mentor_workspace}

## Conversation History (Last 20 Messages)
{conversation_history}

## Your Task
Please respond to the user's latest message as this mentor:
1. Use the MCP tool `add_mentor_message` with mentor_id: {entity_id} to post your response
2. Your response should:
   - Match the mentor's persona and communication style defined above
   - Build naturally on the conversation history
   - Be conversational and supportive
   - Provide actionable guidance relevant to their work
   - Reference specific context when helpful
   - Use web search when you need current information, industry trends, or specific technical details

**Important:** The conversation history above is already complete - you do NOT need to call get_mentor or get_mentor_messages. Just respond based on the context provided.
"""
        system_prompt = base_system_prompt + """
**Your Role for Mentors:**
You act as a personalized AI mentor for the user:
- Adopt the mentor's defined persona and communication style
- Use workspace context (projects, issues, documents) to give specific guidance
- Provide coaching, feedback, and strategic advice
- Help with career development and technical growth
- Be supportive and encouraging while being honest
- Use web search to find current information, best practices, industry trends, or specific technical details

**Internet Access:**
You have access to web search via the WebSearch tool. Use it when:
- User asks about current events, trends, or recent developments
- You need up-to-date information about technologies, tools, or frameworks
- Looking for specific examples, documentation, or best practices
- Researching company information, industry standards, or market data
- Finding relevant articles, tutorials, or resources

**Important Guidelines:**
- Read the mentor's persona carefully and embody it in your responses
- Reference specific projects, issues, or work from their workspace
- Ask clarifying questions when needed
- Provide actionable next steps
- Remember conversation context
- Search the web proactively when it would enhance your guidance
"""
        # Include web search for mentors to access current information
        allowed_tools = ["mcp__turbo__add_mentor_message", "WebSearch"]

    elif entity_type == "resume":
        user_prompt = f"""A user has uploaded a resume (ID: {entity_id}) that needs structured data extraction.

Please:
1. Use the MCP tool `get_resume` with resume_id: {entity_id} to read the resume text and sections
2. Analyze the content and extract structured data
3. Use the MCP tool `update_resume` with resume_id: {entity_id} to save the extracted data

Extract the following structured data in JSON format:
{{
  "personal": {{
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL",
    "website": "Personal website",
    "location": "City, State/Country"
  }},
  "summary": "Professional summary (single paragraph)",
  "experience": [
    {{
      "company": "Company name",
      "title": "Job title",
      "location": "Location",
      "start_date": "Start date (YYYY-MM or YYYY)",
      "end_date": "End date (YYYY-MM or YYYY or 'Present')",
      "description": "Job description and key achievements",
      "technologies": ["Tech1", "Tech2"]
    }}
  ],
  "education": [
    {{
      "institution": "School/University name",
      "degree": "Degree type and field",
      "location": "Location",
      "graduation_date": "Graduation date (YYYY or YYYY-MM)",
      "gpa": "GPA (if mentioned)",
      "honors": "Any honors or distinctions"
    }}
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {{
      "name": "Project name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL (if available)",
      "date": "Project date or date range"
    }}
  ],
  "other": {{
    "certifications": ["Cert1", "Cert2"],
    "awards": ["Award1", "Award2"],
    "publications": ["Publication1"],
    "languages": ["Language: Proficiency"],
    "volunteer": ["Volunteer experience"]
  }}
}}

Save this data using `update_resume` with the parsed_data field.
"""
        system_prompt = base_system_prompt + """
**Your Role for Resumes:**
You are an expert resume parser that extracts structured data from resume text:
- Parse personal information accurately
- Extract all work experience with dates and details
- Identify education credentials
- List technical and soft skills
- Find projects and achievements
- Capture certifications, awards, and other relevant information

**Important Guidelines:**
- Be thorough and extract all relevant information
- Use consistent date formats (YYYY-MM or YYYY)
- If information is not found, use null for strings, [] for arrays
- Preserve the original content while structuring it
- Save the extracted data immediately using the update_resume MCP tool
"""
        allowed_tools = ["mcp__turbo__get_resume", "mcp__turbo__update_resume"]

    else:
        raise ValueError(f"Unknown entity type: {entity_type}")

    return user_prompt, system_prompt, allowed_tools


async def handle_comment_webhook(request: web.Request) -> web.Response:
    """Handle incoming webhook requests to trigger Claude responses."""
    try:
        data = await request.json()
        entity_type = data.get("entity_type")
        entity_id = data.get("entity_id")

        if not entity_type or not entity_id:
            logger.error("Missing entity_type or entity_id in webhook request")
            return web.json_response(
                {"error": "Missing entity_type or entity_id"}, status=400
            )

        logger.info(f"Received webhook for {entity_type} {entity_id}")

        # Fetch extra context for mentor (pre-fetch conversation history)
        extra_context = None
        if entity_type == "mentor":
            try:
                logger.info(f"Fetching mentor context for {entity_id}")
                extra_context = await fetch_mentor_context(entity_id)
                logger.info(f"Fetched {extra_context['message_count']} messages for mentor {entity_id}")
            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch mentor context: {e}")
                return web.json_response({"error": f"Failed to fetch mentor context: {str(e)}"}, status=500)

        # Build entity-specific prompt
        try:
            user_prompt, system_prompt, allowed_tools = build_entity_prompt(
                entity_type, entity_id, extra_context
            )
        except ValueError as e:
            logger.error(f"Invalid entity type: {e}")
            return web.json_response({"error": str(e)}, status=400)

        # Call Claude Code in headless mode
        logger.info(f"Calling Claude Code for {entity_type} {entity_id}")
        process = await asyncio.create_subprocess_exec(
            "claude",
            "-p",
            user_prompt,
            "--output-format",
            "json",
            "--append-system-prompt",
            system_prompt,
            "--allowedTools",
            ",".join(allowed_tools),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            result = json.loads(stdout.decode())
            logger.info(
                f"Claude Code completed for {entity_type} {entity_id}: "
                f"{result.get('subtype')}"
            )
            return web.json_response(
                {
                    "success": True,
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "result": result.get("result"),
                    "cost_usd": result.get("total_cost_usd"),
                }
            )
        else:
            error = stderr.decode()
            logger.error(f"Claude Code error for {entity_type} {entity_id}: {error}")
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