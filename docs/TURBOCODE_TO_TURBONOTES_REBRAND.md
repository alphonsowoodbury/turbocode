# Context → TurboNotes: Rebrand Plan

## Executive Summary

This document outlines the strategic rebrand of "Context" to "TurboNotes" as the first non-developer domain app in the Turbo Platform family.

**Timeline:** 2-3 weeks
**Effort:** Low (mostly naming, positioning, and polish)
**Impact:** High (establishes Turbo family brand, broader appeal)

---

## Why Rename?

### Problems with "Context"

1. **Too Abstract**
   - "What does Context do?" requires explanation
   - Sounds like a developer tool or library
   - Doesn't communicate value to non-technical users

2. **Positioning Confusion**
   - Is it a note-taking app?
   - Is it a knowledge base?
   - Is it documentation software?

3. **Limited Appeal**
   - Name appeals mainly to developers
   - Doesn't stand out in crowded note-taking market
   - Hard to remember or recommend

### Benefits of "TurboNotes"

1. **Crystal Clear**
   - Everyone knows what notes are
   - "Turbo" implies fast, powerful, better
   - Immediately communicates core function

2. **Family Branding**
   - Part of Turbo Platform ecosystem
   - Clear relationship to TurboCode
   - Sets up TurboMusic, TurboFitness, etc.

3. **Broader Appeal**
   - Writers, students, researchers
   - Knowledge workers of all types
   - Anyone who takes notes

4. **Marketing Clarity**
   - "Like Apple Notes, but Turbo"
   - "Notion speed, Obsidian linking, offline-first"
   - Easy to position against competitors

---

## Brand Identity

### Logo & Icon

**Before (Context):**
```
📋 or 📝 or 📄
Generic document icon
```

**After (TurboNotes):**
```
⚡📓 or 📔⚡
Lightning bolt + notebook
Matches TurboCode's ⚡ branding
```

**Color Palette:**
- Primary: Amber/Orange (warm, creative, energetic)
- Accent: Purple (knowledge, wisdom)
- Background: Clean whites/grays (focus on content)

**App Icon Design:**
```
┌────────────┐
│     ⚡      │   Bold lightning bolt
│  ════════  │   Stylized notebook lines
│  ════════  │   Amber gradient background
│  ════════  │
└────────────┘
```

---

### Positioning Statement

**TurboNotes is a lightning-fast, native notes app for people who think with their fingers.**

**Key Messages:**
- ⚡ **Fast:** Native SwiftUI, instant search, offline-first
- 🧠 **Smart:** Knowledge graph, backlinks, AI writing assistant
- 🔒 **Private:** Your data, your device, optional cloud sync
- 🔗 **Connected:** Linked thinking like Obsidian, simpler UX
- 📱 **Everywhere:** macOS, iOS, Web - seamless sync

---

### Target Personas

#### 1. The Writer
**Name:** Sarah, freelance author
**Needs:**
- Distraction-free writing environment
- Organize research and drafts
- Link ideas across multiple projects

**Pitch:** "Write faster with TurboNotes. No lag, no internet required, just you and your words."

---

#### 2. The Researcher
**Name:** Dr. Chen, academic researcher
**Needs:**
- Organize papers and literature
- Connect ideas across domains
- Build personal knowledge base

**Pitch:** "Your second brain. TurboNotes helps you discover connections between ideas you didn't know existed."

---

#### 3. The Student
**Name:** Alex, college sophomore
**Needs:**
- Class notes that are searchable
- Study materials organized by course
- Quick capture during lectures

**Pitch:** "Never lose a note again. TurboNotes syncs across your Mac, iPhone, and iPad - automatically."

---

#### 4. The Knowledge Worker
**Name:** Jamie, product manager
**Needs:**
- Meeting notes linked to projects
- Daily journal for reflection
- Quick reference for frequently used info

**Pitch:** "The only notes app you'll ever need. Fast, powerful, and actually respects your thinking process."

---

## Feature Positioning vs. Competitors

