# AI Staff Document Review System

## Vision: Your Incredibly Powerful Research Channel

Transform document creation into a **self-organizing knowledge feedback loop** where AI staff automatically review, critique, and synthesize new documentation based on their expertise.

**The Flow:**
```
You research → Write doc → Save to /docs →
Auto-uploaded → Staff notified → Staff review →
Comments posted → Lead staff synthesizes →
You get expert feedback
```

---

## Current State

✅ **What's Already Built:**
- Docs watcher monitors `/docs` folder
- Auto-uploads new/modified documents
- Documents stored in PostgreSQL
- AI staff system with expertise areas
- Comment system on documents

❌ **What's Missing:**
- Webhook trigger when document is created/updated
- Staff notification system for new documents
- Intelligent staff routing based on document topic
- Automated review orchestration
- Lead staff synthesis generation
- "Pass" mechanism for out-of-scope reviews

---

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  YOU: Research Something                                        │
│  "How should we implement the Anthropic theme?"                 │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE: Research & Write                                       │
│  Creates comprehensive document                                 │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  FILE SAVED: /docs/anthropic-theme-implementation.md            │
│  Automatically saved to docs folder                             │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOCS WATCHER: Detects New File                                 │
│  Uploads to database via API                                    │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ WEBHOOK TRIGGERED: NEW DOCUMENT                             │
│  POST /webhook/document/created                                 │
│  {                                                              │
│    "document_id": "uuid",                                       │
│    "title": "Anthropic Theme Implementation",                   │
│    "doc_type": "design",                                        │
│    "content_preview": "This document outlines...",              │
│    "tags": ["design", "frontend", "theme"]                      │
│  }                                                              │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAFF ROUTER: Intelligent Assignment                           │
│                                                                 │
│  Analyzes document:                                             │
│  - Title: "Anthropic Theme Implementation"                      │
│  - Type: "design"                                               │
│  - Tags: ["design", "frontend", "theme"]                        │
│  - Content: Semantic analysis                                   │
│                                                                 │
│  Matches to staff expertise:                                    │
│  ✓ Product Manager (strategic/UX implications)   - 0.85 match  │
│  ✓ Engineering Manager (implementation effort)   - 0.92 match  │
│  ✓ Chief of Staff (alignment with goals)         - 0.78 match  │
│  ✗ Agility Lead (not process-related)            - 0.32 skip   │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ├──────────────┬──────────────┬──────────────┐
                │              │              │              │
                ▼              ▼              ▼              ▼
    ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
    │  Product Mgr   │ │  Eng Manager   │ │ Chief of Staff │
    │  Review        │ │  Review        │ │  Review        │
    └────┬───────────┘ └────┬───────────┘ └────┬───────────┘
         │                  │                  │
         │ Comments         │ Comments         │ Comments
         ▼                  ▼                  ▼
    ┌─────────────────────────────────────────────────────────┐
    │  DOCUMENT COMMENTS                                       │
    │                                                          │
    │  💬 Product Manager:                                    │
    │  "Strong alignment with our design-first approach. The  │
    │  Anthropic aesthetic will differentiate us in the       │
    │  market. Recommendation: Prioritize accessibility and   │
    │  performance metrics to match Anthropic's standards."   │
    │                                                          │
    │  💬 Engineering Manager:                                │
    │  "Implementation plan is solid. 4-week timeline is      │
    │  achievable with current team capacity. Framer Motion   │
    │  will add ~15KB to bundle - acceptable tradeoff.        │
    │  Recommend starting with Phase 1 this sprint."          │
    │                                                          │
    │  💬 Chief of Staff:                                     │
    │  "Strategic opportunity. This positions Turbo as a      │
    │  premium tool worthy of Anthropic's attention. The      │
    │  acquisition angle is creative but execution quality    │
    │  matters most. Suggest parallel workstream for demo    │
    │  video and social strategy."                            │
    └────┬────────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  LEAD STAFF SYNTHESIS                                    │
    │  (Highest-scoring staff member)                          │
    │                                                          │
    │  📝 Engineering Manager - COMPREHENSIVE REVIEW           │
    │                                                          │
    │  **Summary:**                                            │
    │  This document presents a well-researched plan for      │
    │  implementing an Anthropic-inspired theme. The team     │
    │  consensus is positive with actionable feedback.        │
    │                                                          │
    │  **Key Insights:**                                       │
    │  • Design direction aligns with product strategy        │
    │  • Implementation timeline is realistic                 │
    │  • Performance impact is acceptable                     │
    │  • Strategic positioning is innovative                  │
    │                                                          │
    │  **Recommendations:**                                    │
    │  1. Proceed with Phase 1 implementation                 │
    │  2. Build prototype for user testing                    │
    │  3. Develop parallel marketing materials                │
    │  4. Monitor performance metrics closely                 │
    │                                                          │
    │  **Action Items:**                                       │
    │  □ EM: Create sprint tasks for Phase 1                  │
    │  □ PM: Draft user testing plan                          │
    │  □ CoS: Outline social media strategy                   │
    │                                                          │
    │  **Risk Mitigation:**                                    │
    │  - Performance: Profile before/after, lazy load assets  │
    │  - Scope creep: Stick to 4-week timeline                │
    │  - Brand issues: Clear attribution, avoid trademarks    │
    └─────────────────────────────────────────────────────────┘
                │
                ▼
    ┌─────────────────────────────────────────────────────────┐
    │  YOU: Read Expert Feedback                               │
    │  See all staff reviews + comprehensive synthesis        │
    │  Make informed decision with multi-perspective input    │
    └─────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. Document Event Webhook Handler

