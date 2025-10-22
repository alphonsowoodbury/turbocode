# Local AI Agents Architecture

## Vision

Replace Claude Code with fully local, open-source AI agents running on M1 Max, capable of:
- Writing and reviewing code
- Updating issues and project status
- Responding to comments intelligently
- Using knowledge graph for context and memory
- Running 24/7 in Docker containers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Turbo Platform (FastAPI)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  REST API  │  │  PostgreSQL  │  │  Knowledge Graph │   │
│  │  Endpoints │  │  (Issues/    │  │  (Neo4j +        │   │
│  │            │  │   Projects)  │  │   Embeddings)    │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ API Calls
                       │
┌──────────────────────┴───────────────────────────────────────┐
│                  AI Agent Orchestrator                        │
│                  (Python + LangChain/LlamaIndex)             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Agent Router / Coordinator             │    │
│  │  - Decides which agent to use                       │    │
│  │  - Manages agent workflows                          │    │
│  │  - Handles tool calling                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Code Agent   │  │ Issue Agent  │  │ Review Agent │      │
│  │              │  │              │  │              │      │
│  │ - Write code │  │ - Update     │  │ - Code       │      │
│  │ - Fix bugs   │  │   issues     │  │   review     │      │
│  │ - Refactor   │  │ - Comment    │  │ - Suggest    │      │
│  │              │  │ - Prioritize │  │   improve    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ Inference API
                        │
┌───────────────────────┴───────────────────────────────────────┐
│              LLM Inference Layer (Ollama/vLLM)                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Llama 3.3    │  │ CodeLlama    │  │ DeepSeek     │      │
│  │ 70B-Instruct │  │ 34B          │  │ Coder 33B    │      │
│  │              │  │              │  │              │      │
│  │ General      │  │ Code-focused │  │ Code-focused │      │
│  │ reasoning    │  │ completion   │  │ & reasoning  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  GPU: M1 Max (24-64GB unified memory)                        │
│  Quantization: Q4_K_M or Q5_K_M for 70B models              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. LLM Inference Layer

**Technology**: Ollama or vLLM running in Docker

**Recommended Models** (for M1 Max):
- **Llama 3.3 70B Instruct** (Q4_K_M quantized ~40GB)
  - Best general reasoning
  - Good at following instructions
  - Handles complex multi-step tasks

- **DeepSeek Coder 33B** (Q5_K_M ~23GB)
  - Excellent code generation
  - Strong at debugging
  - Good documentation writing

- **CodeLlama 34B** (Q4_K_M ~20GB)
  - Fast code completion
  - Good at code understanding
  - Familiar with many frameworks

**Setup**:
```bash
# Using Ollama (easier)
docker run -d --gpus all -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
ollama pull llama3.3:70b-instruct-q4_K_M
ollama pull deepseek-coder:33b-instruct-q5_K_M

# Or using vLLM (more control, better throughput)
docker run -d --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.3-70B-Instruct \
  --quantization awq \
  --max-model-len 4096
```

**Memory Requirements**:
- M1 Max 32GB: Run 1x 33B model at a time
- M1 Max 64GB: Run 1x 70B OR 2x 33B models simultaneously

---

### 2. Agent Orchestrator

**Technology**: LangChain or LlamaIndex + FastAPI

**Responsibilities**:
- Route requests to appropriate agent
- Manage conversation context
- Handle tool calling (API interactions)
- Coordinate multi-agent workflows
- Maintain working memory

**Architecture**:
```python
class AgentOrchestrator:
    def __init__(self):
        self.code_agent = CodeAgent()
        self.issue_agent = IssueAgent()
        self.review_agent = ReviewAgent()
        self.llm_client = OllamaClient()
        self.graph_service = GraphService()

    async def route_request(self, request: str) -> AgentResponse:
        """Determine which agent should handle the request"""

    async def gather_context(self, request: str) -> Context:
        """Use knowledge graph to find relevant context"""
        # Semantic search for related issues/code
        results = await self.graph_service.search(request)
        return Context(related_items=results)
```

**Key Features**:
- **Tool Calling**: Agents can call Turbo API endpoints
- **RAG Pipeline**: Use knowledge graph for retrieval
- **Memory**: Short-term (conversation) + Long-term (graph)
- **Streaming**: Stream responses back to user

---

### 3. Specialized Agents

#### Code Agent
**Purpose**: Write, modify, and understand code

**Capabilities**:
- Generate new features from issue descriptions
- Fix bugs based on error messages
- Refactor existing code
- Write tests
- Update documentation