### Apple Notes
**Their Strength:** Simple, built-in, iCloud sync
**Our Edge:**
- ✅ Knowledge graph and backlinks
- ✅ AI writing assistant built-in
- ✅ Offline-first with better performance
- ✅ More powerful organization (tags, notebooks)
- ✅ Markdown support

---

### Notion
**Their Strength:** Databases, collaboration, templates
**Our Edge:**
- ✅ Native app (10x faster than Electron)
- ✅ Works offline completely
- ✅ No internet required
- ✅ Local-first (your data, your device)
- ✅ Privacy-focused (not web-based)

**Positioning:** "Notion speed, Apple Notes simplicity, Obsidian linking."

---

### Obsidian
**Their Strength:** Local files, powerful linking, community plugins
**Our Edge:**
- ✅ Modern native UI (not Electron)
- ✅ Simpler onboarding (no vault concepts)
- ✅ AI assistant built-in (not a plugin)
- ✅ Automatic sync (no third-party needed)
- ✅ Mobile apps that don't suck

**Positioning:** "Obsidian's power, Apple's polish."

---

### Bear
**Their Strength:** Beautiful design, focused writing
**Our Edge:**
- ✅ Knowledge graph visualization
- ✅ AI writing assistant
- ✅ More powerful organization
- ✅ Cross-links to TurboCode (if user has both)

**Positioning:** "Bear's beauty, Roam's brain."

---

## Rebrand Checklist

### Phase 1: Core Rename (Week 1)

#### Code Changes
- [ ] Rename database tables (`context_*` → `turbonotes_*`)
- [ ] Update API endpoints (`/api/v1/context` → `/api/v1/notes`)
- [ ] Rename Python modules (`turbo.context` → `turbo.notes`)
- [ ] Update environment variables
- [ ] Update Docker container names

#### Repository & Branding
- [ ] Rename repo on GitHub (if separate)
- [ ] Update README.md with new name
- [ ] Change app name in package.json / setup.py
- [ ] Update API documentation
- [ ] Change window titles and UI labels

#### Design Assets
- [ ] Design new app icon (⚡📓)
- [ ] Create logo variations (light/dark)
- [ ] Design launch screen
- [ ] Update favicon for web app
- [ ] Create social media cards

---

### Phase 2: Feature Polish (Week 2)

#### UI Improvements
- [ ] Redesign landing page (emphasize speed + linking)
- [ ] Polish note editor (better typography)
- [ ] Improve knowledge graph visualization
- [ ] Add quick capture modal (Cmd+Shift+N)
- [ ] Better onboarding flow for new users

#### New Features
- [ ] Daily note template (popular in Obsidian)
- [ ] Quick switcher (Cmd+K to search anything)
- [ ] Improved backlinks panel
- [ ] Reading list smart features
- [ ] AI writing assistant improvements

#### Documentation
- [ ] Write user guide (Getting Started)
- [ ] Create video demos (30s, 2min versions)
- [ ] Migration guide from other apps
- [ ] Keyboard shortcuts reference
- [ ] Templates gallery

---

### Phase 3: Marketing Launch (Week 3)

#### Website
- [ ] Landing page at turbonotes.app
- [ ] Features page with comparisons
- [ ] Pricing page (free tier + pro)
- [ ] Download page (macOS, iOS, Web)
- [ ] Blog post: "Introducing TurboNotes"

#### Content
- [ ] Demo video (2 minutes)
- [ ] Screenshots for all platforms
- [ ] Feature highlight videos (15s each)
- [ ] Blog: "Why We Renamed Context to TurboNotes"
- [ ] Blog: "TurboNotes vs. Notion/Obsidian/Bear"

#### Launch
- [ ] Tweet announcement thread
- [ ] Post on Product Hunt
- [ ] Post on Hacker News (Show HN)
- [ ] Post on Reddit (r/productivity, r/Obsidian)
- [ ] Email to Context early users

---

## Migration Strategy

### Existing Context Users