**File:** `scripts/document_review_webhook.py`

**Purpose:** Receive webhook from docs API when document created/updated

```python
"""
Document Review Webhook Handler

Listens for document creation/update events and orchestrates AI staff reviews.
"""

import asyncio
import logging
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List

app = FastAPI()
logger = logging.getLogger(__name__)

class DocumentEvent(BaseModel):
    """Document creation/update event."""
    event_type: str  # "created" | "updated"
    document_id: str
    title: str
    doc_type: str
    content: str
    tags: List[str] = []
    project_id: str | None = None

@app.post("/webhook/document/created")
async def handle_document_created(
    event: DocumentEvent,
    background_tasks: BackgroundTasks
):
    """Handle new document creation event."""
    logger.info(f"New document created: {event.title} (ID: {event.document_id})")

    # Orchestrate staff reviews in background
    background_tasks.add_task(
        orchestrate_staff_reviews,
        document_id=event.document_id,
        title=event.title,
        doc_type=event.doc_type,
        content=event.content,
        tags=event.tags
    )

    return {"status": "accepted", "message": "Staff reviews queued"}

@app.post("/webhook/document/updated")
async def handle_document_updated(
    event: DocumentEvent,
    background_tasks: BackgroundTasks
):
    """Handle document update event."""
    logger.info(f"Document updated: {event.title} (ID: {event.document_id})")

    # Check if this is a significant update (not just typo fixes)
    if should_trigger_re_review(event):
        background_tasks.add_task(
            orchestrate_staff_reviews,
            document_id=event.document_id,
            title=event.title,
            doc_type=event.doc_type,
            content=event.content,
            tags=event.tags,
            is_update=True
        )

    return {"status": "accepted"}
```

### 2. Staff Router & Matcher

**File:** `turbo/core/services/staff_router.py`

**Purpose:** Intelligently match documents to relevant staff based on expertise

