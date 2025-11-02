# Career Management Features - Design Questionnaire

**Date:** October 25, 2025
**Owner:** Alphonso Woodbury
**Status:** AWAITING INPUT

---

## Purpose

This document defines the design decisions for Turbo's career management system. **Fill out all sections before implementation begins.**

---

## 1. Job Search Automation

### A. Job Discovery Method
**Question:** How should Turbo find job opportunities?

- [ x] **Fully Automated** - Background agent scrapes job boards (LinkedIn, Indeed, etc.) based on my criteria
- [ x] **Semi-Automated** - I paste job URLs, Turbo enriches data (scrapes details, finds contacts, etc.)
- [ ] **Manual Only** - I manually enter all job details

**My Choice:** `[FILL IN]`

**Additional Notes:**
```
[Add any clarifications or specific requirements]
```

---

### B. Job Board Integration
**Question:** Which job boards should Turbo support?

Check all that apply:
- [ x] LinkedIn (requires scraping or unofficial API)
- [ x] Indeed
- [ x] Glassdoor
- [ x] AngelList/Wellfound
- [ x] Hacker News "Who's Hiring"
- [ x] Company career pages directly
- [ ] Other: `[SPECIFY]` builtIn(NYC, LA, etc)

**Priority Order (1 = highest):** idk if this matters? i need to apply to jobs FASt within a few hours of them being open
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### C. Search Criteria Definition
**Question:** What criteria should Turbo use to find jobs?

**My Current Job Search Criteria:**
```yaml
# Example - replace with your actual criteria
job_titles:
  - "Senior Data Engineer"
  - "Staff Data Engineer"
  - "Principal Data Engineer"
  - "Senior Software Engineer - Data Platform"

remote_policy:
  - "Remote"
  - "Hybrid (optional in-office)"
  - abosultey no firm hybrid or full in office

excluded_policies:
  - "Fully In-Office" correct

salary_minimum: 150000
salary_target: 200000

required_keywords:
  - "data platform"
  - "data infrastructure"
  - "python"
  - "aws"

excluded_keywords:
  - "blockchain"
  - "crypto"
  - "php"

company_size:
  - "Startup (< 50)"
  - "Medium (50-500)"
  - "Large (500+)"

industries:
  - "Music Tech"
  - "Data Platforms"
  - "Developer Tools"
  - "Fintech"

excluded_industries:
  - "Defense"
  - "Gambling"

locations:
  - "Remote (US)"
  - "Oakland, CA"
  - "Seattle, WA"
  - "Portland, OR"
  - "Philadelphia, PA"
  - los angeles

excluded_states:
  - "Texas"
  - "Florida"
```

---

## 2. Resume Tailoring

### A. Tailoring Automation Level
**Question:** How should resume tailoring work?

- [ ] **Fully Automatic** - Generate tailored resume when I apply, use it automatically
- [x ] **Auto-Generate + Review** - Generate tailored resume, show me for approval before using
- [ ] **Manual Only** - I manually select which resume to use for each application

**My Choice:** `[FILL IN]`

---

### B. Resume Version Tracking
**Question:** How should Turbo track resume performance?

Check all that apply:
- [x ] Track which resume version was sent to each company
- [x ] Track response rate per resume version
- [x ] Track response rate per resume section (e.g., "projects section A vs B")
- [x ] A/B test different resume formats
- [x ] Track which keywords/skills correlate with responses
- [x ] Track time-to-response per resume type

**My Priorities (1 = highest):**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### C. Resume Customization Strategy
**Question:** How should Turbo customize resumes for each application?

Check all that apply:
- [ x] Reorder experience bullets to match job description keywords
- [ x] Highlight relevant skills from job description
- [ x] Customize summary/objective for each company
- [ x] Add/remove projects based on relevance
- [ x] Adjust technical skills section ordering
- [ x] Change formatting/layout based on company culture (e.g., conservative vs startup)
- [ ] Other: `[SPECIFY]`

**Most Important (pick top 3):**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

## 3. Contact Discovery & Networking

### A. Contact Finding Method
**Question:** How should Turbo find hiring managers and recruiters?

