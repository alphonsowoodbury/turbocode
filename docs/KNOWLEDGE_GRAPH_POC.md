# Knowledge Graph POC Implementation

## Overview

This document outlines the Proof of Concept (POC) implementation of the Knowledge Graph feature for Turbo using Graphiti and Neo4j.

## What Was Implemented

### 1. Infrastructure

**Neo4j Graph Database**
- Added Neo4j 5 Community Edition to `docker-compose.yml`
- Configured with APOC plugin for advanced graph operations
- Set up health checks and automatic restart
- Configured memory settings (512MB heap initial, 2GB max)
- Exposed ports:
  - 7474: HTTP web interface
  - 7687: Bolt protocol for database connections

**Docker Volumes**
- `turbo-neo4j-data`: Persistent graph data storage
- `turbo-neo4j-logs`: Neo4j server logs
- `turbo-neo4j-import`: Import directory for bulk data
- `turbo-neo4j-plugins`: Plugin storage (APOC)

### 2. Python Dependencies

Added the following packages to `pyproject.toml`:

```python
"graphiti-core>=0.3.0",  # Knowledge graph framework
"neo4j>=5.14.0",         # Neo4j Python driver
"openai>=1.3.0",         # Required by Graphiti for embeddings
```

### 3. Configuration

**GraphSettings** (in `turbo/utils/config.py`)
- `uri`: Neo4j connection URI (default: `bolt://localhost:7687`)
- `user`: Neo4j username (default: `neo4j`)
- `password`: Neo4j password (default: `turbo_graph_password`)
- `database`: Neo4j database name (default: `neo4j`)
- `openai_api_key`: OpenAI API key for embeddings
- `enabled`: Feature flag to enable/disable graph (default: `True`)

Environment variables use `NEO4J_` prefix:
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `NEO4J_OPENAI_API_KEY`

### 4. Data Models

**Graph Schemas** (`turbo/core/schemas/graph.py`)

```python
GraphNodeCreate       # Create a new node in the graph
GraphSearchQuery      # Search query parameters
GraphSearchResult     # Individual search result
GraphSearchResponse   # Complete search response with metadata
GraphStats           # Graph statistics
```

### 5. Services

**GraphService** (`turbo/core/services/graph.py`)

Key methods:
- `health_check()`: Verify Neo4j connection
- `add_episode(node_data)`: Add an entity to the graph
- `search(query)`: Semantic search across the graph
- `get_related_entities(entity_id, entity_type)`: Find related nodes
- `get_statistics()`: Get graph metrics
- `close()`: Clean up connections

### 6. Ingestion Pipeline

**Script**: `scripts/ingest_issues_to_graph.py`

Features:
- Fetches all issues from the database
- Indexes them in the knowledge graph with full context
- Shows progress bar during ingestion
- Reports success/error counts
- Displays graph statistics after completion

## How to Use

### Starting Neo4j

```bash
# Start just Neo4j
docker-compose up -d neo4j

# Or start entire stack
docker-compose up -d
```

Check Neo4j status:
```bash
docker logs turbo-neo4j
```

Access Neo4j Browser:
- URL: http://localhost:7474
- Username: `neo4j`
- Password: `turbo_graph_password`

### Setting Up OpenAI API Key

Graphiti requires OpenAI for generating embeddings. Set your API key:

```bash
# Option 1: Environment variable
export OPENAI_API_KEY="sk-..."

# Option 2: In .env file
echo "NEO4J_OPENAI_API_KEY=sk-..." >> .env
```

### Ingesting Issues

```bash
# From project root
python scripts/ingest_issues_to_graph.py
```

Expected output:
```
Starting issue ingestion to knowledge graph...

Testing Neo4j connection...
✓ Neo4j connection successful

Fetching issues from database...
✓ Found 65 issues

Ingesting 65 issues... ████████████████████ 100%

Ingestion complete!
  ✓ Successfully ingested: 65 issues

Knowledge Graph Statistics:
  Total nodes: 65
  Total edges: 0
  Entities by type:
    - issue: 65

✓ Done!
```

### Using the Graph Service

**Example: Search for related issues**

```python
from turbo.core.services.graph import GraphService
from turbo.core.schemas.graph import GraphSearchQuery

# Initialize service
graph_service = GraphService()

# Search for authentication-related issues
query = GraphSearchQuery(
    query="authentication and user login",
    limit=10,
    entity_types=["issue"],
    min_relevance=0.7
)

results = await graph_service.search(query)

# Results contain:
# - results: List of matching issues
# - total_results: Count of matches
# - execution_time_ms: Search latency
# - query: Original query text

await graph_service.close()
```

**Example: Add a new issue to the graph**

