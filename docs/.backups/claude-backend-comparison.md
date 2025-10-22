# Claude Backend Comparison

Turbo supports TWO backends for AI subagents. Choose based on your usage volume and budget.

## Backend Options

### Option 1: Direct API (`CLAUDE_BACKEND=api`)

**How it works:**
- Makes direct API calls to `api.anthropic.com`
- Pay-per-request pricing
- No Claude Code CLI installation needed

**Pricing:**
- Claude 3.5 Sonnet: $3/million input tokens, $15/million output tokens
- Typical request: ~5K input + 2K output = **~$0.045 per request**

**Best for:**
- ✅ Low volume usage (< 1000 requests/month)
- ✅ Testing and development
- ✅ Predictable, occasional usage
- ✅ Simpler setup (no Claude Code CLI needed)

**Estimated Monthly Costs:**
| Requests/Day | Requests/Month | Estimated Cost |
|--------------|----------------|----------------|
| 10 | 300 | **$13.50** |
| 50 | 1,500 | **$67.50** |
| 100 | 3,000 | **$135** |
| 500 | 15,000 | **$675** |

---

### Option 2: Claude Code CLI (`CLAUDE_BACKEND=claude-cli`)

**How it works:**
- Uses Claude Code CLI installed in Docker container
- Included in Claude Pro subscription ($20/month)
- No per-request charges

**Pricing:**
- Included with Claude Pro: **$20/month**
- Unlimited requests (within rate limits)
- No incremental costs

**Best for:**
- ✅ High volume usage (> 1000 requests/month)
- ✅ Multiple users
- ✅ Production deployments
- ✅ Predictable monthly costs

**Estimated Monthly Costs:**
| Requests/Day | Requests/Month | Estimated Cost |
|--------------|----------------|----------------|
| 10 | 300 | **$20** (base) |
| 50 | 1,500 | **$20** (base) |
| 100 | 3,000 | **$20** (base) |
| 500 | 15,000 | **$20** (base) |
| 1000 | 30,000 | **$20** (base) |

---

## Break-Even Analysis

**API becomes more expensive at ~450 requests/month**

```
API cost = $0.045 × requests
CLI cost = $20/month (flat)

Break-even: $20 / $0.045 = ~444 requests

If requests > 444/month → Use Claude Code CLI
If requests < 444/month → Use API
```

## How to Switch

### 1. Edit `.env` file

```bash
# For API backend (default)
CLAUDE_BACKEND=api

# For Claude Code CLI backend
CLAUDE_BACKEND=claude-cli
```

### 2. Restart the service

```bash
docker-compose restart claude-code

# Verify the backend
curl http://localhost:9000/health
# Should show: {"backend": "api"} or {"backend": "claude-cli"}
```

### 3. Monitor usage

```bash
# Check current config
curl http://localhost:9000/config

# Watch logs to see which backend is being used
docker-compose logs -f claude-code
```

## Feature Comparison

| Feature | API Backend | Claude Code CLI |
|---------|-------------|-----------------|
| **Cost Model** | Pay-per-use | Flat $20/month |
| **Setup** | Simple | Requires CLI install |
| **MCP Tools** | Not yet supported* | Full support |
| **Rate Limits** | Tier-based | Claude Pro limits |
| **Best For** | Low volume | High volume |
| **Docker Required** | No | Yes |

\* MCP tool support for direct API is coming soon from Anthropic

## Recommendations

### Scenario 1: Personal use, occasional queries
- **Backend:** `api`
- **Why:** Low volume means low costs ($10-30/month)

### Scenario 2: Team of 5-10 users, daily use
- **Backend:** `claude-cli`
- **Why:** High volume, predictable cost of $20/month

### Scenario 3: Production app with 100+ users
- **Backend:** `claude-cli`
- **Why:** Unlimited usage within rate limits, much cheaper at scale

### Scenario 4: Testing/Development only
- **Backend:** `api`
- **Why:** No need for CLI setup, only testing occasionally

## Current Limitations

### API Backend (`api`)
- ⚠️ MCP tools not yet supported (coming from Anthropic)
- ⚠️ Cannot use custom tools/functions
- ⚠️ Simpler responses without tool integration

### Claude Code CLI Backend (`claude-cli`)
- ⚠️ Requires Docker container setup
- ⚠️ Requires active Claude Pro subscription
- ⚠️ More complex to configure

## Monitoring Costs

### For API Backend

Check your usage at: https://console.anthropic.com/account/usage

```bash
# Track requests in logs
docker-compose logs claude-code | grep "Invoking Claude API"

# Count daily requests
docker-compose logs claude-code --since 24h | grep "Invoking Claude API" | wc -l
```

### For Claude Code CLI Backend

Monitor within Claude Pro limits:
- Check rate limits in Claude Code settings
- No per-request costs to track

## Migration Path

**Start with API, switch to CLI if needed:**

1. Begin with `CLAUDE_BACKEND=api`
2. Monitor usage for 1 month
3. If costs exceed $20/month, switch to `claude-cli`
4. No code changes needed, just env variable

## FAQ

**Q: Can I switch backends without redeploying?**
A: Yes! Just edit `.env` and restart: `docker-compose restart claude-code`

**Q: Will my subagents work the same on both backends?**
A: Yes, the interface is identical. API backend has limited MCP support for now.

**Q: Which backend do you recommend?**
A: Start with `api` if you're unsure. Switch to `claude-cli` if you exceed 450 requests/month.

**Q: Can I use different backends for different subagents?**
A: Not currently, but we can add this if needed.

**Q: Does this affect turbodev (my external Claude Code)?**
A: No, turbodev is completely separate and always uses your local Claude Code installation.