- [ x] **Fully Automated** - Scrape LinkedIn for hiring managers/recruiters at target companies
- [ x] **Semi-Automated** - I provide LinkedIn URLs, Turbo extracts contact info
- [ ] **Manual Only** - I manually add contacts as I find them

**My Choice:** `[FILL IN]`

---

### B. Contact Enrichment
**Question:** What information should Turbo automatically gather about contacts?

Check all that apply:
- [ x] Find email addresses (via Hunter.io, RocketReach, etc.)
- [ x] Find LinkedIn profile URL
- [ x] Extract current role and tenure
- [ x] Find mutual connections
- [ x] Track their recent LinkedIn activity (posts, job changes)
- [ x] Find their GitHub/personal website
- [ ] Other: `[SPECIFY]`

**Top Priorities (pick 3):**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### C. Contact Relationship Tracking
**Question:** How should Turbo track networking relationships?

**Contact Types to Track:**
- [ x] Recruiters (internal)
- [ x] Recruiters (external/agency)
- [ x] Hiring Managers
- [ x] Potential Peers/Team Members
- [ x] Referrers (people who can refer me)
- [ x] Mentors/Advisors
- [ x] Former Colleagues (at target companies)
- [ ] Other: `[SPECIFY]`

**Interaction Tracking:**
- [ x] Track last contact date
- [ x] Set next follow-up date
- [ x] Track conversation history (notes)
- [ x] Track referral status (did they refer me?)
- [ x] Track relationship strength (cold, warm, hot)
- [ x] Automatically suggest follow-up timing
- [ ] Other: `[SPECIFY]`

---

## 4. Email & Cover Letter Generation

### A. Automation Level
**Question:** How should email and cover letter generation work?

- [ ] **Fully Automated** - Generate and send emails/applications automatically
- [ x] **Auto-Generate + Review** - Generate emails, show me for review before sending
- [ ] **Auto-Generate Draft** - Generate emails, I edit and send manually
- [ ] **Manual Only** - I write all emails myself

**My Choice:** `[FILL IN]`

**Clarification:** `eventually you will have lots of examples of my writing to use my voice and everything so i can trust it but for now i will have rto approve everything and need to be able to give specific feedback that you apply uinvesally`

---

### B. Email Types to Generate
**Question:** What types of emails should Turbo generate?

Check all that apply:
- [ x] Cover letters (for applications)
- [ x] Cold outreach to recruiters
- [ x] Cold outreach to hiring managers
- [ x] Networking emails (asking for referrals)
- [ x] Follow-up emails (after applying)
- [ x] Follow-up emails (after interviews)
- [ x] Thank you emails (post-interview)
- [ x] Offer negotiation emails
- [ ] Other: `[SPECIFY]`

**Top Priorities (pick 3):**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### C. Email Performance Tracking
**Question:** How should Turbo track email effectiveness?

Check all that apply:
- [x ] Track response rate per email template
- [ x] Track response time (how long until reply)
- [ x] Track which subject lines get opened (if using email tracking)
- [ x] A/B test email approaches (formal vs casual, short vs detailed)
- [ x] Learn from successful emails (what got interviews?)
- [ x] Track follow-up effectiveness (does 2nd email help?)
- [ ] Other: `[SPECIFY]`

**My Priorities:**
1. `[FILL IN]`
2. `[FILL IN]`

---

## 5. Data Model & Architecture

### A. Career Domain Structure
**Question:** How should career management fit into Turbo's architecture?

- [ ] **Option 1: Special Project Type** - "Job Search" is a project, applications are issues
- [ x] **Option 2: Separate Domain** - Career management is separate (like Mentors, Resumes)
- [ ] **Option 3: Hybrid** - Separate domain, but can link applications to regular projects

**My Choice:** `[FILL IN]`

**Reasoning:**
```
[Explain why this makes sense for your workflow]
```

---

### B. Status Tracking for Applications
**Question:** What statuses should job applications have?

