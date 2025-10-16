# Turbo Architecture Split Plan

## Overview

This document outlines the plan to split the monolithic Turbo codebase into three separate repositories, creating a clear separation between backend infrastructure, web UI, and desktop IDE.

## Current State

```
turboCode/ (monolithic)
├── frontend/           # Next.js web app
├── turbo/              # FastAPI backend
├── docker-compose.yml  # All services
└── tests/
```

**Problems:**
- Backend and frontend tightly coupled
- Difficult to version independently
- Unclear product boundaries
- Single git history for different concerns

## Target State

```
~/Documents/Code/PycharmProjects/
├── turboCore/          # Backend API + Infrastructure
│   ├── turbo/          # FastAPI application
│   ├── docker-compose.yml
│   └── README.md
│
├── turboPlan/          # Web UI (formerly turboCode)
│   ├── frontend/       # Next.js application only
│   └── README.md
│
└── turboBuild/         # Desktop IDE (new)
    ├── src/            # VS Code fork/wrapper
    ├── extensions/     # Turbo extensions
    └── README.md
```

---

## Product Architecture

### Three Products, One Platform

#### 1. **Turbo Core** - Backend API & Infrastructure
**Purpose:** Shared backend serving both Plan and Build

**Technology:**
- FastAPI (Python)
- PostgreSQL (data)
- Neo4j (knowledge graph)
- Ollama (AI models)
- Redis (cache)

**Serves:**
- REST API at `http://localhost:8001/api/v1`
- WebSocket at `ws://localhost:8001/ws`
- Swagger docs at `http://localhost:8001/docs`

**Contains:**
- `/turbo/api/` - API endpoints
- `/turbo/core/` - Business logic, models, services
- `/turbo/cli/` - CLI commands
- `/turbo/utils/` - Shared utilities
- `/tests/` - API tests
- `/docker-compose.yml` - All infrastructure services

#### 2. **Turbo Plan** - Web UI for Planning & Organization
**Purpose:** Strategic layer - think and organize

**Technology:**
- Next.js 15 (React)
- TypeScript
- Tailwind CSS
- Tanstack Query

**Features:**
- 📋 Project planning & roadmaps
- 🎙️ Knowledge curation (podcasts, articles)
- 💼 Career management (jobs, invoices, contracts)
- 📅 Calendar & scheduling
- 📊 Analytics & reporting
- 🤝 Team collaboration
- 📱 Mobile access
- 🌐 Public sharing

**Target Users:**
- Solo developers (planning time)
- Small teams
- Freelancers managing business

**Contains:**
- `/frontend/` - Next.js application
- No backend code

#### 3. **Turbo Build** - Desktop IDE for Coding
**Purpose:** Execution layer - build and create

**Technology:**
- VS Code fork/wrapper (Electron)
- TypeScript
- VS Code Extension API

**Features:**
- 💻 Code editor (VS Code core)
- 🎯 Issues in sidebar (from Turbo Plan)
- 🤖 AI coding agents (Ollama-powered)
- 🔗 Knowledge graph integration
- ⚡ Context-aware terminal
- 🧠 Semantic code search
- 🚀 One-click deploy

**Target Users:**
- Solo developers (coding time)
- Developers who want AI pair programming
- Teams using Turbo Plan

**Contains:**
- VS Code fork or wrapper
- Turbo-specific extensions
- Branding and customization

---

## Data Flow

```
┌─────────────────┐         ┌─────────────────┐
│   Turbo Plan    │         │   Turbo Build   │
│   (Web UI)      │         │   (Desktop IDE) │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  HTTP/WebSocket           │  HTTP/WebSocket
         │                           │
         └────────┬──────────────────┘
                  │
         ┌────────▼────────┐
         │   Turbo Core    │
         │   (API Server)  │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼───┐
│ PostgreSQL │ │  Neo4j  │ │ Ollama│
│ (Data)     │ │ (Graph) │ │ (AI)  │
└───────────┘ └─────────┘ └───────┘
```

