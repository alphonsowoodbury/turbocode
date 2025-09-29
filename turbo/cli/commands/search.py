"""Global search command."""

import asyncio
from typing import List, Dict, Any

import click
from rich.console import Console
from rich.table import Table
from rich import box

from turbo.cli.utils import run_async, handle_exceptions
from turbo.api.dependencies import get_project_service, get_issue_service, get_document_service, get_tag_service
from turbo.core.database import get_db_session

console = Console()

# Valid choices for CLI options
TYPE_CHOICES = ['all', 'projects', 'issues', 'documents', 'tags']
FORMAT_CHOICES = ['table', 'json']


@click.command()
@click.argument('query')
@click.option('--type', type=click.Choice(TYPE_CHOICES), default='all', help='Search in specific entity type')
@click.option('--format', type=click.Choice(FORMAT_CHOICES), default='table', help='Output format')
@click.option('--limit', type=int, default=20, help='Limit number of results')
@handle_exceptions
def search_command(query, type, format, limit):
    """Search across all entities in the workspace."""
    async def _search():
        async for session in get_db_session():
            project_service = get_project_service(session)
            issue_service = get_issue_service(session)
            document_service = get_document_service(session)
            tag_service = get_tag_service(session)

            results = {}

            try:
                if type in ['all', 'projects']:
                    results['projects'] = await project_service.search_projects_by_name(query)

                if type in ['all', 'issues']:
                    results['issues'] = await issue_service.search_issues_by_title(query)

                if type in ['all', 'documents']:
                    results['documents'] = await document_service.search_documents(query)

                if type in ['all', 'tags']:
                    results['tags'] = await tag_service.search_tags_by_name(query)

                # Display results
                if format == 'table':
                    _display_search_results_table(results, query, limit)
                else:
                    _display_search_results_json(results, query, limit)

            except Exception as e:
                console.print(f"[red]Search failed: {e}[/red]")

    run_async(_search())


def _display_search_results_table(results: Dict[str, List[Any]], query: str, limit: int):
    """Display search results in table format."""
    total_results = sum(len(items) for items in results.values())

    if total_results == 0:
        console.print(f"[yellow]No results found for '{query}'[/yellow]")
        return

    console.print(f"[blue]Found {total_results} result(s) for '{query}':[/blue]\n")

    shown_count = 0

    # Display projects
    if 'projects' in results and results['projects']:
        console.print("[bold cyan]Projects:[/bold cyan]")
        table = Table(box=box.SIMPLE)
        table.add_column("ID", style="dim")
        table.add_column("Name", style="bold")
        table.add_column("Status", style="cyan")
        table.add_column("Priority", style="yellow")

        for project in results['projects'][:limit - shown_count]:
            table.add_row(
                str(project.id)[:8] + "...",
                project.name,
                project.status,
                project.priority
            )
            shown_count += 1

        console.print(table)
        console.print()

    # Display issues
    if 'issues' in results and results['issues'] and shown_count < limit:
        console.print("[bold cyan]Issues:[/bold cyan]")
        table = Table(box=box.SIMPLE)
        table.add_column("ID", style="dim")
        table.add_column("Title", style="bold")
        table.add_column("Status", style="cyan")
        table.add_column("Priority", style="yellow")

        for issue in results['issues'][:limit - shown_count]:
            table.add_row(
                str(issue.id)[:8] + "...",
                issue.title[:50] + "..." if len(issue.title) > 50 else issue.title,
                issue.status,
                issue.priority
            )
            shown_count += 1

        console.print(table)
        console.print()

    # Display documents
    if 'documents' in results and results['documents'] and shown_count < limit:
        console.print("[bold cyan]Documents:[/bold cyan]")
        table = Table(box=box.SIMPLE)
        table.add_column("ID", style="dim")
        table.add_column("Title", style="bold")
        table.add_column("Type", style="cyan")
        table.add_column("Size", style="green")

        for document in results['documents'][:limit - shown_count]:
            content_size = len(document.content or "")
            size_str = f"{content_size} chars" if content_size < 1000 else f"{content_size/1000:.1f}K"

            table.add_row(
                str(document.id)[:8] + "...",
                document.title[:50] + "..." if len(document.title) > 50 else document.title,
                document.document_type,
                size_str
            )
            shown_count += 1

        console.print(table)
        console.print()

    # Display tags
    if 'tags' in results and results['tags'] and shown_count < limit:
        console.print("[bold cyan]Tags:[/bold cyan]")
        table = Table(box=box.SIMPLE)
        table.add_column("ID", style="dim")
        table.add_column("Name", style="bold")
        table.add_column("Color", style="cyan")
        table.add_column("Description", style="white")

        for tag in results['tags'][:limit - shown_count]:
            colored_name = f"[{tag.color}]{tag.name}[/{tag.color}]"
            description = tag.description[:40] + "..." if tag.description and len(tag.description) > 40 else (tag.description or "")

            table.add_row(
                str(tag.id)[:8] + "...",
                colored_name,
                tag.color,
                description
            )
            shown_count += 1

        console.print(table)

    if shown_count >= limit and total_results > limit:
        console.print(f"[dim]... and {total_results - limit} more results (use --limit to see more)[/dim]")


def _display_search_results_json(results: Dict[str, List[Any]], query: str, limit: int):
    """Display search results in JSON format."""
    import json

    output = {
        'query': query,
        'total_results': sum(len(items) for items in results.values()),
        'results': {}
    }

    for entity_type, items in results.items():
        if items:
            output['results'][entity_type] = [
                item.model_dump() for item in items[:limit]
            ]

    console.print(json.dumps(output, indent=2, default=str))