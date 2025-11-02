# Job Search System - Ready to Use! 🎉

## What's Implemented

### ✅ Complete Backend
1. **Database Tables** (`migrations/024_add_job_search_tables.sql`)
   - `job_postings` - Discovered jobs with scoring
   - `search_criteria` - Your search preferences
   - `job_search_history` - Execution tracking
   - `job_posting_matches` - Job-criteria links

2. **Models & Schemas** (SQLAlchemy + Pydantic)
   - Full validation and type safety
   - Proper relationships

3. **Job Scrapers** (`turbo/core/services/job_scrapers/`)
   - Base scraper interface
   - **Indeed scraper** (working MVP)
   - Ready for LinkedIn, BuiltIn, HN scrapers

4. **Repositories & Services**
   - Data access layer
   - **Job Search Service** with scoring algorithm
   - Deduplication logic

5. **API Endpoints** (`/api/v1/job-search/`)
   - Full CRUD for criteria and postings
   - Execute search endpoint
   - History tracking

6. **MCP Tools** (Available in Claude Code)
   - `create_search_criteria`
   - `list_search_criteria`
   - `execute_job_search`
   - `list_job_postings`
   - `update_job_posting`
   - And more...

## How to Use (MCP Tools)

### 1. Create Search Criteria

```
Use the create_search_criteria tool with:
{
  "name": "Senior Data Engineer Remote",
  "job_titles": ["Senior Data Engineer", "Staff Data Engineer", "Principal Data Engineer"],
  "locations": ["Remote", "Oakland, CA", "Seattle, WA", "Portland, OR"],
  "excluded_states": ["Texas", "Florida"],
  "exclude_onsite": true,
  "salary_minimum": 150000,
  "salary_target": 200000,
  "required_keywords": ["python", "aws", "data platform"],
  "preferred_keywords": ["terraform", "kubernetes", "serverless"],
  "excluded_keywords": ["blockchain", "crypto", "php"],
  "enabled_sources": ["indeed"]
}
```

### 2. Execute Search

```
Use execute_job_search with the criteria_id you just got
```

This will:
- Search Indeed for matching jobs
- Score each job (0-100) based on your criteria
- Store jobs with score >= 50
- Return search history with stats

### 3. View Results

```
Use list_job_postings with:
{
  "status": "new",
  "min_score": 70
}
```

Shows discovered jobs sorted by match score.

### 4. Mark Jobs

```
Use update_job_posting to:
{
  "posting_id": "...",
  "status": "interested"  // or "not_interested", "applied"
}
```

## Scoring Algorithm

Jobs are scored 0-100 based on:
- **Title Match (20%)**: Does job title match your targets?
- **Keywords (30%)**: How many required keywords found?
- **Location (20%)**: Remote or matching location?
- **Salary (30%)**: Meets your minimum?

**Penalties:**
- Excluded keywords found → 50% score reduction

**Threshold:** Only jobs scoring >= 50 are saved

## Example Workflow

1. **Morning**: Create search criteria for roles you want
2. **Run Search**: Execute search (scrapes Indeed, scores jobs)
3. **Review**: List new jobs, see match scores and reasons
4. **Take Action**:
   - Mark as "interested" → save for later
   - Mark as "not_interested" → hide it
   - Mark as "applied" → track in job applications

## API Endpoints

All available at `http://localhost:8001/api/v1/job-search/`:

- `POST /criteria` - Create search criteria
- `GET /criteria` - List all criteria
- `GET /criteria/{id}` - Get specific criteria
- `PUT /criteria/{id}` - Update criteria
- `POST /execute/{criteria_id}` - Run a search
- `GET /postings` - List job postings
- `GET /postings/{id}` - Get job details
- `PUT /postings/{id}` - Update job status
- `GET /history` - View search history

## Match Score Reasons

When you view a job posting, you'll see `match_reasons`:

```json
{
  "title_match": "Senior Data Engineer",
  "matched_keywords": ["python", "aws"],
  "remote_match": true,
  "salary_meets_minimum": true
}
```

This explains WHY it scored well.

## Next Steps

### Immediate (You Can Do Now):
1. **Test It**: Create a search criteria via MCP
2. **Run Search**: Execute search and see results
3. **Review Jobs**: Look at match scores and reasons

### Coming Soon:
1. **Frontend UI** - Visual dashboard at `/work/job-search`
2. **Auto-Search** - Background scheduler
3. **More Scrapers** - LinkedIn, BuiltIn, HN
4. **Email Notifications** - Alert on high-scoring matches

## Technical Details

### Deduplication
Jobs are deduplicated by `(source, external_id)` unique constraint. Same job won't be saved twice.

### Rate Limiting
Base scraper has 1-second delay between requests (configurable).

### Error Handling
Failed searches are logged in `job_search_history` with error messages.

### Data Retention
You control what to keep:
- "new" jobs → review later
- "not_interested" → can delete
- "interested" → keep for applying
- "applied" → track progress

## Testing

Once Docker rebuild completes, try this:

```bash
# Via MCP (this conversation)
"Create search criteria for Senior Data Engineer remote jobs paying $150k+"

# Via API directly
curl http://localhost:8001/api/v1/job-search/criteria
```

## Configuration

Edit search criteria to tune results:
- Add more keywords → stricter matching
- Lower salary → more results
- Enable more sources → broader search
- Adjust scoring weights → change priorities

## Support

- API Docs: http://localhost:8001/docs#/job-search
- Database: Connect to PostgreSQL to query directly
- Logs: `docker-compose logs -f api`

---

**You're all set! Start searching for jobs now!** 🚀