---

## Integration Points

### Plan → Build
```javascript
// In Turbo Plan UI
<button onClick={() => {
  turboBuild.open({
    issueId: '123',
    files: ['auth.py', 'tests.py'],
    branch: 'feature/auth',
  });
}}>
  Open in Turbo Build
</button>
```

**Opens Turbo Build with:**
- Issue context loaded
- Relevant files opened
- Terminal in project directory
- AI knows current task

### Build → Plan
```typescript
// In Turbo Build sidebar
[Issue #123: Fix auth bug]
  ↓ right-click menu
  └─ "View in Turbo Plan"
       └─ Opens browser to full issue page with all context
```

### Bidirectional Sync
```
User updates issue in Turbo Plan
    ↓ WebSocket
Turbo Build sidebar updates instantly

User commits in Turbo Build
    ↓ Git hook → Turbo Core API
Turbo Plan updates issue status
```

---

## Migration Plan

### Phase 1: Create turboCore (2-3 hours)

**Objective:** Extract backend to independent repository

**Steps:**

1. **Create new repository**
```bash
cd ~/Documents/Code/PycharmProjects
mkdir turboCore
cd turboCore
git init
```

2. **Copy backend files from turboCode**
```bash
# Core backend
cp -r ../turboCode/turbo ./
cp -r ../turboCode/tests ./
cp -r ../turboCode/alembic ./
cp -r ../turboCode/migrations ./

# Configuration
cp ../turboCode/pyproject.toml ./
cp ../turboCode/docker-compose.yml ./
cp ../turboCode/.env.example ./
cp ../turboCode/.gitignore ./

# Scripts
cp -r ../turboCode/scripts ./

# Documentation (backend-specific)
mkdir docs
cp ../turboCode/docs/API_SPECIFICATION.md ./docs/
cp ../turboCode/docs/DOCKER_DEPLOYMENT.md ./docs/
cp ../turboCode/CLAUDE.md ./
```

3. **Create turboCore README**
```markdown
# Turbo Core

Backend API and infrastructure for Turbo Plan and Turbo Build.

## Services
- **FastAPI** - REST API server
- **PostgreSQL** - Primary database
- **Neo4j** - Knowledge graph
- **Ollama** - AI models (local LLM)
- **Redis** - Cache and sessions

## Quick Start
```bash
# Start all services
docker-compose up -d

# API available at:
# - http://localhost:8001/api/v1
# - http://localhost:8001/docs (Swagger)
```

## Development
```bash
# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run API locally (without Docker)
uvicorn turbo.main:app --reload --port 8001
```

## Environment Variables
See `.env.example` for configuration options.

## API Clients
This API serves:
- Turbo Plan (web UI)
- Turbo Build (desktop IDE)
- CLI (`turbo` command)
- Third-party integrations
```

4. **Initial commit**
```bash
git add .
git commit -m "Initial commit: turboCore - Backend API extracted from turboCode"
```

5. **Update docker-compose.yml**
- Ensure all ports are exposed for external connections
- Add network configuration for cross-container communication
- Update environment variables

**Files to modify:**
- `docker-compose.yml` - Expose API on port 8001
- `turbo/utils/config.py` - Ensure CORS allows Plan and Build origins

**Deliverables:**
✅ turboCore repository with clean backend only
✅ Docker Compose running all infrastructure
✅ API accessible at http://localhost:8001
✅ Tests passing

---

### Phase 2: Refactor turboCode → turboPlan (1-2 hours)

**Objective:** Remove backend, keep frontend only

**Steps:**

1. **Rename repository**
```bash
cd ~/Documents/Code/PycharmProjects
mv turboCode turboPlan
cd turboPlan
```

