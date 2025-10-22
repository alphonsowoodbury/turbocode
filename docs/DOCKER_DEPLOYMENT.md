---
doc_type: other
project_name: Turbo Code Platform
title: Docker Deployment Guide
version: '1.0'
---

# Docker Deployment Guide

This guide covers deploying Turbo Code using Docker and docker-compose for development and production environments.

## Overview

Turbo Code provides a complete Docker setup with:

- **API Server**: FastAPI application with async PostgreSQL support
- **PostgreSQL Database**: Primary data storage with persistent volumes
- **Redis**: Caching and session storage (future use)
- **Test Database**: Separate PostgreSQL instance for testing

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- 8GB+ RAM recommended
- Available ports: 8001 (API), 5432 (PostgreSQL), 6379 (Redis), 5433 (Test DB)

### Start the Stack

```bash
# Clone and navigate to the repository
git clone <repository-url>
cd turboCode

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

The API will be available at:
- **API Server**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

### Configure CLI to Use Docker Database

```bash
# Configure CLI to use the Docker PostgreSQL database
turbo config database --type postgres

# Verify connection
turbo config show
turbo status
```

## Service Configuration

### API Server

- **Container**: `turbo-api`
- **Port**: 8001 (host) → 8000 (container)
- **Environment**: Production mode with PostgreSQL
- **Health Check**: HTTP GET to `/health` endpoint
- **Auto-restart**: Unless stopped manually

### PostgreSQL Database

- **Container**: `turbo-postgres`
- **Port**: 5432 (host) → 5432 (container)
- **Database**: `turbo`
- **User**: `turbo`
- **Password**: `turbo_password`
- **Persistent Storage**: Docker volume `turbo-postgres-data`
- **Initialization**: Automatic schema creation via `init-db.sql`

### Redis Cache

- **Container**: `turbo-redis`
- **Port**: 6379 (host) → 6379 (container)
- **Persistent Storage**: Docker volume `turbo-redis-data`
- **Configuration**: Append-only file persistence enabled

### Test Database

- **Container**: `turbo-postgres-test`
- **Port**: 5433 (host) → 5432 (container)
- **Database**: `turbo_test`
- **Profile**: `testing` (start with `--profile testing`)
- **Storage**: Temporary (tmpfs) for fast test execution

## Development Workflows

### Option 1: Full Docker Development

Everything runs in containers:

```bash
# Start the complete stack
docker-compose up -d

# View API logs
docker-compose logs -f api

# Execute commands in API container
docker-compose exec api turbo status
docker-compose exec api python -c "from turbo.core.database.connection import init_database; import asyncio; asyncio.run(init_database())"

# Access database directly
docker-compose exec postgres psql -U turbo -d turbo
```

### Option 2: Hybrid Development (Recommended)

API and database in Docker, CLI on host:

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Configure CLI to use Docker database
turbo config database --type postgres

# Use CLI normally
turbo projects create --name "Docker Project"
turbo projects list

# Start API separately if needed
docker-compose up -d api
```

### Option 3: Local Development

Everything on host machine:

```bash
# Use local SQLite database
turbo config database --type sqlite

# Start API locally
uvicorn turbo.main:app --reload

# Use CLI normally
turbo projects list
```

## Production Deployment

### Environment Configuration

Create production environment file `.env.prod`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://turbo:secure_password@postgres:5432/turbo

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
TURBO_ENVIRONMENT=production
TURBO_DEBUG=false

# Security
SECURITY_SECRET_KEY=your-secure-secret-key-here
SECURITY_CORS_ORIGINS=https://your-domain.com,https://api.your-domain.com

# Logging
TURBO_LOG_LEVEL=INFO
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    extends:
      file: docker-compose.yml
      service: postgres
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data

  api:
    extends:
      file: docker-compose.yml
      service: api
    env_file:
      - .env.prod
    environment:
      - DATABASE_URL=postgresql+asyncpg://turbo:${POSTGRES_PASSWORD}@postgres:5432/turbo
    restart: always
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_prod_data:
    name: turbo-postgres-prod-data
```

Deploy production:

```bash
# Set secure password
export POSTGRES_PASSWORD=your-secure-database-password

# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Initialize database
docker-compose exec api python -c "import asyncio; from turbo.core.database.connection import init_database; asyncio.run(init_database())"

# Check health
curl http://localhost:8001/health
```

## Database Management

### Initialize Database

```bash
# For Docker setup (automatic on first start)
docker-compose up -d

# Manual initialization if needed
docker-compose exec api python -c "import asyncio; from turbo.core.database.connection import init_database; asyncio.run(init_database())"
```

### Database Access

```bash
# Connect to database
docker-compose exec postgres psql -U turbo -d turbo