**Automated Migration:**
```python
# Migration script
async def migrate_context_to_turbonotes():
    """
    Migrate existing Context data to TurboNotes branding.
    """
    # 1. Rename database tables
    await rename_table("context_documents", "turbonotes_notes")
    await rename_table("context_projects", "turbonotes_notebooks")

    # 2. Update API endpoints (backwards compatible for 30 days)
    register_alias("/api/v1/context", "/api/v1/notes")

    # 3. Migrate user preferences
    await update_user_settings("app_name", "TurboNotes")

    # 4. Send migration notification email
    await notify_users_of_rebrand()
```

**User Communication:**
```
Subject: Context is now TurboNotes 🚀

Hi [Name],

Great news! Context is getting a new name: TurboNotes.

What's changing?
- New name, new icon, clearer positioning
- Same great features you love
- Better performance and polish
- Part of the Turbo Platform family

What's NOT changing?
- All your notes are safe
- No data migration needed
- Your account and settings stay the same

Your app will update automatically. Just click "Update to TurboNotes"
when you see the prompt.

Thanks for being an early user!
- The Turbo Team
```

---

## Pricing Strategy

### Free Tier
**"TurboNotes Free"**
- Unlimited notes and notebooks
- Local-only (no cloud sync)
- 5 AI writing assistant requests per day
- Single device

**Target:** Students, casual users, try-before-buy

---

### Pro Tier
**"TurboNotes Pro" - $4.99/month or $49/year**
- Everything in Free
- iCloud + Backend sync (all devices)
- Unlimited AI writing assistant
- Priority support
- Early access to new features

**Target:** Power users, professionals

---

### Bundle
**"Turbo Platform" - $9.99/month**
- TurboNotes Pro
- TurboCode Pro
- All future Turbo apps included
- Best value

**Target:** Multi-app users, platform enthusiasts

---

## Success Metrics

### Launch Goals (Month 1)
- 500 signups
- 100 active weekly users
- 10 paying subscribers
- 4.5+ star rating on App Store

### Growth Goals (Month 3)
- 2,000 signups
- 500 active weekly users
- 50 paying subscribers ($250 MRR)
- Featured on Product Hunt (Top 10)

### Long-term (Year 1)
- 10,000 signups
- 2,000 active weekly users
- 200 paying subscribers ($1,000 MRR)
- 5+ blog posts with 1,000+ views each

---

## Key Risks & Mitigations

### Risk 1: Existing Users Confused
**Mitigation:**
- Clear communication 2 weeks before
- In-app migration banner
- Email explaining benefits
- Backwards compatible API for 30 days

---

### Risk 2: Brand Doesn't Resonate
**Mitigation:**
- A/B test landing pages
- Survey early users on name
- Test messaging with target personas
- Iterate based on feedback

---

### Risk 3: Competitors Copy "Turbo" Naming
**Mitigation:**
- Trademark "TurboNotes" and "TurboPlatform"
- Establish brand early and loudly
- Focus on execution, not just naming
- Build community around Turbo family

---

## Timeline

### Week 1: Core Rename
**Days 1-2:** Code changes, database migration
**Days 3-4:** Design new icon and branding
**Days 5-7:** Update UI, test thoroughly

### Week 2: Feature Polish
**Days 8-10:** UI improvements and new features
**Days 11-12:** Documentation and guides
**Days 13-14:** Internal testing and bug fixes

### Week 3: Marketing Launch
**Days 15-17:** Website and content creation
**Days 18-19:** Soft launch to existing users
**Days 20-21:** Public launch and promotion

---

## Post-Launch

### Month 1: Gather Feedback
- User interviews (10-15 people)
- Analytics review (usage patterns)
- Bug fixes and quick wins
- Iterate on messaging

### Month 2: Expand Features
- Mobile app improvements
- Web app feature parity
- Knowledge graph enhancements
- AI writing assistant v2

### Month 3: Platform Integration
- Cross-link with TurboCode
- Universal search across apps
- Shared account system
- Prepare for TurboMusic launch

---

## Talking Points