```python
"""
Staff Router Service

Analyzes documents and matches them to relevant AI staff members based on:
- Staff capabilities and expertise
- Document type and tags
- Semantic content analysis
- Historical review quality
"""

import logging
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from turbo.core.models import Staff, Document
from turbo.core.services.knowledge_graph import KnowledgeGraphService

logger = logging.getLogger(__name__)

class StaffRouter:
    """Routes documents to appropriate AI staff for review."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.kg = KnowledgeGraphService()

    async def match_staff_to_document(
        self,
        document_id: str,
        min_relevance: float = 0.5
    ) -> List[Tuple[Staff, float]]:
        """
        Find staff members best suited to review a document.

        Returns:
            List of (Staff, relevance_score) tuples sorted by relevance
        """
        # Get document
        doc = await self.db.get(Document, document_id)
        if not doc:
            return []

        # Get all active staff
        result = await self.db.execute(
            select(Staff).where(Staff.is_active == True)
        )
        all_staff = result.scalars().all()

        # Score each staff member
        staff_scores = []
        for staff in all_staff:
            score = await self._calculate_relevance_score(
                staff=staff,
                doc_type=doc.doc_type,
                title=doc.title,
                content=doc.content,
                tags=doc.tags
            )

            if score >= min_relevance:
                staff_scores.append((staff, score))

        # Sort by relevance (highest first)
        staff_scores.sort(key=lambda x: x[1], reverse=True)

        logger.info(
            f"Matched {len(staff_scores)} staff to document '{doc.title}': "
            f"{[(s.name, round(score, 2)) for s, score in staff_scores]}"
        )

        return staff_scores

    async def _calculate_relevance_score(
        self,
        staff: Staff,
        doc_type: str,
        title: str,
        content: str,
        tags: List[str]
    ) -> float:
        """
        Calculate how relevant this document is to a staff member.

        Scoring factors:
        - Capability match (40%)
        - Semantic similarity (30%)
        - Tag overlap (20%)
        - Historical performance (10%)
        """
        score = 0.0

        # 1. Capability Match (40%)
        capability_score = self._score_capability_match(
            staff_capabilities=staff.capabilities,
            doc_type=doc_type,
            title=title
        )
        score += capability_score * 0.4

        # 2. Semantic Similarity (30%)
        # Use embedding similarity between staff persona and document content
        semantic_score = await self._score_semantic_similarity(
            staff_persona=staff.persona,
            doc_content=content
        )
        score += semantic_score * 0.3

        # 3. Tag Overlap (20%)
        tag_score = self._score_tag_overlap(
            staff_monitoring_tags=staff.monitoring_scope.get("tags", []),
            doc_tags=tags
        )
        score += tag_score * 0.2

        # 4. Historical Performance (10%)
        # If this staff has provided high-quality reviews before, boost score
        history_score = await self._score_historical_performance(staff.id)
        score += history_score * 0.1

        return min(score, 1.0)  # Cap at 1.0

    def _score_capability_match(
        self,
        staff_capabilities: List[str],
        doc_type: str,
        title: str
    ) -> float:
        """Score based on capability overlap with document domain."""
        # Map document types to relevant capabilities
        doc_type_capabilities = {
            "design": ["cross_functional_analysis", "strategic_planning"],
            "specification": ["technical_prioritization", "architecture"],
            "user_guide": ["document_management", "cross_functional_analysis"],
            "api_doc": ["technical_prioritization", "architecture"],
            "adr": ["architecture", "strategic_planning"],
        }

        # Title keyword matching
        title_lower = title.lower()
        title_capabilities = {
            "theme": ["cross_functional_analysis"],
            "implementation": ["technical_prioritization", "resource_allocation"],
            "strategy": ["strategic_planning"],
            "process": ["capacity_planning"],
            "architecture": ["architecture"],
            "api": ["technical_prioritization"],
        }

        # Collect relevant capabilities
        relevant_caps = set()
        relevant_caps.update(doc_type_capabilities.get(doc_type, []))
        for keyword, caps in title_capabilities.items():
            if keyword in title_lower:
                relevant_caps.update(caps)

        # Calculate overlap
        if not relevant_caps:
            return 0.5  # Neutral if no mapping

        overlap = len(set(staff_capabilities) & relevant_caps)
        return overlap / len(relevant_caps)

    async def _score_semantic_similarity(
        self,
        staff_persona: str,
        doc_content: str
    ) -> float:
        """Use embeddings to measure semantic similarity."""
        # Simplified - in production, use actual embedding model
        # For now, keyword matching
        persona_keywords = set(staff_persona.lower().split())
        doc_keywords = set(doc_content[:500].lower().split())  # First 500 chars

        overlap = len(persona_keywords & doc_keywords)
        union = len(persona_keywords | doc_keywords)

        return overlap / union if union > 0 else 0.0

    def _score_tag_overlap(
        self,
        staff_monitoring_tags: List[str],
        doc_tags: List[str]
    ) -> float:
        """Score based on tag overlap."""
        if not staff_monitoring_tags or not doc_tags:
            return 0.5  # Neutral if no tags

        staff_tags_set = set(staff_monitoring_tags)
        doc_tags_set = set(doc_tags)

        overlap = len(staff_tags_set & doc_tags_set)
        return overlap / len(doc_tags_set) if doc_tags_set else 0.0

    async def _score_historical_performance(self, staff_id: str) -> float:
        """
        Score based on historical review quality.

        Metrics:
        - Number of reviews provided
        - Upvotes/reactions on review comments
        - Review completeness
        """
        # Placeholder - implement with actual metrics
        return 0.5
```

### 3. Review Orchestrator

**File:** `turbo/core/services/review_orchestrator.py`

**Purpose:** Coordinate multi-staff document reviews

