# Neo4j Browser User Guide

## Overview

Neo4j Browser is a web-based interface for interacting with the Neo4j graph database. This guide covers accessing and using Neo4j Browser to explore the Turbo Code knowledge graph.

## Access Information

### Connection Details

- **URL**: http://localhost:7474
- **Username**: `neo4j`
- **Password**: `turbo_graph_password`
- **Bolt Protocol**: `bolt://localhost:7687` (for programmatic access)

### Graph Database Features

Neo4j stores the Turbo Code knowledge graph, which includes:
- **Entities**: Projects, Issues, Documents, Initiatives, Milestones, Tags
- **Relationships**: Dependencies, associations, semantic similarities
- **Vector Embeddings**: For semantic search and similarity queries
- **APOC Procedures**: Advanced graph algorithms and utilities

## Getting Started

### 1. Starting Neo4j

Ensure the Docker containers are running:

```bash
docker-compose up -d
```

Check that Neo4j is running:

```bash
docker-compose ps neo4j
```

You should see:
```
NAME              STATUS    PORTS
turbo-neo4j       Up        0.0.0.0:7474->7474/tcp, 0.0.0.0:7687->7687/tcp
```

### 2. Accessing Neo4j Browser

1. Open your browser and navigate to **http://localhost:7474**
2. You'll see the Neo4j Browser connection screen
3. Enter the credentials:
   - **Connect URL**: `bolt://localhost:7687` (usually pre-filled)
   - **Database**: `neo4j` (default)
   - **Authentication type**: `Username / Password`
   - **Username**: `neo4j`
   - **Password**: `turbo_graph_password`
4. Click **Connect**

### 3. First Time Setup

After connecting for the first time, you may be prompted to change the password. You can skip this step as we're using a local development environment.

## Neo4j Browser Interface

### Layout Overview

The Neo4j Browser interface consists of:

1. **Command Bar** (top) - Enter Cypher queries
2. **Favorites** (left sidebar) - Saved queries and guides
3. **Database Info** (left sidebar) - Node labels, relationship types, property keys
4. **Result Pane** (center) - Query results as graphs, tables, or text
5. **History** (right sidebar) - Previous queries

### Quick Tips

- Press `Ctrl+Enter` to execute the current query
- Use `:help` commands for built-in guides
- Click on nodes in visualizations to expand relationships
- Double-click nodes to view properties

## Cypher Query Language Basics

Cypher is Neo4j's query language for graphs. It uses ASCII-art syntax to represent patterns.

### Pattern Syntax

```cypher
// Nodes (entities)
(n)              // Any node
(n:Label)        // Node with label
(n:Label {prop: 'value'})  // Node with label and properties

// Relationships (connections)
-[r]->           // Directed relationship
-[r:TYPE]->      // Relationship with type
<-[r:TYPE]-      // Reverse direction
-[r:TYPE]-       // Undirected

// Patterns
(a)-[r]->(b)     // Node a connected to node b
(a)-[:KNOWS]->(b) // a KNOWS b
```

### Basic Query Structure

```cypher
// Read query
MATCH (pattern)
WHERE condition
RETURN results
ORDER BY property
LIMIT count

// Create query
CREATE (pattern)
SET properties
RETURN created_node

// Update query
MATCH (pattern)
SET property = value
RETURN updated_node

// Delete query
MATCH (pattern)
DELETE node, relationships
```

## Common Tasks

### Browsing the Knowledge Graph

#### 1. View All Node Types

```cypher
// Get count of nodes by label
CALL db.labels() YIELD label
CALL apoc.cypher.run('MATCH (n:' + label + ') RETURN count(n) as count', {})
YIELD value
RETURN label, value.count as count
ORDER BY count DESC;
```

#### 2. View All Relationship Types

```cypher
// Get count of relationships by type
CALL db.relationshipTypes() YIELD relationshipType
CALL apoc.cypher.run('MATCH ()-[r:' + relationshipType + ']->() RETURN count(r) as count', {})
YIELD value
RETURN relationshipType, value.count as count
ORDER BY count DESC;
```

#### 3. Explore the Graph Schema

```cypher
// Visual schema overview
CALL db.schema.visualization();
```

Or use the built-in command:
```
:schema
```

### Querying Entities

#### Find All Projects

```cypher
MATCH (p:Project)
RETURN p.id, p.name, p.status, p.completion_percentage
ORDER BY p.created_at DESC
LIMIT 10;
```

#### Find All Issues for a Project

```cypher
MATCH (p:Project {name: 'Turbo Code Platform'})-[:HAS_ISSUE]->(i:Issue)
RETURN i.id, i.title, i.status, i.priority
ORDER BY i.created_at DESC;
```

#### Find High-Priority Open Issues