```python
from turbo.core.services.graph import GraphService
from turbo.core.schemas.graph import GraphNodeCreate
from uuid import UUID

graph_service = GraphService()

# Create node data
node_data = GraphNodeCreate(
    entity_id=UUID("..."),
    entity_type="issue",
    content="Implement OAuth2 authentication for API endpoints...",
    metadata={
        "title": "OAuth2 Authentication",
        "type": "feature",
        "status": "open",
        "priority": "high"
    }
)

# Add to graph
result = await graph_service.add_episode(node_data)

await graph_service.close()
```

**Example: Get statistics**

```python
from turbo.core.services.graph import GraphService

graph_service = GraphService()
stats = await graph_service.get_statistics()

print(f"Nodes: {stats.total_nodes}")
print(f"Edges: {stats.total_edges}")
print(f"By type: {stats.entities_by_type}")

await graph_service.close()
```

## Architecture

```
┌─────────────────┐
│   Turbo API     │
│   (FastAPI)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GraphService   │
│  (Business      │
│   Logic)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Graphiti      │
│   (Framework)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Neo4j       │
│  (Graph DB)     │
└─────────────────┘
```

## Data Flow

1. **Ingestion**:
   ```
   Issue (PostgreSQL) → GraphService → Graphiti → Neo4j
   ```

2. **Search**:
   ```
   Search Query → GraphService → Graphiti → Neo4j
   ↓
   Vector Similarity Search (OpenAI Embeddings)
   ↓
   Ranked Results
   ```

3. **Relationships**:
   ```
   Entity → GraphService → Neo4j Cypher Query → Related Entities
   ```

## POC Success Criteria

Based on the original knowledge graph research:

✅ **Technology Selection**: Graphiti + Neo4j implemented
✅ **Integration**: Successfully integrated with Turbo's architecture
✅ **Data Ingestion**: Pipeline created for indexing issues
✅ **Infrastructure**: Docker-based deployment ready
✅ **Configuration**: Flexible settings with environment variables

**Pending (Next Steps)**:
- [ ] Test semantic search with 20+ issues
- [ ] Measure search latency (target: <500ms)
- [ ] Evaluate search relevance (target: 80%+ relevant results)
- [ ] Create API endpoints for graph operations
- [ ] Add frontend integration for semantic search

## Next Steps for Production

### 1. API Endpoints
Create REST endpoints in `turbo/api/v1/endpoints/graph.py`:
- `POST /api/v1/graph/search` - Semantic search
- `POST /api/v1/graph/index` - Index new entity
- `GET /api/v1/graph/stats` - Get statistics
- `GET /api/v1/graph/related/{entity_id}` - Get related entities

### 2. Automatic Indexing
Add graph indexing to issue creation/update flows:
```python
# In IssueService.create_issue()
await graph_service.add_episode(GraphNodeCreate(...))
```

### 3. Frontend Integration
- Add semantic search widget to UI
- Display "Related Issues" sidebar
- Show graph visualization for issue relationships

### 4. Advanced Features
- Support for projects, milestones, and other entities
- Relationship inference between entities
- Time-based context (temporal knowledge graph)
- Multi-hop relationship queries
- Graph-based recommendations

### 5. Performance Optimization
- Connection pooling for Neo4j
- Caching frequently accessed graph data
- Batch indexing operations
- Async graph updates

### 6. Monitoring
- Track search query performance
- Monitor graph size growth
- Alert on connection failures
- Index update success rates

## Troubleshooting

### Neo4j Won't Start

Check logs:
```bash
docker logs turbo-neo4j
```

Common issues:
- Ports 7474/7687 already in use
- Insufficient memory
- Volume permission issues

### Connection Errors

Verify connection:
```bash
docker exec turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "RETURN 1"
```

### OpenAI API Key Issues

Test key:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Ingestion Fails

Check:
1. Neo4j is running: `docker ps | grep neo4j`
2. Database connection works: `turbo config show`
3. OpenAI key is set: `echo $OPENAI_API_KEY`
4. Issues exist: `turbo issues list`

## Resources

- **Neo4j Browser**: http://localhost:7474
- **Graphiti Docs**: https://github.com/getzep/graphiti-core
- **Neo4j Docs**: https://neo4j.com/docs/
- **Knowledge Graph Research**: See issues in "Knowledge Graph for AI Context" initiative

## Cost Considerations

**OpenAI Embeddings**:
- Graphiti uses OpenAI embeddings for semantic search
- Cost: ~$0.0001 per 1K tokens
- Estimated cost for 1000 issues: ~$0.50-$2.00 (one-time indexing)
- Ongoing: Cost per search query is minimal

**Neo4j**:
- Community Edition is free
- No licensing costs
- Self-hosted (Docker container)

**Alternatives to OpenAI**:
- Future: Consider local embedding models (Sentence Transformers)
- Would reduce costs but requires more compute resources