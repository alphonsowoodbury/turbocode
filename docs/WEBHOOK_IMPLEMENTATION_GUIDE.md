# Webhook System Implementation Guide

## Quick Start

This guide shows how to implement the webhook system in Turbo Code step by step.

---

## Architecture Overview

```
Service Layer          →    Webhook Dispatcher    →    Webhook Delivery
(create_issue)              (emit event)               (HTTP POST to subscribers)
```

---

## Step 1: Create Webhook Infrastructure

### 1.1 Webhook Event Schema

**File**: `turbo/core/schemas/webhook.py`

```python
"""Webhook event schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class WebhookActor(BaseModel):
    """Actor who triggered the webhook event."""

    type: Literal["user", "ai", "system"]
    name: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class WebhookContext(BaseModel):
    """Contextual information for the webhook event."""

    project_id: UUID | None = None
    milestone_id: UUID | None = None
    initiative_id: UUID | None = None
    issue_id: UUID | None = None


class WebhookEventData(BaseModel):
    """Data payload for webhook event."""

    current: dict[str, Any]
    previous: dict[str, Any] | None = None
    changes: list[str] = Field(default_factory=list)


class WebhookEvent(BaseModel):
    """Complete webhook event structure."""

    event_id: UUID
    event_type: str  # e.g., "issue.created"
    timestamp: datetime
    entity_type: str  # e.g., "issue"
    entity_id: UUID
    action: str  # e.g., "created"
    actor: WebhookActor
    data: WebhookEventData
    context: WebhookContext


class WebhookSubscription(BaseModel):
    """Webhook subscription configuration."""

    id: UUID
    name: str
    url: str
    event_types: list[str]  # e.g., ["issue.created", "issue.updated"]
    active: bool = True
    secret_token: str | None = None
    filters: dict[str, Any] = Field(default_factory=dict)


class WebhookDelivery(BaseModel):
    """Record of webhook delivery attempt."""

    id: UUID
    subscription_id: UUID
    event_id: UUID
    event_type: str
    payload: dict[str, Any]
    status: Literal["pending", "success", "failed"]
    response_code: int | None = None
    response_body: str | None = None
    error_message: str | None = None
    attempts: int = 0
    created_at: datetime
    delivered_at: datetime | None = None
```

### 1.2 Webhook Dispatcher Service

**File**: `turbo/core/services/webhook_dispatcher.py`

```python
"""Central webhook event dispatcher."""

import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.schemas.webhook import (
    WebhookActor,
    WebhookContext,
    WebhookEvent,
    WebhookEventData,
)

logger = logging.getLogger(__name__)


class WebhookDispatcher:
    """Dispatches webhook events to registered subscribers."""

    def __init__(self, session: AsyncSession):
        self._session = session
        self._timeout = 30.0  # seconds
        self._retry_count = 3
        self._retry_delay = 5  # seconds

    async def emit(
        self,
        event_type: str,
        entity_type: str,
        entity_id: UUID,
        data: dict[str, Any],
        context: dict[str, Any] | None = None,
        actor: dict[str, Any] | None = None,
    ) -> WebhookEvent:
        """
        Emit a webhook event to all subscribers.

        Args:
            event_type: Type of event (e.g., "issue.created")
            entity_type: Type of entity (e.g., "issue")
            entity_id: UUID of the entity
            data: Event data with 'current' and optionally 'previous' and 'changes'
            context: Contextual information (project_id, etc.)
            actor: Actor who triggered the event

        Returns:
            WebhookEvent object
        """
        # Build webhook event
        event = WebhookEvent(
            event_id=uuid4(),
            event_type=event_type,
            timestamp=datetime.utcnow(),
            entity_type=entity_type,
            entity_id=entity_id,
            action=event_type.split(".")[-1],  # Extract action from event_type
            actor=WebhookActor(**actor) if actor else self._default_actor(),
            data=WebhookEventData(**data),
            context=WebhookContext(**context) if context else WebhookContext(),
        )

        # Get matching subscriptions
        subscriptions = await self._get_subscriptions(event_type)

        # Dispatch to each subscriber (background task)
        for subscription in subscriptions:
            await self._deliver_webhook(event, subscription)

        logger.info(
            f"Emitted webhook event {event.event_type} for {entity_type}:{entity_id} "
            f"to {len(subscriptions)} subscribers"
        )

        return event

    async def _get_subscriptions(self, event_type: str) -> list:
        """Get active subscriptions that match the event type."""
        # TODO: Query webhook_subscriptions table
        # For now, return empty list (will be populated after DB migration)
        return []

    async def _deliver_webhook(self, event: WebhookEvent, subscription: Any) -> None:
        """Deliver webhook event to a subscriber."""
        try:
            payload = event.model_dump(mode="json")
            headers = {
                "Content-Type": "application/json",
                "X-Turbo-Event": event.event_type,
                "X-Turbo-Event-ID": str(event.event_id),
                "X-Turbo-Timestamp": event.timestamp.isoformat(),
            }

            # Add signature if secret token is configured
            if subscription.secret_token:
                signature = self._generate_signature(
                    payload, subscription.secret_token
                )
                headers["X-Turbo-Signature"] = signature

            # Send webhook
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    subscription.url,
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()

            logger.info(
                f"Webhook delivered to {subscription.name}: "
                f"{event.event_type} [{response.status_code}]"
            )

        except httpx.HTTPError as e:
            logger.error(
                f"Failed to deliver webhook to {subscription.name}: {e}",
                exc_info=True,
            )
            # TODO: Record failed delivery for retry

        except Exception as e:
            logger.error(
                f"Unexpected error delivering webhook to {subscription.name}: {e}",
                exc_info=True,
            )

    def _generate_signature(self, payload: dict, secret: str) -> str:
        """Generate HMAC signature for webhook payload."""
        payload_bytes = json.dumps(payload, sort_keys=True).encode()
        signature = hmac.new(
            secret.encode(),
            payload_bytes,
            hashlib.sha256,
        ).hexdigest()
        return f"sha256={signature}"

    def _default_actor(self) -> WebhookActor:
        """Create default system actor."""
        return WebhookActor(
            type="system",
            name="turbo-system",
            metadata={},
        )


# Singleton instance
_dispatcher: WebhookDispatcher | None = None


async def get_webhook_dispatcher(session: AsyncSession) -> WebhookDispatcher:
    """Get or create webhook dispatcher."""
    return WebhookDispatcher(session)
```