# View tables
\dt

# View table schema
\d projects

# Exit psql
\q
```

### Backup and Restore

```bash
# Create backup
docker-compose exec postgres pg_dump -U turbo turbo > turbo_backup.sql

# Restore backup
docker-compose exec -T postgres psql -U turbo turbo < turbo_backup.sql

# Backup with docker-compose
docker-compose exec postgres pg_dump -U turbo -d turbo -f /tmp/backup.sql
docker cp $(docker-compose ps -q postgres):/tmp/backup.sql ./backup.sql
```

### Data Migration

```bash
# Export data from CLI
turbo export --format json --output turbo_data.json

# Import data after database setup
turbo import --format json --input turbo_data.json
```

## Monitoring and Maintenance

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Check API health endpoint
curl http://localhost:8001/health

# Check database connectivity
docker-compose exec api python -c "from turbo.core.database.connection import get_db_session; import asyncio; print('Database OK' if asyncio.run(get_db_session().__anext__()) else 'Database Error')"
```

### Logs Management

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f api
docker-compose logs -f postgres

# View recent logs with timestamps
docker-compose logs --since 1h --timestamps

# Save logs to file
docker-compose logs > turbo_logs.txt
```

### Resource Monitoring

```bash
# View resource usage
docker stats

# View container processes
docker-compose top

# View disk usage
docker system df
```

### Updates and Maintenance

```bash
# Pull latest images
docker-compose pull

# Rebuild services
docker-compose build --no-cache

# Update and restart
docker-compose up -d --build

# Remove unused containers and images
docker system prune
```

## Testing with Docker

### Run Tests in Container

```bash
# Start test database
docker-compose --profile testing up -d postgres-test

# Run tests in API container
docker-compose exec api pytest

# Run specific test categories
docker-compose exec api pytest tests/unit/
docker-compose exec api pytest tests/integration/

# Run tests with coverage
docker-compose exec api pytest --cov=turbo --cov-report=html
```

### Integration Testing

```bash
# Start full test environment
docker-compose --profile testing up -d

# Configure for testing
export DATABASE_URL=postgresql+asyncpg://turbo_test:turbo_test_password@localhost:5433/turbo_test

# Run integration tests
pytest tests/integration/ -v

# Cleanup test environment
docker-compose --profile testing down -v
```

## Network Configuration

### Custom Networks

```yaml
# docker-compose.override.yml
version: '3.8'

networks:
  turbo-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Reverse Proxy Setup

Example Nginx configuration:

```nginx
# /etc/nginx/sites-available/turbo
server {
    listen 80;
    server_name api.turbo.local;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Considerations

### Production Security

1. **Change Default Passwords**: Update all default passwords in production
2. **Environment Variables**: Use secure methods to manage environment variables
3. **Network Security**: Limit port exposure and use firewalls
4. **SSL/TLS**: Use HTTPS with proper certificates
5. **Regular Updates**: Keep Docker images and dependencies updated

### Database Security

```bash
# Create read-only user for reporting
docker-compose exec postgres psql -U turbo -d turbo -c "
CREATE USER turbo_readonly PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE turbo TO turbo_readonly;
GRANT USAGE ON SCHEMA public TO turbo_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO turbo_readonly;
"
```

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using port 8001
lsof -i :8001

# Use different port
docker-compose -f docker-compose.yml -p turbo-alt up -d
```

#### Database Connection Issues

```bash
# Check database container status
docker-compose exec postgres pg_isready -U turbo

# Reset database
docker-compose down -v
docker-compose up -d
```

#### Permission Issues

```bash
# Fix volume permissions
docker-compose down
sudo chown -R $USER:$USER ./data/
docker-compose up -d
```

#### Memory Issues

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → Increase limit
```

### Debug Mode

```bash
# Enable debug logging
export TURBO_DEBUG=true
export TURBO_LOG_LEVEL=DEBUG

# Start with debug
docker-compose up

# View detailed logs
docker-compose logs -f api
```

### Clean Reset

```bash
# Complete cleanup
docker-compose down -v
docker system prune -f
docker volume rm $(docker volume ls -q | grep turbo)

# Fresh start
docker-compose up -d
```

## Performance Optimization

### Database Optimization

```sql
-- Connect to database and optimize
docker-compose exec postgres psql -U turbo -d turbo

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- Analyze tables
ANALYZE;
```

### Container Optimization

```yaml
# docker-compose.override.yml
version: '3.8'

services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          memory: 512M

  postgres:
    command: |
      postgres
      -c max_connections=100
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c work_mem=4MB
```

For more information, see the main [README](../README.md) or [CLI Reference](CLI_REFERENCE.md).