### For Press
"TurboNotes is a lightning-fast, native notes app that combines the best of Apple Notes' simplicity, Obsidian's powerful linking, and Notion's organization - all in a beautiful, offline-first package. It's part of the new Turbo Platform, a family of domain-specific productivity apps built on a universal foundation."

### For Users
"TurboNotes is your second brain. Capture ideas instantly, link thoughts together, and let AI help you write better - all while your data stays private and works offline."

### For Investors (Future)
"TurboNotes validates our platform thesis: by building reusable infrastructure once, we can launch new domain apps in weeks, not months. TurboCode proved it works for developers. TurboNotes proves it works for everyone."

---

## Visual Identity

### Typography
**Headings:** SF Pro Display (Apple's system font, modern)
**Body:** SF Pro Text (readable, native)
**Code:** SF Mono (for inline code in notes)

### Color System
```
Primary:    #F59E0B  (Amber 500 - energetic, warm)
Secondary:  #8B5CF6  (Violet 500 - creative, wisdom)
Success:    #10B981  (Emerald 500 - growth)
Warning:    #F59E0B  (Amber 500)
Error:      #EF4444  (Red 500)

Text:       #111827  (Gray 900)
TextMuted:  #6B7280  (Gray 500)
Background: #FFFFFF  (White)
Surface:    #F9FAFB  (Gray 50)
Border:     #E5E7EB  (Gray 200)
```

### Dark Mode
```
Primary:    #FBBF24  (Amber 400 - brighter for dark)
Secondary:  #A78BFA  (Violet 400)

Text:       #F9FAFB  (Gray 50)
TextMuted:  #9CA3AF  (Gray 400)
Background: #111827  (Gray 900)
Surface:    #1F2937  (Gray 800)
Border:     #374151  (Gray 700)
```

---

## Sample Marketing Copy

### Landing Page Hero
```
# Your Second Brain, Turbocharged ⚡

TurboNotes is the notes app that keeps up with your thoughts.
Lightning-fast. Beautifully simple. Works offline.

[Download for Mac]  [Get iOS App]  [Try Web Version]
```

### Feature Headlines
- "Write at the Speed of Thought" (Performance)
- "Connect Your Ideas" (Knowledge Graph)
- "Write Better with AI" (AI Assistant)
- "Your Data, Your Device" (Privacy)
- "Works Everywhere" (Cross-platform)

### App Store Description
```
TurboNotes: Fast, Smart, Private

TurboNotes is a lightning-fast notes app for people who think deeply.
Built with native SwiftUI, TurboNotes is faster than web-based apps
like Notion while being simpler than complex tools like Obsidian.

FAST
⚡ Native app - no lag, no loading
⚡ Instant search across thousands of notes
⚡ Works offline completely

SMART
🧠 Knowledge graph - see how ideas connect
🧠 Backlinks - automatic bidirectional links
🧠 AI writing assistant - write better, faster

PRIVATE
🔒 Local-first - your notes stay on your device
🔒 Optional sync to your private iCloud
🔒 No ads, no tracking, no data mining

SIMPLE
📝 Markdown support for formatting
📝 Organize with notebooks and tags
📝 Daily notes and templates

Download TurboNotes and think faster.
```

---

## Conclusion

Rebranding Context to TurboNotes is a strategic move that:

1. **Clarifies positioning** - Everyone understands notes
2. **Establishes brand family** - First non-dev Turbo app
3. **Broadens appeal** - Writers, students, knowledge workers
4. **Validates platform** - Proves reusable architecture works
5. **Sets up future** - Clear path to TurboMusic, TurboFitness

**Timeline:** 3 weeks
**Cost:** Minimal (mostly time)
**Risk:** Low (migration is straightforward)
**Impact:** High (new market, brand establishment)

**Recommendation:** Proceed with rebrand immediately after TurboCode macOS app launch.

---

**Next Steps:**
1. Review and approve this plan
2. Create GitHub project for tracking
3. Begin Phase 1: Core Rename
4. Announce to existing Context users
5. Execute marketing launch

---

**Version:** 1.0
**Date:** 2025-01-27
**Status:** Ready for Implementation
