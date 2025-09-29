"""Status command."""

import asyncio
from datetime import datetime, timedelta

import click
from rich.console import Console
from rich.table import Table
from rich import box

from turbo.cli.utils import run_async, handle_exceptions
from turbo.core.repositories import ProjectRepository, IssueRepository, DocumentRepository, TagRepository
from turbo.core.services import ProjectService, IssueService, DocumentService, TagService
from turbo.core.database import get_db_session

console = Console()


def _create_services(session):
    """Create all services with repositories."""
    project_repo = ProjectRepository(session)
    issue_repo = IssueRepository(session)
    document_repo = DocumentRepository(session)
    tag_repo = TagRepository(session)

    project_service = ProjectService(project_repo, issue_repo, document_repo)
    issue_service = IssueService(issue_repo, project_repo)
    document_service = DocumentService(document_repo, project_repo)
    tag_service = TagService(tag_repo)

    return project_service, issue_service, document_service, tag_service


@click.command()
@click.option('--health', is_flag=True, help='Show system health status')
@click.option('--recent', is_flag=True, help='Show recent activity')
@click.option('--detailed', is_flag=True, help='Show detailed statistics')
@handle_exceptions
def status_command(health, recent, detailed):
    """Show workspace status and statistics."""
    async def _status():
        async for session in get_db_session():
            project_service, issue_service, document_service, tag_service = _create_services(session)

            if health:
                await _show_health_status(session)
            elif recent:
                await _show_recent_activity(project_service, issue_service, document_service)
            else:
                await _show_overview(project_service, issue_service, document_service, tag_service, detailed)

    run_async(_status())


async def _show_overview(project_service, issue_service, document_service, tag_service, detailed=False):
    """Show general overview of workspace."""
    console.print("[bold blue]Turbo Workspace Overview[/bold blue]\n")

    # Get basic counts
    try:
        projects = await project_service.get_all_projects()
        issues = await issue_service.get_all_issues()
        documents = await document_service.get_all_documents()
        tags = await tag_service.get_all_tags()

        project_count = len(projects)
        issue_count = len(issues)
        document_count = len(documents)
        tag_count = len(tags)

        # Basic statistics table
        table = Table(box=box.SIMPLE)
        table.add_column("Entity", style="cyan")
        table.add_column("Count", style="green")

        table.add_row("Projects", str(project_count))
        table.add_row("Issues", str(issue_count))
        table.add_row("Documents", str(document_count))
        table.add_row("Tags", str(tag_count))

        console.print(table)

        if detailed and projects:
            console.print("\n[bold]Project Status Breakdown:[/bold]")
            project_stats = {}
            for project in projects:
                status = project.status
                project_stats[status] = project_stats.get(status, 0) + 1

            status_table = Table(box=box.SIMPLE)
            status_table.add_column("Status", style="cyan")
            status_table.add_column("Count", style="yellow")

            for status, count in project_stats.items():
                status_table.add_row(status.title(), str(count))

            console.print(status_table)

        if detailed and issues:
            console.print("\n[bold]Issue Status Breakdown:[/bold]")
            issue_stats = {}
            for issue in issues:
                status = issue.status
                issue_stats[status] = issue_stats.get(status, 0) + 1

            issue_table = Table(box=box.SIMPLE)
            issue_table.add_column("Status", style="cyan")
            issue_table.add_column("Count", style="yellow")

            for status, count in issue_stats.items():
                issue_table.add_row(status.title(), str(count))

            console.print(issue_table)

    except Exception as e:
        console.print(f"[red]Failed to get workspace statistics: {e}[/red]")


async def _show_health_status(session):
    """Show system health status."""
    console.print("[bold blue]System Health Status[/bold blue]\n")

    health_table = Table(box=box.SIMPLE)
    health_table.add_column("Component", style="cyan")
    health_table.add_column("Status", style="white")

    # Database connection
    try:
        await session.execute("SELECT 1")
        db_status = "[green]✓ Connected[/green]"
    except Exception:
        db_status = "[red]✗ Connection failed[/red]"

    health_table.add_row("Database", db_status)

    # Configuration
    try:
        from turbo.utils.config import get_settings
        get_settings()
        config_status = "[green]✓ Valid[/green]"
    except Exception:
        config_status = "[red]✗ Invalid[/red]"

    health_table.add_row("Configuration", config_status)

    # Workspace directory
    from pathlib import Path
    turbo_dir = Path.cwd() / '.turbo'
    workspace_status = "[green]✓ Initialized[/green]" if turbo_dir.exists() else "[yellow]! Not initialized[/yellow]"
    health_table.add_row("Workspace", workspace_status)

    console.print(health_table)


async def _show_recent_activity(project_service, issue_service, document_service):
    """Show recent activity in the workspace."""
    console.print("[bold blue]Recent Activity[/bold blue]\n")

    try:
        # Get recent items (last 7 days)
        cutoff_date = datetime.now() - timedelta(days=7)

        projects = await project_service.get_all_projects()
        issues = await issue_service.get_all_issues()
        documents = await document_service.get_all_documents()

        # Filter recent items
        recent_projects = [p for p in projects if p.created_at >= cutoff_date]
        recent_issues = [i for i in issues if i.created_at >= cutoff_date]
        recent_documents = [d for d in documents if d.created_at >= cutoff_date]

        # Combine and sort by creation date
        activity = []
        for project in recent_projects:
            activity.append(('project', 'Created', project.name, project.created_at))

        for issue in recent_issues:
            activity.append(('issue', 'Created', issue.title, issue.created_at))

        for document in recent_documents:
            activity.append(('document', 'Created', document.title, document.created_at))

        activity.sort(key=lambda x: x[3], reverse=True)

        if activity:
            activity_table = Table(box=box.SIMPLE_HEAD)
            activity_table.add_column("Type", style="cyan")
            activity_table.add_column("Action", style="yellow")
            activity_table.add_column("Item", style="white")
            activity_table.add_column("Date", style="dim")

            for item_type, action, name, date in activity[:10]:  # Show last 10 items
                formatted_date = date.strftime('%Y-%m-%d %H:%M') if hasattr(date, 'strftime') else str(date)
                activity_table.add_row(
                    item_type.title(),
                    action,
                    name[:50] + "..." if len(name) > 50 else name,
                    formatted_date
                )

            console.print(activity_table)
        else:
            console.print("[dim]No recent activity in the last 7 days[/dim]")

    except Exception as e:
        console.print(f"[red]Failed to get recent activity: {e}[/red]")