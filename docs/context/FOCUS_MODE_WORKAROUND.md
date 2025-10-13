# Focus Mode Detection via App Intents & Shortcuts

## The Strategy

Until Apple approves broader Focus mode API access, we can use App Intents to create a seamless Focus detection experience through Shortcuts automations. This approach is:
- **100% App Store compliant** - Uses only public APIs
- **User-friendly** - One-time setup, then automatic
- **Reliable** - Shortcuts automations run consistently
- **Future-proof** - Easy to migrate when Apple opens the API

## Implementation Plan

### 1. Create App Intents

```swift
import AppIntents

struct SetFocusModeIntent: AppIntent {
    static var title: LocalizedStringResource = "Set Focus Mode"
    static var description = IntentDescription("Updates Context with your current Focus mode")
    
    @Parameter(title: "Focus Mode")
    var focusMode: String
    
    func perform() async throws -> some IntentResult {
        // Update FocusService with the current mode
        await FocusService.shared.updateFocus(focusMode)
        return .result()
    }
}

struct ClearFocusModeIntent: AppIntent {
    static var title: LocalizedStringResource = "Clear Focus Mode"
    static var description = IntentDescription("Clears Focus mode when Focus ends")
    
    func perform() async throws -> some IntentResult {
        await FocusService.shared.clearFocus()
        return .result()
    }
}

// App Shortcuts provider
struct ContextShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: SetFocusModeIntent(),
            phrases: [
                "Set Focus in \(.applicationName)",
                "Update \(.applicationName) Focus"
            ],
            shortTitle: "Set Focus",
            systemImageName: "moon.circle"
        )
    }
}
```

### 2. Enhanced FocusService

```swift
class FocusService: ObservableObject {
    @Published var currentFocusMode: String?
    @Published var lastUpdated: Date?
    
    func updateFocus(_ mode: String) async {
        await MainActor.run {
            self.currentFocusMode = mode
            self.lastUpdated = Date()
            
            // Store in UserDefaults for persistence
            UserDefaults.standard.set(mode, forKey: "currentFocusMode")
            UserDefaults.standard.set(Date(), forKey: "focusLastUpdated")
            
            // Post notification for any listening views
            NotificationCenter.default.post(
                name: .focusModeChanged,
                object: nil,
                userInfo: ["mode": mode]
            )
        }
    }
    
    func clearFocus() async {
        await MainActor.run {
            self.currentFocusMode = nil
            UserDefaults.standard.removeObject(forKey: "currentFocusMode")
        }
    }
}
```

### 3. User Onboarding Flow

Create a dedicated onboarding screen that:

1. **Explains the Value**
   - "Context can automatically tag your entries with your Focus mode"
   - "Know what you were thinking during Work vs Personal time"

2. **Guides Setup** (with screenshots)
   - Opens Shortcuts app
   - Shows exact steps for each Focus mode
   - Provides pre-configured shortcuts via links

3. **Tests the Connection**
   - Button to trigger test Focus change
   - Confirms when working correctly

### 4. Shortcuts Automation Templates

Provide users with easy-to-install automations:

**Work Focus Automation**
```
Trigger: When Work Focus turns on
Actions:
1. Run "Set Focus Mode" with input "Work"
```

**Personal Focus Automation**
```
Trigger: When Personal Focus turns on
Actions:
1. Run "Set Focus Mode" with input "Personal"
```

**Focus Off Automation**
```
Trigger: When any Focus turns off
Actions:
1. Run "Clear Focus Mode"
```

### 5. Smart Fallbacks

If Focus mode hasn't been updated recently:
- Check time patterns (work hours = likely Work focus)
- Check location (home vs office)
- Check calendar (meeting = likely Work focus)
- Prompt user to confirm current mode

### 6. UI Integration

```swift
struct NewEntryView: View {
    @StateObject private var focusService = FocusService.shared
    
    var body: some View {
        VStack {
            // Show current Focus if detected
            if let focus = focusService.currentFocusMode {
                HStack {
                    Image(systemName: "moon.fill")
                        .foregroundColor(.purple)
                    Text("\(focus) Focus")
                        .font(.caption)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.purple.opacity(0.1))
                .cornerRadius(8)
            }
            
            // Rest of entry UI...
        }
    }
}
```

## User Experience Flow

### First-Time Setup (One-time, 2 minutes)
1. App shows "Enable Focus Detection" card
2. User taps "Set Up"
3. Guided walkthrough with Shortcuts app
4. Test to confirm working
5. Card disappears forever

### Daily Use (Automatic)
1. User enables Work Focus on iPhone
2. Shortcuts automation triggers instantly
3. Context updates Focus mode
4. All new entries tagged with "Work"
5. User never thinks about it

### Entry Creation
- Focus badge shows current mode
- Entries automatically tagged
- Can manually override if needed
- Search works instantly: "entries during Work Focus"

## Marketing This Feature

### App Store Description
"Automatic Focus mode tagging (with simple one-time setup)"

### Onboarding Message
"Context can remember which Focus mode you were in for each entry. Set up once in 2 minutes, works forever."

### Support Documentation
- Video walkthrough
- Step-by-step screenshots
- Troubleshooting guide
- FAQ section

## Benefits Over URL Schemes

1. **More Elegant**: No URL opening/app switching
2. **Background Operation**: Works even when app is closed
3. **Native Integration**: Feels like built-in iOS feature
4. **Better Analytics**: Can track which Focuses are used
5. **Richer Data**: Can pass additional parameters

## Future Migration Path

When Apple approves Focus API access:
1. Detect if user has Shortcuts automations
2. Show "Upgrade to Native Focus Detection"
3. Automatically migrate their settings
4. Thank them for being early adopters
5. Disable Shortcuts automations

## Technical Considerations

### Performance
- Intents run in separate process
- Minimal battery impact
- Near-instant execution

### Reliability
- Shortcuts automations are highly reliable in iOS 17+
- Store last known Focus with timestamp
- Graceful degradation if automation fails

### Privacy
- All data stays on device
- No network calls required
- User has complete control

## Implementation Priority

1. **Phase 1**: Basic App Intents (1 day)
2. **Phase 2**: Onboarding UI (2 days)
3. **Phase 3**: Shortcuts templates (1 day)
4. **Phase 4**: Testing & refinement (2 days)

Total: ~1 week to production-ready

## Success Metrics

- 40% of users complete Focus setup
- 80% of those keep it enabled after 30 days
- 25% increase in entry creation (due to context value)
- 50% use Focus-based search within first month

---

*Note: This is a legitimate workaround that provides real value while we wait for Apple to expand Focus API access. It demonstrates our commitment to user experience even within platform constraints.*