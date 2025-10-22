---
doc_type: other
project_name: Turbo Code Platform
title: Claude Issue Management Protocol
version: '1.0'
---

# Claude Issue Management Protocol

## Authentication Requirements
- GitHub CLI (`gh`) must be authenticated with repo access
- Required scopes: `repo`, `read:org` (NOT `read:project` for basic issue management)

## Core Commands

### View Issue
```bash
gh issue view <number>
```

### List Issues
```bash
gh issue list
# Filter by state
gh issue list --state open
gh issue list --state closed
```

### Create Issue
```bash
gh issue create --title "Title" --body "Body content" --label "label1,label2"
# Available labels: priority/high, priority/medium, priority/low, type/feature, type/bug, area/core, area/ui, area/ai
```

### Update Issue Body
```bash
gh issue edit <number> --body "New body content"
```

### Add Comment
```bash
gh issue comment <number> --body "Comment text"
```

### Close Issue
```bash
gh issue close <number> --comment "Closing reason"
```

### Reopen Issue
```bash
gh issue reopen <number>
```

## Issue State Management Protocol

### Completed Features (CLOSE with comment)
- Include ✅ in comment
- List implemented components
- Reference commit/PR where completed
- Example:
```bash
gh issue close 1 --comment "✅ **Completed** - Zero-latency entry system implemented

The core entry system has been successfully implemented with:
- Sub-second entry creation via QuickEntryView and NewEntryView
- Zero typing latency with optimized SwiftUI TextEditor
- Auto-save functionality in JournalStore
- Offline-first architecture with local UserDefaults persistence

Implemented in recent commits with RadialFloatingMenu providing instant access."
```

### In Progress Features (UPDATE body with status)
- Add ## Current Status section
- List ✅ completed components
- List remaining work with [ ] checkboxes
- Example:
```bash
gh issue edit 5 --body "Original requirements...

## Current Status
🚧 **In Progress** - Foundation implemented:
- OnDeviceAI service created with local processing capabilities
- AIService infrastructure established
- TextSummarizationService implemented

## Remaining Work
- [ ] Complete AI model integration
- [ ] Implement content analysis algorithms
- [ ] Add sentiment analysis features"
```

### Won't Implement (CLOSE with explanation)
- Use ❌ in comment
- Explain reasoning clearly
- Suggest alternatives if applicable

## Project Context Rules

### Chronikle-Specific Guidelines
1. **Knowledge Graph (#10)**: NEVER close - core feature, no visualization, backend intelligence only
2. **MVP 1 Priority**: Issues #1-4 completed, focus on #5-12 for current development
3. **Demo Mode**: High priority for user onboarding experience
4. **Privacy First**: All features must be local-first, no cloud dependency
5. **Utility Over Engagement**: Avoid addictive patterns, focus on meaningful tools

### Label Usage
- `priority/high`: MVP 1 features, critical bugs
- `priority/medium`: MVP 2 features, enhancements  
- `priority/low`: Nice-to-have, future features
- `area/core`: Entry system, storage, search
- `area/ui`: User interface, UX improvements
- `area/ai`: AI services, intelligence features
- `type/feature`: New functionality
- `type/bug`: Bug fixes

### Status Indicators in Comments
- ✅ **Completed**: Feature fully implemented
- 🚧 **In Progress**: Actively being worked on
- 📋 **Planned**: Next in queue
- ❌ **Won't Do**: Not implementing, with reason

## Error Handling

### Common Issues
1. **Permission Errors**: Check `gh auth status`, may need `gh auth refresh`
2. **Project Access**: Ignore project-related errors, focus on issue management
3. **Label Not Found**: Use exact label names from available list above

### Verification Commands
```bash
# Check auth status
gh auth status

# List available labels
gh label list

# Check issue exists before operations
gh issue view <number>
```

## Batch Operations

### Update Multiple Issues
Use shell loops for bulk operations:
```bash
# Close multiple completed issues
for issue in 1 2 3 4; do
  gh issue close $issue --comment "✅ Completed in MVP 1 implementation"
done
```

### Status Updates
Always verify current state before making changes:
```bash
# Get current issue list for planning
gh issue list --json number,title,state,labels
```

## Integration with Development Workflow

### Feature Branch to Issue Updates
1. When starting feature branch, mark issue as in progress
2. Update issue body with current implementation status
3. When PR merged, close issue with completion comment
4. Reference specific commits/files in closure comment

### CI/CD Integration
- Issues can be auto-closed by commit messages: "closes #123"
- Use manual closure for better documentation and context