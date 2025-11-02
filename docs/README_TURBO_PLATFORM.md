# TurboPlatform Documentation

Welcome to the TurboPlatform documentation! This README serves as the central index for all platform documentation.

---

## What is TurboPlatform?

TurboPlatform is a universal foundation for building domain-specific personal productivity and creativity applications. Instead of building isolated apps from scratch, TurboPlatform provides proven architecture for sync, storage, AI, cross-platform deployment, and knowledge graphs.

**One platform → Infinite domain apps → All platforms (macOS, iOS, Web, Android)**

---

## Documentation Index

### 📘 Core Documents

#### [TURBO_PLATFORM_VISION.md](./TURBO_PLATFORM_VISION.md)
**The master plan.** Read this first to understand the overall strategy, business model, and roadmap.

**Topics covered:**
- What is TurboPlatform and why it exists
- Product family overview (TurboCode, TurboNotes, TurboMusic, TurboFitness)
- Universal architecture and core abstractions
- Technology stack and decisions
- Business model options
- Success metrics and roadmap
- Why this approach will work

**Read this if:** You want to understand the big picture and long-term vision.

---

#### [CROSS_PLATFORM_TECHNICAL_GUIDE.md](./CROSS_PLATFORM_TECHNICAL_GUIDE.md)
**The technical implementation guide.** Deep dive into how data sharing, sync, and cross-platform deployment work.

**Topics covered:**
- Platform matrix (macOS, iOS, Web, Android)
- Data sharing architecture (App Groups, CloudKit, Backend)
- Three-layer sync system (Local → iCloud → Backend)
- Platform-specific features (Menu Bar, Widgets, Shortcuts)
- Performance optimization
- Security and authentication
- Testing strategy
- Deployment checklist

**Read this if:** You're implementing cross-platform features or sync.

---

#### [DOMAIN_APPS_GUIDE.md](./DOMAIN_APPS_GUIDE.md)
**Complete specifications for each domain app.** Detailed breakdown of TurboCode, TurboNotes, TurboMusic, and TurboFitness.

**Topics covered:**
- Target audience and value proposition per app
- Data models and domain mapping
- Unique features and capabilities
- UI screens for each platform
- Domain comparison matrix

**Read this if:** You're building or understanding a specific domain app.

---

#### [PLATFORM_COMPONENTS_LIBRARY.md](./PLATFORM_COMPONENTS_LIBRARY.md)
**The reusable components that power everything.** Reference for all shared code.

**Topics covered:**
- Core data models (Entity, Container, WorkItem)
- Storage provider and local database
- Sync engine and offline queue
- UI components (EntityListView, WorkQueueView, QuickCaptureSheet)
- AI integration
- Utilities (NetworkMonitor, Logger)
- Usage examples

**Read this if:** You're building a new domain app or contributing to the platform.

---

#### [TURBOCODE_TO_TURBONOTES_REBRAND.md](./TURBOCODE_TO_TURBONOTES_REBRAND.md)
**The Context → TurboNotes rebrand plan.** Strategic document for rebranding the first non-dev domain app.

**Topics covered:**
- Why rename Context to TurboNotes
- Brand identity (logo, colors, positioning)
- Target personas and messaging
- Feature positioning vs competitors
- Complete rebrand checklist (3-week plan)
- Migration strategy for existing users
- Pricing and success metrics
- Marketing launch plan

**Read this if:** You're working on the TurboNotes rebrand or launch.

---

## Quick Start Guides

### For Users

**Want to use Turbo apps?**

1. **TurboCode** (Available Now)
   ```bash
   git clone https://github.com/username/turboCode
   cd turboCode
   docker-compose up -d
   # Open http://localhost:3010
   ```

2. **TurboNotes** (Rebrand in Progress)
   - Same backend as TurboCode
   - Access at http://localhost:3010/notes

3. **Native Apps** (Coming Q1 2025)
   - macOS and iOS apps
   - Download from turboapps.com

---

### For Developers

**Want to build a domain app?**

1. **Study the architecture**
   - Read [TURBO_PLATFORM_VISION.md](./TURBO_PLATFORM_VISION.md)
   - Review [PLATFORM_COMPONENTS_LIBRARY.md](./PLATFORM_COMPONENTS_LIBRARY.md)
   - Explore TurboCode source code

