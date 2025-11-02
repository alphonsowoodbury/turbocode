# Multi-API Job Search System

## Overview

TurboCode now supports **6 job search APIs** to maximize job discovery across different markets and specialties:

| API | Type | Cost | Best For | Setup |
|-----|------|------|----------|-------|
| **JSearch** (RapidAPI) | Aggregator | Free 150/mo | US jobs, multi-source | Requires key |
| **Adzuna** | Aggregator | Free 250/mo | Global, salary data | Requires key |
| **Remotive** | Specialized | 100% Free | Remote tech jobs | No key needed |
| **The Muse** | Curated | 100% Free | Company culture | No key needed |
| **Arbeitnow** | Specialized | 100% Free | European tech | No key needed |
| **Indeed** | Scraper | N/A | (Deprecated) | Not recommended |

## Quick Start

### 1. No-Key APIs (Ready to Use)

These work immediately without any signup:

```bash
# Just select the source in your search criteria:
enabled_sources: ["remotive", "themuse", "arbeitnow"]
```

- **Remotive**: Remote-only tech jobs
- **The Muse**: Jobs with company culture info
- **Arbeitnow**: European tech jobs

### 2. Free-Tier APIs (Requires Signup)

#### JSearch (Recommended - Best Aggregator)

1. Go to https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Click "Sign Up" → Create free account
3. Click "Subscribe to Test" → Choose "Basic" plan (Free)
4. Go to "Endpoints" → Copy your **X-RapidAPI-Key**
5. Add to `.env`:
   ```bash
   RAPIDAPI_KEY=your_key_here
   ```

**What you get:**
- 150 searches/month free
- Aggregates from Indeed, LinkedIn, Glassdoor, ZipRecruiter
- Salary data, job highlights, benefits
- US-focused with good tech coverage

#### Adzuna

