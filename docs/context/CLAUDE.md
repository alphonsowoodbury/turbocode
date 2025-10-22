---
doc_type: other
project_name: Turbo Code Platform
title: CLAUDE.md
version: '1.0'
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Context is an AI-Enhanced Personal Knowledge System built as a cross-platform SwiftUI application targeting iOS and macOS. The core philosophy emphasizes zero-friction entry & retrieval, privacy-first design, utility over engagement, and Apple-grade UX.

## Development Commands

### Building and Running
- **iOS Simulator**: Open `Context.xcodeproj` in Xcode and run the `Context` scheme
- **macOS**: Open `Context.xcodeproj` in Xcode and run the `Context` scheme with macOS destination
- **macOS Specific Build**: Use the `ContextMacOS` target for macOS-specific features

### Project Structure
The project uses Xcode's new file system synchronized build system. Key targets:
- `Context`: Main iOS/macOS universal app
- `ContextMacOS`: macOS-specific variant with additional features

## Architecture Overview

### Core Data Models
- **JournalEntry**: Primary content model with `id`, `content`, `date`, and `types` (Set<String>)
- **InfoEntry**: Structured data model with key/value pairs, optional notes, and date
- **JournalStore**: Singleton ObservableObject managing all entries, persistence via UserDefaults with JSON encoding

### App Structure
- **ContextApp**: Main app entry point with conditional compilation for iOS/macOS
- **macOS Features**: MenuBarExtra for quick entry, dedicated Settings window
- **Cross-platform**: Shared Views with conditional UI elements

### Data Management
- **Persistence**: UserDefaults with JSON encoding (transitioning to local DB + sync)
- **State Management**: SwiftUI @StateObject and @ObservableObject patterns
- **Entry Types**: Dynamic typing system with base types ("Thought", "Dream", "Idea", "Info", "Log")

### UI Architecture
- **Navigation**: TabView on iOS, WindowGroup on macOS
- **Entry Management**: Timeline-based grouping (Today, Yesterday, This Week, etc.)
- **Search & Filtering**: Real-time search with tag-based filtering
- **Quick Entry**: Dedicated quick entry interface for minimal friction

### Key Views
- **TimelineView**: Main entry display with time-based grouping
- **ContentView**: Root navigation container with platform-specific layouts
- **QuickEntryView**: Minimal entry creation interface
- **EntryDetailView**: Full entry display and editing

### Platform Differences
- **iOS**: Tab-based navigation, standard iOS patterns
- **macOS**: Hidden title bar, menu bar extra, dedicated settings window
- **Shared**: Core functionality and data models are universal

### Developer Features
- **Developer Mode**: Toggle via @AppStorage("developerMode")
- **Text Size**: Configurable via @AppStorage("textSize") with 16pt default
- **Entry Types**: Dynamic type system with predefined base types

### Sync Architecture (Planned)
- Current: Local persistence via UserDefaults
- Future: Local DB with sync queue for cloud synchronization
- Privacy-first approach with user-controlled data





# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Context (formerly Chronikle) is a privacy-first personal journaling system built as a native SwiftUI application for iOS and macOS. It exemplifies Apple's design philosophy of powerful simplicity - sophisticated technology that disappears into intuitive, human-centered experiences.

**Design Philosophy**: Context reimagines digital journaling through the lens of effortless capture and temporal relevance. The app removes all friction between thought and record, allowing users to deposit their consciousness into a trusted system and return to the present moment. Its timeline-based architecture naturally surfaces recent thoughts while gracefully aging older content, encouraging regular reflection cycles that promote self-awareness and personal growth.

**Ambient Intelligence**: Context enriches every entry with automatic contextual capture - location, music, and temporal data - transforming simple text into rich, multidimensional memories. This ambient metadata enables powerful recall patterns: rediscover thoughts by where you were, what you were listening to, or when they occurred. The system remembers context so users don't have to.

**Note**: Some documentation may still reference "Chronikle" - this was the previous name.

## Development Commands

### Building and Running
```bash
# Build for iOS Simulator
xcodebuild -scheme Context -destination 'platform=iOS Simulator,name=iPhone 15 Pro' build

# Run tests
xcodebuild -scheme Context -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test

# Build for release
xcodebuild -scheme Context -configuration Release build

# Open in Xcode (recommended for development)
open Context.xcodeproj
```

### Known Build Issues
- **App Groups Capability**: Currently causing build failures for share extension
- **Workaround**: Set `CODE_SIGN_ALLOW_ENTITLEMENTS_MODIFICATION=YES` or temporarily disable App Groups
- **Share Extension**: Currently disabled due to provisioning profile limitations