2. **Remove backend files**
```bash
# Remove backend code
rm -rf turbo/
rm -rf tests/
rm -rf alembic/
rm -rf migrations/
rm pyproject.toml

# Remove backend Docker setup (use turboCore instead)
rm docker-compose.yml

# Remove backend scripts
rm -rf scripts/run_*.py
rm -rf scripts/*webhook*.py

# Remove backend docs
rm docs/API_SPECIFICATION.md
rm docs/DOCKER_DEPLOYMENT.md
```

3. **Update frontend configuration**
```bash
cd frontend

# Create/update .env.local
cat > .env.local << 'EOF'
# Turbo Core API
NEXT_PUBLIC_API_URL=http://localhost:8001

# Environment
NODE_ENV=development
EOF
```

4. **Update frontend API client**

**File:** `frontend/lib/api.ts` (or wherever API client is defined)
```typescript
// Update base URL to use env variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
```

5. **Create turboPlan README**
```markdown
# Turbo Plan

The web interface for Turbo - plan projects, manage knowledge, track your career.

## Prerequisites
- **Turbo Core** must be running (provides API)
  ```bash
  cd ../turboCore
  docker-compose up -d
  ```

## Quick Start
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3001

## Features
- 📋 Project & issue management
- 🎙️ Podcast & article library
- 💼 Career tracking (jobs, invoices, freelance)
- 📅 Calendar & scheduling
- 📊 Analytics dashboards
- 🤝 Team collaboration (planned)
- 📱 Mobile-responsive

## Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables
See `frontend/.env.example` for all options.

## Architecture
Turbo Plan is the web UI frontend for Turbo. It connects to:
- **Turbo Core** - Backend API (required)
- **Turbo Build** - Desktop IDE (optional companion)
```

6. **Update package.json scripts**
```json
{
  "name": "turbo-plan",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "test": "jest"
  }
}
```

7. **Commit changes**
```bash
git add .
git commit -m "Refactor: Extract backend to turboCore, frontend-only architecture"
```

**Files to update:**
- `frontend/.env.local` - Point to turboCore API
- `frontend/lib/api.ts` - Use environment variable for API URL
- `frontend/package.json` - Update name and description
- `README.md` - New documentation for Plan UI only
- `.gitignore` - Remove backend-specific ignores

**Deliverables:**
✅ turboPlan repository with frontend only
✅ Connects to turboCore API
✅ All features working
✅ Development server running on port 3001

---

### Phase 3: Create turboBuild (8-12 weeks)

**Objective:** Build VS Code-based desktop IDE

**Note:** This is a larger effort and should be done in stages.

#### Stage 1: Choose Architecture Approach (Week 1)

**Option A: VS Code Fork**
- Fork https://github.com/microsoft/vscode
- Most control, most maintenance
- Similar to Cursor's approach

**Option B: Electron Wrapper**
- Wrap VS Code's core with custom shell
- Moderate control, less maintenance
- Faster to market

**Option C: Extension Bundle**
- VS Code with pre-installed extensions
- Least control, minimal maintenance
- Fastest to market

**Recommendation:** Start with Option C for MVP, can upgrade to B or A later.

#### Stage 2: Project Setup (Week 1-2)

```bash
cd ~/Documents/Code/PycharmProjects
mkdir turboBuild
cd turboBuild
git init

# Create basic structure
mkdir -p src/{extension,client,common}
mkdir -p resources/{icons,branding}
mkdir -p scripts

# Initialize package.json
npm init -y
```

**Initial structure:**
```
turboBuild/
├── src/
│   ├── extension/          # Main Turbo extension
│   │   ├── extension.ts    # Entry point
│   │   ├── turboSidebar.ts # Project/issue tree
│   │   ├── apiClient.ts    # Turbo Core API client
│   │   └── commands/       # VS Code commands
│   ├── client/             # Language client (optional)
│   └── common/             # Shared utilities
├── resources/
│   ├── icons/              # Turbo branding
│   └── splash/             # Splash screen
├── scripts/
│   ├── build.sh            # Build script
│   └── package.sh          # Package for distribution
├── package.json
├── tsconfig.json
└── README.md
```

