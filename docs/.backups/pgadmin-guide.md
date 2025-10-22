# pgAdmin User Guide

## Overview

pgAdmin is a feature-rich web-based administration tool for PostgreSQL databases. This guide covers accessing and using pgAdmin to manage the Turbo Code PostgreSQL database.

## Access Information

### Connection Details

- **URL**: http://localhost:5050
- **Login Email**: `admin@admin.com`
- **Login Password**: `admin`

### Database Connection Details

- **Host**: `postgres` (from within Docker) or `localhost` (from host machine)
- **Port**: `5432`
- **Database**: `turbo`
- **Username**: `turbo`
- **Password**: `turbo_password`

## Getting Started

### 1. Starting pgAdmin

Ensure the Docker containers are running:

```bash
docker-compose up -d
```

Check that pgAdmin is running:

```bash
docker-compose ps pgadmin
```

You should see:
```
NAME              STATUS    PORTS
turbo-pgadmin     Up        0.0.0.0:5050->80/tcp
```

### 2. Accessing pgAdmin

1. Open your browser and navigate to **http://localhost:5050**
2. You'll see the pgAdmin login screen
3. Enter the credentials:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`
4. Click **Login**

### 3. Connecting to the Turbo Database

#### First-Time Setup

1. **Right-click on "Servers"** in the left sidebar
2. Select **Create > Server...**
3. **General Tab**:
   - **Name**: `Turbo Database` (or any name you prefer)
4. **Connection Tab**:
   - **Host name/address**: `postgres`
   - **Port**: `5432`
   - **Maintenance database**: `turbo`
   - **Username**: `turbo`
   - **Password**: `turbo_password`
   - ✅ Check **Save password**
5. **Advanced Tab** (optional):
   - You can set a custom database connection limit
6. Click **Save**

#### Quick Connection (After Setup)

1. Expand **Servers** in the left sidebar
2. Click on **Turbo Database** (or whatever you named it)
3. Expand **Databases > turbo**

You're now connected!

## Common Tasks

### Browsing Tables

1. Navigate to: **Servers > Turbo Database > Databases > turbo > Schemas > public > Tables**
2. You'll see all tables:
   - `projects`
   - `issues`
   - `comments`
   - `staff`
   - `initiatives`
   - `milestones`
   - `documents`
   - `tags`
   - And more...

### Viewing Table Data

1. **Right-click** on a table (e.g., `issues`)
2. Select **View/Edit Data > All Rows**
3. The data grid will appear showing all rows

**Keyboard Shortcut**: Click table, then press `F8`

### Running SQL Queries

#### Using the Query Tool

1. **Right-click** on the `turbo` database
2. Select **Query Tool** (or press `Alt+Shift+Q`)
3. Enter your SQL query:

```sql
-- Example: Get all open issues
SELECT id, title, status, priority, created_at
FROM issues
WHERE status = 'open'
ORDER BY created_at DESC;
```

4. Press **F5** or click the **Execute** button (▶️)
5. Results appear in the **Data Output** panel below

#### Example Queries

**Get all projects with completion percentage:**
```sql
SELECT
    id,
    name,
    status,
    completion_percentage,
    created_at,
    updated_at
FROM projects
ORDER BY completion_percentage DESC;
```

**Find all AI staff members:**
```sql
SELECT
    handle,
    alias,
    name,
    role_type,
    is_active,
    performance_metrics
FROM staff
WHERE is_active = true
ORDER BY handle;
```

**Get comment statistics by entity type:**
```sql
SELECT
    entity_type,
    COUNT(*) as comment_count,
    COUNT(DISTINCT author_name) as unique_authors
FROM comments
GROUP BY entity_type
ORDER BY comment_count DESC;
```

**Find blocked issues:**
```sql
SELECT
    i.id,
    i.title,
    i.status,
    i.priority,
    COUNT(d.blocking_issue_id) as blocker_count