### Project Structure
- Native iOS/macOS app using Xcode project format (`.xcodeproj`)
- No external package managers (SPM, CocoaPods, Carthage)
- Pure SwiftUI implementation with iOS 17+ target
- Dual database architecture for demo mode (JournalStoreManager)

## High-Level Architecture

### Core Components

**Data Layer**
- `JournalEntry`: Primary data model with:
  - Core content: text, date, types
  - Ambient context: Focus mode, location, music track, weather (planned)
  - All metadata captured automatically at creation time
- `JournalStore`: Singleton ObservableObject managing all entries, currently using UserDefaults with JSON encoding
- `JournalStoreManager`: Additional store management layer for advanced operations

**Entry Types System**
- Six fundamental categories:
  - **Thought**: Reflections, observations, mental notes
  - **Idea**: Creative concepts, innovations, brainstorms
  - **Task**: Actions, reminders, to-dos
  - **Note**: General notes and information
  - **Dream**: Dream logs and subconscious thoughts
  - **Info**: Structured data with key-value pairs
- Entries can have multiple types (Set<String>)
- Info entries support structured key-value pairs with optional notes

**View Architecture**
- `ContextApp`: Main app entry point with @StateObject initialization
- `ContentView`: Root navigation container with TabView
- `TimelineView`: Main entry display with chronological organization
  - Time-based grouping (Today, Yesterday, This Week, etc.)
  - Visual type indicators for quick scanning
  - Contextual metadata display (location, music, etc.)
- `NewEntryView`: Minimal friction entry creation
  - Type selection for categorization
  - Voice input capability
  - Context capture (time, location, music if available)
  - Quick save/cancel actions
- `EntryDetailView`: Complete entry information
  - Full content display
  - All associated metadata (location, music, time)
  - Inter-entry navigation capability
  - Edit functionality
- `SearchView`: Full-text search across all entries

**Services** (Ambient Context Capture)
- `FocusService`: Captures current iOS Focus mode (Work, Personal, Sleep, etc.) - critical for context
- `LocationService`: Captures location context with place names (incomplete background tracking)
- `MusicService`: Captures currently playing music/podcast (iOS only, macOS missing)
- `BiometricAuthenticationService`: Face ID/Touch ID for private entries
- `TextSummarizationService`: AI-powered summarization (integration incomplete)
- `OnDeviceAI`: Local AI processing (architecture incomplete - empty methods at lines 356-369)

**Metadata Automatically Captured Per Entry**:
- **Focus Mode**: What mode you were in (Deep Work, Personal, Sleep, Driving, etc.)
- **Location**: Where you were (with place name if available)
- **Music/Audio**: What you were listening to
- **Time**: When it happened (with smart relative grouping)
- **Device State**: Battery level, network state (planned)
- **Weather**: Current conditions (planned)
- **Calendar Context**: What meeting/event was happening (planned)

### Key Design Patterns

**State Management**
- SwiftUI @StateObject for app-level state (JournalStore)
- @EnvironmentObject for view hierarchy state propagation
- @AppStorage for user preferences (textSize, developerMode)

**Data Persistence**
- Current: UserDefaults with JSON encoding
- Conflicting plans in documentation:
  - CoreData for local persistence (architecture.yaml)
  - CloudKit for cloud integration (development.yaml)
  - Local DB with sync queue (CLAUDE.md in documents/)
- All data stays on-device by default (privacy-first)
- Demo mode with dual database architecture via JournalStoreManager

**UI/UX Principles**
- Zero-friction entry creation (single tap to start)
- Timeline-based organization (temporal context is primary)
- Natural language search including metadata ("entries while in Work Focus", "thoughts at the gym")
- No manual metadata entry required - everything captured automatically
- Visual indicators for all context (Focus mode badge, location pin, music note)
- Voice input as first-class citizen
- Progressive disclosure (summary + key context in timeline, full detail on tap)
- Seamless navigation between entries
- Auto-save and background sync
- Privacy indicators for sensitive content
- Context becomes searchable memory ("What was I thinking when that song played?")

### Critical Implementation Notes

1. **Timeline Organization**: 
   - Entries grouped by relative time periods (Today, Yesterday, This Week, Last Week, etc.)
   - Chronological ordering within groups
   - Visual separation between time periods

2. **Context Capture** (Core Feature):
   - Automatic capture of ALL available ambient context without user action:
     - Focus mode (Work, Personal, Sleep, Fitness, Driving, etc.)
     - Location with place name resolution
     - Currently playing music/podcast/audiobook
     - Time and date
   - Context displayed prominently in timeline and detail views
   - Context becomes searchable: "entries during Deep Work", "ideas while running"
   - No manual logging - the app remembers the context so you don't have to
   - Optional manual override if needed

