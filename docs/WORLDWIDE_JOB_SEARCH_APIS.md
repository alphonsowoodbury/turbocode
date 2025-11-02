# Worldwide Job Search API Integration

## Complete API Coverage

TurboCode now supports **9 job search APIs** providing comprehensive worldwide coverage:

### Geographic Coverage Matrix

| Region | APIs Available | Total Coverage |
|--------|----------------|----------------|
| **United States** | JSearch, Adzuna, USAJobs, Remotive, The Muse, WWR | 6 sources |
| **United Kingdom** | Reed, Adzuna, The Muse, Remotive, WWR | 5 sources |
| **Europe** | Arbeitnow, Adzuna, The Muse, Remotive, WWR | 5 sources |
| **Remote Worldwide** | Remotive, WWR, The Muse | 3 sources |
| **Global** | Adzuna (195 countries) | 1 source |

## All 9 APIs Overview

### Free Forever (No Keys Required)

| API | Coverage | Limit | Best For |
|-----|----------|-------|----------|
| **Remotive** | Remote worldwide | Unlimited | Remote tech jobs |
| **The Muse** | Global, curated | Unlimited | Company culture |
| **Arbeitnow** | Europe (esp. Germany) | Unlimited | European tech |

### Free with API Key (Rate Limited)

| API | Coverage | Free Limit | Best For |
|-----|----------|------------|----------|
| **JSearch** | US (multi-source) | 150/month | US job aggregation |
| **Adzuna** | 195 countries | 250/month | Global + salary data |
| **Reed** | United Kingdom | 1000/day | UK job market |
| **USAJobs** | US federal govt | Unlimited | Government jobs |
| **WWR** | Remote worldwide | 1000/day | Premium remote |

### Deprecated

| API | Status | Note |
|-----|--------|------|
| **Indeed** | Deprecated | Use JSearch instead |

## Setup Instructions

### Instant Setup (No Keys)

These 3 APIs work right now:

```json
{
  "enabled_sources": ["remotive", "themuse", "arbeitnow"]
}
```

### API Key Setup

#### 1. JSearch (US Aggregator)

**Time:** 3 minutes  
**Limit:** 150 requests/month free

1. Go to https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Sign up → Subscribe to "Basic" (Free)
3. Copy your `X-RapidAPI-Key`
4. Add to `.env`:
   ```
   RAPIDAPI_KEY=your_key_here
   ```

#### 2. Adzuna (Global)

**Time:** 5 minutes  
**Limit:** 250 requests/month free

1. Go to https://developer.adzuna.com/
2. Create account → Create application
3. Copy App ID and App Key
4. Add to `.env`:
   ```
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

#### 3. Reed (UK Jobs)

**Time:** 3 minutes  
**Limit:** 1000 requests/day free

1. Go to https://www.reed.co.uk/developers
2. Create account → Get API key
3. Add to `.env`:
   ```
   REED_API_KEY=your_reed_key
   ```

#### 4. USAJobs (US Government)

**Time:** 5 minutes  
**Limit:** Unlimited free

1. Go to https://developer.usajobs.gov/
2. Create account → Apply for API key
3. Add to `.env`:
   ```
   USAJOBS_API_KEY=your_usajobs_key
   USAJOBS_USER_AGENT=your_email@example.com
   ```

#### 5. We Work Remotely (Premium Remote)

**Time:** 1-3 days (manual approval)  
**Limit:** 1000 requests/day free

1. Email [email protected]
2. Request API token for personal job search
3. Wait for manual approval (1-3 business days)
4. Add to `.env`:
   ```
   WWR_API_TOKEN=your_wwr_token
   ```

### Complete Setup

```bash
# 1. Copy example
cp .env.example .env

# 2. Edit .env with your keys
nano .env

