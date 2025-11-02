# Job Search Quick Start

## 🚀 Instant Start (No Setup)

TurboCode supports **3 APIs that work immediately** without any signup:

```bash
# Just use these sources:
enabled_sources: ["remotive", "themuse", "arbeitnow"]
```

- **Remotive**: Remote tech jobs, unlimited
- **The Muse**: Curated jobs with culture info, unlimited
- **Arbeitnow**: European tech jobs, unlimited

## 📊 All Available APIs

| API | Setup | Free Tier | Best For |
|-----|-------|-----------|----------|
| **Remotive** | None | Unlimited | Remote-only tech |
| **The Muse** | None | Unlimited | Company culture |
| **Arbeitnow** | None | Unlimited | European tech |
| **JSearch** | RapidAPI key | 150/month | US aggregator |
| **Adzuna** | App ID + Key | 250/month | Global + salary |

## ⚡ 5-Minute Setup for Premium APIs

### JSearch (Best US Aggregator)

1. https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Sign up → Free plan
3. Copy RapidAPI key to `.env`:
   ```
   RAPIDAPI_KEY=your_key
   ```

### Adzuna (Global Jobs)

1. https://developer.adzuna.com/
2. Create app
3. Copy to `.env`:
   ```
   ADZUNA_APP_ID=your_id
   ADZUNA_APP_KEY=your_key
   ```

4. Restart: `docker-compose restart api`

## 💡 Usage

### Web UI
1. Go to http://localhost:3001/work/job-search
2. Create search criteria
3. Select sources: `["remotive", "jsearch"]`
4. Click "Run Search"

### API
```bash
# Create criteria
POST /api/v1/job-search/criteria
{
  "name": "Senior Python Remote",
  "job_titles": ["Senior Python Engineer"],
  "enabled_sources": ["remotive", "jsearch"],
  "salary_minimum": 150000
}

# Execute search
POST /api/v1/job-search/execute/{criteria_id}

# View jobs
GET /api/v1/job-search/postings?status=new
```

## 📚 Full Documentation

- **Complete Guide**: `/docs/MULTI_API_JOB_SEARCH.md`
- **Implementation**: `/docs/COMPLETE_JOB_SEARCH_IMPLEMENTATION.md`
- **Adzuna Setup**: `/docs/JOB_SEARCH_SETUP.md`

## 🎯 Recommended Strategy

**Start Free:**
```json
{
  "enabled_sources": ["remotive", "themuse", "arbeitnow"]
}
```
Result: 50-100 jobs/search, unlimited

**Add Premium for More:**
```json
{
  "enabled_sources": ["jsearch", "adzuna", "remotive"]
}
```
Result: 150-200 jobs/search, ~20 searches/month

## 🔧 Troubleshooting

**No jobs found?**
- Try different sources
- Broaden keywords
- Remove location filters

**API errors?**
- Check `.env` has correct keys
- Restart: `docker-compose restart api`
- Verify API signup completed

**Rate limit?**
- Switch to free APIs
- Wait for monthly reset
- Upgrade to paid tier
