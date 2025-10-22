---
doc_type: other
project_name: Turbo Code Platform
title: The Ultimate Guide to Subagents & Skills in Turbo
version: '1.0'
---

# The Ultimate Guide to Subagents & Skills in Turbo
## Supercharging Your Development Workflow with AI

---

## Table of Contents

1. [Vision: The AI-Augmented Development Platform](#vision)
2. [Turbo Platform Primer](#turbo-primer)
3. [Subagents for Turbo Workflows](#turbo-subagents)
4. [Skills for Turbo Operations](#turbo-skills)
5. [Advanced Integration Patterns](#integration-patterns)
6. [Real-World Scenarios](#scenarios)
7. [The Turbo Agent Ecosystem](#ecosystem)
8. [Future Possibilities](#future)
9. [Implementation Roadmap](#roadmap)

---

<a name="vision"></a>
## 1. Vision: The AI-Augmented Development Platform

Imagine a development platform where:

- **AI Project Managers** autonomously triage issues, update statuses, and identify bottlenecks
- **AI Code Reviewers** analyze your commits, suggest improvements, and update issue progress
- **AI Documentation Writers** generate docs from your code and keep them synchronized
- **AI Sprint Planners** organize milestones, predict completion dates, and optimize resource allocation
- **AI Knowledge Curators** digest literature, extract insights, and link them to relevant projects
- **AI Mentors** provide context-aware guidance based on your entire project history

This is Turbo with Subagents and Skills - a platform where AI agents work alongside you, handling cognitive overhead while you focus on creative problem-solving.

---

<a name="turbo-primer"></a>
## 2. Turbo Platform Primer

### Core Entities

**Organizational:**
- **Projects** - Top-level containers with status, priority, completion tracking
- **Issues** - Granular tasks (feature, bug, task, enhancement, documentation, discovery)
- **Milestones** - Time/release-based groupings with due dates
- **Initiatives** - Feature/technology-based groupings
- **Tags** - Cross-cutting categorization

**Knowledge:**
- **Documents** - Specifications, guides, API docs, designs
- **Literature** - Articles, podcasts, books, research papers
- **Mentors** - AI personas with workspace-specific context
- **Blueprints** - Architecture patterns, coding standards, templates

**Intelligence:**
- **Knowledge Graph** - Semantic relationships via vector embeddings
- **Comments** - Threaded discussions on any entity
- **Dependencies** - Issue blocking relationships
- **Forms** - Structured data collection

### MCP Integration

All operations available via MCP tools:
- `mcp__turbo__*` - 80+ tools for CRUD, search, relationships
- Real-time updates via webhook system
- Semantic search across all entities
- AI-powered issue refinement

---

<a name="turbo-subagents"></a>
## 3. Subagents for Turbo Workflows

### 3.1 Project Management Subagents

#### 🎯 **Sprint Planner**

```markdown
---
name: turbo-sprint-planner
description: Use PROACTIVELY for sprint planning, milestone organization, and capacity planning
tools: mcp__turbo__list_issues, mcp__turbo__list_milestones, mcp__turbo__create_milestone, mcp__turbo__link_issue_to_milestone, mcp__turbo__update_issue
model: sonnet
---

You are an expert Agile sprint planner for Turbo projects.

**Responsibilities:**
1. Analyze project backlog and current sprint status
2. Identify unassigned high-priority issues
3. Create/update milestones for upcoming sprints
4. Balance workload across team capacity
5. Flag blocking dependencies
6. Suggest sprint goals and acceptance criteria

**Process:**
1. List all open issues with priorities and estimates
2. Review existing milestones and their progress
3. Identify issues ready for next sprint
4. Create new milestone if needed
5. Link issues to appropriate milestones
6. Update issue priorities based on dependencies
7. Generate sprint summary with goals and risks

**Output Format:**
- Sprint goals (3-5 key objectives)
- Issue assignments to milestones
- Dependency warnings
- Capacity recommendations
- Risk assessment
```

**Usage:**
```
"Plan the next sprint for the API Gateway project"
"Organize issues for the Q1 2026 release milestone"
```

---

#### 📊 **Issue Triage Agent**

```markdown
---
name: turbo-issue-triager
description: Use PROACTIVELY for issue triage, prioritization, and assignment
tools: mcp__turbo__list_issues, mcp__turbo__update_issue, mcp__turbo__add_tag_to_entity, mcp__turbo__add_blocker, mcp__turbo__add_comment
model: sonnet
---

Expert issue triage specialist for Turbo.

**Responsibilities:**
1. Analyze new and open issues
2. Assign appropriate priority levels
3. Add relevant tags for categorization
4. Identify and link blocking dependencies
5. Suggest assignees based on expertise
6. Add triage comments with reasoning

**Triage Criteria:**
- **Critical**: Security, data loss, production outages
- **High**: Major features, significant bugs, blocking issues
- **Medium**: Standard features, minor bugs, improvements
- **Low**: Nice-to-haves, documentation, refactoring

**Tag Strategy:**
- Technical: `backend`, `frontend`, `database`, `api`, `infrastructure`
- Functional: `auth`, `payments`, `notifications`, `analytics`
- Status: `needs-info`, `blocked`, `ready`, `in-review`

**Process:**
1. Get all issues with status "open" and no priority
2. Analyze each issue's description and context
3. Assign priority based on impact and urgency
4. Add relevant tags
5. Check for blocking dependencies
6. Add triage comment explaining decisions
```

**Usage:**
```
"Triage all unprocessed issues in the mobile app project"
"Review and prioritize issues tagged with 'needs-triage'"
```

---

#### 🔄 **Status Sync Agent**

```markdown
---
name: turbo-status-sync
description: Use PROACTIVELY to sync issue statuses with actual code changes
tools: Bash, mcp__turbo__list_issues, mcp__turbo__update_issue, mcp__turbo__add_comment, Grep, Read
model: sonnet
---

Automated status synchronization between git and Turbo issues.

**Responsibilities:**
1. Monitor recent git commits
2. Extract issue references from commit messages
3. Update issue statuses based on branch activity
4. Add progress comments to issues
5. Detect completed work and suggest closure
6. Identify stale issues with no activity

**Detection Patterns:**
- `feat: description (#123)` → Link to issue #123
- Branch `feature/issue-123` → Link to issue #123
- Merged PR → Move issue to "review" or "testing"
- Main branch commit → Consider "closed"

**Sync Rules:**
- Active branch → "in_progress"
- PR opened → "review"
- PR merged → "testing"
- 30+ days no activity → Flag as stale

**Process:**
1. Run `git log --since="7 days ago" --oneline`
2. Extract issue IDs from commit messages and branches
3. Get current status for each referenced issue
4. Update status based on git activity
5. Add comment with commit references
6. Generate sync report
```

**Usage:**
```
"Sync issue statuses with git commits from the past week"
"Update all issues based on merged pull requests"
```

---

### 3.2 Code Intelligence Subagents

#### 🔍 **Code-to-Issue Linker**

```markdown
---
name: turbo-code-linker
description: Use PROACTIVELY to link code changes to Turbo issues and update documentation
tools: Bash, Grep, Read, mcp__turbo__list_issues, mcp__turbo__search_knowledge_graph, mcp__turbo__add_comment, mcp__turbo__update_issue
model: sonnet
---

Intelligent code-to-issue linking and documentation updater.

**Responsibilities:**
1. Analyze code changes in current branch
2. Use semantic search to find related issues
3. Link commits to relevant issues via comments
4. Update issue descriptions with technical details
5. Suggest new issues for undocumented work
6. Generate change impact analysis

**Linking Strategy:**
- Exact match: Issue ID in commit/branch name
- Semantic match: Code changes match issue description (>0.8 similarity)
- File-based: Changes to files mentioned in issue
- Dependency: Changes affect issue dependencies

**Process:**
1. Get current branch and recent commits
2. Identify modified files and changes
3. Search knowledge graph for semantically related issues
4. Add comments linking commits to issues
5. Update issue descriptions with technical implementation notes
6. Flag issues that may need status updates
7. Suggest new issues for uncovered work
```

**Usage:**
```
"Link my recent code changes to relevant Turbo issues"
"Find all issues related to the authentication refactor"
```

---

#### 📚 **Documentation Sync Agent**

```markdown
---
name: turbo-doc-sync
description: Use PROACTIVELY to keep documentation synchronized with code and issues
tools: Read, Write, Edit, Glob, mcp__turbo__list_documents, mcp__turbo__update_document, mcp__turbo__search_knowledge_graph, mcp__turbo__list_issues
model: sonnet
---

Automated documentation synchronization specialist.

**Responsibilities:**
1. Monitor code changes affecting documented APIs/features
2. Update relevant Turbo documents automatically
3. Create documentation for new features
4. Link documents to related issues and projects
5. Detect documentation drift and gaps
6. Generate API documentation from code

**Sync Triggers:**
- API endpoint changes → Update API docs
- Schema changes → Update data model docs
- Configuration changes → Update setup guides
- Issue closed → Update feature documentation
- New feature → Create user guide

**Documentation Types:**
- API documentation from FastAPI/OpenAPI
- User guides from feature issues
- Architecture docs from blueprints
- Changelog from closed issues

**Process:**
1. Detect code changes via git diff
2. Identify affected documentation
3. Search for related Turbo documents
4. Update documents with changes
5. Add comments linking docs to issues
6. Flag missing documentation
7. Generate new docs for undocumented features
```

**Usage:**
```
"Update all API documentation based on recent endpoint changes"
"Sync user guides with closed feature issues from last sprint"
```

---

### 3.3 Knowledge Management Subagents

#### 📖 **Literature Curator**

```markdown
---
name: turbo-literature-curator
description: Use PROACTIVELY for managing and extracting insights from saved literature
tools: mcp__turbo__list_literature, mcp__turbo__get_literature, mcp__turbo__update_literature, mcp__turbo__search_knowledge_graph, mcp__turbo__create_issue, mcp__turbo__add_comment
model: sonnet
---

AI-powered literature curation and insight extraction.

**Responsibilities:**
1. Review unread literature items
2. Extract key insights and actionable takeaways
3. Link literature to relevant projects/issues
4. Create discovery issues for promising ideas
5. Tag literature by topic and relevance
6. Generate weekly literature digests

**Curation Process:**
1. Get unread literature items
2. Analyze content for relevance to active projects
3. Extract technical insights, best practices, patterns
4. Search knowledge graph for related issues/projects
5. Add comments linking literature to relevant entities
6. Create discovery issues for ideas worth exploring
7. Update literature with tags and progress

**Insight Categories:**
- Best practices applicable to current projects
- New technologies/tools worth evaluating
- Architecture patterns for active initiatives
- Security considerations for ongoing work
- Performance optimization techniques

**Output:**
- Literature summary with key points
- Links to related projects/issues
- Discovery issues for exploration
- Reading recommendations
```

**Usage:**
```
"Review unread articles and extract insights for the API Gateway project"
"Find literature related to microservices architecture"
```

---

#### 🧠 **Knowledge Graph Explorer**

```markdown
---
name: turbo-knowledge-explorer
description: Use PROACTIVELY to discover hidden connections and insights across projects
tools: mcp__turbo__search_knowledge_graph, mcp__turbo__get_related_entities, mcp__turbo__list_issues, mcp__turbo__list_documents, mcp__turbo__add_comment
model: sonnet
---

Advanced knowledge graph analysis and insight discovery.

**Responsibilities:**
1. Map semantic relationships across all entities
2. Identify patterns and clusters
3. Discover hidden dependencies
4. Suggest cross-project learnings
5. Find duplicate or related work
6. Generate insight reports

**Analysis Types:**
- **Cluster Analysis**: Group related issues/projects
- **Pattern Detection**: Identify recurring themes
- **Dependency Mapping**: Visualize entity relationships
- **Duplicate Detection**: Find similar issues/documents
- **Gap Analysis**: Identify missing connections

**Discovery Queries:**
- "What issues are semantically similar to X?"
- "What projects share common patterns?"
- "What documents relate to initiative Y?"
- "What literature applies to project Z?"

**Process:**
1. Run semantic search across entity types
2. Get related entities for key items
3. Build relationship map
4. Identify clusters and patterns
5. Generate insights and recommendations
6. Add discovery comments to relevant entities
```

**Usage:**
```
"Explore knowledge graph for patterns in authentication issues"
"Find all entities related to 'performance optimization'"
```

---

### 3.4 AI Mentor Subagents

#### 🎓 **Mentor Orchestrator**

```markdown
---
name: turbo-mentor-orchestrator
description: Use PROACTIVELY to manage mentor conversations and provide contextual guidance
tools: mcp__turbo__get_mentor, mcp__turbo__get_mentor_messages, mcp__turbo__add_mentor_message, mcp__turbo__search_knowledge_graph, mcp__turbo__list_issues, mcp__turbo__get_project
model: sonnet
---

Intelligent mentor conversation management and context enrichment.

**Responsibilities:**
1. Route user questions to appropriate mentors
2. Build rich context from project history
3. Generate mentor responses with full awareness
4. Synthesize insights from multiple mentors
5. Track conversation threads
6. Provide actionable guidance

**Context Building:**
1. Identify user's current project/workspace
2. Get recent issues and their status
3. Search knowledge graph for relevant history
4. Pull related documents and literature
5. Review past mentor conversations
6. Compile comprehensive context

**Mentor Personas:**
- **Technical Architect**: System design, patterns, architecture
- **Code Reviewer**: Code quality, best practices, refactoring
- **Product Manager**: Features, priorities, roadmap
- **DevOps Engineer**: Infrastructure, deployment, monitoring
- **Security Expert**: Vulnerabilities, compliance, hardening

**Process:**
1. Analyze user's question/request
2. Determine best mentor persona
3. Build context from Turbo entities
4. Generate response as mentor
5. Add message to conversation history
6. Suggest follow-up actions or issues
```

**Usage:**
```
"Ask the Technical Architect about microservices patterns"
"Get DevOps mentor's advice on deployment strategy"
```

---

### 3.5 Automation & Intelligence Subagents

#### ⚡ **Issue Refinement Orchestrator**

```markdown
---
name: turbo-issue-refiner
description: Use PROACTIVELY to analyze and refine issues automatically
tools: mcp__turbo__refine_issues_analyze, mcp__turbo__refine_issues_execute, mcp__turbo__list_issues, mcp__turbo__update_issue, mcp__turbo__add_comment
model: sonnet
---

AI-powered issue analysis and refinement automation.

**Responsibilities:**
1. Analyze all project issues for problems
2. Detect stale issues (30+ days no activity)
3. Identify missing dependencies
4. Find orphaned discovery issues
5. Suggest templates for incomplete issues
6. Execute safe refinements automatically
7. Present risky refinements for approval

**Analysis Categories:**
- **Stale Issues**: No activity, outdated, needs closure
- **Dependency Gaps**: Missing blockers, circular deps
- **Orphaned Items**: Discovery issues not linked to projects
- **Template Gaps**: Missing critical information
- **Tag Inconsistencies**: Improper categorization

**Execution Modes:**
- **Safe (Auto-execute)**: Add tags, apply templates, update descriptions
- **Approval Needed**: Status changes, dependency additions, closures

**Process:**
1. Run `refine_issues_analyze` for project
2. Review SAFE changes (tags, templates)
3. Execute safe changes automatically
4. Review APPROVAL_NEEDED changes (status, deps)
5. Present to user with recommendations
6. Execute approved changes
7. Add comments documenting refinements
```

**Usage:**
```
"Refine all issues in the mobile app project"
"Analyze and fix stale issues across all active projects"
```

---

#### 🔗 **Dependency Mapper**

```markdown
---
name: turbo-dependency-mapper
description: Use PROACTIVELY to map and manage issue dependencies
tools: mcp__turbo__list_issues, mcp__turbo__add_blocker, mcp__turbo__remove_blocker, mcp__turbo__get_blocking_issues, mcp__turbo__get_blocked_issues, Glob, Grep
model: sonnet
---

Intelligent dependency detection and management.

**Responsibilities:**
1. Analyze code and issues for dependencies
2. Detect implicit blocking relationships
3. Create dependency links automatically
4. Identify circular dependencies
5. Suggest optimal work order
6. Visualize dependency graphs

**Detection Strategies:**
- **Keyword Analysis**: "depends on", "blocked by", "requires"
- **File Dependencies**: Issues modifying same files
- **Semantic Analysis**: Related functionality patterns
- **Code Imports**: Module dependency mapping
- **Database Schema**: Table relationship dependencies

**Dependency Types:**
- **Hard Block**: Must complete first (e.g., API before UI)
- **Soft Block**: Better if done first (e.g., refactor before feature)
- **Circular**: Mutually dependent (requires resolution)
- **Phantom**: Outdated dependency (should remove)

**Process:**
1. Get all open issues for project
2. Analyze descriptions for dependency keywords
3. Search code for file/module dependencies
4. Run semantic similarity on issue pairs
5. Add blocker relationships where detected
6. Identify circular dependencies
7. Generate dependency graph visualization
8. Suggest optimal work sequence
```

**Usage:**
```
"Map dependencies for all backend issues"
"Find and visualize the critical path for v2.0 release"
```

---

<a name="turbo-skills"></a>
## 4. Skills for Turbo Operations

### 4.1 Turbo Core Skills

#### 🎯 **Turbo Project Manager Skill**

```
turbo-project-manager/
├── SKILL.md
├── resources/
│   ├── project-templates.json
│   ├── priority-matrix.json
│   └── status-workflows.json
├── scripts/
│   ├── create-project.py
│   ├── update-milestones.py
│   └── generate-reports.py
└── templates/
    ├── sprint-plan.md
    ├── project-charter.md
    └── status-report.md
```

**SKILL.md:**
```markdown
# Turbo Project Manager Skill

## Description
Complete project management capabilities for Turbo platform including project creation, milestone management, sprint planning, and reporting.

## When to Use
- Creating new projects with best-practice structure
- Planning sprints and organizing milestones
- Generating project status reports
- Managing project lifecycles
- Capacity planning and resource allocation

## Capabilities

### Project Creation
- Initialize projects with templates
- Set up milestones and initiatives
- Create starter issues and tags
- Configure project settings
- Link related documents

### Sprint Planning
- Analyze backlog and capacity
- Create milestone structure
- Assign issues to sprints
- Balance workload
- Generate sprint goals

### Reporting
- Project status dashboards
- Sprint burndown reports
- Velocity tracking
- Risk assessments
- Completion forecasts

## MCP Tools Used
- mcp__turbo__list_projects
- mcp__turbo__create_project (future)
- mcp__turbo__update_project
- mcp__turbo__create_milestone
- mcp__turbo__link_issue_to_milestone
- mcp__turbo__list_issues

## Resources

### project-templates.json
```json
{
  "web-app": {
    "milestones": ["MVP", "Beta", "V1.0"],
    "initiatives": ["Frontend", "Backend", "DevOps"],
    "tags": ["frontend", "backend", "database", "api", "ui/ux"],
    "initial_issues": [
      {"title": "Setup project structure", "type": "task", "priority": "high"},
      {"title": "Configure CI/CD", "type": "task", "priority": "high"},
      {"title": "Design system architecture", "type": "discovery", "priority": "high"}
    ]
  },
  "api-service": {
    "milestones": ["Alpha", "Beta", "V1.0"],
    "initiatives": ["Core API", "Auth", "Documentation"],
    "tags": ["api", "auth", "docs", "testing"],
    "initial_issues": [
      {"title": "Design API schema", "type": "discovery", "priority": "critical"},
      {"title": "Implement authentication", "type": "feature", "priority": "high"},
      {"title": "Setup API documentation", "type": "documentation", "priority": "medium"}
    ]
  }
}
```

### priority-matrix.json
```json
{
  "criteria": {
    "impact": {
      "critical": ["data loss", "security breach", "production outage"],
      "high": ["major feature", "performance degradation", "user experience"],
      "medium": ["minor feature", "optimization", "improvement"],
      "low": ["nice-to-have", "cleanup", "documentation"]
    },
    "urgency": {
      "immediate": ["blocking", "deadline today", "critical bug"],
      "soon": ["deadline this week", "high priority"],
      "normal": ["deadline this sprint", "planned work"],
      "low": ["backlog", "future consideration"]
    }
  },
  "matrix": {
    "critical-immediate": "critical",
    "critical-soon": "critical",
    "high-immediate": "critical",
    "high-soon": "high",
    "medium-immediate": "high",
    "medium-soon": "medium",
    "low-immediate": "medium",
    "low-soon": "low"
  }
}
```

## Usage Examples

### Create a New Web App Project
```python
# Load skill
skill = load_skill("turbo-project-manager")

# Create project with template
project = skill.create_project(
    name="E-commerce Platform",
    template="web-app",
    workspace="work"
)

# Output:
# - Project created with proper structure
# - Milestones: MVP, Beta, V1.0
# - Initiatives: Frontend, Backend, DevOps
# - Initial issues created and tagged
```

### Plan Next Sprint
```python
# Analyze backlog
sprint_plan = skill.plan_sprint(
    project_id="project-uuid",
    sprint_name="Sprint 12",
    capacity_points=40,
    start_date="2026-01-13",
    end_date="2026-01-27"
)

# Output:
# - Milestone created for Sprint 12
# - Issues assigned based on priority and capacity
# - Dependencies mapped
# - Sprint goals generated
# - Risk assessment provided
```

### Generate Status Report
```python
# Weekly status report
report = skill.generate_report(
    project_id="project-uuid",
    report_type="weekly_status",
    include_metrics=True
)

# Output: Markdown report with:
# - Sprint progress (burndown)
# - Completed vs planned issues
# - Blocked issues
# - Upcoming milestones
# - Risk flags
# - Velocity trends
```
```

---

#### 🔍 **Turbo Knowledge Graph Skill**

```
turbo-knowledge-graph/
├── SKILL.md
├── resources/
│   ├── query-templates.json
│   └── relationship-types.json
├── scripts/
│   ├── semantic-search.py
│   ├── build-graph.py
│   └── visualize-graph.py
└── examples/
    └── sample-queries.md
```

**Key Capabilities:**
- Semantic search across all entities
- Relationship discovery and mapping
- Pattern detection and clustering
- Insight generation from connections
- Graph visualization (mermaid diagrams)
- Duplicate detection
- Gap analysis

**Example Queries:**
```python
# Find all entities related to authentication
results = kg_skill.search("authentication security patterns")

# Discover hidden connections
connections = kg_skill.find_connections(
    entity_id="issue-uuid",
    max_depth=3,
    min_relevance=0.7
)

# Detect duplicates
duplicates = kg_skill.find_duplicates(
    entity_type="issue",
    similarity_threshold=0.85
)

# Generate insight report
insights = kg_skill.analyze_patterns(
    project_id="project-uuid",
    pattern_types=["recurring_bugs", "common_blockers", "skill_gaps"]
)
```

---

#### 📊 **Turbo Analytics Skill**

```
turbo-analytics/
├── SKILL.md
├── resources/
│   ├── metric-definitions.json
│   └── chart-templates.json
├── scripts/
│   ├── calculate-metrics.py
│   ├── generate-charts.py
│   └── forecast-completion.py
└── dashboards/
    ├── project-health.json
    ├── team-velocity.json
    └── issue-trends.json
```

**Metrics Tracked:**
- **Velocity**: Story points completed per sprint
- **Lead Time**: Idea to completion duration
- **Cycle Time**: Start to finish duration
- **Throughput**: Issues completed per time period
- **WIP Limits**: Work in progress tracking
- **Blocker Impact**: Time lost to blockers
- **Quality Metrics**: Bug rate, rework percentage

**Dashboards:**
- Project health overview
- Sprint burndown/burnup
- Cumulative flow diagram
- Team velocity trends
- Issue type distribution
- Priority breakdown
- Completion forecasts

---

#### 🤖 **Turbo Automation Skill**

```
turbo-automation/
├── SKILL.md
├── resources/
│   ├── automation-rules.json
│   └── webhook-configs.json
├── scripts/
│   ├── auto-triage.py
│   ├── status-sync.py
│   ├── notification-sender.py
│   └── scheduled-tasks.py
└── workflows/
    ├── issue-lifecycle.json
    ├── pr-to-issue-sync.json
    └── stale-issue-cleanup.json
```

**Automation Workflows:**

1. **Issue Lifecycle Automation**
   - New issue → Auto-triage → Add tags → Assign priority
   - In progress → Track time → Update estimates
   - Review → Run checks → Update status
   - Closed → Update docs → Archive → Notify

2. **PR-to-Issue Sync**
   - PR opened → Update issue to "review"
   - PR merged → Update issue to "testing"
   - Deploy successful → Update issue to "closed"
   - Add commit links to issue comments

3. **Stale Issue Management**
   - 30 days no activity → Tag "stale"
   - 45 days → Comment asking for update
   - 60 days → Suggest closure
   - 90 days → Auto-close with comment

4. **Notification Rules**
   - Critical issue created → Notify team
   - Blocker added → Notify affected issues
   - Milestone at risk → Notify project lead
   - Sprint complete → Generate report

---

### 4.2 Developer Workflow Skills

#### 💻 **Turbo Code Review Skill**

```
turbo-code-review/
├── SKILL.md
├── resources/
│   ├── review-checklist.json
│   ├── coding-standards.md
│   └── security-patterns.json
├── scripts/
│   ├── review-changes.py
│   ├── link-to-issues.py
│   └── update-issue-status.py
└── templates/
    └── review-comment.md
```

**Review Process:**
1. Analyze git diff for current branch
2. Check against coding standards
3. Identify security issues
4. Find related Turbo issues via semantic search
5. Update issue status based on changes
6. Add review comments to issues
7. Suggest improvements and links

**Integration:**
```python
# Review current changes
review = code_review_skill.review_branch(
    branch="feature/auth-refactor",
    link_to_issues=True,
    update_status=True
)

# Output:
# - Code review findings
# - Security issues flagged
# - Related issues updated
# - Comments added to issues
# - Improvement suggestions
```

---

#### 📝 **Turbo Documentation Generator Skill**

```
turbo-doc-generator/
├── SKILL.md
├── resources/
│   ├── doc-templates/
│   │   ├── api-reference.md
│   │   ├── user-guide.md
│   │   ├── architecture.md
│   │   └── changelog.md
│   └── extraction-rules.json
├── scripts/
│   ├── extract-api-docs.py
│   ├── generate-changelog.py
│   ├── create-user-guide.py
│   └── sync-to-turbo.py
└── examples/
    └── generated-docs/
```

**Documentation Types:**

1. **API Documentation**
   - Extract from FastAPI/OpenAPI specs
   - Generate endpoint descriptions
   - Include request/response examples
   - Link to related issues

2. **User Guides**
   - Generate from feature issues
   - Include screenshots (if available)
   - Step-by-step instructions
   - Troubleshooting sections

3. **Architecture Docs**
   - Extract from blueprints
   - Generate diagrams (mermaid)
   - Document patterns and decisions
   - Link to implementation issues

4. **Changelogs**
   - Generate from closed issues
   - Group by type (features, bugs, breaking)
   - Include issue links
   - Format for release notes

**Auto-Sync:**
- Code changes → Update API docs
- Issue closed → Update feature docs
- Blueprint updated → Update architecture docs
- Sprint complete → Generate changelog

---

<a name="integration-patterns"></a>
## 5. Advanced Integration Patterns

### 5.1 Subagent + Skill Combinations

#### Pattern 1: Intelligent Project Bootstrapping

**Subagent:** `turbo-project-initializer`
**Skills:** `turbo-project-manager` + `turbo-doc-generator`

```markdown
---
name: turbo-project-initializer
description: Use PROACTIVELY to bootstrap new projects with complete structure
tools: mcp__turbo__*, Write, Edit
skills: turbo-project-manager, turbo-doc-generator
model: sonnet
---

**Process:**
1. Load `turbo-project-manager` skill
2. Create project with appropriate template
3. Set up milestones and initiatives
4. Create initial issues with proper tagging
5. Load `turbo-doc-generator` skill
6. Generate project README
7. Create architecture documentation
8. Setup contributing guidelines
9. Initialize changelog
10. Link all docs to project in Turbo
```

**Usage:**
```
"Initialize a new microservice project for payment processing"

# Result:
# - Turbo project created with "api-service" template
# - Milestones: Alpha, Beta, V1.0
# - Initiatives: Core API, Auth, Documentation
# - 10+ starter issues created and tagged
# - README.md with project overview
# - docs/architecture.md with system design
# - docs/api-reference.md placeholder
# - CHANGELOG.md initialized
# - All docs linked in Turbo
```

---

#### Pattern 2: Sprint Orchestration & Reporting

**Subagent:** `turbo-sprint-orchestrator`
**Skills:** `turbo-project-manager` + `turbo-analytics` + `turbo-knowledge-graph`

```markdown
---
name: turbo-sprint-orchestrator
description: Use PROACTIVELY for complete sprint management from planning to retrospective
tools: mcp__turbo__*, Bash
skills: turbo-project-manager, turbo-analytics, turbo-knowledge-graph
model: sonnet
---

**Sprint Lifecycle:**

1. **Sprint Planning:**
   - Load `turbo-analytics` for velocity data
   - Load `turbo-project-manager` for backlog analysis
   - Create milestone with optimal capacity
   - Assign issues based on priorities and dependencies

2. **Sprint Execution:**
   - Monitor progress daily
   - Flag blockers immediately
   - Update velocity predictions
   - Sync with git activity

3. **Sprint Review:**
   - Load `turbo-knowledge-graph` for insights
   - Generate completion report
   - Identify patterns and learnings
   - Create retrospective document

4. **Sprint Retrospective:**
   - Analyze what went well
   - Identify improvement areas
   - Create action items as issues
   - Update team processes
```

**Usage:**
```
"Orchestrate Sprint 15 for the API Gateway project"

# Week 1: Planning
# - Analyzed last 3 sprints (avg velocity: 38 points)
# - Created "Sprint 15" milestone (Jan 13-27)
# - Assigned 12 issues (40 points total)
# - Identified 2 blockers, created dependencies

# Week 2: Execution
# - Daily progress: 45% complete
# - 1 blocker resolved
# - Velocity on track: 19/40 points (Day 7)

# Week 3: Review & Retro
# - Completed: 42 points (105% velocity!)
# - Generated insights: API issues cluster together
# - Retrospective: Strong pairing increased velocity
# - Action items: Continue pairing practice
```

---

#### Pattern 3: Code-Driven Issue Management

**Subagent:** `turbo-code-sync-agent`
**Skills:** `turbo-code-review` + `turbo-automation`

```markdown
---
name: turbo-code-sync-agent
description: Use PROACTIVELY to sync code changes with Turbo issues automatically
tools: Bash, Grep, Read, mcp__turbo__*
skills: turbo-code-review, turbo-automation
model: sonnet
---

**Continuous Sync Process:**

1. **On Commit:**
   - Load `turbo-code-review` skill
   - Analyze changes
   - Find related issues via semantic search
   - Add commit links to issue comments
   - Update issue progress estimates

2. **On PR Open:**
   - Load `turbo-automation` skill
   - Update issue status to "review"
   - Add PR link to issue
   - Request reviewers based on file ownership

3. **On PR Merge:**
   - Update issue status to "testing"
   - Add merge commit to issue
   - Check if issue is complete
   - Trigger doc generation if needed

4. **On Deploy:**
   - Update issue status to "closed"
   - Generate changelog entry
   - Update related documentation
   - Notify stakeholders
```

**Trigger:** Git hooks or CI/CD pipeline

```bash
# .git/hooks/post-commit
#!/bin/bash
claude-code run turbo-code-sync-agent --event=commit

# .github/workflows/pr-sync.yml
- name: Sync PR to Turbo
  run: claude-code run turbo-code-sync-agent --event=pr-open
```

---

### 5.2 Knowledge Flow Patterns

#### Pattern 4: Literature-to-Action Pipeline

**Subagent:** `turbo-insight-extractor`
**Skills:** `turbo-knowledge-graph` + `turbo-project-manager`

```markdown
---
name: turbo-insight-extractor
description: Use PROACTIVELY to extract actionable insights from literature
tools: mcp__turbo__list_literature, mcp__turbo__search_knowledge_graph, mcp__turbo__create_issue, mcp__turbo__add_comment
skills: turbo-knowledge-graph, turbo-project-manager
model: sonnet
---

**Insight Extraction Flow:**

1. **Digest Literature:**
   - Get unread articles/papers
   - Extract key technical insights
   - Identify applicable patterns/tools/techniques

2. **Map to Projects:**
   - Load `turbo-knowledge-graph` skill
   - Search for relevant projects/issues
   - Identify application opportunities

3. **Create Action Items:**
   - Load `turbo-project-manager` skill
   - Create discovery issues for promising ideas
   - Link to source literature
   - Assign priority based on impact
   - Tag appropriately

4. **Build Context:**
   - Add comments linking insights to existing work
   - Update related documents
   - Notify relevant team members
```

**Weekly Automation:**
```
"Extract insights from this week's literature"

# Result:
# - 15 articles reviewed
# - 8 applicable insights identified:
#   - "GraphQL federation" → Created discovery issue in API Gateway
#   - "Postgres row-level security" → Linked to auth refactor issue
#   - "React Server Components" → Created spike issue in frontend
#   - "OpenTelemetry tracing" → Added to observability initiative
#   - ... (4 more)
# - All insights linked to source articles
# - Discovery issues prioritized and tagged
```

---

#### Pattern 5: Mentor-Driven Development

**Subagent:** `turbo-mentor-workflow`
**Skills:** `turbo-knowledge-graph` + `turbo-doc-generator`

```markdown
---
name: turbo-mentor-workflow
description: Use PROACTIVELY for mentor-guided development with full context
tools: mcp__turbo__get_mentor, mcp__turbo__add_mentor_message, mcp__turbo__search_knowledge_graph, mcp__turbo__list_issues, Read
skills: turbo-knowledge-graph, turbo-doc-generator
model: sonnet
---

**Context-Rich Mentoring:**

1. **Build Context:**
   - Load `turbo-knowledge-graph` skill
   - Get user's current project and workspace
   - Search for related issues, docs, literature
   - Analyze recent git activity
   - Review past mentor conversations

2. **Generate Response:**
   - Load appropriate mentor persona
   - Synthesize context into guidance
   - Reference specific issues/docs/code
   - Provide actionable recommendations

3. **Create Artifacts:**
   - Load `turbo-doc-generator` skill
   - Generate docs from mentor guidance
   - Create issues for action items
   - Link everything to conversation

4. **Track Learning:**
   - Tag issues with learning topics
   - Build knowledge over time
   - Suggest related literature
   - Identify skill gaps
```

**Example Session:**
```
User: "How should I implement caching for the API?"

Mentor (with full context):
"Based on your API Gateway project (issues #42, #38) and recent work
on rate limiting (commit abc123), I recommend:

1. Redis-based caching (you already have Redis for rate limiting)
2. Cache-aside pattern (see architecture doc section 3.2)
3. TTL strategy based on endpoint type (ref: article XYZ)

I've created issue #89 'Implement API caching layer' with:
- Technical approach from this discussion
- Links to related issues (#42, #38)
- Reference to Redis setup in infrastructure/
- Spike estimate: 5 points

I've also updated docs/architecture.md with caching strategy.

Recommended reading: Article 'Caching Strategies' in your literature."
```

---

<a name="scenarios"></a>
## 6. Real-World Scenarios

### Scenario 1: New Project Inception

**Goal:** Start a new e-commerce platform project from scratch

**Workflow:**

```
1. User: "Initialize a new e-commerce platform project"

2. turbo-project-initializer (subagent):
   - Loads turbo-project-manager skill
   - Creates project: "E-commerce Platform"
   - Template: "web-app"
   - Workspace: "work"

   - Milestones created:
     * MVP (6 weeks out)
     * Beta (12 weeks out)
     * V1.0 (20 weeks out)

   - Initiatives created:
     * Product Catalog
     * Shopping Cart
     * Checkout & Payments
     * User Accounts
     * Admin Dashboard

   - Initial issues created (25 issues):
     * Setup monorepo structure [task, critical]
     * Design system architecture [discovery, critical]
     * Configure CI/CD pipeline [task, high]
     * Setup auth service [feature, high]
     * Design database schema [discovery, high]
     * ... (20 more)

   - Loads turbo-doc-generator skill
   - Generates:
     * README.md with project overview
     * docs/architecture.md with initial design
     * docs/api-reference.md (placeholder)
     * docs/setup-guide.md
     * CONTRIBUTING.md
     * CHANGELOG.md

   - All docs loaded into Turbo and linked to project

3. Output to user:
   "✅ E-commerce Platform project initialized!

   📊 Project Structure:
   - 3 milestones (MVP, Beta, V1.0)
   - 5 initiatives (Catalog, Cart, Checkout, Accounts, Admin)
   - 25 initial issues created and prioritized
   - 6 documentation files generated

   🎯 Next Steps:
   - Review and refine initial issues
   - Start with discovery issues for architecture and schema
   - Run 'Plan Sprint 1' when ready

   📁 View project: http://localhost:3001/projects/{id}"
```

---

### Scenario 2: Sprint Planning Automation

**Goal:** Plan Sprint 8 for the API Gateway project

**Workflow:**

```
1. User: "Plan Sprint 8 for API Gateway project"

2. turbo-sprint-orchestrator (subagent):

   Step 1: Load turbo-analytics skill
   - Analyze last 5 sprints:
     * Sprint 3: 32 points (8 issues)
     * Sprint 4: 28 points (7 issues) - holiday week
     * Sprint 5: 35 points (9 issues)
     * Sprint 6: 38 points (10 issues)
     * Sprint 7: 36 points (9 issues)
   - Average velocity: 34 points
   - Trend: Increasing (+6% over 5 sprints)

   Step 2: Load turbo-project-manager skill
   - Get backlog issues (status: open, no milestone)
   - Found 43 issues:
     * 8 critical priority
     * 15 high priority
     * 20 medium priority

   Step 3: Check dependencies
   - Load turbo-dependency-mapper
   - Identify blocking issues
   - Critical path analysis:
     * Issue #127 blocks #128, #129
     * Issue #134 blocks #135

   Step 4: Create Sprint 8 milestone
   - Dates: Jan 20 - Feb 3 (2 weeks)
   - Target: 36 points (conservative based on velocity)

   Step 5: Select issues for sprint
   - Algorithm: Priority + Dependencies + Points
   - Selected 11 issues (36 points):
     1. #127 - Implement OAuth2 refresh [8 pts, critical, blocks 2]
     2. #134 - Add rate limiting [5 pts, critical, blocks 1]
     3. #142 - GraphQL schema validation [3 pts, high]
     4. #145 - API versioning strategy [5 pts, high, discovery]
     5. #151 - Error handling middleware [3 pts, high]
     6. #128 - Token rotation logic [3 pts, high, blocked by #127]
     7. #135 - Rate limit Redis cache [2 pts, med, blocked by #134]
     8. #159 - Update API docs [2 pts, medium]
     9. #163 - Add request logging [2 pts, medium]
     10. #167 - Health check endpoints [2 pts, low]
     11. #171 - Metrics dashboard [1 pt, low]

   Step 6: Generate sprint plan
   - Sprint goal: "Complete OAuth2 implementation and rate limiting"
   - Week 1 focus: Critical blockers (#127, #134)
   - Week 2 focus: Dependent and medium priority work

   Step 7: Link issues to milestone
   - All 11 issues linked to "Sprint 8"
   - Dependencies mapped
   - Assignees suggested based on past work

3. Output to user:
   "✅ Sprint 8 planned for API Gateway!

   📅 Sprint 8 (Jan 20 - Feb 3)
   🎯 Goal: Complete OAuth2 implementation and rate limiting

   📊 Capacity: 36 points (11 issues)
   Based on velocity: 34 avg (last 5 sprints)

   🔥 Critical Path:
   Week 1: #127 (OAuth2) → #128 (Token rotation)
   Week 1: #134 (Rate limiting) → #135 (Redis cache)

   ⚠️ Risks:
   - OAuth2 refresh is complex (8 pts) - may need pairing
   - Discovery issue #145 (versioning) could expand scope

   💡 Recommendations:
   - Assign #127 to Sarah (OAuth2 expert)
   - Schedule architecture review for #145 (day 3)
   - Pair on rate limiting implementation

   🔗 View Sprint 8: http://localhost:3001/milestones/{id}"
```

---

### Scenario 3: Automated Code Review & Issue Updates

**Goal:** Review PR and update related Turbo issues

**Workflow:**

```
1. Developer: Pushes branch "feature/graphql-subscriptions"
   Opens PR: "Add GraphQL subscriptions support"

2. CI triggers: turbo-code-sync-agent (subagent)

   Step 1: Load turbo-code-review skill
   - Analyze git diff:
     * 8 files changed
     * +342 lines, -89 lines
     * Key files:
       - src/graphql/subscriptions.ts (new)
       - src/graphql/resolvers/subscriptions.ts (new)
       - src/server.ts (modified)
       - src/types/subscription.types.ts (new)

   Step 2: Run code review checks
   - ✅ No security issues
   - ✅ Follows coding standards
   - ⚠️ Missing tests for subscriptions.ts
   - ✅ TypeScript types complete
   - ⚠️ Needs documentation update

   Step 3: Search for related issues
   - Semantic search: "GraphQL subscriptions real-time"
   - Found related issues:
     * #156 - "Add real-time updates" [in_progress]
     * #162 - "Implement WebSocket support" [open]
     * #178 - "GraphQL subscriptions" [in_progress]

   Step 4: Update primary issue #178
   - Status: in_progress → review
   - Add comment:
     "PR #42 ready for review. Implementation complete.

     ✅ Implemented:
     - GraphQL subscription server setup
     - WebSocket connection handling
     - Subscription resolvers and types

     ⚠️ Before merge:
     - Add tests for subscriptions.ts
     - Update API documentation

     Files changed: src/graphql/subscriptions.ts:23-145
     Commits: abc123, def456"

   Step 5: Update related issue #156
   - Add comment linking to #178
   - "Real-time updates enabled via GraphQL subscriptions (PR #42)"

   Step 6: Create follow-up issues
   - Load turbo-automation skill
   - Create issue #189: "Add tests for GraphQL subscriptions"
     * Type: task, Priority: high
     * Blocked by: #178 (must merge first)
     * Assignee: Same as #178

   - Create issue #190: "Document GraphQL subscription API"
     * Type: documentation, Priority: medium
     * Blocked by: #178

   Step 7: Load turbo-doc-generator skill
   - Queue documentation update (will run on merge)

3. Output (posted to PR):
   "🤖 Turbo Code Sync Report

   📋 Related Issues Updated:
   - #178: Moved to 'review' status
   - #156: Linked as related

   ✅ Code Review:
   - Security: PASS
   - Standards: PASS
   - Types: PASS

   ⚠️ Action Items Created:
   - #189: Add tests for subscriptions [high priority]
   - #190: Document subscription API [medium priority]

   📚 On Merge:
   - API docs will auto-update
   - Issues #178, #156 will close automatically
   - Changelog entry will generate

   View in Turbo: http://localhost:3001/issues/178"
```

---

### Scenario 4: Knowledge Extraction from Literature

**Goal:** Extract insights from saved articles and create action items

**Workflow:**

```
1. User: "Review this week's literature and extract insights"

2. turbo-insight-extractor (subagent):

   Step 1: Get unread literature
   - Query: mcp__turbo__list_literature(is_read=False)
   - Found 8 new items:
     * "Modern API Authentication Patterns" (article)
     * "GraphQL Performance Optimization" (article)
     * "Postgres Query Optimization" (article)
     * "Microservices Observability" (podcast)
     * "Event-Driven Architecture" (article)
     * "Redis Caching Strategies" (article)
     * "TypeScript 5.3 Features" (article)
     * "Container Security Best Practices" (article)

   Step 2: Extract insights

   Article 1: "Modern API Authentication Patterns"
   - Key insights:
     * Refresh token rotation prevents token theft
     * Device fingerprinting adds security layer
     * JWT claims should be minimal
   - Applicable to: API Gateway project

   Article 2: "GraphQL Performance Optimization"
   - Key insights:
     * DataLoader pattern prevents N+1 queries
     * Query complexity analysis prevents DoS
     * Persisted queries reduce bandwidth
   - Applicable to: API Gateway project (GraphQL initiative)

   Article 3: "Postgres Query Optimization"
   - Key insights:
     * Partial indexes for status columns
     * JSONB indexes for flexible schemas
     * Connection pooling with PgBouncer
   - Applicable to: All projects using Postgres

   ... (analyze remaining 5 items)

   Step 3: Load turbo-knowledge-graph skill
   - Search for related projects/issues:
     * "authentication" → API Gateway project, Issue #127
     * "GraphQL performance" → API Gateway, Initiative "GraphQL"
     * "Postgres optimization" → E-commerce project, database issues
     * "observability" → All active projects

   Step 4: Load turbo-project-manager skill
   - Create discovery issues for actionable insights:

   Issue #191: "Implement refresh token rotation"
   - Type: discovery, Priority: high
   - Project: API Gateway
   - Description: "Evaluate refresh token rotation pattern to prevent
     token theft attacks. See insights from article 'Modern API
     Authentication Patterns'."
   - Tags: auth, security
   - Linked to: Issue #127 (OAuth2), Literature item #45

   Issue #192: "Add DataLoader for GraphQL N+1 prevention"
   - Type: enhancement, Priority: medium
   - Project: API Gateway
   - Initiative: GraphQL
   - Description: "Implement DataLoader pattern to prevent N+1 queries
     in GraphQL resolvers. Expected 10x performance improvement."
   - Tags: graphql, performance
   - Linked to: Literature item #46

   Issue #193: "Optimize Postgres indexes for status queries"
   - Type: task, Priority: medium
   - Project: E-commerce Platform
   - Description: "Add partial indexes on status columns to improve
     query performance. Applies to orders, users, products tables."
   - Tags: database, performance
   - Linked to: Literature item #47

   Issue #194: "Implement observability stack"
   - Type: discovery, Priority: high
   - Projects: All (cross-cutting)
   - Description: "Design observability strategy with metrics, logs,
     traces. Consider OpenTelemetry, Prometheus, Grafana stack."
   - Tags: observability, infrastructure
   - Linked to: Literature item #48

   ... (2 more discovery issues)

   Step 5: Add context comments
   - Add comment to Issue #127:
     "Consider token rotation pattern from article 'Modern API Auth'.
     Adds security against token theft. See discovery issue #191."

   - Add comment to GraphQL initiative:
     "Performance optimization opportunity: DataLoader pattern.
     See issue #192 and article reference."

   Step 6: Update literature items
   - Mark all 8 items as read
   - Add tags based on content
   - Set progress to 100%

3. Output to user:
   "📚 Literature Review Complete!

   📖 Reviewed: 8 items
   - 6 articles
   - 1 podcast
   - 1 whitepaper

   💡 Insights Extracted: 12 actionable items

   🎯 Discovery Issues Created: 6
   1. #191 - Refresh token rotation [API Gateway, high]
   2. #192 - DataLoader for GraphQL [API Gateway, medium]
   3. #193 - Postgres index optimization [E-commerce, medium]
   4. #194 - Observability stack [All projects, high]
   5. #195 - Event-driven refactor [API Gateway, low]
   6. #196 - Redis caching layer [E-commerce, medium]

   🔗 Connected to Existing Work:
   - #191 linked to Issue #127 (OAuth2)
   - #192 linked to GraphQL initiative
   - #194 tagged for all active projects

   📊 Recommendations:
   - Prioritize #191 and #194 (high impact, security/reliability)
   - Include #192 in next GraphQL sprint
   - Schedule architecture review for #194 (observability)

   🔗 View all discovery issues:
      http://localhost:3001/issues?type=discovery"
```

---

### Scenario 5: Mentor-Driven Problem Solving

**Goal:** Get architectural guidance with full project context

**Workflow:**

```
1. User: "Ask the Technical Architect mentor about scaling our API"

2. turbo-mentor-workflow (subagent):

   Step 1: Identify mentor
   - Mentor: "Technical Architect" (workspace: work)
   - Persona: Senior architect, 15 years experience, systems thinking

   Step 2: Load turbo-knowledge-graph skill
   - Build context for API Gateway project:
     * Get project details: API Gateway [active, 65% complete]
     * Get active issues: 23 issues (8 high priority)
     * Recent work: GraphQL subscriptions, OAuth2, rate limiting

   - Semantic search: "API scaling architecture performance"
     * Found: Issue #87 "Handle 10k concurrent users"
     * Found: Document "Architecture Design" (section on scaling)
     * Found: Literature "Microservices Observability"
     * Found: Blueprint "API Architecture Patterns"

   - Get related entities:
     * Initiative: "Infrastructure & Scaling"
     * Issues: #87, #134 (rate limiting), #142 (validation)
     * Recent commits: Rate limiting with Redis

   Step 3: Analyze git history
   - Recent work:
     * Implemented Redis for rate limiting (2 days ago)
     * Added WebSocket support for subscriptions (5 days ago)
     * OAuth2 refresh token flow (1 week ago)

   Step 4: Generate mentor response
   - Synthesize context into architectural guidance
   - Reference specific issues, docs, patterns

   Mentor response:
   "Based on your API Gateway project's current state (65% complete) and
   recent work on rate limiting and GraphQL subscriptions, here's my
   scaling recommendation:

   ## Current Architecture Analysis

   ✅ Good foundations:
   - Redis already in place (rate limiting) - can extend for caching
   - WebSocket support (subscriptions) - consider separate service
   - OAuth2 with refresh tokens - stateless auth ready for horizontal scaling

   ⚠️ Bottlenecks identified:
   - Issue #87 targets 10k concurrent users
   - GraphQL resolvers may have N+1 queries (see Issue #192)
   - No connection pooling mentioned (see Literature: Postgres optimization)

   ## Scaling Strategy (Phased Approach)

   ### Phase 1: Vertical Optimization (2 weeks)
   **Before adding servers, optimize what you have:**

   1. ✅ Implement DataLoader (Issue #192)
      - Solves N+1 queries in GraphQL
      - Expected 10x improvement
      - Priority: High (blocking #87)

   2. 🆕 Add API response caching (NEW ISSUE)
      - Use existing Redis infrastructure
      - Cache-aside pattern (see Architecture doc section 3.2)
      - Cache immutable data: 60min TTL
      - Cache user-specific: 5min TTL

   3. 🆕 Implement connection pooling (NEW ISSUE)
      - Add PgBouncer for Postgres
      - Reduce connection overhead
      - See Literature: "Postgres Query Optimization"

   ### Phase 2: Horizontal Scaling (4 weeks)
   **Multi-instance deployment:**

   1. 🆕 Containerize API service (NEW ISSUE)
      - Docker + K8s deployment
      - See Blueprint: "API Architecture Patterns" → Scaling section

   2. 🆕 Add load balancer (NEW ISSUE)
      - NGINX or AWS ALB
      - Health checks on /health endpoint
      - Session affinity for WebSocket

   3. 🆕 Separate WebSocket service (NEW ISSUE)
      - Dedicated service for subscriptions
      - Prevents blocking on main API
      - Use Redis pub/sub for cross-service events

   ### Phase 3: Observability (Parallel track)
   **Can't scale what you can't measure:**

   1. ✅ Implement observability stack (Issue #194)
      - Metrics: Request rate, latency, errors
      - Traces: Track request flow
      - Logs: Centralized logging
      - Priority: High (needed before scaling)

   ## Resource Requirements
   - Phase 1: 1 developer, 2 weeks → 80% capacity improvement
   - Phase 2: 2 developers, 4 weeks → 10x horizontal capacity
   - Phase 3: 1 DevOps, ongoing → visibility & confidence

   ## Next Steps
   I've created 5 new issues and linked them to Initiative 'Infrastructure
   & Scaling'. Start with Phase 1 - optimize first, then scale.

   Want me to detail any specific phase?"

   Step 5: Load turbo-project-manager skill
   - Create issues from mentor guidance:

   Issue #197: "Implement Redis response caching"
   - Type: feature, Priority: high
   - Linked to: Initiative "Infrastructure & Scaling"
   - Blocked by: None (Redis already available)
   - Estimate: 5 points

   Issue #198: "Add PgBouncer connection pooling"
   - Type: task, Priority: high
   - Linked to: Literature "Postgres Query Optimization"
   - Estimate: 3 points

   Issue #199: "Containerize API service with K8s"
   - Type: task, Priority: medium
   - Linked to: Blueprint "API Architecture Patterns"
   - Blocked by: #197, #198 (optimize first)
   - Estimate: 8 points

   Issue #200: "Setup load balancer (NGINX/ALB)"
   - Type: task, Priority: medium
   - Blocked by: #199
   - Estimate: 5 points

   Issue #201: "Extract WebSocket service"
   - Type: feature, Priority: medium
   - Blocked by: #199
   - Estimate: 13 points

   - Link all to Initiative: "Infrastructure & Scaling"
   - Add dependencies (blocked_by relationships)

   Step 6: Load turbo-doc-generator skill
   - Update Architecture doc with scaling strategy
   - Add section: "Scaling Strategy & Phases"
   - Include diagrams (current vs future architecture)

   Step 7: Add mentor conversation to history
   - Save to Turbo mentor messages
   - Link conversation to created issues

3. Output to user:
   "🧠 Technical Architect Mentor Response:

   [Full mentor response displayed above]

   ✅ Actions Taken:

   📋 Created 5 Issues:
   - #197: Redis response caching [high, 5pts]
   - #198: PgBouncer pooling [high, 3pts]
   - #199: K8s containerization [medium, 8pts]
   - #200: Load balancer setup [medium, 5pts]
   - #201: WebSocket service extraction [medium, 13pts]

   🔗 All linked to Initiative: Infrastructure & Scaling

   📊 Dependencies Mapped:
   Phase 1 (#197, #198) → Phase 2 (#199 → #200, #201)

   📚 Updated Documentation:
   - docs/architecture.md (new section: Scaling Strategy)

   💬 Conversation saved to mentor history

   🎯 Recommended Next Step:
   Start with Issue #192 (DataLoader) - already exists, high impact

   View scaling roadmap:
   http://localhost:3001/initiatives/{infrastructure-scaling-id}"
```

---

<a name="ecosystem"></a>
## 7. The Turbo Agent Ecosystem

### 7.1 Agent Marketplace (Future Vision)

**Community Subagents:**
- **turbo-security-auditor** - Comprehensive security analysis
- **turbo-performance-analyzer** - Performance profiling & optimization
- **turbo-test-generator** - Automated test creation
- **turbo-refactor-assistant** - Code quality improvements
- **turbo-deployment-manager** - CI/CD and deployment automation

**Community Skills:**
- **turbo-jira-sync** - Bidirectional Jira integration
- **turbo-github-actions** - GitHub Actions automation
- **turbo-slack-notifier** - Smart Slack notifications
- **turbo-confluence-docs** - Confluence documentation sync
- **turbo-figma-integration** - Design-to-development workflow

### 7.2 Agent Collaboration Patterns

**Multi-Agent Workflows:**

```markdown
# Example: Full Feature Implementation

User: "Implement user notification system"

1. turbo-sprint-planner (subagent)
   - Creates epic and breaks down into issues
   - Estimates complexity
   - Creates milestone

2. turbo-knowledge-explorer (subagent)
   - Searches for similar implementations
   - Finds relevant literature on notification patterns
   - Links to architectural blueprints

3. turbo-code-linker (subagent)
   - Identifies affected files
   - Maps dependencies with existing features
   - Suggests implementation approach

4. turbo-doc-generator (skill)
   - Creates design document
   - Generates API specification
   - Prepares user guide template

5. [Developer implements feature]

6. turbo-code-review (skill)
   - Reviews implementation
   - Checks against patterns
   - Updates issue status

7. turbo-doc-sync-agent (subagent)
   - Updates API docs
   - Completes user guide
   - Generates changelog

8. turbo-status-sync (subagent)
   - Closes related issues
   - Updates project completion
   - Notifies stakeholders
```

### 7.3 Agent Templates

**Starter Templates for Common Workflows:**

1. **Startup Project Template**
   - Subagents: project-initializer, sprint-planner
   - Skills: project-manager, doc-generator
   - Use case: 0 to MVP in days

2. **Enterprise Team Template**
   - Subagents: issue-triager, status-sync, dependency-mapper
   - Skills: analytics, automation, knowledge-graph
   - Use case: Large team coordination

3. **Open Source Maintainer Template**
   - Subagents: issue-triager, code-reviewer, doc-sync
   - Skills: community-manager, changelog-generator
   - Use case: OSS project management

4. **Solo Developer Template**
   - Subagents: mentor-orchestrator, knowledge-explorer
   - Skills: project-manager, doc-generator
   - Use case: Personal productivity

---

<a name="future"></a>
## 8. Future Possibilities

### 8.1 Predictive Intelligence

**AI-Powered Forecasting:**
- **Completion Prediction**: ML models predict project completion dates
- **Risk Detection**: Early warning system for potential blockers
- **Resource Optimization**: Suggest optimal team assignments
- **Scope Creep Prevention**: Detect expanding requirements early
- **Quality Prediction**: Forecast bug likelihood based on patterns

**Implementation:**
```python
# turbo-forecasting-agent (future)
prediction = agent.predict_completion(
    project_id="uuid",
    confidence_level=0.85
)

# Output:
# - Estimated completion: March 15, 2026 (±5 days)
# - Confidence: 85%
# - Risk factors: 2 blockers, 1 team member vacation
# - Recommendation: Add 3 days buffer for testing phase
```

### 8.2 Natural Language Interfaces

**Conversational Project Management:**

```
User: "What's blocking the mobile app release?"

Agent: "2 critical blockers found:
1. Issue #234 'iOS crash on login' - in_progress, assigned to Sarah
2. Issue #267 'Payment gateway timeout' - open, needs assignment

Sarah estimates #234 complete by Friday. Shall I assign #267 to Mike
(has payment experience)? This keeps us on track for March 1 release."

User: "Yes, and let me know if Sarah needs help"

Agent: "✅ Assigned #267 to Mike
✅ Set up daily check-in reminder for Sarah on #234
✅ Created contingency task #301 'iOS crash - backup plan' (low priority)

I'll notify you if #234 isn't 50% complete by Wednesday."
```

### 8.3 Cross-Platform Intelligence

**Universal Context Sharing:**
- Turbo ↔ GitHub Issues
- Turbo ↔ Jira
- Turbo ↔ Linear
- Turbo ↔ Notion
- Turbo ↔ Confluence

**Smart Sync Agents:**
```markdown
---
name: turbo-github-sync
description: Bidirectional sync with GitHub Issues
---

Automatic sync:
- GitHub issue created → Create Turbo issue
- Turbo issue updated → Update GitHub issue
- PR merged → Update both platforms
- Maintain single source of truth
```

### 8.4 AI Pair Programming

**Code Generation with Turbo Context:**

```
User: "Implement the payment processing from issue #156"

turbo-code-generator (future agent):
1. Loads issue #156 and all context
2. Reviews related issues and design docs
3. Checks architectural blueprints
4. Reads existing payment code
5. Generates implementation:
   - Follows project patterns
   - Uses established libraries
   - Includes tests
   - Updates documentation
6. Creates PR and links to issue
7. Requests review from domain expert
```

### 8.5 Autonomous Agents

**Self-Managing Projects:**

**Autonomous Sprint Agent:**
- Monitors project health 24/7
- Auto-creates sprints when backlog is ready
- Assigns issues based on expertise and capacity
- Adjusts priorities based on blockers
- Notifies team of important changes
- Generates reports automatically

**Autonomous Quality Agent:**
- Monitors code quality metrics
- Creates refactoring issues when quality drops
- Schedules technical debt sprints
- Enforces quality gates
- Prevents quality regression

**Autonomous Learning Agent:**
- Tracks team skill development
- Suggests learning resources
- Creates skill-building issues
- Measures improvement over time
- Recommends role progressions

---

<a name="roadmap"></a>
## 9. Implementation Roadmap

### Phase 1: Foundation (Month 1-2)
**Goal: Core subagents and skills operational**

**Week 1-2: Project Management**
- [ ] Create turbo-sprint-planner subagent
- [ ] Create turbo-issue-triager subagent
- [ ] Build turbo-project-manager skill
- [ ] Test sprint planning workflow

**Week 3-4: Code Intelligence**
- [ ] Create turbo-status-sync subagent
- [ ] Create turbo-code-linker subagent
- [ ] Build turbo-code-review skill
- [ ] Test git-to-issue sync

**Week 5-6: Knowledge Management**
- [ ] Create turbo-literature-curator subagent
- [ ] Create turbo-knowledge-explorer subagent
- [ ] Build turbo-knowledge-graph skill
- [ ] Test insight extraction

**Week 7-8: Integration & Polish**
- [ ] Create turbo-mentor-orchestrator subagent
- [ ] Build turbo-doc-generator skill
- [ ] End-to-end workflow testing
- [ ] Documentation and training

### Phase 2: Automation (Month 3-4)
**Goal: Automated workflows and intelligence**

**Week 9-10: Advanced Automation**
- [ ] Create turbo-dependency-mapper subagent
- [ ] Create turbo-issue-refiner subagent
- [ ] Build turbo-automation skill
- [ ] Implement workflow automation

**Week 11-12: Analytics & Insights**
- [ ] Build turbo-analytics skill
- [ ] Implement predictive models
- [ ] Create dashboards
- [ ] Risk detection system

**Week 13-14: Cross-Platform**
- [ ] Build turbo-github-sync skill
- [ ] Build turbo-jira-sync skill
- [ ] Integration testing
- [ ] Data consistency validation

**Week 15-16: Refinement**
- [ ] Performance optimization
- [ ] User feedback integration
- [ ] Agent collaboration improvements
- [ ] Comprehensive testing

### Phase 3: Intelligence (Month 5-6)
**Goal: AI-powered intelligence and autonomy**

**Week 17-18: Predictive Systems**
- [ ] ML models for completion prediction
- [ ] Risk detection algorithms
- [ ] Quality forecasting
- [ ] Resource optimization

**Week 19-20: Natural Language**
- [ ] Conversational interfaces
- [ ] Voice command support
- [ ] Smart notifications
- [ ] Context-aware responses

**Week 21-22: Autonomous Agents**
- [ ] Self-managing sprint agent
- [ ] Autonomous quality agent
- [ ] Learning & development agent
- [ ] Testing and validation

**Week 23-24: Ecosystem & Marketplace**
- [ ] Agent marketplace platform
- [ ] Community contributions
- [ ] Skill sharing system
- [ ] Templates and presets

### Phase 4: Scale (Month 7+)
**Goal: Enterprise-ready and community-driven**

- [ ] Multi-tenant support
- [ ] Enterprise security features
- [ ] Advanced analytics and BI
- [ ] API for third-party integrations
- [ ] Mobile applications
- [ ] Community growth initiatives

---

## 10. Getting Started Today

### Quick Start: Your First Turbo Subagent

**Step 1: Create Project Triager**

```bash
# Create subagent file
mkdir -p .claude/agents
cat > .claude/agents/turbo-triager.md << 'EOF'
---
name: turbo-triager
description: Use PROACTIVELY to triage and organize Turbo issues
tools: mcp__turbo__list_issues, mcp__turbo__update_issue, mcp__turbo__add_tag_to_entity
model: sonnet
---

You are an expert issue triage specialist for Turbo.

Process:
1. Get all issues with status "open" and no priority
2. Analyze description and impact
3. Assign priority (critical/high/medium/low)
4. Add relevant tags
5. Add triage comment with reasoning

Priority Rules:
- Critical: Security, data loss, production issues
- High: Major features, significant bugs
- Medium: Standard features, minor bugs
- Low: Nice-to-have, refactoring
EOF
```

**Step 2: Test It**

```
User: "Triage all open issues in my project"

# Subagent will:
# 1. Find unprocessed issues
# 2. Assign priorities
# 3. Add tags
# 4. Comment with reasoning
```

**Step 3: Automate It**

```bash
# Add to your CI/CD or cron
0 9 * * * claude-code run turbo-triager --project="API Gateway"
```

### Quick Start: Your First Turbo Skill

**Step 1: Create Sprint Reporter Skill**

```bash
mkdir -p ~/.claude/skills/turbo-sprint-reporter
cat > ~/.claude/skills/turbo-sprint-reporter/SKILL.md << 'EOF'
# Turbo Sprint Reporter Skill

## Description
Generate comprehensive sprint reports from Turbo data

## When to Use
- End of sprint reporting
- Stakeholder updates
- Retrospective preparation

## Capabilities
- Sprint completion summary
- Velocity calculation
- Blocker analysis
- Team performance metrics

## MCP Tools
- mcp__turbo__get_milestone
- mcp__turbo__get_milestone_issues
- mcp__turbo__list_issues
EOF
```

**Step 2: Use It**

```
User: "Generate sprint report for Sprint 8"

# Skill loads automatically
# Outputs comprehensive markdown report
```

---

## Conclusion: The Future is Agent-Augmented

Turbo with Subagents and Skills transforms from a project management platform into an **AI-augmented development environment**. Where:

- **Projects manage themselves** - Agents handle triage, planning, and coordination
- **Code writes its documentation** - Automatic sync between implementation and docs
- **Knowledge compounds over time** - Every article, issue, and commit builds intelligence
- **Mentors provide infinite wisdom** - Context-aware guidance from your project history
- **Teams move faster** - Automation handles the cognitive overhead

**The magic isn't in the tools—it's in the orchestration.**

Start small. Pick one subagent. Add one skill. Watch the magic unfold.

---

*"The best project management system is one you don't have to manage."*

---

## Appendix: Quick Reference

### Essential MCP Tools
```python
# Projects
mcp__turbo__list_projects(status="active")
mcp__turbo__get_project(project_id)
mcp__turbo__update_project(project_id, **updates)

# Issues
mcp__turbo__create_issue(title, description, type, priority, project_id)
mcp__turbo__list_issues(project_id, status, priority)
mcp__turbo__update_issue(issue_id, **updates)

# Knowledge Graph
mcp__turbo__search_knowledge_graph(query, entity_types, min_relevance)
mcp__turbo__get_related_entities(entity_type, entity_id, limit)

# Dependencies
mcp__turbo__add_blocker(blocking_issue_id, blocked_issue_id)
mcp__turbo__get_blocking_issues(issue_id)

# Intelligence
mcp__turbo__refine_issues_analyze(project_id)
mcp__turbo__refine_issues_execute(mode, changes)
```

### Subagent Template
```markdown
---
name: your-agent-name
description: Use PROACTIVELY for [when to use]
tools: [comma-separated tool list]
model: sonnet
---

You are [role/expertise].

Responsibilities:
1. [Primary responsibility]
2. [Secondary responsibility]

Process:
1. [Step 1]
2. [Step 2]
3. [Output format]
```

### Skill Template
```
skill-name/
├── SKILL.md          # Description and usage
├── resources/        # Supporting files
├── scripts/          # Executable code
└── templates/        # Output templates
```

---

**Ready to build the future? Start creating your Turbo agents today!** 🚀