```cypher
MATCH (i:Issue)
WHERE i.status = 'open' AND i.priority IN ['high', 'critical']
RETURN i.id, i.title, i.status, i.priority, i.created_at
ORDER BY
  CASE i.priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    ELSE 3
  END,
  i.created_at DESC
LIMIT 20;
```

### Relationship Queries

#### Find Issue Dependencies (Blockers)

```cypher
MATCH (blocked:Issue)-[:BLOCKS]->(blocking:Issue)
RETURN blocked.title as blocked_issue,
       blocking.title as blocking_issue,
       blocked.status as blocked_status,
       blocking.status as blocking_status;
```

#### Find Issues Blocked by Unresolved Issues

```cypher
MATCH (blocked:Issue)-[:BLOCKS]->(blocking:Issue)
WHERE blocking.status IN ['open', 'in_progress']
RETURN blocked.title as cannot_start,
       blocking.title as waiting_on,
       blocking.status as blocker_status
ORDER BY blocking.priority DESC;
```

#### Find All Entities Tagged with a Specific Tag

```cypher
MATCH (entity)-[:TAGGED_WITH]->(tag:Tag {name: 'frontend'})
RETURN labels(entity)[0] as entity_type,
       entity.title as title,
       entity.status as status;
```

### Semantic Search (Vector Similarity)

#### Find Similar Issues by Embedding

```cypher
// Find issues similar to a specific issue
MATCH (i:Issue {id: 'your-issue-uuid'})
MATCH (similar:Issue)
WHERE i <> similar AND similar.embedding IS NOT NULL
WITH i, similar,
     gds.similarity.cosine(i.embedding, similar.embedding) as similarity
WHERE similarity > 0.7
RETURN similar.id, similar.title, similarity
ORDER BY similarity DESC
LIMIT 10;
```

#### Find Related Documents

```cypher
// Find documents related to an issue by semantic similarity
MATCH (i:Issue {id: 'your-issue-uuid'})
MATCH (d:Document)
WHERE d.embedding IS NOT NULL
WITH i, d,
     gds.similarity.cosine(i.embedding, d.embedding) as similarity
WHERE similarity > 0.6
RETURN d.id, d.title, d.doc_type, similarity
ORDER BY similarity DESC
LIMIT 5;
```

### Graph Analytics

#### Find Most Connected Issues (Hub Detection)

```cypher
MATCH (i:Issue)
OPTIONAL MATCH (i)-[r]-()
WITH i, count(r) as connections
WHERE connections > 0
RETURN i.id, i.title, i.status, connections
ORDER BY connections DESC
LIMIT 10;
```

#### Find Orphaned Issues (No Relationships)

```cypher
MATCH (i:Issue)
WHERE NOT (i)-[]-()
RETURN i.id, i.title, i.status, i.priority
ORDER BY i.created_at DESC;
```

#### Shortest Path Between Two Issues

```cypher
MATCH (start:Issue {id: 'issue-uuid-1'}),
      (end:Issue {id: 'issue-uuid-2'}),
      path = shortestPath((start)-[*]-(end))
RETURN path;
```

### Data Management

#### Create a New Node

```cypher
CREATE (i:Issue {
  id: 'uuid-here',
  title: 'New Issue',
  description: 'Description',
  status: 'open',
  priority: 'medium',
  created_at: datetime()
})
RETURN i;
```

#### Create a Relationship

```cypher
MATCH (a:Issue {id: 'issue-uuid-1'}),
      (b:Issue {id: 'issue-uuid-2'})
CREATE (a)-[r:BLOCKS]->(b)
RETURN a, r, b;
```

#### Update Node Properties

```cypher
MATCH (i:Issue {id: 'your-issue-uuid'})
SET i.status = 'closed',
    i.updated_at = datetime()
RETURN i;
```

#### Delete a Node and Its Relationships

```cypher
MATCH (i:Issue {id: 'your-issue-uuid'})
DETACH DELETE i;
```

**Warning**: `DETACH DELETE` removes the node AND all its relationships. Be careful!

### Bulk Operations

#### Count Entities by Type

```cypher
MATCH (n)
RETURN labels(n) as labels, count(n) as count
ORDER BY count DESC;
```

#### Delete All Nodes of a Specific Type

```cypher
// WARNING: This deletes all nodes with the label!
MATCH (n:TemporaryNode)
DETACH DELETE n;
```

#### Update All Nodes with a Property

```cypher
MATCH (i:Issue)
WHERE i.priority IS NULL
SET i.priority = 'medium'
RETURN count(i) as updated_count;
```

## Advanced Features

### Using APOC Procedures

APOC (Awesome Procedures on Cypher) provides additional graph algorithms and utilities.