---

## Step 2: Add Webhook Triggers to Services

### 2.1 Example: Issue Service

**File**: `turbo/core/services/issue.py`

```python
from turbo.core.services.webhook_dispatcher import get_webhook_dispatcher

class IssueService:
    """Service for issue business logic."""

    async def create_issue(self, issue_data: IssueCreate) -> IssueResponse:
        """Create a new issue with webhook emission."""
        # ... existing creation logic ...
        issue = await self._issue_repository.create(issue_data)

        # Emit webhook event
        dispatcher = await get_webhook_dispatcher(self._issue_repository._session)
        await dispatcher.emit(
            event_type="issue.created",
            entity_type="issue",
            entity_id=issue.id,
            data={
                "current": {
                    "title": issue.title,
                    "type": issue.type,
                    "status": issue.status,
                    "priority": issue.priority,
                    "project_id": str(issue.project_id) if issue.project_id else None,
                }
            },
            context={"project_id": issue.project_id} if issue.project_id else {},
            actor={"type": "user", "name": issue.created_by or "unknown"},
        )

        return IssueResponse.model_validate(issue)

    async def update_issue(
        self, issue_id: UUID, update_data: IssueUpdate
    ) -> IssueResponse:
        """Update an issue with webhook emission."""
        # Get current state before update
        current_issue = await self._issue_repository.get_by_id(issue_id)
        if not current_issue:
            raise IssueNotFoundError(issue_id)

        previous_state = {
            "status": current_issue.status,
            "priority": current_issue.priority,
            "assignee": current_issue.assignee,
        }

        # Perform update
        issue = await self._issue_repository.update(issue_id, update_data)

        # Determine what changed
        changes = []
        if update_data.status and update_data.status != previous_state["status"]:
            changes.append("status")
        if update_data.priority and update_data.priority != previous_state["priority"]:
            changes.append("priority")
        if update_data.assignee is not None and update_data.assignee != previous_state["assignee"]:
            changes.append("assignee")

        # Emit webhook event
        dispatcher = await get_webhook_dispatcher(self._issue_repository._session)

        # General update event
        await dispatcher.emit(
            event_type="issue.updated",
            entity_type="issue",
            entity_id=issue.id,
            data={
                "current": {
                    "status": issue.status,
                    "priority": issue.priority,
                    "assignee": issue.assignee,
                },
                "previous": previous_state,
                "changes": changes,
            },
            context={"project_id": issue.project_id} if issue.project_id else {},
        )

        # Emit specific events for important changes
        if "status" in changes:
            await dispatcher.emit(
                event_type="issue.status_changed",
                entity_type="issue",
                entity_id=issue.id,
                data={
                    "current": {"status": issue.status},
                    "previous": {"status": previous_state["status"]},
                },
                context={"project_id": issue.project_id} if issue.project_id else {},
            )

        if "assignee" in changes and update_data.assignee:
            await dispatcher.emit(
                event_type="issue.assigned",
                entity_type="issue",
                entity_id=issue.id,
                data={
                    "current": {"assignee": issue.assignee},
                    "previous": {"assignee": previous_state["assignee"]},
                },
                context={"project_id": issue.project_id} if issue.project_id else {},
            )

        return IssueResponse.model_validate(issue)
```