2. **Define your domain**
   - What are your Entities?
   - What are your Containers?
   - What makes a WorkItem in your domain?
   - See [DOMAIN_APPS_GUIDE.md](./DOMAIN_APPS_GUIDE.md) for examples

3. **Build on the platform**
   ```swift
   import TurboPlatform

   // Define domain model
   struct MyEntity: Entity, WorkItem {
       // Implement required properties
   }

   // Use platform components
   EntityListView(entities: myEntities) { entity in
       MyCustomRow(entity: entity)
   }
   ```

4. **Deploy across platforms**
   - SwiftUI for macOS/iOS (shared code)
   - Next.js for Web (existing backend)
   - See [CROSS_PLATFORM_TECHNICAL_GUIDE.md](./CROSS_PLATFORM_TECHNICAL_GUIDE.md)

---

## Architecture Overview

### The Stack

```
┌─────────────────────────────────────────────────┐
│         Domain Apps (TurboCode, etc.)            │
├─────────────────────────────────────────────────┤
│         UI Components (Reusable Views)           │
├─────────────────────────────────────────────────┤
│         Services (Sync, AI, Search)              │
├─────────────────────────────────────────────────┤
│         Data Models (Entity, Container)          │
├─────────────────────────────────────────────────┤
│         Infrastructure (Storage, Network)        │
└─────────────────────────────────────────────────┘
```

### Core Concepts

**Entity** - Basic building block (Issue, Note, Track, Workout)
**Container** - Collection of entities (Project, Notebook, Album, Program)
**WorkItem** - Trackable, prioritizable entity
**Tag** - Organization and categorization
**Mentor** - Domain-specific AI assistant

### Data Flow

```
User Action
    ↓
1. Save to Local SQLite (instant)
    ↓
2. Queue for iCloud Sync (background)
    ↓
3. Queue for Backend Sync (background)
    ↓
All devices see update
```

---

## Product Family

### 🔧 TurboCode
**"Project management for developers"**
- Status: ✅ In active development
- Target: Software developers
- Features: Issues, git worktrees, blueprints, engineering mentor

### 📝 TurboNotes
**"Your second brain"**
- Status: 🔄 Rebrand from Context
- Target: Writers, researchers, knowledge workers
- Features: Linked notes, knowledge graph, reading list, writing assistant

### 🎵 TurboMusic
**"Studio management for producers"**
- Status: 🔜 Planned after platform extraction
- Target: Music producers, audio engineers
- Features: Track management, sample library, BPM detection, production mentor

### 💪 TurboFitness
**"Your personal trainer"**
- Status: 🔮 Future validation
- Target: Athletes, fitness enthusiasts
- Features: Workout tracking, progress photos, meal planning, trainer AI

---

## Technology Decisions

### Backend
- **Current:** FastAPI + Python
- **Database:** PostgreSQL (cloud), SQLite (local)
- **API:** REST with OpenAPI/Swagger docs

### Frontend
- **Native:** SwiftUI (macOS, iOS, iPadOS)
- **Web:** Next.js + React + TypeScript
- **Android:** TBD (Kotlin Multiplatform or Flutter)

### Sync
- **Layer 1:** Local SQLite (instant, offline)
- **Layer 2:** iCloud + CloudKit (Apple devices)
- **Layer 3:** FastAPI backend (all platforms)

### AI
- **Model:** Claude 3.5 Sonnet
- **Integration:** Built-in domain mentors
- **Context:** Semantic search for relevant entities

---

## Development Roadmap

### Phase 1: Prove Cross-Platform (Q1 2025)
- [x] FastAPI backend for TurboCode
- [x] Next.js web UI for TurboCode
- [ ] SwiftUI macOS app (2-3 weeks)
- [ ] SwiftUI iOS app (1 week)
- [ ] CloudKit sync (1 week)

### Phase 2: Extract Platform (Q2 2025)
- [ ] Identify universal patterns
- [ ] Create TurboPlatform Swift Package
- [ ] Refactor TurboCode to use package
- [ ] Document platform APIs

### Phase 3: Rebrand + Polish (Q2 2025)
- [ ] Context → TurboNotes rebrand
- [ ] Polish notes editor
- [ ] Improve knowledge graph
- [ ] Build macOS/iOS apps

### Phase 4: Validate Platform (Q3 2025)
- [ ] Design TurboMusic
- [ ] Build macOS/iOS apps
- [ ] Test platform reusability
- [ ] Private beta

