# Neo4j Query Auditing & Monitoring Guide

## Overview

This guide shows how to monitor and audit all Neo4j graph database queries executed by the Turbo API and AI agents. By default, Neo4j does not log queries, leaving you without visibility into what operations are being performed on your knowledge graph.

## Problem Statement

Currently, when the API or AI agents interact with Neo4j:
- ❌ No query logs exist (query.log is empty)
- ❌ No audit trail of what was executed
- ❌ No attribution (which AI agent ran which query)
- ❌ No performance metrics
- ❌ No debugging capability

## Solution Overview

This guide provides 4 approaches to enable comprehensive query auditing:

1. **Server-Side Query Logging** - Enable Neo4j's built-in query logging
2. **Application-Level Logging** - Add Python logging to KnowledgeGraphService
3. **Database Audit Table** - Store query history in PostgreSQL
4. **Real-Time Monitoring** - View current Neo4j activity

---

## Option 1: Server-Side Query Logging (Recommended)

Enable Neo4j's built-in query logging to capture all queries at the database level.

### Implementation

**File:** `/Users/alphonso/Documents/Code/PycharmProjects/turboCode/docker-compose.yml`

```yaml
# Neo4j Graph Database (for Knowledge Graph)
neo4j:
  image: neo4j:5-community
  container_name: turbo-neo4j
  environment:
    - NEO4J_AUTH=neo4j/turbo_graph_password
    - NEO4J_PLUGINS=["apoc"]
    - NEO4J_dbms_security_procedures_unrestricted=apoc.*
    - NEO4J_dbms_memory_heap_initial__size=512m
    - NEO4J_dbms_memory_heap_max__size=2G
    - NEO4J_dbms_memory_pagecache_size=512m

    # ===== QUERY LOGGING CONFIGURATION =====
    # Enable query logging
    - NEO4J_dbms_logs_query_enabled=INFO

    # Log ALL queries (0ms threshold = everything)
    - NEO4J_dbms_logs_query_threshold=0

    # Include query parameters in logs
    - NEO4J_dbms_logs_query_parameter_logging_enabled=true

    # Include execution time
    - NEO4J_dbms_logs_query_time_logging_enabled=true

    # Include page cache details
    - NEO4J_dbms_logs_query_page_logging_enabled=true

    # Include memory allocation info
    - NEO4J_dbms_logs_query_allocation_logging_enabled=true

    # Most verbose logging
    - NEO4J_server_logs_query_enabled=VERBOSE
```

### Apply Changes

```bash
# Restart Neo4j to apply configuration
docker restart turbo-neo4j

# Or rebuild and restart entire stack
docker-compose up -d neo4j
```

### View Query Logs

```bash
# Watch queries in real-time
docker exec turbo-neo4j tail -f /logs/query.log

# View last 100 queries
docker exec turbo-neo4j tail -n 100 /logs/query.log

# Search for specific query patterns
docker exec turbo-neo4j grep "MATCH" /logs/query.log

# Filter by execution time (slow queries)
docker exec turbo-neo4j grep "time:" /logs/query.log | grep -E "[0-9]{3,} ms"
```

### Log Format

Query logs will appear in this format:

```
2025-10-22 01:23:45.123+0000 INFO  [bolt-123] client/127.0.0.1:54321 neo4j -
MATCH (n:Project {id: $id}) RETURN n -
{id: "abc-123-def"} -
runtime=slotted -
time: 12 ms -
planning: 3 ms -
waiting: 0 ms
```

### Benefits

✅ **Complete audit trail** - Every query logged with timestamp
✅ **Query parameters** - See actual values used
✅ **Performance metrics** - Execution time, planning time, waiting time
✅ **Client attribution** - IP address and connection info
✅ **No code changes** - Configuration only
✅ **Production ready** - Neo4j's official logging mechanism

---

## Option 2: Application-Level Query Logging

Add Python logging to track queries from the application side, providing better context about which service or AI agent triggered each query.

### Current KnowledgeGraphService

**File:** `/Users/alphonso/Documents/Code/PycharmProjects/turboCode/turbo/core/services/knowledge_graph.py`

The service currently uses `session.run()` without logging:

```python
async with self.driver.session() as session:
    result = await session.run(query, parameters)
    records = await result.data()
```