### 2.2 Using Decorators for Automatic Webhook Emission

**File**: `turbo/core/decorators/webhook.py`

```python
"""Decorators for automatic webhook emission."""

from functools import wraps
from typing import Callable

from turbo.core.services.webhook_dispatcher import get_webhook_dispatcher


def emit_webhook(event_type: str, entity_type: str):
    """
    Decorator that automatically emits webhook events.

    Usage:
        @emit_webhook("issue.created", "issue")
        async def create_issue(self, issue_data: IssueCreate) -> IssueResponse:
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute the function
            result = await func(*args, **kwargs)

            # Emit webhook (assumes result has 'id' attribute)
            if hasattr(result, 'id'):
                # Get session from first arg (self is service with _repository)
                service = args[0]
                session = service._issue_repository._session  # Adjust based on service

                dispatcher = await get_webhook_dispatcher(session)
                await dispatcher.emit(
                    event_type=event_type,
                    entity_type=entity_type,
                    entity_id=result.id,
                    data={"current": result.model_dump()},
                )

            return result
        return wrapper
    return decorator
```

---

## Step 3: Create Database Models

### 3.1 Webhook Subscription Model

**File**: `turbo/core/models/webhook_subscription.py`

```python
"""Webhook subscription model."""

from sqlalchemy import Boolean, Column, String, ARRAY
from sqlalchemy.dialects.postgresql import JSONB

from turbo.core.database.base import Base


class WebhookSubscription(Base):
    """Webhook subscription model."""

    __tablename__ = "webhook_subscriptions"

    name = Column(String(100), nullable=False)
    url = Column(String, nullable=False)
    event_types = Column(ARRAY(String), nullable=False)
    active = Column(Boolean, default=True, index=True)
    secret_token = Column(String(255), nullable=True)
    filters = Column(JSONB, nullable=True)

    def __repr__(self) -> str:
        return f"<WebhookSubscription(id={self.id}, name='{self.name}')>"
```

### 3.2 Alembic Migration

**File**: `migrations/versions/xxx_add_webhook_tables.py`

```python
"""Add webhook tables.

Revision ID: xxx
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'xxx'
down_revision = 'yyy'
branch_labels = None
depends_on = None


def upgrade():
    # Create webhook_subscriptions table
    op.create_table(
        'webhook_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('url', sa.String, nullable=False),
        sa.Column('event_types', postgresql.ARRAY(sa.String), nullable=False),
        sa.Column('active', sa.Boolean, default=True, index=True),
        sa.Column('secret_token', sa.String(255), nullable=True),
        sa.Column('filters', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create webhook_deliveries table
    op.create_table(
        'webhook_deliveries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('webhook_subscriptions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('payload', postgresql.JSONB, nullable=False),
        sa.Column('status', sa.String(20), nullable=False, index=True),
        sa.Column('response_code', sa.Integer, nullable=True),
        sa.Column('response_body', sa.Text, nullable=True),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('attempts', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table('webhook_deliveries')
    op.drop_table('webhook_subscriptions')
```

---

## Step 4: API Endpoints for Webhook Management

### 4.1 Webhook Endpoints

**File**: `turbo/api/v1/endpoints/webhooks.py`

```python
"""Webhook management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.database.connection import get_db_session
from turbo.core.models.webhook_subscription import WebhookSubscription
from turbo.core.schemas.webhook import WebhookSubscription as WebhookSubscriptionSchema
from sqlalchemy import select

router = APIRouter()


@router.post("/", response_model=WebhookSubscriptionSchema, status_code=status.HTTP_201_CREATED)
async def create_webhook_subscription(
    subscription_data: WebhookSubscriptionSchema,
    db: AsyncSession = Depends(get_db_session),
) -> WebhookSubscriptionSchema:
    """Create a new webhook subscription."""
    subscription = WebhookSubscription(
        name=subscription_data.name,
        url=subscription_data.url,
        event_types=subscription_data.event_types,
        active=subscription_data.active,
        secret_token=subscription_data.secret_token,
        filters=subscription_data.filters,
    )
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return WebhookSubscriptionSchema.model_validate(subscription)


@router.get("/", response_model=list[WebhookSubscriptionSchema])
async def list_webhook_subscriptions(
    db: AsyncSession = Depends(get_db_session),
) -> list[WebhookSubscriptionSchema]:
    """List all webhook subscriptions."""
    result = await db.execute(select(WebhookSubscription).order_by(WebhookSubscription.created_at.desc()))
    subscriptions = result.scalars().all()
    return [WebhookSubscriptionSchema.model_validate(sub) for sub in subscriptions]


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook_subscription(
    subscription_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a webhook subscription."""
    result = await db.execute(
        select(WebhookSubscription).where(WebhookSubscription.id == subscription_id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Webhook subscription {subscription_id} not found",
        )

    await db.delete(subscription)
    await db.commit()
```