# 3. Restart API
docker-compose restart api
```

## Usage Examples

### US Tech Jobs (Maximum Coverage)

```json
{
  "name": "US Senior Engineer",
  "job_titles": ["Senior Software Engineer", "Senior Backend Engineer"],
  "locations": ["Remote", "San Francisco", "New York"],
  "salary_minimum": 150000,
  "required_keywords": ["Python", "AWS", "Docker"],
  "enabled_sources": ["jsearch", "adzuna", "usajobs", "remotive", "themuse", "weworkremotely"]
}
```

**Result:** 200-300 jobs from 6 sources

### UK Tech Jobs (Maximum Coverage)

```json
{
  "name": "UK Python Developer",
  "job_titles": ["Python Developer", "Backend Engineer"],
  "locations": ["London", "Remote"],
  "salary_minimum": 50000,
  "required_keywords": ["Python", "Django", "PostgreSQL"],
  "enabled_sources": ["reed", "adzuna", "themuse", "remotive"]
}
```

**Result:** 100-150 jobs from 4 sources

### European Tech Jobs

```json
{
  "name": "EU Tech Jobs",
  "job_titles": ["Software Engineer", "Full Stack Developer"],
  "locations": ["Berlin", "Amsterdam", "Remote"],
  "enabled_sources": ["arbeitnow", "adzuna", "remotive", "themuse"]
}
```

**Result:** 80-120 jobs from 4 sources

### Remote-Only Worldwide

```json
{
  "name": "Worldwide Remote",
  "job_titles": ["Senior Engineer"],
  "remote_policies": ["remote"],
  "salary_minimum": 100000,
  "enabled_sources": ["remotive", "weworkremotely", "themuse", "adzuna"]
}
```

**Result:** 100-200 jobs from 4 sources

### US Government Jobs

```json
{
  "name": "Federal Tech Jobs",
  "job_titles": ["Software Developer", "IT Specialist"],
  "locations": ["Washington DC", "Remote"],
  "enabled_sources": ["usajobs"]
}
```

**Result:** 50-100 government jobs

## API Comparison

### Data Quality

| API | Salary Data | Skills | Description | Company Info |
|-----|-------------|--------|-------------|--------------|
| JSearch | ✅ Good | ✅ Yes | ✅ Full | ✅ Good |
| Adzuna | ✅ Excellent | ❌ No | ✅ Full | ⚠️ Basic |
| Reed | ✅ Good | ❌ No | ✅ Full | ✅ Good |
| USAJobs | ✅ Excellent | ✅ Yes | ✅ Very detailed | ✅ Excellent |
| Remotive | ❌ No | ✅ Tags | ✅ Full | ⚠️ Basic |
| The Muse | ❌ No | ✅ Categories | ✅ Full | ✅ Excellent |
| Arbeitnow | ❌ No | ✅ Tags | ⚠️ Brief | ⚠️ Basic |
| WWR | ❌ No | ✅ Tags | ✅ Full | ⚠️ Basic |

### Coverage Strength

| API | US | UK | EU | Remote | Global |
|-----|----|----|----|----|--------|
| JSearch | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Adzuna | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Reed | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐ |
| USAJobs | ⭐⭐⭐⭐ | - | - | ⭐⭐ | - |
| Remotive | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| The Muse | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Arbeitnow | - | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| WWR | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Recommended Strategies

### Budget: $0 (Unlimited Searches)

**Free APIs Only:**
```
enabled_sources: ["remotive", "themuse", "arbeitnow"]
```

**Pros:** Unlimited, no setup  
**Cons:** Smaller dataset, no salary data  
**Result:** 50-100 jobs per search

### Budget: $0 (Best Quality, Limited)

**Free + Rate-Limited APIs:**
```
enabled_sources: ["jsearch", "adzuna", "reed", "usajobs", "remotive", "themuse", "arbeitnow"]
```

**Pros:** Maximum coverage  
**Cons:** ~20 searches/month limit  
**Result:** 200-400 jobs per search

### Regional Focus: United States

**Best US Sources:**
```
enabled_sources: ["jsearch", "adzuna", "usajobs", "remotive", "themuse"]
```

**Result:** 150-250 US jobs per search

### Regional Focus: United Kingdom

**Best UK Sources:**
```
enabled_sources: ["reed", "adzuna", "themuse", "remotive"]
```

**Result:** 100-200 UK jobs per search

### Regional Focus: Europe

**Best EU Sources:**
```
enabled_sources: ["arbeitnow", "adzuna", "remotive", "themuse"]
```

**Result:** 80-150 EU jobs per search

### Remote-Only Worldwide

**Best Remote Sources:**
```
enabled_sources: ["remotive", "weworkremotely", "themuse", "adzuna"]
```

**Result:** 100-200 remote jobs per search

## Rate Limits & Optimization

### Monthly Allowances

| API | Free Limit | Daily Equivalent |
|-----|------------|------------------|
| JSearch | 150/month | ~5/day |
| Adzuna | 250/month | ~8/day |
| Reed | 1000/day | 1000/day |
| USAJobs | Unlimited | Unlimited |
| WWR | 1000/day | 1000/day |
| Remotive | Unlimited | Unlimited |
| The Muse | Unlimited | Unlimited |
| Arbeitnow | Unlimited | Unlimited |

### Optimization Tips

1. **Start with free unlimited APIs** - Remotive, The Muse, Arbeitnow
2. **Add Reed for UK** - 1000/day is very generous
3. **Add USAJobs for government** - Unlimited, unique jobs
4. **Save JSearch/Adzuna** for weekly comprehensive searches
5. **Request WWR token early** - Takes 1-3 days approval

### Search Frequency Recommendations

- **Daily:** Free unlimited APIs (remotive, themuse, arbeitnow, reed, usajobs)
- **Weekly:** Rate-limited APIs (jsearch, adzuna, weworkremotely)
- **Monthly:** Comprehensive all-source searches

## Troubleshooting

### Reed API (401 Unauthorized)

- Verify `REED_API_KEY` in `.env`
- Check key at https://www.reed.co.uk/developers
- Restart: `docker-compose restart api`

### USAJobs API (403 Forbidden)

- Check `USAJOBS_API_KEY` in `.env`
- Verify `USAJOBS_USER_AGENT` is a valid email
- Apply for key at https://developer.usajobs.gov/

### We Work Remotely (401)

- Confirm you received token via email from WWR
- Check `WWR_API_TOKEN` in `.env`
- Contact [email protected] if no response after 3 days

### No Jobs Found

- Try different sources
- Broaden keywords
- Remove location filters
- Check API status pages

## Migration from Previous Setup

If you were using the 6-API setup, add these to your `.env`:

```bash
# New APIs
REED_API_KEY=your_reed_key
USAJOBS_API_KEY=your_usajobs_key
USAJOBS_USER_AGENT=your_email@example.com
WWR_API_TOKEN=your_wwr_token
```

Then restart: `docker-compose restart api`

## Support

- **JSearch**: https://rapidapi.com/support
- **Adzuna**: support@adzuna.com
- **Reed**: https://www.reed.co.uk/developers
- **USAJobs**: https://developer.usajobs.gov/
- **WWR**: [email protected]
- **Remotive**: Via website contact
- **The Muse**: https://www.themuse.com/advice/contact-us
- **Arbeitnow**: Via website

## Next Steps

1. **Choose your target market** (US, UK, EU, or worldwide)
2. **Set up appropriate APIs** (start with free ones)
3. **Create search criteria** matching your preferences
4. **Run test search** to verify APIs are working
5. **Review results** and refine criteria
