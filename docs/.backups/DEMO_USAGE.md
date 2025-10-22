# Demo Database Usage Guide

## Overview

Chronikle now has a clean dual database system that separates demo data from real user data. This provides a safe way to test features without affecting real journal entries.

## Architecture

```
JournalStoreManager
├── Real Data: JournalStore (production user data)
└── Demo Data: DemoJournalStore (sample data for testing)
```

## Usage in Views

### Before (Direct JournalStore)
```swift
struct MyView: View {
    @EnvironmentObject var journalStore: JournalStore
    
    var body: some View {
        // View code
    }
}
```

### After (Using JournalStoreManager)
```swift
struct MyView: View {
    @EnvironmentObject var storeManager: JournalStoreManager
    
    var body: some View {
        let store = storeManager.currentStore
        // View code using store
    }
}
```

## Key Features

### 1. Settings Toggle
Users can enable "Demo Mode" in Settings > Interface to switch between:
- **Real Mode**: Uses actual user journal data
- **Demo Mode**: Uses rich sample data for testing

### 2. Safe Testing
Demo data includes examples of:
- ✅ Various entry types (Thought, Idea, Task, etc.)
- ✅ Music integration examples
- ✅ Location-tagged entries
- ✅ Private entries (with Face ID demo)
- ✅ Pre-generated summaries
- ✅ URL entries
- ✅ Entries spanning months/years

### 3. Protocol-Based Design
Both stores conform to `JournalStoreProtocol`, so views work seamlessly with either:
```swift
protocol JournalStoreProtocol: ObservableObject {
    var entries: [JournalEntry] { get }
    var isLoading: Bool { get }
    var error: String? { get }
    var allTypes: Set<String> { get }
    
    func addEntry(_ content: String, types: Set<String>)
    func deleteEntry(_ entry: JournalEntry)
    func updateEntry(_ entry: JournalEntry)
    func updateEntrySummary(entryId: UUID, summary: String?, briefSummary: String?)
    func enhancedSearchEntries(matching query: String) -> [JournalEntry]
}
```

## Demo Data Features

The demo data is inspired by real chronicle patterns and includes:

### Recent Entries
- Algorithm breakthroughs
- Team meeting insights
- Coffee shop discoveries
- Learning moments

### Historical Entries
- Career transitions
- Educational milestones
- Personal reflections
- Creative projects

### Feature Examples
- **Music Integration**: Entries with ambient tracks, coding music
- **Location Tagging**: Coffee shops, parks, offices with real coordinates
- **Private Entries**: Personal reflections requiring Face ID
- **URL Entries**: Links to articles and resources
- **Summarization**: Pre-generated summaries for testing summary features

## Development Benefits

1. **Clean Production Code**: No demo conditionals in real logic
2. **Safe Feature Testing**: Test new features without affecting user data
3. **Realistic Data**: Demo entries feel authentic and relatable
4. **Easy Switching**: Toggle between modes for development and demos
5. **Comprehensive Coverage**: Examples of every app feature

## Testing Workflows

### Test Summarization
1. Enable Demo Mode
2. Enable Smart Summaries in settings
3. Watch the queue system process exactly 2 entries at a time

### Test Music Capture
1. Enable Demo Mode
2. Browse entries with music tracks
3. Test music-related UI components

### Test Private Entries
1. Enable Demo Mode
2. Enable Private Mode
3. Use Face ID to access private entries

### Test Search & Filtering
1. Enable Demo Mode
2. Search for terms like "career", "music", "breakthrough"
3. Test type-based filtering

## Migration Path

Existing views can be gradually migrated to use `JournalStoreManager`:

1. Update `@EnvironmentObject` declarations
2. Use `storeManager.currentStore` instead of direct store access
3. No changes needed to actual view logic

This approach ensures zero disruption to existing functionality while adding powerful demo capabilities!