### Enhanced Implementation

Add a query wrapper method with logging:

```python
import logging
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)

class KnowledgeGraphService:
    """Service for interacting with Neo4j knowledge graph."""

    async def _execute_query(
        self,
        query: str,
        parameters: Optional[dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> list[dict]:
        """
        Execute Cypher query with comprehensive logging.

        Args:
            query: Cypher query string
            parameters: Query parameters
            context: Context info (e.g., "semantic_search", "entity_resolution")

        Returns:
            Query results as list of records
        """
        if not self.driver:
            raise RuntimeError("Neo4j driver not initialized")

        # Sanitize parameters for logging (hide sensitive data)
        safe_params = self._sanitize_params(parameters) if parameters else {}

        # Log query execution
        logger.info(
            f"[Neo4j Query] Context: {context or 'unknown'} | "
            f"Query: {query[:100]}{'...' if len(query) > 100 else ''}"
        )
        logger.debug(f"[Neo4j Parameters] {safe_params}")

        start_time = time.time()

        try:
            async with self.driver.session() as session:
                result = await session.run(query, parameters)
                records = await result.data()

                execution_time = (time.time() - start_time) * 1000  # ms

                logger.info(
                    f"[Neo4j Success] Context: {context or 'unknown'} | "
                    f"Time: {execution_time:.2f}ms | "
                    f"Records: {len(records)}"
                )

                return records

        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            logger.error(
                f"[Neo4j Error] Context: {context or 'unknown'} | "
                f"Time: {execution_time:.2f}ms | "
                f"Error: {str(e)}"
            )
            raise

    def _sanitize_params(self, params: dict[str, Any]) -> dict[str, Any]:
        """Remove sensitive data from parameters for logging."""
        sanitized = {}
        for key, value in params.items():
            # Hide sensitive fields
            if any(sensitive in key.lower() for sensitive in ['password', 'secret', 'token', 'key']):
                sanitized[key] = "***REDACTED***"
            # Truncate long values
            elif isinstance(value, str) and len(value) > 100:
                sanitized[key] = value[:100] + "..."
            else:
                sanitized[key] = value
        return sanitized
```

### Update All Query Calls

Replace direct `session.run()` calls with `_execute_query()`:

```python
# Before:
async with self.driver.session() as session:
    result = await session.run(
        "MATCH (n:Skill {name: $name}) RETURN n",
        {"name": skill_name}
    )
    records = await result.data()

# After:
records = await self._execute_query(
    query="MATCH (n:Skill {name: $name}) RETURN n",
    parameters={"name": skill_name},
    context="find_skill_by_name"
)
```

### Log Output Example

```
2025-10-22 01:23:45,123 INFO [knowledge_graph] [Neo4j Query] Context: semantic_search | Query: MATCH (n) WHERE n.embedding IS NOT NULL WITH n, gds.similarity.cosine(n.embedding, $query_...
2025-10-22 01:23:45,124 DEBUG [knowledge_graph] [Neo4j Parameters] {'query_embedding': [0.123, 0.456, ...], 'limit': 10, 'threshold': 0.7}
2025-10-22 01:23:45,148 INFO [knowledge_graph] [Neo4j Success] Context: semantic_search | Time: 24.32ms | Records: 8
```

### Benefits

✅ **Application context** - Know which service/method triggered query
✅ **Sensitive data protection** - Automatic redaction of secrets
✅ **Performance tracking** - Per-query timing from Python side
✅ **Error tracking** - Failed queries with full context
✅ **Structured logging** - Easy to parse and analyze
✅ **Debug information** - Full parameter logging in debug mode

---

## Option 3: Database Audit Table

Store query history in PostgreSQL for long-term retention and analysis.

### Schema

**File:** Create migration `turbo/migrations/versions/add_neo4j_query_audit.py`