#### Stage 3: Core Extension (Week 3-4)

**Implement:**
1. **Sidebar tree view** - Projects and issues from Turbo Core
2. **API client** - Connect to http://localhost:8001
3. **Commands** - Create issue, update status, search
4. **Status bar** - Show current issue/project

**Key files:**
- `src/extension/extension.ts` - Extension entry point
- `src/extension/turboSidebar.ts` - Tree view provider
- `src/extension/apiClient.ts` - Fetch data from Turbo Core

#### Stage 4: AI Integration (Week 5-8)

**Implement:**
1. **Ollama integration** - Connect to local AI models
2. **Code suggestions** - Inline AI suggestions
3. **Knowledge graph** - Semantic search in sidebar
4. **Agent execution** - Run tasks in background

#### Stage 5: Polish & Distribution (Week 9-12)

**Implement:**
1. **Branding** - Custom splash screen, icons
2. **Onboarding** - First-run experience
3. **Settings** - Turbo-specific preferences
4. **Documentation** - User guide
5. **Packaging** - Installers for Mac/Windows/Linux

**Deliverables:**
✅ turboBuild desktop application
✅ Connects to turboCore API
✅ Sidebar with projects/issues
✅ AI coding assistance
✅ Branded VS Code experience

---

## Development Workflow

### Daily Development

**Start infrastructure:**
```bash
# Terminal 1: Start all backend services
cd ~/Documents/Code/PycharmProjects/turboCore
docker-compose up -d

# Check services are running
docker-compose ps
curl http://localhost:8001/api/v1/health
```

**Start frontends:**
```bash
# Terminal 2: Start web UI
cd ~/Documents/Code/PycharmProjects/turboPlan/frontend
npm run dev
# → http://localhost:3001

# Terminal 3: Start desktop IDE (once built)
cd ~/Documents/Code/PycharmProjects/turboBuild
npm start
```

### Working on Different Components

**Backend API changes:**
```bash
cd turboCore
# Edit turbo/api/ or turbo/core/
# Both UIs automatically pick up changes
pytest  # Run tests
```

**Web UI changes:**
```bash
cd turboPlan/frontend
# Edit components/, app/, etc.
# Hot reload in browser
npm test  # Run tests
```

**Desktop IDE changes:**
```bash
cd turboBuild
# Edit src/extension/
# Reload window in VS Code
npm test  # Run tests
```

---

## Docker & Deployment Strategy

### Development (Local)

**turboCore:**
```bash
docker-compose up -d
# Runs: postgres, neo4j, ollama, redis, api
```

**turboPlan:**
```bash
npm run dev
# Connects to turboCore API
```

**turboBuild:**
```bash
npm start
# Connects to turboCore API
```

### Production Deployment

**turboCore (api.turbo.dev):**
- Deploy to Kubernetes/ECS/Railway
- Environment: Production
- Scaled horizontally
- Managed PostgreSQL (RDS/Supabase)
- Managed Redis

**turboPlan (plan.turbo.dev):**
- Deploy to Vercel/Netlify
- Static export or SSR
- CDN for assets
- Connects to api.turbo.dev

**turboBuild:**
- Downloadable installer
- Auto-update mechanism
- Connects to api.turbo.dev (or self-hosted)

---

## Database & Data Sharing

### Shared Database

All three products use the **same PostgreSQL database** via Turbo Core API:

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Plan   │  │  Build   │  │    CLI   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
              ┌────▼─────┐
              │   Core   │
              │   API    │
              └────┬─────┘
                   │
            ┌──────▼──────┐
            │ PostgreSQL  │
            │ (Single DB) │
            └─────────────┘
```

**Benefits:**
- ✅ Real-time sync (WebSocket)
- ✅ No data duplication
- ✅ Consistent state across apps
- ✅ Easy backup/restore

### Data Model (Unchanged)

The database schema remains the same:
- Projects
- Issues
- Milestones
- Initiatives
- Documents
- Tags
- Comments
- Users (future)
- Organizations (future)

---

## API Versioning

### Current: v1

**Base URL:** `http://localhost:8001/api/v1`