1. Go to https://developer.adzuna.com/
2. Create free account → Verify email
3. Create Application → Copy **App ID** and **App Key**
4. Add to `.env`:
   ```bash
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

**What you get:**
- 250 searches/month free
- Global coverage (US, UK, Europe, etc.)
- Real salary data
- Multiple countries supported

### 3. Restart API

```bash
docker-compose restart api
```

## Usage Examples

### Remote-Only Tech Jobs (Free, No Key)

```json
{
  "name": "Remote Tech Jobs",
  "job_titles": ["Software Engineer", "Backend Developer"],
  "enabled_sources": ["remotive"],
  "remote_policies": ["remote"]
}
```

### Maximum Coverage (Requires Keys)

```json
{
  "name": "Senior Python - All Sources",
  "job_titles": ["Senior Python Engineer"],
  "locations": ["Remote", "San Francisco"],
  "required_keywords": ["Python", "FastAPI", "AWS"],
  "salary_minimum": 150000,
  "enabled_sources": ["jsearch", "adzuna", "remotive", "themuse"]
}
```

### European Tech Jobs (Free, No Key)

```json
{
  "name": "Berlin Python Jobs",
  "job_titles": ["Python Developer"],
  "locations": ["Berlin", "Germany"],
  "enabled_sources": ["arbeitnow", "adzuna"]
}
```

### Company Culture Focus (Free, No Key)

```json
{
  "name": "Culture-Fit Jobs",
  "job_titles": ["Product Manager"],
  "enabled_sources": ["themuse"]
}
```

## API Comparison

### JSearch (Aggregator via RapidAPI)

**Pros:**
- Best aggregator - combines Indeed, LinkedIn, Glassdoor
- Rich data: salary, highlights, benefits
- Good tech coverage
- 150 free searches/month

**Cons:**
- Requires RapidAPI account
- Limited to 150 requests on free tier

**Best For:** US-based job seekers wanting maximum coverage

---

### Adzuna (Multi-Country Aggregator)

**Pros:**
- Global coverage (US, UK, AU, CA, EU)
- Real salary data (not predicted)
- 250 free searches/month
- Good documentation

**Cons:**
- Requires API credentials
- Some regions have better coverage than others

**Best For:** International job seekers, salary research

---

### Remotive (Remote-Only)

**Pros:**
- 100% free, no API key
- All jobs are remote
- Tech-heavy listings
- Clean, structured data

**Cons:**
- Remote-only (no hybrid/onsite)
- Smaller dataset than aggregators
- No salary data

**Best For:** Remote-first job seekers, digital nomads

---

### The Muse (Curated + Culture)

**Pros:**
- 100% free, no API key
- Company culture/values included
- Curated, quality listings
- Good for company research

**Cons:**
- Smaller dataset
- No salary data via API
- More general (not just tech)

**Best For:** Culture-fit seekers, quality over quantity

---

### Arbeitnow (European Tech)

**Pros:**
- 100% free, no API key
- Focuses on Europe (especially Germany)
- Tech-focused
- Includes tags/technologies

**Cons:**
- Europe-only
- No salary data
- Smaller dataset

**Best For:** European job seekers, Germany-based

---

## Strategy Recommendations

### Maximum Free Coverage

Use all 3 no-key APIs:

```json
{
  "enabled_sources": ["remotive", "themuse", "arbeitnow"]
}
```

**Result:** ~50-100 jobs per search, 100% free

---

### Best Quality (Mixed)

Combine aggregator + specialized:

```json
{
  "enabled_sources": ["jsearch", "remotive"]
}
```

**Result:** Broad coverage + remote-specific, 150 searches/month limit

---

### International Coverage

```json
{
  "enabled_sources": ["adzuna", "arbeitnow", "remotive"]
}
```

**Result:** US + Europe + Global remote, 250 searches/month limit

---

### High-Volume Search

Use no-key APIs only:

```json
{
  "enabled_sources": ["remotive", "themuse", "arbeitnow"]
}
```

**Result:** Unlimited searches, no rate limits

---

## Rate Limits Summary

| API | Free Tier Limit | Paid Option |
|-----|----------------|-------------|
| JSearch | 150 requests/month | $10/mo for 500 |
| Adzuna | 250 requests/month | Contact for enterprise |
| Remotive | Unlimited | N/A (always free) |
| The Muse | Unlimited | N/A (always free) |
| Arbeitnow | Unlimited | N/A (always free) |

## Optimization Tips

1. **Start with free APIs** (remotive, themuse, arbeitnow) - no setup, unlimited
2. **Add JSearch** when you need aggregated US jobs (150/month)
3. **Add Adzuna** for international or when JSearch runs out (250/month)
4. **Run searches weekly** instead of daily to conserve API calls
5. **Use specific keywords** to get better matches (less noise)
6. **Target one or two sources** per search criteria for better focus

## Troubleshooting

### "401 Unauthorized" from JSearch
- Check `RAPIDAPI_KEY` in `.env`
- Verify you're subscribed to JSearch on RapidAPI (even free tier requires subscription)
- Restart API: `docker-compose restart api`

### "401 Unauthorized" from Adzuna
- Check `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` in `.env`
- Verify credentials at https://developer.adzuna.com/
- Restart API: `docker-compose restart api`

### "0 jobs found" from Remotive/The Muse/Arbeitnow
- These APIs don't support all search parameters
- Try broader keywords
- Remove location filters (except Arbeitnow)
- Check API is working: https://remotive.com/api/remote-jobs

### Rate Limit Exceeded
- JSearch: 150/month → Wait for reset or upgrade plan
- Adzuna: 250/month → Wait for reset or contact for enterprise
- Free APIs: No limits

## Future APIs to Consider

- **LinkedIn Jobs API** - Requires partnership approval
- **ZipRecruiter API** - Partner API, contact for access
- **Google Jobs API** - Part of Cloud Talent Solution (enterprise)
- **SerpApi** - Scrapes Google Jobs, pay-per-search ($50/5000 searches)
- **We Work Remotely API** - Remote jobs, check availability

## Support

- **JSearch**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/discussions
- **Adzuna**: support@adzuna.com
- **Remotive**: contact via website
- **The Muse**: https://www.themuse.com/advice/contact-us
- **Arbeitnow**: Check GitHub or website