```python
"""
Review Orchestrator

Coordinates AI staff document reviews:
1. Routes document to relevant staff
2. Requests reviews from each
3. Waits for all responses
4. Identifies lead reviewer
5. Generates synthesis
"""

import asyncio
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.models import Document, Staff, Comment
from turbo.core.services.staff_router import StaffRouter
from turbo.core.services.staff_review_agent import StaffReviewAgent

logger = logging.getLogger(__name__)

class ReviewOrchestrator:
    """Orchestrates multi-staff document reviews."""

    def __init__(self, db: AsyncSession, anthropic_api_key: str):
        self.db = db
        self.router = StaffRouter(db)
        self.review_agent = StaffReviewAgent(anthropic_api_key)

    async def orchestrate_reviews(
        self,
        document_id: str,
        timeout: int = 120  # 2 minutes
    ) -> dict:
        """
        Orchestrate full review cycle for a document.

        Returns:
            {
                "reviews": [...],
                "lead_review": {...},
                "summary": "..."
            }
        """
        logger.info(f"Orchestrating reviews for document {document_id}")

        # 1. Get document
        doc = await self.db.get(Document, document_id)
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        # 2. Match staff to document
        matched_staff = await self.router.match_staff_to_document(document_id)

        if not matched_staff:
            logger.warning(f"No staff matched for document {doc.title}")
            return {"reviews": [], "lead_review": None, "summary": "No reviewers assigned"}

        # 3. Request reviews from all matched staff (in parallel)
        review_tasks = [
            self._request_staff_review(staff, relevance, doc)
            for staff, relevance in matched_staff
        ]

        reviews = await asyncio.gather(*review_tasks, return_exceptions=True)

        # Filter out errors and "pass" responses
        valid_reviews = [
            r for r in reviews
            if not isinstance(r, Exception) and r.get("status") != "pass"
        ]

        logger.info(
            f"Received {len(valid_reviews)} reviews "
            f"({len(reviews) - len(valid_reviews)} passed/failed)"
        )

        # 4. Identify lead reviewer (highest relevance score who didn't pass)
        lead_staff = None
        lead_score = 0.0
        for (staff, score), review in zip(matched_staff, reviews):
            if not isinstance(review, Exception) and review.get("status") != "pass":
                if score > lead_score:
                    lead_staff = staff
                    lead_score = score

        # 5. Request comprehensive synthesis from lead reviewer
        synthesis = None
        if lead_staff and valid_reviews:
            synthesis = await self._request_synthesis(
                lead_staff=lead_staff,
                document=doc,
                all_reviews=valid_reviews
            )

        return {
            "reviews": valid_reviews,
            "lead_staff": lead_staff.name if lead_staff else None,
            "synthesis": synthesis,
            "total_reviewers": len(matched_staff),
            "active_reviewers": len(valid_reviews)
        }

    async def _request_staff_review(
        self,
        staff: Staff,
        relevance: float,
        document: Document
    ) -> dict:
        """Request review from a single staff member."""
        try:
            logger.info(
                f"Requesting review from {staff.name} "
                f"(relevance: {relevance:.2f})"
            )

            review = await self.review_agent.generate_review(
                staff=staff,
                document=document,
                relevance_score=relevance
            )

            # Post as comment if not "pass"
            if review.get("status") != "pass":
                await self._post_review_comment(
                    staff=staff,
                    document=document,
                    review_content=review["content"]
                )

            return review

        except Exception as e:
            logger.error(f"Review failed for {staff.name}: {e}")
            return {"status": "error", "error": str(e)}

    async def _post_review_comment(
        self,
        staff: Staff,
        document: Document,
        review_content: str
    ):
        """Post staff review as a comment on the document."""
        comment = Comment(
            entity_type="document",
            entity_id=document.id,
            content=review_content,
            author_type="ai",
            author_name=staff.name,
            metadata={"review_type": "automated", "staff_id": str(staff.id)}
        )

        self.db.add(comment)
        await self.db.commit()

        logger.info(f"Posted review comment from {staff.name} on document {document.title}")

    async def _request_synthesis(
        self,
        lead_staff: Staff,
        document: Document,
        all_reviews: List[dict]
    ) -> str:
        """Request comprehensive synthesis from lead reviewer."""
        logger.info(f"Requesting synthesis from lead reviewer {lead_staff.name}")

        synthesis = await self.review_agent.generate_synthesis(
            staff=lead_staff,
            document=document,
            reviews=all_reviews
        )

        # Post synthesis as separate comment
        await self._post_review_comment(
            staff=lead_staff,
            document=document,
            review_content=f"## 📝 COMPREHENSIVE REVIEW - Lead Synthesis\n\n{synthesis}"
        )

        return synthesis
```