FROM issues i
LEFT JOIN dependencies d ON i.id = d.blocked_issue_id
GROUP BY i.id, i.title, i.status, i.priority
HAVING COUNT(d.blocking_issue_id) > 0
ORDER BY blocker_count DESC;
```

### Editing Data

1. View table data (see "Viewing Table Data" above)
2. **Double-click** a cell to edit it
3. Modify the value
4. Click **Save** (💾 icon) or press `F6`

**Warning**: Be careful when editing data directly. Use transactions when making critical changes.

### Creating Tables

1. Navigate to: **Schemas > public > Tables**
2. **Right-click** on **Tables**
3. Select **Create > Table...**
4. **General Tab**: Enter table name
5. **Columns Tab**: Add columns
   - Name, Data type, Length, Not NULL, Primary Key, etc.
6. Click **Save**

### Backing Up the Database

#### Full Database Backup

1. **Right-click** on the `turbo` database
2. Select **Backup...**
3. **General Tab**:
   - **Filename**: Choose location and name (e.g., `turbo_backup_2025-10-19.sql`)
   - **Format**: `Plain` (for SQL script) or `Custom` (for pg_restore)
4. **Data/Objects Tab**:
   - Select what to include (usually default is fine)
5. Click **Backup**

**Via Command Line**:
```bash
docker exec turbo-postgres pg_dump -U turbo turbo > backup.sql
```

#### Restore from Backup

1. **Right-click** on the `turbo` database
2. Select **Restore...**
3. **General Tab**:
   - **Filename**: Select your backup file
   - **Format**: Match the format used during backup
4. Click **Restore**

**Via Command Line**:
```bash
docker exec -i turbo-postgres psql -U turbo turbo < backup.sql
```

### Monitoring Database Activity

#### Active Queries

1. Navigate to: **Dashboard** (top menu)
2. Select **Server Activity**
3. View:
   - Active sessions
   - Running queries
   - Lock information

#### Database Statistics

1. **Right-click** on the `turbo` database
2. Select **Properties**
3. Go to **Statistics** tab
4. View:
   - Database size
   - Number of connections
   - Transaction statistics
   - Last backup time

### Using the ERD Tool (Entity Relationship Diagram)

1. **Right-click** on the `turbo` database
2. Select **ERD For Database**
3. You'll see a visual representation of:
   - All tables
   - Relationships (foreign keys)
   - Columns and data types

**Tips**:
- Use **Auto-layout** button to organize the diagram
- Click and drag tables to rearrange
- Right-click table for options
- Export as PNG/SVG for documentation

## Advanced Features

### Using Schemas

```sql
-- Create a new schema for testing
CREATE SCHEMA testing;

-- Create table in schema
CREATE TABLE testing.temp_data (
    id SERIAL PRIMARY KEY,
    data TEXT
);

-- Query across schemas
SELECT * FROM public.issues
UNION ALL
SELECT * FROM testing.temp_data;
```

### Creating Views

1. Navigate to: **Schemas > public > Views**
2. **Right-click** on **Views**
3. Select **Create > View...**
4. **General Tab**: Name your view
5. **Code Tab**: Enter SQL:

```sql
CREATE VIEW active_high_priority_issues AS
SELECT
    i.id,
    i.title,
    i.description,
    i.status,
    i.priority,
    i.created_at,
    p.name as project_name
FROM issues i
LEFT JOIN projects p ON i.project_id = p.id
WHERE i.status IN ('open', 'in_progress')
  AND i.priority IN ('high', 'critical')
ORDER BY i.created_at DESC;
```

6. Click **Save**

### Query History

1. Open **Query Tool**
2. Click **History** tab (bottom panel)
3. View all previously executed queries
4. Double-click a query to re-run it

### Export Query Results

After running a query:

1. Click **Download** button (⬇️) in results panel
2. Choose format:
   - CSV
   - JSON
   - Excel
3. Select file location
4. Click **Save**

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Query Tool | `Alt+Shift+Q` |
| Execute Query | `F5` |
| Explain Query | `F7` |
| View/Edit Data | `F8` |
| Save Data | `F6` |
| Find | `Ctrl+F` |
| Comment/Uncomment | `Ctrl+/` |
| Auto-complete | `Ctrl+Space` |
| Refresh Browser | `F5` (in browser panel) |

## Tips & Best Practices

### Performance Tips

1. **Use EXPLAIN** to analyze slow queries:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM issues WHERE status = 'open';
   ```