#### Find Related Entities by Multi-Hop Traversal

```cypher
// Find all entities within 3 hops of an issue
MATCH (i:Issue {id: 'your-issue-uuid'})
CALL apoc.path.subgraphAll(i, {
  relationshipFilter: null,
  maxLevel: 3
})
YIELD nodes, relationships
RETURN nodes, relationships;
```

#### Export Query Results to JSON

```cypher
// Export issues to JSON
MATCH (i:Issue)
WHERE i.status = 'open'
WITH collect(i) as issues
CALL apoc.convert.toJson(issues)
YIELD value
RETURN value;
```

#### Batch Updates

```cypher
// Update multiple nodes efficiently
MATCH (i:Issue)
WHERE i.created_at > datetime() - duration({days: 7})
CALL apoc.periodic.commit("
  MATCH (i:Issue)
  WHERE i.created_at > datetime() - duration({days: 7})
    AND i.needs_review IS NULL
  WITH i LIMIT 100
  SET i.needs_review = true
  RETURN count(i)
", {})
YIELD updates
RETURN updates;
```

### Graph Data Science

#### PageRank (Find Important Issues)

```cypher
// Run PageRank algorithm on issues
CALL gds.pageRank.stream({
  nodeProjection: 'Issue',
  relationshipProjection: {
    BLOCKS: {
      type: 'BLOCKS',
      orientation: 'NATURAL'
    }
  }
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).title as issue, score
ORDER BY score DESC
LIMIT 10;
```

#### Community Detection (Find Issue Clusters)

```cypher
// Find communities of related issues
CALL gds.louvain.stream({
  nodeProjection: 'Issue',
  relationshipProjection: 'BLOCKS'
})
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId).title) as issues
RETURN communityId, issues, size(issues) as cluster_size
ORDER BY cluster_size DESC;
```

## Visualization Features

### Graph Visualization

When you run a query that returns nodes and relationships, Neo4j Browser displays them visually.

**Tips:**
- **Click node** - Select and highlight
- **Double-click node** - Expand relationships
- **Click relationship** - View properties
- **Scroll** - Zoom in/out
- **Drag** - Pan around
- **Ctrl+Click** - Multi-select

### Customize Visualization

Click the settings icon (⚙️) in the result pane to:
- Change node colors by label
- Adjust node size
- Show/hide properties
- Change layout algorithm

### Export Visualizations

Click the download icon (⬇️) to export as:
- PNG image
- SVG vector
- CSV data

## Performance Tips

### 1. Use Indexes for Faster Queries

```cypher
// Create index on frequently queried properties
CREATE INDEX issue_id_index FOR (i:Issue) ON (i.id);
CREATE INDEX issue_status_index FOR (i:Issue) ON (i.status);
CREATE INDEX project_name_index FOR (p:Project) ON (p.name);
```

### 2. Check Existing Indexes

```cypher
SHOW INDEXES;
```

### 3. Use PROFILE to Analyze Query Performance

```cypher
// Add PROFILE to see execution plan
PROFILE
MATCH (i:Issue)
WHERE i.status = 'open'
RETURN i
LIMIT 10;
```

### 4. Limit Result Size

Always use `LIMIT` when exploring:

```cypher
// Good - limited results
MATCH (i:Issue)
RETURN i
LIMIT 100;

// Bad - could return millions of nodes
MATCH (i:Issue)
RETURN i;
```

### 5. Use Parameters for Repeated Queries

```cypher
// Instead of hardcoding values
:param issue_id => 'your-uuid-here'

// Use parameters in queries
MATCH (i:Issue {id: $issue_id})
RETURN i;
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Execute Query | `Ctrl+Enter` |
| Multi-line Mode | `Shift+Enter` |
| Clear Editor | `Ctrl+K` |
| Previous Query | `Ctrl+Up` |
| Next Query | `Ctrl+Down` |
| Toggle Fullscreen | `Esc` |
| Focus Editor | `/` |

## Built-in Guides

Neo4j Browser includes interactive guides. Try these commands:

```
:help           // General help
:play intro     // Introduction to Neo4j
:play cypher    // Cypher query language tutorial
:play concepts  // Graph database concepts
```

## Troubleshooting

### Can't Connect to Neo4j

**Problem**: "ServiceUnavailable: WebSocket connection failure"

**Solutions**:
1. Check container is running: `docker-compose ps neo4j`
2. Restart Neo4j: `docker-compose restart neo4j`
3. Check logs: `docker-compose logs neo4j`
4. Verify URL is `bolt://localhost:7687`
5. Wait 30 seconds after starting (healthcheck period)

### Authentication Failed

**Problem**: "Neo.ClientError.Security.Unauthorized"