### 4. Staff Review Agent

**File:** `turbo/core/services/staff_review_agent.py`

**Purpose:** Generate AI-powered reviews using Claude

```python
"""
Staff Review Agent

Uses Claude API to generate contextual document reviews from different
staff perspectives.
"""

import logging
from typing import List
import httpx

from turbo.core.models import Staff, Document

logger = logging.getLogger(__name__)

class StaffReviewAgent:
    """Generates AI-powered staff reviews."""

    def __init__(self, anthropic_api_key: str):
        self.api_key = anthropic_api_key
        self.api_url = "https://api.anthropic.com/v1/messages"

    async def generate_review(
        self,
        staff: Staff,
        document: Document,
        relevance_score: float
    ) -> dict:
        """
        Generate a review from a staff member's perspective.

        Returns:
            {
                "status": "reviewed" | "pass",
                "content": "Review text or 'Pass - not in my purview'"
            }
        """
        # Build review prompt
        prompt = self._build_review_prompt(
            staff=staff,
            document=document,
            relevance_score=relevance_score
        )

        # Call Claude
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.api_url,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-sonnet-4-5-20250929",
                    "max_tokens": 2048,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )

            if response.status_code != 200:
                raise Exception(f"Claude API error: {response.status_code}")

            result = response.json()
            content = result["content"][0]["text"]

            # Check if staff passed on review
            if content.strip().lower().startswith("pass"):
                return {"status": "pass", "content": content}

            return {"status": "reviewed", "content": content}

    def _build_review_prompt(
        self,
        staff: Staff,
        document: Document,
        relevance_score: float
    ) -> str:
        """Build prompt for staff review."""
        return f"""You are {staff.name}, reviewing a new document added to the Turbo knowledge base.

**Your Persona:**
{staff.persona}

**Your Capabilities:**
{", ".join(staff.capabilities)}

**Document to Review:**
Title: {document.title}
Type: {document.doc_type}
Tags: {", ".join([t.name for t in document.tags])}

**Document Content (first 2000 chars):**
{document.content[:2000]}...

**Relevance Score:** {relevance_score:.2f} (how relevant this document is to your expertise)

**Instructions:**
1. If this document is NOT in your purview or you have nothing substantive to add, respond with exactly: "Pass - not in my area of expertise"

2. If this IS relevant to your role, provide a focused review with:
   - **Key Observations** (2-3 points)
   - **Strengths** (what's good about this document)
   - **Concerns/Questions** (if any)
   - **Recommendations** (specific, actionable)

Keep your review concise (3-5 paragraphs). Focus on insights from YOUR perspective as {staff.name}.

Your review:"""

    async def generate_synthesis(
        self,
        staff: Staff,
        document: Document,
        reviews: List[dict]
    ) -> str:
        """Generate comprehensive synthesis from lead reviewer."""
        prompt = f"""You are {staff.name}, and you've been selected as the lead reviewer for this document because of your expertise.

**Document:**
{document.title}

**Reviews from Team:**
{self._format_reviews(reviews)}

**Your Task:**
As lead reviewer, synthesize ALL reviews into a comprehensive summary that includes:

## Summary
Brief overview of the document and team consensus

## Key Insights
Most important observations across all reviews (4-6 bullet points)

## Recommendations
Consolidated, prioritized recommendations (numbered list)

## Action Items
Specific next steps with assigned owners (checkbox list)

## Risk Mitigation
Any risks or concerns raised, with proposed mitigations

Keep it clear, actionable, and executive-friendly. This will be the primary feedback the user sees.

Your synthesis:"""

        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                self.api_url,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-sonnet-4-5-20250929",
                    "max_tokens": 4096,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )

            result = response.json()
            return result["content"][0]["text"]

    def _format_reviews(self, reviews: List[dict]) -> str:
        """Format reviews for synthesis prompt."""
        formatted = []
        for i, review in enumerate(reviews, 1):
            formatted.append(f"**Review {i}:**\n{review['content']}\n")
        return "\n".join(formatted)
```

---

## Implementation Checklist

### Phase 1: Webhook Infrastructure (Week 1)
- [ ] Create `scripts/document_review_webhook.py`
- [ ] Add webhook endpoints to FastAPI
- [ ] Update docs watcher to call webhook on upload
- [ ] Test webhook receives events