```sql
CREATE TABLE neo4j_query_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Query details
    query TEXT NOT NULL,
    parameters JSONB,

    -- Attribution
    executed_by VARCHAR(100),  -- API endpoint, AI agent name, or user email
    source_service VARCHAR(50), -- 'knowledge_graph', 'semantic_search', etc.

    -- Performance
    execution_time_ms FLOAT,
    record_count INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'success',  -- 'success', 'error', 'timeout'
    error_message TEXT,

    -- Metadata
    client_ip VARCHAR(45),
    user_agent TEXT,
    request_id UUID,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_neo4j_audit_created_at ON neo4j_query_audit(created_at DESC);
CREATE INDEX idx_neo4j_audit_executed_by ON neo4j_query_audit(executed_by);
CREATE INDEX idx_neo4j_audit_source_service ON neo4j_query_audit(source_service);
CREATE INDEX idx_neo4j_audit_status ON neo4j_query_audit(status);
CREATE INDEX idx_neo4j_audit_execution_time ON neo4j_query_audit(execution_time_ms DESC);
```

### Integration with KnowledgeGraphService

```python
from sqlalchemy.ext.asyncio import AsyncSession
from turbo.core.models.neo4j_query_audit import Neo4jQueryAudit

class KnowledgeGraphService:
    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        db_session: Optional[AsyncSession] = None,  # Add PostgreSQL session
        executed_by: Optional[str] = None  # Track who's executing
    ):
        self.uri = uri or settings.graph.uri
        self.user = user or settings.graph.user
        self.password = password or settings.graph.password
        self.driver: Optional[AsyncDriver] = None
        self.db_session = db_session
        self.executed_by = executed_by or "unknown"

    async def _execute_query(
        self,
        query: str,
        parameters: Optional[dict[str, Any]] = None,
        context: Optional[str] = None
    ) -> list[dict]:
        """Execute query with audit logging to PostgreSQL."""
        start_time = time.time()
        status = "success"
        error_message = None
        record_count = 0

        try:
            async with self.driver.session() as session:
                result = await session.run(query, parameters)
                records = await result.data()
                record_count = len(records)

                return records

        except Exception as e:
            status = "error"
            error_message = str(e)
            raise

        finally:
            execution_time = (time.time() - start_time) * 1000

            # Save to audit table
            if self.db_session:
                try:
                    audit = Neo4jQueryAudit(
                        query=query,
                        parameters=parameters,
                        executed_by=self.executed_by,
                        source_service=context,
                        execution_time_ms=execution_time,
                        record_count=record_count,
                        status=status,
                        error_message=error_message
                    )
                    self.db_session.add(audit)
                    await self.db_session.commit()
                except Exception as audit_error:
                    logger.error(f"Failed to save audit record: {audit_error}")
```

### Query Audit API Endpoints

Add endpoints to view audit history:

```python
# turbo/api/v1/endpoints/neo4j_audit.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from turbo.api.dependencies import get_db_session

router = APIRouter(prefix="/neo4j-audit", tags=["Neo4j Audit"])

@router.get("/queries")
async def get_query_audit(
    limit: int = Query(50, le=500),
    executed_by: str | None = None,
    source_service: str | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db_session)
):
    """Get Neo4j query audit history."""
    query = select(Neo4jQueryAudit).order_by(Neo4jQueryAudit.created_at.desc())

    if executed_by:
        query = query.where(Neo4jQueryAudit.executed_by == executed_by)
    if source_service:
        query = query.where(Neo4jQueryAudit.source_service == source_service)
    if status:
        query = query.where(Neo4jQueryAudit.status == status)

    query = query.limit(limit)

    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "count": len(records),
        "queries": [
            {
                "id": str(r.id),
                "query": r.query,
                "executed_by": r.executed_by,
                "source_service": r.source_service,
                "execution_time_ms": r.execution_time_ms,
                "record_count": r.record_count,
                "status": r.status,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]
    }

@router.get("/stats")
async def get_query_stats(
    db: AsyncSession = Depends(get_db_session)
):
    """Get Neo4j query statistics."""
    # Total queries
    total = await db.scalar(select(func.count(Neo4jQueryAudit.id)))

    # Average execution time
    avg_time = await db.scalar(select(func.avg(Neo4jQueryAudit.execution_time_ms)))

    # Queries by status
    status_counts = await db.execute(
        select(
            Neo4jQueryAudit.status,
            func.count(Neo4jQueryAudit.id)
        ).group_by(Neo4jQueryAudit.status)
    )

    # Top executors
    top_executors = await db.execute(
        select(
            Neo4jQueryAudit.executed_by,
            func.count(Neo4jQueryAudit.id)
        )
        .group_by(Neo4jQueryAudit.executed_by)
        .order_by(func.count(Neo4jQueryAudit.id).desc())
        .limit(10)
    )

    return {
        "total_queries": total,
        "avg_execution_time_ms": round(avg_time, 2) if avg_time else 0,
        "by_status": dict(status_counts.all()),
        "top_executors": dict(top_executors.all())
    }
```

