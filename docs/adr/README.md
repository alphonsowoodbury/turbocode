---
doc_type: adr
project_name: Turbo Code Platform
title: Architecture Decision Records (ADRs)
version: '1.0'
tags: architecture
---

# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Turbo Code project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: What is the issue that we're seeing that is motivating this decision?
- **Decision**: What is the change that we're proposing and/or doing?
- **Consequences**: What becomes easier or more difficult to do because of this change?

## Index of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-mcp-integration.md) | Model Context Protocol Integration | Accepted | 2024-10-15 |
| [002](002-staff-mention-architecture.md) | Staff Mention System Architecture | Accepted | 2024-10-18 |
| [003](003-context-prefetch-vs-mcp-connector.md) | Context Pre-fetching vs MCP Connector for AI Staff Responses | Accepted | 2025-10-19 |

## How to Create a New ADR

1. Copy the template below or use an existing ADR as a reference
2. Number it sequentially (next available number)
3. Use kebab-case for the filename: `XXX-title-of-decision.md`
4. Update this README with the new entry
5. Submit for review

## ADR Template

```markdown
# ADR XXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

What is the issue we're facing? What factors are driving this decision?

## Decision

What are we going to do? Why this approach?

## Alternatives Considered

What other options did we consider?

### Option 1: [Name]

**Advantages:**
- Point 1
- Point 2

**Disadvantages:**
- Point 1
- Point 2

### Option 2: [Name]

...

## Consequences

### Positive

What becomes easier?

### Negative

What becomes more difficult?

### Neutral

What else changes?

## References

- Links to relevant documentation
- Related issues/PRs
```

## Related Resources

- [Michael Nygard's ADR Format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
