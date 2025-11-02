# Unified Create Modal

A sleek, responsive modal system for creating any entity type in the application with a single keyboard shortcut.

## Overview

The Unified Create Modal provides a command palette-style interface (activated via `Cmd+K` or `Ctrl+K`) that allows users to quickly create different entity types without navigating through the application.

**Status:** ✅ Fully Implemented with Note entity
**Location:** `frontend/components/unified-create/`

## Features

- **Global Keyboard Shortcut:** Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) from anywhere in the app
- **Smooth Animations:** Framer Motion-powered transitions and entity type switching
- **Entity Type Switcher:** Quick toggle between different entity types with animated background indicator
- **Form Validation:** React Hook Form integration for robust client-side validation
- **Auto-Focus:** First input field automatically focused when modal opens
- **Keyboard Navigation:** Full keyboard support including Escape to close
- **Context-Aware:** Accepts contextual data (project, workspace, etc.) when opened programmatically

## Supported Entity Types

| Entity | Status | Form Component |
|--------|--------|----------------|
| Note | ✅ Complete | `NoteForm` |
| Issue | 🚧 Placeholder | Pending |
| Initiative | 🚧 Placeholder | Pending |
| Milestone | 🚧 Placeholder | Pending |
| Document | 🚧 Placeholder | Pending |
| Project | 🚧 Placeholder | Pending |

## Architecture

### Component Structure

```
unified-create/
├── unified-create-modal.tsx     # Main modal container
├── entity-type-switcher.tsx     # Entity type selector tabs
└── forms/
    ├── note-form.tsx             # Note creation form
    ├── issue-form.tsx            # TODO: Issue form
    ├── initiative-form.tsx       # TODO: Initiative form
    ├── milestone-form.tsx        # TODO: Milestone form
    ├── document-form.tsx         # TODO: Document form
    └── project-form.tsx          # TODO: Project form
```

### State Management

**Global Store:** `hooks/use-unified-create.ts`

```typescript
interface UnifiedCreateStore {
  isOpen: boolean;                    // Modal visibility state
  entityType: EntityType;             // Currently selected entity type
  contextData: ContextData | null;    // Optional context (project_id, etc.)

  // Actions
  open: (type?: EntityType, context?: ContextData) => void;
  close: () => void;
  setEntityType: (type: EntityType) => void;
  setContextData: (context: ContextData) => void;
}
```

**Context Data Interface:**

```typescript
interface ContextData {
  project_id?: string;
  initiative_id?: string;
  milestone_id?: string;
  workspace?: string;
  work_company?: string;
}
```

### Data Flow

```
User Action (Cmd+K)
  ↓
useUnifiedCreateShortcut() hook
  ↓
Zustand Store: open()
  ↓
UnifiedCreateModal renders
  ↓
EntityTypeSwitcher + Active Form
  ↓
Form Submission
  ↓
React Query Mutation
  ↓
API Call → Database
  ↓
Success Toast + Modal Close
```

## Usage

### Opening the Modal

**Via Keyboard Shortcut:**
```
Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
```

**Programmatically:**
```typescript
import { useUnifiedCreate } from '@/hooks/use-unified-create';

function MyComponent() {
  const { open } = useUnifiedCreate();

  // Open with default (note)
  const handleCreate = () => {
    open();
  };

  // Open specific entity type
  const handleCreateIssue = () => {
    open('issue');
  };

  // Open with context data
  const handleCreateFromProject = () => {
    open('note', {
      project_id: currentProject.id,
      workspace: 'work',
      work_company: 'Acme Corp'
    });
  };
}
```

### Creating a New Entity Form

To add a new entity form (e.g., Issue):

1. **Create the form component:**

```typescript
// frontend/components/unified-create/forms/issue-form.tsx
"use client";

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useCreateIssue } from '@/hooks/use-issues';
import type { IssueCreate } from '@/lib/types';

interface IssueFormProps {
  contextData: ContextData | null;
  onSuccess: () => void;
}

export function IssueForm({ contextData, onSuccess }: IssueFormProps) {
  const form = useForm<IssueCreate>({
    defaultValues: {
      title: '',
      description: '',
      project_id: contextData?.project_id,
      type: 'feature',
      priority: 'medium',
    }
  });

  const createIssue = useCreateIssue();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createIssue.mutateAsync(data);
      toast.success('Issue created successfully!');
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create issue');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      {/* Form fields with motion animations */}
    </form>
  );
}
```

2. **Add to UnifiedCreateModal:**

```typescript
// frontend/components/unified-create/unified-create-modal.tsx
import { IssueForm } from './forms/issue-form';

// In the render method:
{entityType === 'issue' && (
  <IssueForm contextData={contextData} onSuccess={handleSuccess} />
)}
```

## Backend Integration

### Note Entity (Reference Implementation)

**Model:** `turbo/core/models/note.py`
```python
class Note(Base):
    __tablename__ = "notes"

    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=True)
    workspace = Column(String(50), nullable=False, index=True, default="personal")
    work_company = Column(String(100), nullable=True, index=True)
    is_archived = Column(Boolean, default=False, index=True)

    tags = relationship("Tag", secondary=note_tags, back_populates="notes", lazy="select")
```

**API Endpoint:** `POST /api/v1/notes/`

