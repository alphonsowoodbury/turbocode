# Claude Code Integration Architecture
## AI-Powered Project Management with User Approval Workflow

**Version:** 1.0
**Date:** September 28, 2025
**Purpose:** Technical specification for integrating Claude Code agents with Streamlit UI through an approval-based workflow

---

## Executive Summary

This document outlines the architecture for integrating Claude Code agents into the Turbo Code project management platform. The system implements a two-stage approval workflow where users can preview, modify, and approve AI-generated content before local file generation occurs.

## Architecture Overview

### System Components

1. **Streamlit Frontend** - User interface for project management and AI interaction
2. **FastAPI Backend** - REST API handling data persistence and webhook coordination
3. **Claude Code Agent** - AI assistant for content generation and file creation
4. **File Monitoring System** - Real-time tracking of generated files
5. **Approval State Management** - Workflow coordination between components

### Data Flow

```
User Action → Preview Generation → UI Review → User Approval → Local Generation → Real-time Display
```

## Two-Stage Workflow Design

### Stage 1: Preview Generation

**Purpose:** Generate preview content for user review without creating actual files.

**Process:**
1. User triggers AI action in Streamlit UI
2. FastAPI creates unique approval ID
3. Claude generates preview content structure
4. Preview stored in memory for user review

**Preview Content Structure:**
```python
{
    "files_to_create": ["README.md", "package.json"],
    "directories_to_create": ["src/", "tests/"],
    "content_previews": {
        "README.md": "# Project Name\n\nDescription..."
    }
}
```

### Stage 2: File Generation

**Purpose:** Execute approved generation with real-time monitoring.

**Process:**
1. User approves or modifies preview
2. System triggers Claude Code instruction file creation
3. File watcher monitors workspace for new files
4. Progress updates sent to UI in real-time
5. Completion summary displayed to user

## API Endpoints

### Preview Management

```python
POST /claude/preview
# Generate preview content for approval

GET /claude/preview/{approval_id}
# Check preview generation status

POST /claude/approve/{approval_id}
# Approve preview and trigger file generation
```

### State Management

```python
# Approval state structure
{
    "approval_id": "uuid-string",
    "status": "preview_ready|generating_files|completed",
    "workflow_data": {...},
    "preview_content": {...},
    "generated_files": [...]
}
```

## User Interface Components

### Preview Review Interface

**Features:**
- File tree visualization of planned structure
- Content preview with syntax highlighting
- Markdown rendering for documentation
- Modification interface for user edits
- Approval/rejection controls

### Real-time Generation Monitor

**Features:**
- Progress bar showing generation status
- Live file list updates as files are created
- Error handling and retry mechanisms
- Completion summary with metrics

### Approval Workflow States

1. **Initial Request** - User selects AI generation options
2. **Preview Generation** - System creates preview content
3. **User Review** - Preview displayed for approval/modification
4. **File Generation** - Claude creates actual files locally
5. **Completion** - Summary and workspace access provided

## File Monitoring System

### Implementation Approach

Uses Python watchdog library to monitor workspace directory for file system events.

```python
class ClaudeGenerationWatcher(FileSystemEventHandler):
    def on_created(self, event):
        # Track new files created by Claude
        # Update approval state with file information
        # Notify UI of progress updates
```

### Monitored Events

- File creation
- Directory creation
- File modifications during generation
- Generation completion detection

## Claude Code Integration

### Instruction File Format

```markdown
# Generation Request

Project: Project Name
Type: project_setup|spec_generation|documentation

## Context
[Project details and user requirements]

## Tasks
1. Create project structure
2. Generate README with project details
3. Create issue templates

## User Modifications
[Any user-specified changes from approval interface]
```

### Output Detection

System monitors predefined workspace locations for Claude-generated content:
- `~/turbo_workspace/projects/` - Project files
- `~/turbo_workspace/specs/` - Technical specifications
- `~/turbo_workspace/docs/` - Documentation

## Error Handling and Recovery

### Preview Generation Failures

- Timeout handling for slow Claude responses
- Fallback to basic template generation
- User notification with retry options

### File Generation Failures

- Partial generation recovery
- Rollback capabilities for failed generations
- Error reporting with actionable feedback

### State Consistency

- Cleanup of orphaned approval states
- Session state recovery after UI refresh
- Graceful handling of concurrent requests

## Security Considerations

### Local File Access

- Restricted workspace directory access
- Validation of generated file paths
- Prevention of system file overwrites

### User Input Validation

- Sanitization of modification instructions
- Prevention of malicious code injection
- Validation of approval request authenticity

## Performance Optimization

### Preview Generation

- Caching of common preview templates
- Async processing to prevent UI blocking
- Pagination for large file previews

### File Monitoring

- Efficient file system watching with minimal CPU impact
- Debounced UI updates to prevent excessive refreshes
- Cleanup of completed monitoring sessions

## Scalability Considerations

### Concurrent Users

- Support for multiple approval workflows simultaneously
- Resource management for file monitoring processes
- Queue management for Claude Code requests

### Storage Management

- Automatic cleanup of old approval states
- Workspace organization for multiple projects
- File size limits and disk space monitoring

## Implementation Phases

### Phase 1: Basic Approval Workflow
- Simple preview generation
- Basic file monitoring
- Core approval interface

### Phase 2: Enhanced UI Experience
- Rich content previews
- Real-time progress indicators
- Advanced modification capabilities

### Phase 3: Advanced Features
- Batch approval workflows
- Template library integration
- Advanced error recovery

## Success Metrics

### User Experience
- Time from request to preview: < 30 seconds
- Approval workflow completion rate: > 90%
- User satisfaction with generated content quality

### Technical Performance
- File generation monitoring accuracy: > 99%
- System resource utilization: < 10% CPU during monitoring
- Concurrent workflow support: 10+ simultaneous approvals

## Conclusion

This architecture provides a comprehensive solution for integrating Claude Code agents with a modern web-based project management interface. The approval workflow ensures user control while maintaining the efficiency benefits of AI-powered content generation. The modular design allows for incremental implementation and future enhancements.