### Benefits

✅ **Permanent record** - Long-term query history storage
✅ **Advanced analytics** - SQL queries on audit data
✅ **Compliance** - Meet audit requirements
✅ **Performance analysis** - Identify slow queries over time
✅ **API access** - Query audit history programmatically
✅ **Dashboard ready** - Easy to visualize in UI

---

## Option 4: Real-Time Monitoring

View current Neo4j activity without enabling logging.

### Check Current Database State

```bash
# See all node types and counts
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
MATCH (n)
RETURN labels(n) as NodeType, count(*) as Count
ORDER BY Count DESC;
"

# See all relationship types
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
MATCH ()-[r]->()
RETURN type(r) as RelationshipType, count(*) as Count
ORDER BY Count DESC;
"

# See database statistics
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
CALL dbms.queryJmx('org.neo4j:instance=kernel#0,name=Kernel')
YIELD attributes
RETURN attributes.StoreCreationDate, attributes.ReadOnly;
"
```

### Monitor Active Queries

```bash
# List currently running queries
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
CALL dbms.listQueries()
YIELD queryId, query, elapsedTimeMillis, username
RETURN queryId, query, elapsedTimeMillis, username;
"

# Show active transactions
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
SHOW TRANSACTIONS;
"

# Kill long-running query (if needed)
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
CALL dbms.killQuery('query-123');
"
```

### View Recent Changes (if timestamps exist)

```bash
# Recent node creation (if created_at property exists)
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
MATCH (n)
WHERE n.created_at IS NOT NULL
RETURN labels(n) as Type, n.name as Name, n.created_at as Created
ORDER BY n.created_at DESC
LIMIT 20;
"

# Recent relationships
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
MATCH (a)-[r]->(b)
WHERE r.created_at IS NOT NULL
RETURN type(r) as Relationship, a.name, b.name, r.created_at
ORDER BY r.created_at DESC
LIMIT 20;
"
```

### Check Query Performance

```bash
# View slow query log (if enabled)
docker exec turbo-neo4j cat /logs/debug.log | grep -i "slow"

# Check memory usage
docker stats turbo-neo4j --no-stream

# Check disk usage
docker exec turbo-neo4j df -h /data
```

### Neo4j Browser Access

1. Open **http://localhost:7474**
2. Login: `neo4j` / `turbo_graph_password`
3. Run `:history` to see your browser query history
4. Use `:sysinfo` to see system information
5. Use `:queries` to see active queries

---

## Recommended Implementation Strategy

### Phase 1: Immediate Visibility (5 minutes)

1. **Enable Neo4j query logging** (Option 1)
   - Update `docker-compose.yml`
   - Restart Neo4j container
   - Verify logs with `tail -f`

### Phase 2: Application Logging (30 minutes)

2. **Add query wrapper to KnowledgeGraphService** (Option 2)
   - Create `_execute_query()` method
   - Add logging with context
   - Update all query calls

### Phase 3: Audit Database (1 hour)

3. **Create audit table and API** (Option 3)
   - Run migration to create table
   - Integrate audit logging
   - Add API endpoints for viewing history

### Phase 4: Dashboard (Future)

4. **Build audit dashboard** (Optional)
   - Visualize query trends
   - Alert on slow queries
   - Show query attribution

---

## Configuration Reference

### Neo4j Query Logging Settings

| Setting | Values | Description |
|---------|--------|-------------|
| `dbms.logs.query.enabled` | `INFO`, `VERBOSE`, `OFF` | Enable query logging |
| `dbms.logs.query.threshold` | milliseconds | Only log queries slower than threshold (0 = all) |
| `dbms.logs.query.parameter_logging_enabled` | `true`, `false` | Include query parameters |
| `dbms.logs.query.time_logging_enabled` | `true`, `false` | Include execution time |
| `dbms.logs.query.allocation_logging_enabled` | `true`, `false` | Include memory allocation |
| `dbms.logs.query.page_logging_enabled` | `true`, `false` | Include page cache info |
| `server.logs.query.enabled` | `VERBOSE`, `INFO`, `OFF` | Server-level query logging |