**Request Body:**
```json
{
  "title": "Quick thought",
  "content": "Meeting notes from today...",
  "workspace": "personal",
  "work_company": null,
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "id": "a94d230f-b3be-4ec3-b80e-b855db5e3761",
  "title": "Quick thought",
  "content": "Meeting notes from today...",
  "workspace": "personal",
  "work_company": null,
  "is_archived": false,
  "created_at": "2025-10-22T03:45:45.336280Z",
  "updated_at": "2025-10-22T03:45:45.336280Z",
  "tags": []
}
```

### Repository Pattern

All repository query methods must eagerly load relationships to avoid SQLAlchemy lazy loading issues with Pydantic:

```python
from sqlalchemy.orm import selectinload

async def get_all(self, limit: int = 100, offset: int = 0) -> list[Note]:
    stmt = select(self._model).options(selectinload(self._model.tags)).limit(limit).offset(offset)
    result = await self._session.execute(stmt)
    return list(result.scalars().all())
```

## Animation System

### Container Animations

```typescript
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]  // Custom easing curve
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};
```

### Field Stagger Animations

```typescript
const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,        // Stagger delay
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }),
};
```

### Entity Type Switcher

Uses Framer Motion's `layoutId` for smooth shared element transitions:

```typescript
{entityType === type && (
  <motion.div
    layoutId="active-entity-bg"
    className="absolute inset-0 bg-muted rounded-md"
    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
  />
)}
```

## Testing

### Manual Testing Checklist

- [ ] Press `Cmd+K` to open modal
- [ ] Modal opens with Note form by default
- [ ] Click different entity types in switcher - background animates smoothly
- [ ] Fill out Note form with title and content
- [ ] Submit form - success toast appears
- [ ] Modal closes automatically
- [ ] Press `Cmd+K` again - form is reset
- [ ] Press `Escape` - modal closes
- [ ] Click outside modal - modal closes
- [ ] Tab through form fields - focus management works

### API Testing

```bash
# Create a note
curl -X POST http://localhost:8001/api/v1/notes/ \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Note",
    "content": "Testing from API",
    "workspace": "personal"
  }'

# List notes
curl http://localhost:8001/api/v1/notes/

# Get specific note
curl http://localhost:8001/api/v1/notes/{note_id}

# Update note
curl -X PUT http://localhost:8001/api/v1/notes/{note_id} \
  -H 'Content-Type: application/json' \
  -d '{"title": "Updated Title"}'

# Delete note
curl -X DELETE http://localhost:8001/api/v1/notes/{note_id}
```

## Troubleshooting

### Issue: Modal doesn't open on Cmd+K

**Cause:** Browser or OS keyboard shortcut conflict

**Solution:**
- Check browser extensions that might intercept Cmd+K
- On macOS, check System Preferences → Keyboard → Shortcuts
- Modal can still be opened programmatically

### Issue: SQLAlchemy MissingGreenlet error

**Cause:** Lazy-loaded relationships accessed outside async context

**Solution:** Add `selectinload()` to repository queries:
```python
stmt = select(Model).options(selectinload(Model.relationship))
```

### Issue: Form validation errors not showing

**Cause:** React Hook Form not properly configured

**Solution:** Ensure form fields use `{...form.register('field')}`

### Issue: Tags not loading in Note responses

**Cause:** Repository not eagerly loading tags relationship

**Solution:** Override repository methods to include:
```python
.options(selectinload(Note.tags))
```

## Future Enhancements

### Short-term
- [ ] Add Issue form (reuse existing create-issue-dialog logic)
- [ ] Add Initiative, Milestone, Document, Project forms
- [ ] Tag selector component for multi-tag selection
- [ ] Recent selections memory (localStorage)
- [ ] Keyboard shortcuts: Cmd+1-6 for direct entity type selection

### Medium-term
- [ ] Auto-save drafts to localStorage
- [ ] Rich text editor for content fields
- [ ] File attachment support
- [ ] Template system for common notes/issues
- [ ] Search recent items to quickly reference/link

### Long-term
- [ ] AI-powered suggestions based on content
- [ ] Smart defaults from user behavior
- [ ] Bulk creation mode
- [ ] Integration with clipboard/share extensions
- [ ] Voice input support

## Performance Considerations

- **Code Splitting:** Each form component is lazy-loaded
- **Animation Performance:** Uses GPU-accelerated transforms (opacity, scale, translateY)
- **State Updates:** Zustand ensures minimal re-renders
- **API Calls:** Debounced search, optimistic updates
- **Bundle Size:**
  - framer-motion: ~60KB gzipped
  - react-hook-form: ~25KB gzipped

## Accessibility

- **Keyboard Navigation:** Full keyboard support
- **Focus Management:** Auto-focus on modal open, trapped focus within modal
- **Screen Readers:** Proper ARIA labels and roles
- **High Contrast:** Works with system dark/light mode
- **Reduced Motion:** Respects `prefers-reduced-motion` media query

## Related Documentation

- [API Documentation](./API_SPECIFICATION.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Knowledge Graph Integration](./KNOWLEDGE_GRAPH_LOCAL.md)

## Changelog

### 2025-10-21 - Initial Implementation
- ✅ Created UnifiedCreateModal component
- ✅ Added EntityTypeSwitcher with animations
- ✅ Implemented NoteForm with validation
- ✅ Added global Cmd+K keyboard shortcut
- ✅ Integrated Zustand for state management
- ✅ Added React Query hooks for data fetching
- ✅ Created Note backend (model, repository, service, API)
- ✅ Fixed SQLAlchemy eager loading issues
- ✅ Added comprehensive error handling
