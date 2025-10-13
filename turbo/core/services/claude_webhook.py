"""Claude webhook service for automatic AI responses to comments."""

import logging
import os
from uuid import UUID

import httpx

logger = logging.getLogger(__name__)


class ClaudeWebhookService:
    """Service for triggering Claude Code responses to user comments.

    This service makes HTTP requests to a webhook server running on the host machine,
    which then calls Claude Code CLI in headless mode to generate responses.
    """

    def __init__(
        self, api_url: str | None = None, webhook_url: str | None = None
    ):
        """Initialize the webhook service.

        Args:
            api_url: Base URL for the Turbo API (defaults to localhost:8001)
            webhook_url: URL of the Claude webhook server on host machine
        """
        self.api_url = api_url or os.getenv(
            "TURBO_API_URL", "http://localhost:8001/api/v1"
        )
        self.webhook_url = webhook_url or os.getenv(
            "CLAUDE_WEBHOOK_URL", "http://host.docker.internal:9000/webhook/comment"
        )
        self.claude_enabled = os.getenv("CLAUDE_AUTO_RESPOND", "true").lower() == "true"

    async def trigger_claude_response(self, issue_id: UUID) -> None:
        """Trigger Claude to analyze an issue and respond with a comment.

        This is called as a background task when a user adds a comment.
        Makes an HTTP request to the webhook server running on the host machine.

        Args:
            issue_id: UUID of the issue to respond to
        """
        if not self.claude_enabled:
            logger.info("Claude auto-response is disabled")
            return

        try:
            logger.info(f"Triggering Claude response for issue {issue_id}")

            # Send webhook request to host machine
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json={"issue_id": str(issue_id)},
                )
                response.raise_for_status()
                result = response.json()

                if result.get("success"):
                    logger.info(
                        f"Claude generated response for issue {issue_id} "
                        f"(cost: ${result.get('cost_usd', 0):.4f})"
                    )
                else:
                    logger.warning(
                        f"Claude webhook failed for issue {issue_id}: {result.get('error')}"
                    )

        except httpx.HTTPError as e:
            logger.error(
                f"Failed to reach Claude webhook server: {e}. "
                f"Make sure webhook server is running on host machine."
            )
        except Exception as e:
            logger.error(f"Error triggering Claude response: {e}", exc_info=True)



# Singleton instance
_webhook_service: ClaudeWebhookService | None = None


def get_webhook_service() -> ClaudeWebhookService:
    """Get or create the webhook service singleton."""
    global _webhook_service
    if _webhook_service is None:
        _webhook_service = ClaudeWebhookService()
    return _webhook_service