**Proposed Application Statuses:**
```yaml
# Edit/add/remove as needed
statuses:
  - researching       # Investigating the company/role
  - interested        # Want to apply, preparing materials
  - applied           # Application submitted
  - screening         # Initial recruiter screen scheduled/completed
  - phone_screen      # Phone interview scheduled/completed
  - technical_interview  # Technical interview scheduled/completed
  - onsite            # Onsite/final round scheduled/completed
  - offer             # Received offer
  - negotiating       # Negotiating offer terms
  - accepted          # Accepted offer
  - rejected          # Rejected by company
  - withdrawn         # I withdrew application
  - ghosted           # No response after follow-ups
```
above is fine
**Any changes/additions?**
```
[Add or modify statuses]
```

---

### C. Linking Applications to Projects
**Question:** Should job applications link to your regular projects?

**Use Case Examples:**
- Link "Databricks Application" to "Ritmo Project" (portfolio project to showcase)
- Link "Spotify Application" to "Music Tech Skills" project
- Track which projects/skills helped win interviews

**My Answer:**
- [ x] Yes, applications should link to projects
- [ ] No, keep career management separate
- [ ] Maybe later, not MVP

**If yes, how should linking work?**
```
[Describe the relationship - e.g., "Applications can reference multiple projects as portfolio examples"]
```

---

## 6. AI Integration & Automation

### A. Career Coach Mentor Persona
**Question:** What should the Career Coach mentor be able to do?

Check all that apply:
- [ x] Access all my applications, companies, contacts for context
- [ x] Automatically suggest companies to apply to
- [ x] Automatically suggest people to reach out to
- [ x] Proactively remind me to follow up
- [ x] Review my resume and suggest improvements
- [ x] Mock interview practice
- [ x] Salary negotiation advice
- [ x] Career path planning
- [ ] Other: `[SPECIFY]`

**Top 3 Most Valuable:**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### B. Automatic Actions & Notifications
**Question:** What should Turbo do automatically without asking?

Check all that apply:
- [x ] Track application deadlines and remind me
- [x ] Suggest follow-up timing (e.g., "It's been 1 week since you applied to X")
- [x ] Flag stale applications (e.g., "No response in 2 weeks")
- [x ] Suggest networking opportunities (e.g., "Y works at company Z")
- [x ] Update application status based on email replies
- [x ] Generate weekly job search progress reports
- [ ] Other: `[SPECIFY]`

**Priority Order:**
1. `[FILL IN]`
2. `[FILL IN]`
3. `[FILL IN]`

---

### C. Learning & Optimization
**Question:** How should Turbo learn from your job search?

Check all that apply:
- [ x] Track which resume versions get the most responses
- [ x] Track which email templates get the most replies
- [ x] Track which companies/industries respond fastest
- [ x] Track which skills/keywords appear in successful applications
- [ x] Suggest optimizations based on patterns (e.g., "Your response rate is higher when you mention X")
- [ ] Other: `[SPECIFY]`

**What matters most?**
1. `[FILL IN]`
2. `[FILL IN]`

---

## 7. Autonomy Level (CRITICAL)

### Final Question: How Autonomous Should This Be?

**Pick ONE level:**

- [ ] **Level 1: Fully Manual**
  - I paste job URLs manually
  - Turbo enriches data (scrapes job details, finds company info)
  - Turbo generates tailored resumes/emails on demand
  - I review and send everything myself

- [ x] **Level 2: Semi-Autonomous**
  - Turbo finds jobs matching my criteria automatically
  - Turbo generates tailored materials automatically
  - Turbo shows me everything for approval before applying/sending
  - I click "approve" or "edit" for each action

- [ ] **Level 3: Fully Autonomous**
  - Turbo finds jobs, tailors resumes, finds contacts, generates emails
  - Turbo applies and sends emails automatically
  - I review results daily (what was sent, what responses came in)
  - I only intervene for interviews/offers

**My Choice:** `[FILL IN]`

**Reasoning:**
```
[Be honest - which level will you actually use? Don't pick Level 3 if you'll
never trust it enough to let it send emails on your behalf.]
```

---

## 8. Additional Requirements

### A. Integration with Existing Features
**Question:** How should career features integrate with existing Turbo features?

**Resume Integration:**
- [x ] Parse existing resumes in `/docs/resumes/` directory
- [x ] Import resume from Markdown
- [x ] Import resume from PDF
- [x ] Track which resume sections came from which file