2. **Check indexes**:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'issues';
   ```

3. **Monitor table bloat**:
   ```sql
   SELECT
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

### Safety Tips

1. **Always use transactions for critical changes**:
   ```sql
   BEGIN;
   UPDATE issues SET status = 'closed' WHERE id = 'uuid-here';
   -- Check the result
   SELECT * FROM issues WHERE id = 'uuid-here';
   -- If correct:
   COMMIT;
   -- If wrong:
   ROLLBACK;
   ```

2. **Test queries with LIMIT first**:
   ```sql
   -- Test with small sample
   UPDATE issues SET priority = 'high' WHERE status = 'open' LIMIT 1;

   -- If correct, run full update
   UPDATE issues SET priority = 'high' WHERE status = 'open';
   ```

3. **Backup before major changes**:
   - Always backup before structural changes
   - Test in development first

### Query Optimization

1. **Use indexes**:
   ```sql
   CREATE INDEX idx_issues_status ON issues(status);
   CREATE INDEX idx_issues_priority ON issues(priority);
   ```

2. **Avoid SELECT ***:
   ```sql
   -- Bad
   SELECT * FROM issues;

   -- Good
   SELECT id, title, status FROM issues;
   ```

3. **Use proper JOIN types**:
   ```sql
   -- Use INNER JOIN when you only want matching records
   SELECT i.title, p.name
   FROM issues i
   INNER JOIN projects p ON i.project_id = p.id;

   -- Use LEFT JOIN when you want all issues, even without projects
   SELECT i.title, p.name
   FROM issues i
   LEFT JOIN projects p ON i.project_id = p.id;
   ```

## Troubleshooting

### Can't Connect to pgAdmin

**Problem**: Browser shows "This site can't be reached"

**Solutions**:
1. Check container is running: `docker-compose ps pgadmin`
2. Restart pgAdmin: `docker-compose restart pgadmin`
3. Check logs: `docker-compose logs pgadmin`
4. Try different browser or clear cache

### Can't Connect to Database

**Problem**: "Could not connect to server"

**Solutions**:
1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify credentials in connection settings
3. For **Host**, use `postgres` (not `localhost`) when connecting from within Docker
4. Check network: Ensure both containers are in `turbo-network`

### Slow Query Performance

**Solutions**:
1. Add LIMIT to queries during testing
2. Create indexes on frequently queried columns
3. Use EXPLAIN ANALYZE to identify bottlenecks
4. Consider using materialized views for complex aggregations

### Permission Denied

**Problem**: "ERROR: permission denied for table X"

**Solutions**:
1. Check user permissions:
   ```sql
   SELECT * FROM information_schema.role_table_grants
   WHERE grantee = 'turbo';
   ```
2. Grant permissions if needed:
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO turbo;
   ```

## Useful Resources

- **pgAdmin Documentation**: https://www.pgadmin.org/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **SQL Tutorial**: https://www.postgresql.org/docs/current/tutorial-sql.html

## Quick Reference

### Database Schema

Main tables in Turbo:
- `projects` - Project management
- `issues` - Issue tracking
- `initiatives` - Feature/tech initiatives
- `milestones` - Release milestones
- `staff` - AI staff members
- `comments` - Entity comments
- `tags` - Categorization tags
- `documents` - Project documentation
- `literature` - Articles/podcasts/books
- `blueprints` - Architecture patterns
- `dependencies` - Issue dependencies
- `agent_sessions` - AI agent activity

### Common Maintenance Tasks

**Vacuum database** (reclaim space):
```sql
VACUUM ANALYZE;
```

**Reindex** (rebuild indexes):
```sql
REINDEX DATABASE turbo;
```

**Check table sizes**:
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

---

**Last Updated**: October 19, 2025
**Version**: 1.0