3. **Privacy & Security**: 
   - Private entries protected with biometric authentication
   - All data stored locally by default
   - Export capability for data portability

4. **Performance Requirements**: 
   - Sub-1.5 second launch time
   - Instant search across thousands of entries
   - Smooth 60fps scrolling in timeline

5. **Entry Creation Flow**:
   - Single tap to start new entry
   - Auto-focus on text input
   - Type selection without interrupting flow
   - Voice input alternative to typing

6. **Share Extension**: 
   - System-wide capture via share sheet
   - Currently disabled due to App Groups provisioning issues
   - File structure: `/ChronikleShareExtension/` (needs renaming to Context)

7. **Entry Types & Parsing**:
   - Info entries parse key-value pairs from structured text
   - Type determines default behavior and display
   - Multiple types per entry supported

8. **Platform Integration**:
   - Shortcuts app integration with App Intents
   - Action Button support (iPhone 15 Pro)
   - Siri voice commands
   - Focus mode awareness (via App Intents + Shortcuts automations until native API available)

## Critical Development Rules

**NEVER USE DEBUG MODE OR TEMPORARY SOLUTIONS**
- Never add #if DEBUG blocks or simulated data
- Never create "temporary" workarounds or fake implementations
- Always implement real functionality or clearly state if something cannot be done
- Never pretend a feature works when it doesn't
- If a feature requires specific device capabilities or permissions, state this clearly

## Apple Engineering Excellence Standards

### Code Quality Principles

**Architecture**
- Follow Model-View-ViewModel (MVVM) with clear separation of concerns
- Use dependency injection for testability and modularity
- Implement coordinator pattern for navigation flow
- Design with protocol-oriented programming (POP) principles
- Create single-purpose, composable components
- Maintain immutable state where possible

**Swift Best Practices**
- Leverage Swift's type system for compile-time safety
- Use `Result` types for error handling
- Implement proper access control (`private`, `fileprivate`, `internal`, `public`)
- Prefer value types (structs) over reference types when appropriate
- Use extensions to organize code logically
- Implement computed properties for derived values
- Apply `@MainActor` for UI-bound code
- Use async/await for asynchronous operations

**SwiftUI Excellence**
- Compose views from small, reusable components
- Implement proper view lifecycle management
- Use `@StateObject` for ownership, `@ObservedObject` for references
- Leverage `@Environment` for dependency injection
- Implement proper animation with `.animation(_:value:)`
- Use `ViewModifier` for reusable styling
- Optimize with `EquatableView` where needed
- Implement proper dark mode support with semantic colors

### Security & Privacy

**Data Protection**
- Encrypt sensitive data at rest using Apple's Crypto frameworks
- Implement proper keychain storage for credentials
- Use App Transport Security (ATS) for network requests
- Validate and sanitize all user inputs
- Implement certificate pinning for critical endpoints
- Use `SecureField` for sensitive text input
- Clear sensitive data from memory after use

**Privacy Engineering**
- Request permissions only when needed with clear explanations
- Implement granular privacy controls
- Provide data export functionality
- Support account deletion with complete data removal
- Minimize data collection to essential functionality
- Implement on-device processing where possible
- Use differential privacy for analytics if needed

### Performance Optimization

**Launch Performance**
- Lazy load non-critical resources
- Implement proper app lifecycle management
- Use `@AppStorage` for lightweight preferences
- Defer heavy operations until after first frame
- Optimize asset catalog with proper sizing
- Implement progressive loading for large datasets

**Runtime Performance**
- Use Instruments for profiling (Time Profiler, Allocations, Leaks)
- Implement proper list virtualization with `LazyVStack`
- Cache expensive computations
- Use `@State` and `@Binding` judiciously to minimize redraws
- Implement debouncing for search and input
- Profile and optimize Core Data fetches
- Use background queues for heavy processing

**Memory Management**
- Avoid retain cycles with `[weak self]` in closures
- Implement proper image caching and disposal
- Monitor memory warnings and respond appropriately
- Use autorelease pools for batch operations
- Profile with Memory Graph Debugger
- Implement proper cleanup in `deinit`

### User Experience Excellence

**Accessibility**
- Support Dynamic Type for all text
- Implement VoiceOver with descriptive labels
- Provide sufficient color contrast (WCAG AA minimum)
- Support Reduce Motion preferences
- Implement keyboard navigation
- Add haptic feedback appropriately
- Support Switch Control and Voice Control