**Mentor Integration:**
- [ x] Create dedicated "Career Coach" mentor
- [ x] Allow career coach to access application data
- [ x] Allow career coach to trigger actions (e.g., "generate resume for X")

**Document Integration:**
- [x ] Store cover letters as Documents
- [ x] Store email templates as Documents
- [ x] Store company research notes as Documents

**Check all that apply above.**

---

### B. Data Privacy & Security
**Question:** What data should stay local vs. use external APIs?

**Local Only (never sent externally):**
- [ ] Resume content
- [ ] Application history
- [ ] Contact information
- [ ] Email drafts
- [ ] Salary expectations/negotiations

**OK to Use External APIs For:**
- [x ] Job board scraping (LinkedIn, Indeed, etc.)
- [ x] Email finding (Hunter.io, RocketReach)
- [ x] Company data enrichment (Crunchbase, LinkedIn)
- [ x] Email tracking (open/click tracking)

**My Preferences:**
```
[Specify which external services you're OK using and why]
```

---

### C. MVP Scope
**Question:** What's the absolute minimum you need to start using this?

**Must Have for MVP:**
1. `[FILL IN - e.g., "Track applications I paste manually"]`
2. `[FILL IN - e.g., "Link resume versions to applications"]`
3. `[FILL IN - e.g., "Generate tailored resumes on demand"]`

**Nice to Have (but can wait):**
1. `[FILL IN]`
2. `[FILL IN]`

**Future (not needed now):**
1. `[FILL IN]`
2. `[FILL IN]`

---

## 9. Timeline & Expectations

### A. When Do You Need This?
**Question:** What's your timeline for job searching?

**My Timeline:**
- Lease ends: `February 16, 2025`
- Want to start applying: `[asap]`
- Need job offer by: `[End of December"]`
- Want to move: `[febraury, need to stay to get my bonus]`

**Turbo MVP Deadline:**
```
[When do you need the basic career features working?] we can do this in a day
```

---

### B. Daily Usage Pattern
**Question:** How will you use Turbo for job searching daily?

**My Ideal Daily Workflow:**
```
Example - replace with your actual workflow:

Morning (30 min):
- Review new jobs Turbo found overnight
- Approve/reject applications Turbo prepared
- Review emails Turbo drafted

Afternoon (1 hour):
- Research companies Turbo flagged as interesting
- Customize resumes for high-priority applications
- Network with contacts Turbo suggested

Evening (30 min):
- Review Career Coach mentor suggestions
- Plan tomorrow's applications
- Track progress toward weekly goals
```

**Replace with your workflow:**
```
[FILL IN YOUR ACTUAL WORKFLOW]
```

---

## 10. Success Criteria

### How Will You Know This Is Working?

**Quantitative Metrics:**
- [ x] Apply to `[20]` jobs per week
- [ x] Response rate of at least `[almost doesnt matter if im applying enough but lets ay above average]`%
- [ x] Save `[all]` hours per week on applications
- [ x] Land `[8]` interviews per month
- [ ] Other: `[SPECIFY]`

**Qualitative Metrics:**
- [ x] Feel less overwhelmed by job search
- [ x] Feel more organized and in control
- [ x] Spend more time on high-value activities (networking, interviewing)
- [x ] Spend less time on low-value activities (copy-pasting, formatting)
- [ ] Other: `[SPECIFY]`

**Most Important Success Metric:**
```
THat i have more time to study for interviews and do amazing at them, fully confident, no longer held back by doubt
```

---

## NEXT STEPS

Once you fill this out:

1. **Review your answers** - make sure they're realistic and actionable
2. **Share with Claude** - paste completed doc or tell Claude it's ready
3. **Claude will create**:
   - Database schema matching your requirements
   - Migration files
   - Models, repositories, services
   - MCP tools
   - API endpoints
   - Career Coach mentor persona

**DO NOT START IMPLEMENTATION UNTIL THIS IS COMPLETED.**

---

## Notes & Questions

```
[Add any additional thoughts, questions, or requirements that don't fit above]
```