**Tools**:
- `read_file(path)` - Read source files
- `write_file(path, content)` - Write code
- `run_tests()` - Execute test suite
- `search_codebase(query)` - Semantic code search
- `get_related_issues(issue_id)` - Context from graph

**Prompt Template**:
```
You are an expert software engineer working on the Turbo project.

Current Task: {issue_title}
Description: {issue_description}

Related Context:
{semantic_search_results}

Recent Changes:
{git_recent_commits}

Your goal is to implement this feature following the project's patterns.
Use the codebase context to maintain consistency.
```

#### Issue Agent
**Purpose**: Manage project issues and communications

**Capabilities**:
- Update issue status based on progress
- Add comments with insights
- Suggest priorities
- Find related/duplicate issues
- Auto-triage new issues

**Tools**:
- `update_issue(id, data)` - Update issue
- `add_comment(issue_id, text)` - Comment
- `search_similar_issues(description)` - Semantic search
- `get_issue_dependencies(id)` - Get blocking/blocked by

**Use Cases**:
1. Daily standup: Comment on in-progress issues with status
2. Triage: Auto-categorize and prioritize new issues
3. Duplicate detection: Find similar existing issues
4. Context switching: Summarize issue history when resuming

#### Review Agent
**Purpose**: Code quality and knowledge sharing

**Capabilities**:
- Review pull requests
- Suggest improvements
- Check against project standards
- Find potential bugs
- Generate documentation

**Tools**:
- `get_diff(pr_id)` - Get code changes
- `check_tests_coverage()` - Analyze coverage
- `lint_code(files)` - Run linters
- `search_similar_code(snippet)` - Find patterns

---

### 4. Knowledge Graph Integration

**Why It's Critical**:
The knowledge graph provides **semantic memory** that makes local LLMs effective:

1. **Context Retrieval**: Find related issues/code by meaning
2. **Relationship Understanding**: See how issues connect
3. **Historical Memory**: Learn from past decisions
4. **Pattern Recognition**: Identify similar problems

**RAG Pipeline**:
```python
async def get_context_for_task(task_description: str):
    # 1. Semantic search in knowledge graph
    related = await graph.search(GraphSearchQuery(
        query=task_description,
        limit=10,
        min_relevance=0.5
    ))

    # 2. Get related entities
    for item in related.results[:3]:
        similar = await graph.get_related_entities(
            entity_id=item.entity_id,
            entity_type=item.entity_type,
            limit=5
        )
        related.results.extend(similar)

    # 3. Format for LLM context
    context = format_context_for_llm(related.results)
    return context
```

**Example**:
```
User: "Fix the slow search performance"

1. Semantic search finds:
   - "Performance Optimization" issue (0.78 relevance)
   - "Database Indexing" task (0.65 relevance)
   - "Caching Strategy" discussion (0.61 relevance)

2. Agent gets full context of related work

3. LLM generates solution informed by:
   - Past performance work
   - Existing optimization patterns
   - Team's previous decisions
```

---

## Implementation Roadmap

### Phase 1: Infrastructure (Week 1-2)
- [ ] Set up Ollama/vLLM in Docker
- [ ] Download and quantize models (Llama 3.3 70B, DeepSeek Coder 33B)
- [ ] Benchmark inference speed on M1 Max
- [ ] Create LLM client abstraction layer

### Phase 2: Basic Agent (Week 3-4)
- [ ] Build agent orchestrator with LangChain
- [ ] Implement basic tool calling (Turbo API)
- [ ] Create simple prompt templates
- [ ] Test with simple tasks (update issue status)

### Phase 3: Knowledge Graph Integration (Week 5-6)
- [ ] Connect agents to knowledge graph
- [ ] Implement RAG pipeline
- [ ] Test context retrieval quality
- [ ] Tune relevance thresholds

### Phase 4: Specialized Agents (Week 7-10)
- [ ] Code Agent: Generate simple features
- [ ] Issue Agent: Auto-triage and comment
- [ ] Review Agent: Basic PR feedback
- [ ] Iterate on prompt engineering