**Endpoints:**
- `/projects/` - CRUD operations
- `/issues/` - Issue management
- `/milestones/` - Milestone tracking
- `/initiatives/` - Initiative management
- `/documents/` - Document management
- `/tags/` - Tag management
- `/comments/` - Comments & threads
- `/graph/` - Knowledge graph queries
- `/ai/` - AI executor
- `/terminal/` - Terminal sessions (will be removed from Plan)

### Future: v2 (Breaking Changes)

When we need breaking changes:
- New path: `/api/v2/`
- Support v1 for 6-12 months
- Clients specify version in request
- Deprecation warnings in v1 responses

---

## Testing Strategy

### turboCore (Backend)

**Unit Tests:**
```bash
cd turboCore
pytest tests/unit/
```

**Integration Tests:**
```bash
pytest tests/integration/
```

**API Tests:**
```bash
pytest tests/api/
```

**Coverage Target:** >80%

### turboPlan (Web UI)

**Component Tests:**
```bash
cd turboPlan/frontend
npm test
```

**E2E Tests:**
```bash
npm run test:e2e
```

**Visual Regression:**
```bash
npm run test:visual
```

**Coverage Target:** >70%

### turboBuild (Desktop IDE)

**Extension Tests:**
```bash
cd turboBuild
npm test
```

**Integration Tests:**
```bash
npm run test:integration
```

**Manual QA:** Required for desktop app

---

## Repository Structure Details

### turboCore Structure

```
turboCore/
├── turbo/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   └── endpoints/
│   │   │       ├── projects.py
│   │   │       ├── issues.py
│   │   │       ├── documents.py
│   │   │       └── ...
│   │   └── dependencies.py
│   ├── core/
│   │   ├── database/           # DB connection, session
│   │   ├── models/             # SQLAlchemy models
│   │   ├── repositories/       # Data access layer
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic
│   ├── cli/                    # CLI commands
│   └── utils/                  # Config, exceptions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── alembic/                    # DB migrations
├── scripts/
├── docker-compose.yml
├── pyproject.toml
├── pytest.ini
├── .env.example
└── README.md
```

### turboPlan Structure

```
turboPlan/
├── frontend/
│   ├── app/                    # Next.js 15 app router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   ├── issues/
│   │   ├── calendar/
│   │   ├── work/
│   │   └── ...
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── issues/
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── utils.ts
│   │   └── hooks.ts
│   ├── public/
│   ├── styles/
│   ├── .env.local
│   ├── .env.example
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── docs/
└── README.md
```

### turboBuild Structure

```
turboBuild/
├── src/
│   ├── extension/
│   │   ├── extension.ts        # Main extension entry
│   │   ├── turboSidebar.ts     # Sidebar tree view
│   │   ├── apiClient.ts        # API client for Turbo Core
│   │   ├── commands/           # VS Code commands
│   │   │   ├── createIssue.ts
│   │   │   ├── updateStatus.ts
│   │   │   └── searchIssues.ts
│   │   ├── providers/          # Tree/content providers
│   │   └── utils/
│   ├── client/                 # Language client (optional)
│   └── common/                 # Shared types/utils
├── resources/
│   ├── icons/
│   │   ├── turbo-logo.png
│   │   └── ...
│   └── splash/
├── scripts/
│   ├── build.sh
│   └── package.sh
├── package.json
├── tsconfig.json
├── .vscodeignore
└── README.md
```

---

## Environment Variables

### turboCore