**Solutions**:
1. Verify credentials:
   - Username: `neo4j`
   - Password: `turbo_graph_password`
2. Check docker-compose.yml for `NEO4J_AUTH` setting
3. Try resetting password via Docker environment variables

### Slow Query Performance

**Problem**: Queries taking too long

**Solutions**:
1. Add `LIMIT` to queries
2. Create indexes on frequently queried properties
3. Use `PROFILE` or `EXPLAIN` to analyze query plan
4. Avoid Cartesian products (multiple `MATCH` without relationships)

### Graph Not Visualizing

**Problem**: Results show as table instead of graph

**Solution**: Ensure query returns nodes and relationships:

```cypher
// Returns graph
MATCH (i:Issue)-[r:BLOCKS]->(b:Issue)
RETURN i, r, b;

// Returns table
MATCH (i:Issue)-[:BLOCKS]->(b:Issue)
RETURN i.title, b.title;
```

### Memory Issues

**Problem**: "OutOfMemoryError"

**Solutions**:
1. Increase heap size in docker-compose.yml:
   ```yaml
   NEO4J_dbms_memory_heap_max__size=4G
   ```
2. Use `LIMIT` in queries
3. Process data in batches with `apoc.periodic.iterate`
4. Restart container: `docker-compose restart neo4j`

## Useful Resources

- **Neo4j Documentation**: https://neo4j.com/docs/
- **Cypher Manual**: https://neo4j.com/docs/cypher-manual/current/
- **APOC Documentation**: https://neo4j.com/labs/apoc/
- **Graph Data Science**: https://neo4j.com/docs/graph-data-science/current/

## Turbo Knowledge Graph Schema

### Node Labels

The Turbo knowledge graph uses these primary node types:

- **Project** - Project entities
- **Issue** - Issue tracking
- **Document** - Documentation
- **Initiative** - Strategic initiatives
- **Milestone** - Release milestones
- **Tag** - Classification tags
- **Literature** - Articles, podcasts, books

### Relationship Types

Common relationship types in the Turbo graph:

- **HAS_ISSUE** - Project → Issue
- **BLOCKS** - Issue → Issue (dependency)
- **TAGGED_WITH** - Entity → Tag
- **BELONGS_TO** - Issue → Project
- **RELATED_TO** - Generic relationship
- **SIMILAR_TO** - Semantic similarity (with score)

### Common Properties

Most nodes have these properties:
- `id` (UUID)
- `title` or `name`
- `description`
- `status`
- `created_at`
- `updated_at`
- `embedding` (vector for similarity search)

## Example Workflows

### Workflow 1: Find Related Issues for Context

```cypher
// Start with an issue
MATCH (i:Issue {id: 'your-issue-uuid'})

// Find directly related issues
OPTIONAL MATCH (i)-[:BLOCKS]->(blocked:Issue)
OPTIONAL MATCH (blocker:Issue)-[:BLOCKS]->(i)

// Find issues with same tags
OPTIONAL MATCH (i)-[:TAGGED_WITH]->(tag:Tag)<-[:TAGGED_WITH]-(tagged:Issue)
WHERE tagged <> i

// Return all related issues
RETURN i.title as current_issue,
       collect(DISTINCT blocked.title) as blocking_issues,
       collect(DISTINCT blocker.title) as blocked_by,
       collect(DISTINCT tagged.title) as similarly_tagged
LIMIT 1;
```

### Workflow 2: Project Health Overview

```cypher
// Get project overview with issue statistics
MATCH (p:Project)
OPTIONAL MATCH (p)-[:HAS_ISSUE]->(i:Issue)
WITH p,
     count(i) as total_issues,
     count(CASE WHEN i.status = 'open' THEN 1 END) as open_issues,
     count(CASE WHEN i.status = 'closed' THEN 1 END) as closed_issues,
     count(CASE WHEN i.priority IN ['high', 'critical'] THEN 1 END) as high_priority
RETURN p.name,
       p.status,
       p.completion_percentage,
       total_issues,
       open_issues,
       closed_issues,
       high_priority,
       round(100.0 * closed_issues / CASE WHEN total_issues > 0 THEN total_issues ELSE 1 END, 1) as completion_rate
ORDER BY p.created_at DESC;
```

### Workflow 3: Dependency Chain Analysis

```cypher
// Find all issues in a dependency chain
MATCH path = (start:Issue {id: 'your-issue-uuid'})-[:BLOCKS*1..5]->(end:Issue)
WITH start, end, path, length(path) as depth
RETURN start.title as origin,
       end.title as depends_on,
       depth as chain_length,
       [node in nodes(path) | node.title] as full_chain
ORDER BY depth DESC;
```

---

**Last Updated**: October 19, 2025
**Version**: 1.0