### Python Logging Levels

```python
# In turbo/utils/config.py or logging configuration
LOGGING = {
    'loggers': {
        'turbo.core.services.knowledge_graph': {
            'level': 'INFO',  # Set to DEBUG for parameter logging
            'handlers': ['console', 'file']
        }
    }
}
```

---

## Troubleshooting

### Query logs not appearing

**Check Neo4j configuration:**
```bash
docker exec turbo-neo4j cat /var/lib/neo4j/conf/neo4j.conf | grep query
```

**Verify logging is enabled:**
```bash
docker exec -it turbo-neo4j cypher-shell -u neo4j -p turbo_graph_password "
CALL dbms.listConfig()
YIELD name, value
WHERE name CONTAINS 'query'
RETURN name, value;
"
```

### Logs file too large

**Rotate logs:**
```bash
# Clear old logs
docker exec turbo-neo4j sh -c "> /logs/query.log"

# Or configure log rotation in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Performance impact

Query logging has minimal overhead:
- **VERBOSE**: ~1-3% performance impact
- **INFO**: ~0.5-1% performance impact
- **Threshold > 100ms**: < 0.1% impact

For production, use threshold-based logging:
```yaml
- NEO4J_dbms_logs_query_threshold=100  # Only log queries > 100ms
```

---

## Security Considerations

### Sensitive Data in Logs

**Problem:** Query parameters may contain sensitive data (passwords, emails, etc.)

**Solutions:**

1. **Sanitize in application code** (Option 2 includes this)
2. **Restrict log file access:**
   ```bash
   docker exec turbo-neo4j chmod 600 /logs/query.log
   ```
3. **Exclude sensitive queries** from logging:
   ```python
   if 'password' not in query.lower():
       logger.info(f"Query: {query}")
   ```

### Log Retention

Set up log rotation and retention policy:

```yaml
# docker-compose.yml
neo4j:
  logging:
    driver: "json-file"
    options:
      max-size: "50m"
      max-file: "10"  # Keep 10 files = 500MB total
```

For audit table, implement retention:
```sql
-- Delete audit records older than 90 days
DELETE FROM neo4j_query_audit
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Example Queries for Audit Analysis

### Find slow queries
```sql
SELECT
    executed_by,
    source_service,
    query,
    execution_time_ms,
    created_at
FROM neo4j_query_audit
WHERE execution_time_ms > 100
ORDER BY execution_time_ms DESC
LIMIT 20;
```

### Query volume by AI agent
```sql
SELECT
    executed_by,
    COUNT(*) as query_count,
    AVG(execution_time_ms) as avg_time,
    MAX(execution_time_ms) as max_time
FROM neo4j_query_audit
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY executed_by
ORDER BY query_count DESC;
```

### Failed queries
```sql
SELECT
    query,
    error_message,
    executed_by,
    created_at
FROM neo4j_query_audit
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 50;
```

### Query patterns over time
```sql
SELECT
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as queries_per_hour,
    AVG(execution_time_ms) as avg_time
FROM neo4j_query_audit
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Next Steps

1. **Choose approach** based on your needs:
   - Quick audit trail → Option 1 (Server-side logging)
   - Attribution & context → Option 2 (Application logging)
   - Long-term analytics → Option 3 (Audit table)
   - All of the above → Combine all options

2. **Implement selected option(s)** following this guide

3. **Monitor and tune:**
   - Check log volume
   - Adjust threshold if needed
   - Set up log rotation
   - Create alerts for slow queries

4. **Build dashboards** (optional):
   - Query volume trends
   - Performance metrics
   - AI agent attribution
   - Error rates

---

## References

- [Neo4j Query Logging Documentation](https://neo4j.com/docs/operations-manual/current/monitoring/logging/query-logging/)
- [Neo4j Configuration Reference](https://neo4j.com/docs/operations-manual/current/reference/configuration-settings/)
- Neo4j Browser: http://localhost:7474
- Turbo KnowledgeGraphService: `/turbo/core/services/knowledge_graph.py`