### Phase 5: Scale & Grow (Q4 2025)
- [ ] Open source TurboPlatform
- [ ] Build TurboFitness
- [ ] Launch hosted backend service
- [ ] Build community

---

## Contributing

### Areas for Contribution

1. **Platform Core**
   - Sync improvements
   - Storage optimization
   - AI enhancements
   - Cross-platform features

2. **UI Components**
   - Reusable views
   - Accessibility
   - Performance
   - Documentation

3. **Domain Apps**
   - Bug fixes
   - Feature requests
   - Design improvements
   - Testing

4. **Documentation**
   - Tutorials
   - Examples
   - API reference
   - Video guides

---

## Support & Community

### Getting Help

- **Issues:** GitHub Issues for bug reports
- **Discussions:** GitHub Discussions for questions
- **Discord:** (Coming soon)
- **Email:** support@turboapps.com (Coming soon)

### Resources

- **Website:** turboapps.com (Coming soon)
- **Blog:** turboapps.com/blog (Coming soon)
- **Twitter:** @turboapps (Coming soon)
- **YouTube:** Turbo Platform (Coming soon)

---

## License

TBD - Will likely be:
- **TurboPlatform Core:** MIT or Apache 2.0 (open source)
- **Domain Apps:** Proprietary (paid apps)
- **Documentation:** CC BY 4.0

---

## Project Structure

```
turboCode/
├── docs/                                    # 📚 You are here
│   ├── README_TURBO_PLATFORM.md            # This file
│   ├── TURBO_PLATFORM_VISION.md            # Master plan
│   ├── CROSS_PLATFORM_TECHNICAL_GUIDE.md   # Implementation guide
│   ├── DOMAIN_APPS_GUIDE.md                # App specifications
│   ├── PLATFORM_COMPONENTS_LIBRARY.md      # Reusable components
│   └── TURBOCODE_TO_TURBONOTES_REBRAND.md  # Rebrand plan
├── turbo/                                   # Python backend
│   ├── api/                                # FastAPI endpoints
│   ├── core/                               # Business logic
│   │   ├── models/                         # SQLAlchemy models
│   │   ├── repositories/                   # Data access
│   │   ├── services/                       # Business services
│   │   └── schemas/                        # Pydantic schemas
│   └── mcp_server.py                       # MCP integration
├── frontend/                                # Next.js web UI
│   ├── app/                                # Next.js 13+ app router
│   ├── components/                         # React components
│   └── hooks/                              # Custom React hooks
├── migrations/                              # Database migrations
└── docker-compose.yml                       # Docker setup
```

---

## Frequently Asked Questions

### Why build a platform instead of individual apps?

Building the hard parts once (sync, storage, AI, cross-platform) means new domain apps take days instead of months. Plus, the apps get better together - shared account, cross-app linking, consistent UX.

### Why not use Flutter/React Native for everything?

Native SwiftUI apps are significantly faster and provide better OS integration. We value performance and native feel over write-once-deploy-everywhere. Web version exists for universal access.

### Will TurboPlatform be open source?

The plan is to open source the core platform while keeping domain apps proprietary. This builds trust, enables community contributions, and creates a standard for personal productivity apps.

### Can I build my own domain app on TurboPlatform?

Yes! Once we extract and document the platform (Q2 2025), anyone can build domain apps. The platform will be designed for extensibility.

### How do I migrate from Notion/Obsidian/etc?

Import tools are planned for TurboNotes. For now, you can:
1. Export from your current tool (usually markdown)
2. Import via API or bulk upload
3. Use knowledge graph to auto-link notes

---

## Next Steps

1. **Understand the vision:** Read [TURBO_PLATFORM_VISION.md](./TURBO_PLATFORM_VISION.md)
2. **Learn the tech:** Read [CROSS_PLATFORM_TECHNICAL_GUIDE.md](./CROSS_PLATFORM_TECHNICAL_GUIDE.md)
3. **Explore domain apps:** Read [DOMAIN_APPS_GUIDE.md](./DOMAIN_APPS_GUIDE.md)
4. **Start building:** Review [PLATFORM_COMPONENTS_LIBRARY.md](./PLATFORM_COMPONENTS_LIBRARY.md)

---

**Let's build the future of personal productivity software. 🚀**

---

**Version:** 1.0
**Last Updated:** 2025-01-27
**Status:** Living Document
