# Adzuna API Integration Summary

## What Changed

Switched from Indeed web scraping to Adzuna REST API for job search functionality.

## Why the Change?

Web scraping Indeed was problematic:
- Indeed actively blocks scrapers
- HTML structure changes frequently break parsers
- Violates Indeed's Terms of Service
- No guarantee of data quality

Adzuna API provides:
- Stable REST API with guaranteed uptime
- Clean, structured JSON data
- Legal, ToS-compliant usage
- Free tier: 250 API calls/month
- Good US job market coverage

## Files Created

### 1. `/turbo/core/services/job_scrapers/adzuna_scraper.py`
- AdzunaScraper class implementing BaseScraper interface
- Uses Adzuna v1 API endpoint: `https://api.adzuna.com/v1/api/jobs/us/search/`
- Supports all search criteria: keywords, locations, remote filtering
- Parses API responses into ScrapedJob objects
- Handles salary data, job descriptions, company info, locations
- Environment variable configuration: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`

### 2. `/.env.example`
- Template for environment configuration
- Documents required API keys
- Instructions for getting Adzuna credentials

### 3. `/docs/JOB_SEARCH_SETUP.md`
- Complete setup guide for Adzuna integration
- Step-by-step account creation instructions
- Configuration examples
- Troubleshooting section
- API limits and optimization tips
- Alternative API suggestions (The Muse, GitHub Jobs, Remotive)

## Files Modified

### 1. `/turbo/core/services/job_scrapers/__init__.py`
- Added AdzunaScraper to exports
- Now exports: BaseScraper, IndeedScraper, AdzunaScraper, ScrapedJob

### 2. `/turbo/core/services/job_search.py`
- Imported AdzunaScraper
- Registered adzuna scraper in self._scrapers dict
- Search execution now supports "adzuna" as a source

### 3. `/docker-compose.yml`
- Added environment variables:
  - `ADZUNA_APP_ID=${ADZUNA_APP_ID:-}`
  - `ADZUNA_APP_KEY=${ADZUNA_APP_KEY:-}`

## How to Use

### Setup (One-time)

1. **Get Adzuna credentials**:
   - Go to https://developer.adzuna.com/
   - Create free account
   - Create application
   - Copy App ID and App Key

2. **Configure TurboCode**:
   ```bash
   cp .env.example .env
   # Edit .env and add:
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

3. **Restart API**:
   ```bash
   docker-compose restart api
   ```

### Create Search Criteria

Navigate to http://localhost:3001/work/job-search and create criteria:

```json
{
  "name": "Senior Python Remote",
  "job_titles": ["Senior Python Engineer", "Senior Backend Engineer"],
  "locations": ["Remote"],
  "required_keywords": ["Python", "FastAPI", "PostgreSQL"],
  "salary_minimum": 150000,
  "enabled_sources": ["adzuna"]
}
```

### Execute Search

Click "Run Search" button. The system will:
1. Call Adzuna API with your criteria
2. Parse and score each job (0-100)
3. Save jobs with score >= 50
4. Display in UI feed

## API Response Structure

Adzuna returns JSON like this:

```json
{
  "results": [
    {
      "id": "3456789",
      "title": "Senior Python Engineer",
      "company": {
        "display_name": "Tech Corp"
      },
      "location": {
        "display_name": "Remote",
        "area": ["United States"]
      },
      "description": "Full job description...",
      "salary_min": 150000,
      "salary_max": 180000,
      "salary_is_predicted": false,
      "created": "2025-10-20T12:00:00Z",
      "redirect_url": "https://www.adzuna.com/redirect/...",
      "category": {
        "label": "IT Jobs"
      }
    }
  ],
  "count": 1234
}
```

## Testing

### With Real API (requires credentials):
```bash
# Update search criteria to use Adzuna
curl -X PUT http://localhost:8001/api/v1/job-search/criteria/{id} \
  -H "Content-Type: application/json" \
  -d '{"enabled_sources": ["adzuna"]}'

# Execute search
curl -X POST http://localhost:8001/api/v1/job-search/execute/{id}
```

### Without API Credentials:
The system will work but return 0 jobs. Test data has been added:
- 3 sample job postings created manually
- Visible at http://localhost:3001/work/job-search

## Rate Limits

- **Free Tier**: 250 calls/month
- **Per Request**: Up to 50 jobs returned
- **Optimization**: Create targeted searches, run weekly not daily

## Next Steps

1. **Get Adzuna API credentials** and configure `.env`
2. **Update existing search criteria** to use "adzuna" source
3. **Test with real API** by running a search
4. Consider adding more API sources:
   - The Muse API (tech jobs, culture-focused)
   - GitHub Jobs API (tech-only, unlimited)
   - Remotive.io API (remote-only jobs)

## Migration Notes

- **Indeed scraper still exists** but should not be used
- All new searches should use `enabled_sources: ["adzuna"]`
- Existing job postings in database are unaffected
- Frontend displays jobs from any source

## Support

- **Adzuna API Docs**: https://developer.adzuna.com/docs/search
- **Adzuna Support**: support@adzuna.com
- **Setup Guide**: See `/docs/JOB_SEARCH_SETUP.md`