---

## Step 5: Testing Webhooks

### 5.1 Test Webhook Server

**File**: `scripts/test_webhook_receiver.py`

```python
#!/usr/bin/env python3
"""Test webhook receiver for development."""

import json
from aiohttp import web


async def handle_webhook(request: web.Request) -> web.Response:
    """Receive and log webhook events."""
    data = await request.json()

    print("\n" + "=" * 60)
    print(f"Received webhook: {data.get('event_type')}")
    print("=" * 60)
    print(json.dumps(data, indent=2))
    print("=" * 60 + "\n")

    return web.json_response({"status": "ok"})


def main():
    app = web.Application()
    app.router.add_post("/webhook", handle_webhook)

    print("Test webhook receiver starting on http://localhost:9001/webhook")
    web.run_app(app, host="0.0.0.0", port=9001)


if __name__ == "__main__":
    main()
```

### 5.2 Manual Testing

```bash
# Terminal 1: Start test webhook receiver
python scripts/test_webhook_receiver.py

# Terminal 2: Create webhook subscription
curl -X POST http://localhost:8001/api/v1/webhooks/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "http://localhost:9001/webhook",
    "event_types": ["issue.created", "issue.updated"],
    "active": true
  }'

# Terminal 3: Create an issue (triggers webhook)
turbo issues create \
  --title "Test Issue" \
  --description "Testing webhooks" \
  --project-id <your-project-id> \
  --type task \
  --priority medium
```

---

## Step 6: Frontend Integration

### 6.1 Webhook Settings Page

**File**: `frontend/app/settings/webhooks/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const EVENT_TYPES = [
  "issue.created",
  "issue.updated",
  "issue.assigned",
  "project.created",
  "milestone.completed",
  "comment.created",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    event_types: [],
  });

  const handleCreateWebhook = async () => {
    const response = await fetch("http://localhost:8001/api/v1/webhooks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWebhook),
    });

    if (response.ok) {
      const webhook = await response.json();
      setWebhooks([...webhooks, webhook]);
      setNewWebhook({ name: "", url: "", event_types: [] });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Webhook Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              placeholder="My Webhook"
            />
          </div>

          <div>
            <Label>URL</Label>
            <Input
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </div>

          <div>
            <Label>Event Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EVENT_TYPES.map((event) => (
                <Badge
                  key={event}
                  variant={newWebhook.event_types.includes(event) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (newWebhook.event_types.includes(event)) {
                      setNewWebhook({
                        ...newWebhook,
                        event_types: newWebhook.event_types.filter((e) => e !== event),
                      });
                    } else {
                      setNewWebhook({
                        ...newWebhook,
                        event_types: [...newWebhook.event_types, event],
                      });
                    }
                  }}
                >
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleCreateWebhook}>Create Webhook</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <p className="text-muted-foreground">No webhooks configured</p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{webhook.name}</h3>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      <div className="flex gap-1 mt-2">
                        {webhook.event_types.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Quick Win: Implement Top 3 Webhooks Today

### 1. Issue Created (30 minutes)
- Add dispatcher call to `issue.py:create_issue()`
- Test with existing Claude webhook server

### 2. Issue Status Changed (20 minutes)
- Add to `issue.py:update_issue()`
- Emit specific event when status changes

### 3. Project Created (15 minutes)
- Add to `project.py:create_project()`
- Easy win for testing

Total time: ~1 hour to have 3 working webhooks!

---

## Debugging Tips

### Check Webhook Deliveries
```sql
SELECT * FROM webhook_deliveries
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Test Webhook Manually
```bash
curl -X POST http://localhost:9000/webhook/comment \
  -H "Content-Type: application/json" \
  -d '{"issue_id": "your-issue-uuid"}'
```

### View Webhook Logs
```bash
# API logs
docker-compose logs -f turbo-api | grep webhook

# Webhook server logs
# (running in foreground, see terminal output)
```

---

## Next Steps

1. **Immediate**: Implement top 3 webhooks
2. **This Week**: Add webhook management UI
3. **Next Week**: Build Slack/Discord integrations
4. **Month 1**: Complete all core entity webhooks
5. **Month 2**: Add advanced features (retry logic, analytics)

## Questions?

See `docs/WEBHOOK_SYSTEM_DESIGN.md` for comprehensive reference.