**Responsive Design**
- Support all device sizes and orientations
- Implement proper safe area handling
- Use adaptive layouts with size classes
- Support multitasking on iPad
- Implement proper keyboard avoidance
- Scale UI elements appropriately

**Error Handling**
- Never crash - handle all error cases gracefully
- Provide actionable error messages
- Implement retry mechanisms where appropriate
- Log errors for debugging without exposing sensitive data
- Provide offline functionality where possible
- Show loading states for async operations

### Testing & Quality Assurance

**Test Coverage**
- Maintain >80% code coverage for business logic
- Write unit tests for all public APIs
- Implement UI tests for critical user flows
- Add performance tests for key operations
- Test error conditions and edge cases
- Implement snapshot tests for UI consistency

**Testing Best Practices**
- Follow Arrange-Act-Assert pattern
- Use dependency injection for mockability
- Test behaviors, not implementation details
- Keep tests isolated and repeatable
- Use XCTest expectations for async code
- Implement proper test data builders

### Documentation Standards

**Code Documentation**
- Document all public APIs with triple-slash comments
- Include usage examples in documentation
- Document complex algorithms and business logic
- Add MARK: comments for code organization
- Document any workarounds with FIXME: or TODO:
- Include complexity annotations (O(n)) where relevant

**Architecture Documentation**
- Maintain up-to-date README
- Document design decisions in ADRs (Architecture Decision Records)
- Include diagrams for complex flows
- Document API contracts clearly
- Maintain changelog for version history

### Continuous Improvement

**Code Review Checklist**
- Verify no force unwrapping (`!`) without safety checks
- Ensure proper error handling
- Check for potential race conditions
- Verify accessibility support
- Confirm no hardcoded strings (use Localizable.strings)
- Validate proper memory management
- Ensure consistent code style

**Performance Monitoring**
- Implement MetricKit for production monitoring
- Track app launch time
- Monitor memory usage trends
- Track crash-free sessions rate
- Monitor network request performance
- Implement proper analytics with privacy

### Platform Integration

**iOS Ecosystem**
- Support Handoff for continuity
- Implement proper Share Sheet integration
- Support Shortcuts app with App Intents
- Integrate with Focus modes appropriately
- Support widgets where valuable
- Implement proper notification handling

**Developer Tools**
- Use Xcode Cloud for CI/CD
- Implement proper scheme configuration
- Use build configurations effectively
- Leverage Xcode Previews for rapid development
- Implement proper versioning strategy
- Use TestFlight for beta testing

## Common Tasks

### Adding New Entry Types
1. Add to `JournalStore.defaultTypes` array
2. Update UI picker in `NewEntryView`
3. Consider adding specific icon/color in `EntryRowView`

### Modifying Data Models
1. Update the Codable struct in Models/
2. Handle migration in `JournalStore.loadEntries()`
3. Update any dependent views

### Testing
- Unit tests in ContextTests/
- UI tests in ContextUITests/
- Focus on Timeline performance with `TimelineStressTest`

## Performance Targets
- Launch time: < 1.2 seconds cold start
- Share extension: < 0.3 seconds completion
- Search response: < 0.2 seconds across lifetime of data
- Memory: < 100MB average, < 200MB peak
- Battery: < 2% per hour active use
- Animations: 60fps always
- Zero UI jank or lag

## Current Known Issues

### High Priority
1. **OnDeviceAI architecture broken** - Empty task coordination methods (lines 356-369)
2. **Location services incomplete** - No background tracking implementation
3. **Music integration iOS-only** - macOS support missing
4. **Search panel positioning** - Keyboard-attached search broken
5. **Share extension disabled** - App Groups provisioning issues

### Implementation Gaps
- TextSummarizationService integration incomplete
- LLM Chat persistence missing
- Smart Insights not implemented
- Cross-platform UI inconsistencies

## Future Vision: Folios

**Concept**: Folios are intelligent, living collections that transcend smart folders. They automatically synthesize related entries into continuously updated artifacts - turning your stream of consciousness into actionable intelligence.

**Example Use Cases**:
- Development folio auto-maintains `CLAUDE.md` from scattered technical decisions
- Therapy folio generates session prep notes from weekly reflections  
- Recipe folio evolves master recipes with each cooking note
- Work folio creates project updates from daily thoughts

**Key Innovation**: On-device AI continuously regenerates purpose-built documents as new entries are added, making captured thoughts immediately useful without manual synthesis.

See `documents/FOLIOS_CONCEPT.md` for complete vision.

## Success Metrics
- **User Engagement**: 85% retention after 30 days
- **Performance**: < 0.01% crash rate
- **Behavior Change**: 50% users sharing to Context by default within 30 days
- **Business**: 15% trial-to-paid conversion (if applicable)