### Phase 2: Staff Routing (Week 1-2)
- [ ] Implement `StaffRouter` class
- [ ] Add capability matching logic
- [ ] Add semantic similarity scoring
- [ ] Test routing with sample documents

### Phase 3: Review Generation (Week 2)
- [ ] Implement `StaffReviewAgent`
- [ ] Create review prompt templates
- [ ] Add "pass" detection logic
- [ ] Test review generation

### Phase 4: Orchestration (Week 2-3)
- [ ] Implement `ReviewOrchestrator`
- [ ] Add parallel review requests
- [ ] Implement lead reviewer selection
- [ ] Add synthesis generation

### Phase 5: Integration (Week 3)
- [ ] Connect all components
- [ ] Add database persistence
- [ ] Implement comment posting
- [ ] End-to-end testing

### Phase 6: UI & UX (Week 3-4)
- [ ] Document page shows review comments
- [ ] Lead synthesis highlighted
- [ ] Review status indicators
- [ ] Filter by reviewer

### Phase 7: Polish (Week 4)
- [ ] Error handling and retries
- [ ] Performance optimization
- [ ] Logging and monitoring
- [ ] Documentation

---

## Usage Examples

### Example 1: Design Document

**You create:** `/docs/anthropic-theme-implementation.md`

**System routes to:**
- Product Manager (0.85) - Strategic/UX implications
- Engineering Manager (0.92) - Implementation effort
- Chief of Staff (0.78) - Strategic alignment

**Reviews:**
1. **Product Manager**: "Strong market differentiation. Recommend A/B testing..."
2. **Engineering Manager**: "Timeline achievable. Performance acceptable. Proceed with Phase 1..."
3. **Chief of Staff**: "Strategic opportunity. Build parallel marketing stream..."

**Lead Synthesis (Eng Manager):**
Comprehensive plan combining all feedback with action items.

### Example 2: Technical Spec

**You create:** `/docs/neo4j-query-auditing-guide.md`

**System routes to:**
- Engineering Manager (0.95) - Technical implementation
- Agility Lead (0.42) - Pass (not process-related)

**Reviews:**
1. **Engineering Manager**: "Comprehensive approach. Option 1 is fastest. Recommend..."

**Lead Synthesis:**
Single reviewer, so their review serves as synthesis.

### Example 3: Process Documentation

**You create:** `/docs/sprint-planning-process.md`

**System routes to:**
- Agility Lead (0.98) - Process expertise
- Product Manager (0.82) - Planning involvement
- Engineering Manager (0.75) - Team execution

**All provide substantive feedback, synthesis generated.**

---

## Benefits

### 1. Incredibly Powerful Research Channel
- You ask → Claude researches → Document created
- Staff automatically review from multiple angles
- Expert synthesis without manual coordination
- Institutional knowledge captured

### 2. Multi-Perspective Feedback
- Engineering feasibility
- Strategic alignment
- Market positioning
- Resource planning
- Process implications

### 3. Self-Organizing Knowledge
- Relevant staff auto-selected
- Irrelevant staff auto-pass
- Lead reviewer auto-identified
- Quality synthesis auto-generated

### 4. Scales Indefinitely
- Add new staff → They join review pool
- Add new doc types → Routing adapts
- Add new capabilities → Matching improves

### 5. Permanent Audit Trail
- All reviews saved as comments
- Searchable by staff/topic
- Historical decision context
- Learning from past reviews

---

## Advanced Features (Future)

### 1. Review Quality Scoring
Track which staff provide highest-value reviews to improve routing.

### 2. User Voting
Let users upvote/downvote reviews to train the system.

### 3. Review Templates
Pre-defined review frameworks for different document types.

### 4. Collaborative Reviews
Staff can respond to each other's reviews (threaded discussions).

### 5. Review Summarization for User
Weekly digest: "This week your staff reviewed 5 documents..."

### 6. Auto-Issue Creation
If reviews identify action items, auto-create issues.

### 7. Review Notifications
Slack/email when your document has been reviewed.

---

## Conclusion

This creates a **self-organizing research and feedback loop** where:
1. You ask a question
2. Claude researches and writes
3. Document saved to `/docs`
4. AI staff auto-review based on expertise
5. Lead staff synthesizes all feedback
6. You get comprehensive, multi-angle expert input

**Result:** Every research question becomes a knowledge artifact with built-in expert validation.

This is how you build institutional intelligence at scale. 🚀