**File:** `.env`
```bash
# Database
DATABASE_URL=postgresql+asyncpg://turbo:turbo_password@postgres:5432/turbo

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=turbo_graph_password

# Redis
REDIS_URL=redis://redis:6379/0

# Ollama
OLLAMA_BASE_URL=http://ollama:11434

# API
API_HOST=0.0.0.0
API_PORT=8000
TURBO_ENVIRONMENT=development
TURBO_DEBUG=true

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3000,vscode://turbobuild

# Claude Integration (optional)
CLAUDE_AUTO_RESPOND=false
CLAUDE_WEBHOOK_URL=http://host.docker.internal:9000/webhook/comment
```

### turboPlan

**File:** `frontend/.env.local`
```bash
# Turbo Core API
NEXT_PUBLIC_API_URL=http://localhost:8001

# Environment
NODE_ENV=development

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Optional: Sentry
SENTRY_DSN=
```

### turboBuild

**File:** User settings in VS Code
```json
{
  "turbo.apiUrl": "http://localhost:8001",
  "turbo.autoConnect": true,
  "turbo.enableAI": true,
  "turbo.ollamaModel": "qwen2.5:7b"
}
```

---

## Git Workflow

### Branch Strategy

**turboCore:**
```
main              (production)
├── develop       (integration)
├── feature/*     (new features)
├── bugfix/*      (bug fixes)
└── release/*     (release prep)
```

**turboPlan:**
```
main              (production)
├── develop       (integration)
├── feature/*     (new features)
└── bugfix/*      (bug fixes)
```

**turboBuild:**
```
main              (production)
├── develop       (integration)
├── feature/*     (new features)
└── bugfix/*      (bug fixes)
```

### Commit Convention

Use conventional commits:
```
feat: Add issue search command
fix: Resolve sidebar refresh bug
docs: Update API documentation
chore: Update dependencies
test: Add unit tests for projects endpoint
```

---

## CI/CD Pipeline

### turboCore

**GitHub Actions:**
```yaml
# .github/workflows/test.yml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          docker-compose up -d postgres neo4j redis
          pytest
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### turboPlan

**Vercel (or similar):**
- Auto-deploy on push to `main`
- Preview deployments for PRs
- Environment variables from Vercel dashboard

### turboBuild

**Release workflow:**
```yaml
# .github/workflows/release.yml
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - name: Build installer
        run: npm run package
      - name: Upload release assets
        uses: actions/upload-release-asset@v1
```

---

## Security Considerations

### API Authentication (Future)

**Current:** No authentication (local development)

**Planned:**
- JWT tokens for API access
- User registration/login
- RBAC (Role-Based Access Control)
- API keys for third-party integrations

### CORS Configuration

**turboCore must allow:**
- `http://localhost:3001` (turboPlan dev)
- `https://plan.turbo.dev` (turboPlan prod)
- `vscode://turbobuild` (turboBuild)

