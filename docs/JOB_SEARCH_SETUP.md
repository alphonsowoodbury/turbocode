# Job Search Setup Guide

## Overview

TurboCode includes automated job search functionality that uses the Adzuna API to discover job postings based on your search criteria.

## Why Adzuna Instead of Web Scraping?

We switched from Indeed web scraping to Adzuna API because:

- **Reliability**: Adzuna provides a stable REST API that won't break when HTML changes
- **Legal**: Using official APIs respects Terms of Service
- **Quality**: Clean, structured data with guaranteed fields
- **Free Tier**: 250 API calls/month at no cost
- **Coverage**: Good US job market coverage, especially for tech roles

## Setup Instructions

### 1. Create Adzuna Account

1. Go to https://developer.adzuna.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Get API Credentials

1. Log in to your Adzuna developer account
2. Go to "Applications" or "My Applications"
3. Click "Create New Application"
4. Fill in application details:
   - Name: "TurboCode Job Search"  
   - Description: "Personal job search automation"
   - Website: Can be left blank or use your portfolio
5. Submit the form
6. Copy your **App ID** and **App Key**

### 3. Configure TurboCode

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_APP_KEY=your_app_key_here
   ```

3. Restart the API container:
   ```bash
   docker-compose restart api
   ```

## Using Job Search

### Create Search Criteria

1. Navigate to http://localhost:3001/work/job-search
2. Click "New Search Criteria"
3. Configure your search:
   - **Name**: "Senior Python Remote"
   - **Job Titles**: ["Senior Python Engineer", "Senior Backend Engineer"]
   - **Locations**: ["Remote"] or specific cities
   - **Required Keywords**: ["Python", "FastAPI", "PostgreSQL"]
   - **Salary Minimum**: 150000
   - **Enabled Sources**: ["adzuna"]
4. Save the criteria

### Execute Search

1. Click "Run Search" on your criteria card
2. The system will:
   - Call Adzuna API with your parameters
   - Score each job against your criteria  
   - Save jobs with score >= 50 to database
   - Display discovered jobs in the feed

### Review Jobs

Jobs are displayed with:
- **Match Score**: 0-100 rating based on your criteria
- **Company & Title**: Job details
- **Salary Range**: If available
- **Location**: Including remote status
- **Actions**: Mark as Interested, Skip, or Rate 1-5 stars

## API Limits

**Adzuna Free Tier**: 250 calls/month

### Optimization Tips

- Create targeted search criteria (fewer broad searches)
- Use meaningful keywords to filter results server-side
- Run searches weekly instead of daily
- Each search = 1 API call (returns up to 50 jobs)

## Scoring Algorithm

Jobs are scored based on weighted criteria:

- **Title Match** (20%): Job title contains your target titles
- **Keywords** (30%): Description contains required/preferred keywords
- **Location** (20%): Matches location preferences and remote policy
- **Salary** (30%): Meets salary minimum and target

Only jobs scoring >= 50 are saved to your database.

## Alternative APIs

If you need more API calls or different sources, you can add:

### The Muse API
- Free tier available
- Tech-focused jobs
- Good for startup/culture fit

### GitHub Jobs API
- Free, unlimited
- Tech-only positions  
- Remote-friendly

### Remotive.io API  
- Free tier
- Remote-only jobs
- Quality over quantity

To add a new source, create a scraper in `turbo/core/services/job_scrapers/` following the `AdzunaScraper` pattern.

## Troubleshooting

### "Adzuna API error (401)"
- Check that `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are correctly set in `.env`
- Verify credentials in Adzuna developer dashboard
- Restart API container after updating `.env`

### "0 jobs found"
- Check that your search criteria isn't too restrictive
- Try broader keywords or locations
- Verify Adzuna has jobs for your search (test on Adzuna.com)

### API Rate Limit Exceeded
- You've used all 250 calls this month
- Wait until next month resets
- Consider creating multiple Adzuna accounts (not recommended)
- Add alternative API sources

## Support

For issues with:
- **Adzuna API**: Contact support@adzuna.com
- **TurboCode job search**: Create issue at your repo