### Phase 5: Autonomy (Week 11-12)
- [ ] Agent-initiated tasks (daily standup comments)
- [ ] Multi-agent workflows (code + test + review)
- [ ] Background processing (nightly analysis)
- [ ] Quality gates (don't commit bad code)

---

## Docker Compose Setup

```yaml
version: '3.8'

services:
  # Existing Turbo services
  turbo-api:
    # ... existing config

  neo4j:
    # ... existing config

  # New: LLM Inference
  ollama:
    image: ollama/ollama:latest
    container_name: turbo-ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

  # New: Agent Orchestrator
  agent-orchestrator:
    build: ./agents
    container_name: turbo-agents
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - TURBO_API_URL=http://turbo-api:8000
      - NEO4J_URI=bolt://neo4j:7687
    ports:
      - "8001:8001"
    depends_on:
      - ollama
      - turbo-api
      - neo4j
    restart: unless-stopped

volumes:
  ollama_data:
```

---

## Agent API Endpoints

Once built, you'll interact with agents via API:

```bash
# Ask agent to implement a feature
POST /agents/code/implement
{
  "issue_id": "uuid",
  "context": "Use existing patterns from similar features"
}

# Ask agent to review code
POST /agents/review/analyze
{
  "pr_id": "uuid",
  "focus": ["performance", "security"]
}

# Ask agent to triage issues
POST /agents/issue/triage
{
  "batch": "new_issues",
  "auto_comment": true
}

# Natural language query
POST /agents/chat
{
  "message": "What issues are blocking the v1.0 release?",
  "use_knowledge_graph": true
}
```

---

## Advantages Over Claude Code

### Pros:
✅ **100% Local**: No data leaves your machine, ever
✅ **No Costs**: Free after initial setup
✅ **Always Available**: No rate limits or API quotas
✅ **Customizable**: Fine-tune on your codebase
✅ **Private**: Your code never sent to external services
✅ **Specialized**: Train/prompt for your specific patterns
✅ **24/7 Operations**: Background agents always working

### Cons:
❌ **Lower Quality** (initially): Local models are good but not GPT-4/Claude level yet
❌ **Slower**: M1 Max inference ~10-20 tokens/sec vs cloud instant
❌ **Resource Intensive**: Uses GPU/memory constantly
❌ **More Complex**: You manage the infrastructure
❌ **Limited Context**: 4K-8K context vs Claude's 200K

### Mitigation:
- Use knowledge graph for "unlimited context" via RAG
- Specialize models with fine-tuning
- Use Claude/GPT-4 for complex reasoning, local for routine tasks
- Ensemble: Local for speed, cloud for quality when needed

---

## Cost Analysis

### One-Time Setup:
- M1 Max Mac Studio: $0 (you have it)
- Models: $0 (open source)
- Development time: ~3 months

### Ongoing:
- Electricity: ~$15-30/month (running 24/7)
- **Total**: ~$200-400/year

### vs. Claude Code:
- Claude Code: $0 (currently free)
- But: Limited availability, rate limits, data privacy concerns
- Local: Pay once with time, own it forever

---

## Recommended Starting Point

### Minimal Viable Agent (Week 1):

1. **Install Ollama**:
```bash
docker-compose up -d ollama
ollama pull deepseek-coder:33b-instruct
```

2. **Simple Agent Script**:
```python
# agents/simple_agent.py
import requests
from ollama import Client

ollama = Client(host='http://localhost:11434')
turbo_api = 'http://localhost:8000/api/v1'

async def auto_comment_on_issues():
    # Get open issues
    issues = requests.get(f'{turbo_api}/issues?status=open').json()

    for issue in issues[:5]:  # Process 5 at a time
        # Get context from knowledge graph
        related = requests.post(f'{turbo_api}/graph/search', json={
            'query': issue['title'],
            'limit': 3
        }).json()

        # Generate insightful comment
        prompt = f"""
        Issue: {issue['title']}
        Description: {issue['description']}

        Related context:
        {related}

        Provide a brief, helpful comment on this issue.
        """

        response = ollama.chat(
            model='deepseek-coder:33b-instruct',
            messages=[{'role': 'user', 'content': prompt}]
        )

        # Post comment
        requests.post(f'{turbo_api}/issues/{issue["id"]}/comments', json={
            'text': response['message']['content']
        })
```

3. **Test It**:
```bash
python agents/simple_agent.py
```

Watch it add intelligent comments to your issues!

---

## Next Steps

1. **Create Discovery Issue** to track this vision
2. **Start with Ollama + DeepSeek Coder** (easiest path)
3. **Build simple comment bot** to prove concept
4. **Iterate on prompts** to improve quality
5. **Add more capabilities** incrementally
6. **Fine-tune on your codebase** for best results

---

## Success Metrics

- **Agent Response Quality**: Human review scores >7/10
- **Time Saved**: Agent handles 30% of routine tasks
- **Availability**: 99% uptime for background processing
- **Cost**: <$50/month in electricity
- **Privacy**: 100% of AI processing done locally

---

## Long-Term Vision

**Year 1**: Agents handle routine tasks (triage, comments, simple fixes)
**Year 2**: Agents implement features from specs
**Year 3**: Agents proactively improve codebase (refactoring, optimization)

**End Goal**: AI development partner that knows your project deeply through the knowledge graph, works 24/7, costs nothing, and never shares your data.