**File:** `turbo/main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://localhost:3000",
        "https://plan.turbo.dev",
        "vscode://turbobuild",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Secrets Management

**Development:** `.env` files (gitignored)

**Production:**
- Environment variables in deployment platform
- AWS Secrets Manager / HashiCorp Vault
- Never commit secrets to git

---

## Documentation Updates

### After Split

**Update these docs:**
1. `turboCore/README.md` - Backend setup
2. `turboPlan/README.md` - Web UI setup
3. `turboBuild/README.md` - IDE setup
4. `turboCore/docs/API_SPECIFICATION.md` - API reference
5. All CLAUDE.md files - Update paths

**Create new docs:**
1. `ARCHITECTURE.md` - Overall architecture (this file)
2. `DEVELOPMENT.md` - Development workflow
3. `DEPLOYMENT.md` - Production deployment
4. `CONTRIBUTING.md` - Contribution guidelines

---

## Success Criteria

### turboCore
- ✅ All tests passing
- ✅ API accessible on localhost:8001
- ✅ Docker Compose runs all services
- ✅ No frontend code in repository
- ✅ Documentation complete

### turboPlan
- ✅ All tests passing
- ✅ UI running on localhost:3001
- ✅ Connects to turboCore API
- ✅ All features working
- ✅ No backend code in repository
- ✅ Documentation complete

### turboBuild
- ✅ Desktop app launches
- ✅ Sidebar shows projects/issues
- ✅ Commands work
- ✅ Connects to turboCore API
- ✅ AI features functional
- ✅ Installers for Mac/Windows/Linux

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: turboCore** | 2-3 hours | Backend API extracted, running independently |
| **Phase 2: turboPlan** | 1-2 hours | Frontend-only, connects to turboCore |
| **Phase 3: turboBuild** | 8-12 weeks | Desktop IDE with AI features |

**Total Time to Full Architecture:** ~3 months

**MVP (Core + Plan):** ~3-4 hours (can be done in single afternoon)

---

## Next Steps

1. **Immediate (Next Session):**
   - [ ] Create turboCore repository
   - [ ] Extract backend from turboCode
   - [ ] Test API independently
   - [ ] Update documentation

2. **Same Day:**
   - [ ] Rename turboCode → turboPlan
   - [ ] Remove backend from turboPlan
   - [ ] Update frontend to use turboCore
   - [ ] Test full stack (Core + Plan)

3. **Week 1-2:**
   - [ ] Choose turboBuild approach
   - [ ] Create turboBuild repository
   - [ ] Set up basic extension structure

4. **Month 1-3:**
   - [ ] Build turboBuild features incrementally
   - [ ] Enhance turboPlan features
   - [ ] Maintain turboCore API

---

## Questions & Decisions

### Open Questions

1. **turboBuild approach:** Fork, wrapper, or extension bundle?
   - **Recommendation:** Start with extension bundle for MVP

2. **Monorepo vs separate repos?**
   - **Decision:** Separate repos for independence

3. **Deployment strategy for turboCore?**
   - **Options:** Railway, Render, AWS ECS, Kubernetes
   - **Recommendation:** Start with Railway for simplicity

4. **Authentication timing?**
   - **Recommendation:** Add after turboBuild MVP

### Decisions Made

✅ Three separate products: Core, Plan, Build
✅ Shared backend (turboCore API)
✅ Independent versioning
✅ Separate git repositories
✅ Docker Compose for local development

---

## Resources & Links

### Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Electron Docs](https://www.electronjs.org/docs)

### Inspiration
- [Cursor](https://cursor.sh/) - AI code editor (VS Code fork)
- [Windsurf](https://codeium.com/windsurf) - AI IDE
- [Linear](https://linear.app/) - Project management
- [Notion](https://notion.so/) - Knowledge management

### GitHub Examples
- [VS Code](https://github.com/microsoft/vscode)
- [Theia IDE](https://github.com/eclipse-theia/theia)
- [Code Server](https://github.com/coder/code-server)

---

## Appendix: Migration Checklist

### Pre-Migration
- [ ] Back up current turboCode repository
- [ ] Export database (if contains important data)
- [ ] Document current working features
- [ ] List all environment variables

### During Migration
- [ ] Create turboCore repo
- [ ] Copy backend files
- [ ] Test turboCore independently
- [ ] Rename turboCode → turboPlan
- [ ] Remove backend from turboPlan
- [ ] Update frontend API client
- [ ] Test full stack together

### Post-Migration
- [ ] Update all documentation
- [ ] Update git remotes (if using GitHub)
- [ ] Notify collaborators (if any)
- [ ] Archive old turboCode (don't delete)

### Validation
- [ ] All tests pass in turboCore
- [ ] All tests pass in turboPlan
- [ ] API accessible from turboPlan
- [ ] Docker Compose works
- [ ] Development workflow functional
- [ ] No broken imports or paths

---

## Contact & Support

**Questions during migration?**
- Check this document first
- Review README in each repo
- Check API docs at http://localhost:8001/docs

**After migration:**
- turboCore: Backend/API issues
- turboPlan: Web UI issues
- turboBuild: IDE issues (once created)

---

**Last Updated:** 2025-01-14
**Status:** Planning Phase
**Next Action:** Create turboCore repository