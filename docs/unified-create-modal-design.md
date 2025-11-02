# Unified Create Modal Design

## Overview

Create a single, sleek command palette-style modal that handles creation of ALL entity types with lightning-fast entity type switching. This provides a unified, high-quality creation experience across the entire application.

---

## Key Features

### 1. Quick Switcher UI (Inspired by Raycast/Linear)

- Single modal triggered by global keyboard shortcut (`Cmd/Ctrl+K`)
- Top bar with entity type selector (chips/tabs)
- Instant switching between entity types
- Form morphs smoothly based on selection
- Auto-focus on first input field

### 2. Entity Types to Support

- **Notes** (NEW) - Quick thoughts, not attached to projects
- **Issues** (all types: bug, feature, task, enhancement, documentation, discovery)
- **Initiatives** - Strategic feature planning
- **Milestones** - Project phases
- **Documents** - ADRs, design docs, specs
- **Projects** - New project creation
- **Blueprints** - Policies and standards

### 3. Design System

- **Framer Motion** animations for smooth transitions
- **Command palette** aesthetic (dark overlay, centered modal)
- **Keyboard navigation** throughout (arrows, enter, escape)
- **Smart defaults** based on current context
- **Instant search** for related entities (projects, tags, etc.)
- **Existing shadcn/ui theme** - use current colors and design tokens
- **High-quality polish** - smooth animations, perfect spacing, responsive

### 4. Smart Context Awareness

- If on project page → pre-fill project_id
- If viewing initiative → offer to link
- Recent selections remembered
- Smart field ordering based on importance

---

## Implementation Plan

### Phase 1: Core Infrastructure

1. Create `UnifiedCreateModal` component using existing Dialog + Command components
2. Implement entity type switcher with keyboard nav (Tab to cycle)
3. Build form state management (per entity type)
4. Add global keyboard shortcut hook (`useUnifiedCreate`)

### Phase 2: Entity Forms

1. Create modular form components per entity (reuse existing form patterns)
2. Implement smooth form transitions (Framer Motion)
3. Add validation per entity type (existing patterns)
4. Smart field hiding/showing

### Phase 3: Notes Entity (NEW)

1. Add `Note` model to backend (lightweight: title, content, tags, created_at)
2. Create notes API endpoints (CRUD)
3. Implement notes storage
4. Notes list view/search

### Phase 4: Polish & UX

1. Framer Motion animations for entity switching
2. Keyboard shortcuts for all actions (Cmd+Enter, Esc, Tab)
3. Quick-add mode (minimal fields only)
4. Auto-save to localStorage on incomplete forms

---

## Files to Create/Modify

### New Files

**Frontend Components:**
- `frontend/components/unified-create/unified-create-modal.tsx` - Main modal component
- `frontend/components/unified-create/entity-type-switcher.tsx` - Type selector chips
- `frontend/components/unified-create/forms/note-form.tsx` - Note creation form
- `frontend/components/unified-create/forms/issue-form.tsx` - Issue form (refactor existing)
- `frontend/components/unified-create/forms/initiative-form.tsx` - Initiative form
- `frontend/components/unified-create/forms/milestone-form.tsx` - Milestone form
- `frontend/components/unified-create/forms/document-form.tsx` - Document form
- `frontend/components/unified-create/forms/project-form.tsx` - Project form

**Frontend Hooks & State:**
- `frontend/hooks/use-unified-create.ts` - Global state + keyboard shortcut
- `frontend/hooks/use-notes.ts` - React Query hooks for notes
- `frontend/lib/api/notes.ts` - Notes API client

**Backend - Notes Entity:**
- `turbo/core/models/note.py` - Note SQLAlchemy model
- `turbo/core/schemas/note.py` - Note Pydantic schemas
- `turbo/core/repositories/note_repository.py` - Note repository
- `turbo/core/services/note_service.py` - Note service
- `turbo/api/v1/endpoints/notes.py` - Notes REST API

**Pages:**
- `frontend/app/notes/page.tsx` (NEW) - Notes list/management page

### Modified Files

- `frontend/components/layout/layout-wrapper.tsx` - Add global Cmd+K listener
- `frontend/lib/types.ts` - Add Note types
- `turbo/api/v1/__init__.py` - Include notes router

---

## User Experience Flow

```
1. User presses Cmd+K anywhere in the app
2. Modal appears with smooth fade-in + backdrop blur
3. Entity type selector at top (defaults to Note for quick capture)
4. Visual indicator shows current entity with icon + color
5. Tab to cycle through entity types, Click to jump directly
6. Form fields morph smoothly with Framer Motion layout animations
7. Fill in minimal required fields (smart validation)
8. Press Cmd+Enter to create instantly, Esc to cancel
9. Success toast with link to created entity
10. Modal dismisses smoothly, user back to work in <5 seconds
```

**Goal:** User can capture any entity in under 5 seconds from anywhere in the app.

---

## Visual Design (Using Existing shadcn/ui Theme)

```
┌─────────────────────────────────────────────────────┐
│  Create...                                       ✕  │
├─────────────────────────────────────────────────────┤
│  [📝 Note] [🐛 Issue] [🎯 Initiative] [🏁 Milestone] │  ← Entity chips
│  [📄 Doc]  [📁 Project]                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Title *                                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ Quick note about...                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Content                                            │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  🏷️  Tags                                           │
│  [+ Add tag]                                        │
│                                                     │
│                [Cancel]  [Create Note ⌘↵]          │
└─────────────────────────────────────────────────────┘
```

### Design Principles

- **Minimal chrome** - Focus on the content, not the container
- **Smart defaults** - Most common options pre-selected
- **Progressive disclosure** - Advanced options hidden by default
- **Keyboard-first** - Every action has a keyboard shortcut
- **Instant feedback** - Validation as you type
- **Smooth animations** - Framer Motion for all transitions

---

## Technical Implementation Details

### 1. Global State (Zustand)

```typescript
// frontend/hooks/use-unified-create.ts

import { create } from 'zustand';

export type EntityType = 'note' | 'issue' | 'initiative' | 'milestone' | 'document' | 'project' | 'blueprint';

export interface ContextData {
  project_id?: string;
  initiative_id?: string;
  milestone_id?: string;
  workspace?: string;
  work_company?: string;
  // Pre-filled data from current context
}

interface UnifiedCreateStore {
  isOpen: boolean;
  entityType: EntityType;
  contextData: ContextData | null;

  // Actions
  open: (type?: EntityType, context?: ContextData) => void;
  close: () => void;
  setEntityType: (type: EntityType) => void;
}

export const useUnifiedCreate = create<UnifiedCreateStore>((set) => ({
  isOpen: false,
  entityType: 'note',
  contextData: null,

  open: (type = 'note', context = null) =>
    set({ isOpen: true, entityType: type, contextData: context }),

  close: () =>
    set({ isOpen: false, contextData: null }),

  setEntityType: (type) =>
    set({ entityType: type }),
}));

// Global keyboard shortcut
export function useUnifiedCreateShortcut() {
  const open = useUnifiedCreate((state) => state.open);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);
}
```

### 2. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open modal |
| `Tab` | Cycle entity types forward |
| `Shift+Tab` | Cycle entity types backward |
| `Cmd/Ctrl+Enter` | Submit form |
| `Esc` | Close modal |
| `Cmd/Ctrl+1` | Jump to Notes |
| `Cmd/Ctrl+2` | Jump to Issues |
| `Cmd/Ctrl+3` | Jump to Initiatives |
| `Cmd/Ctrl+4` | Jump to Milestones |
| `Cmd/Ctrl+5` | Jump to Documents |
| `Cmd/Ctrl+6` | Jump to Projects |

### 3. Form Animations (Framer Motion)

```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Container animation
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] // Custom easing
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

// Form fields animation
const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }),
  exit: { opacity: 0, y: -10 }
};

// Usage
<AnimatePresence mode="wait">
  <motion.div
    key={entityType}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {/* Form fields */}
  </motion.div>
</AnimatePresence>
```

### 4. Note Model Schema

```python
# turbo/core/models/note.py

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from turbo.core.database.base import Base

class Note(Base):
    """Quick notes/thoughts not attached to projects."""

    __tablename__ = "notes"

    # Identity
    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: str = Column(String(500), nullable=False, index=True)
    content: str | None = Column(Text, nullable=True)

    # Workspace context
    workspace: str = Column(String(50), nullable=False, index=True, default="personal")
    work_company: str | None = Column(String(100), nullable=True, index=True)

    # Status
    is_archived: bool = Column(Boolean, default=False, index=True)

    # Timestamps
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # Tags relationship (many-to-many)
    tags = relationship("Tag", secondary="note_tags", back_populates="notes")
```

```python
# turbo/core/schemas/note.py

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional

class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    workspace: str = "personal"
    work_company: Optional[str] = None

class NoteCreate(NoteBase):
    tag_ids: Optional[list[UUID]] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    is_archived: Optional[bool] = None
    tag_ids: Optional[list[UUID]] = None

class NoteResponse(NoteBase):
    id: UUID
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagSummary] = []

    model_config = {"from_attributes": True}
```

### 5. Context Awareness

```typescript
// frontend/components/unified-create/unified-create-modal.tsx

function UnifiedCreateModal() {
  const { isOpen, entityType, contextData, close } = useUnifiedCreate();
  const pathname = usePathname();

  // Extract context from current page
  useEffect(() => {
    if (isOpen && !contextData) {
      const context: ContextData = {};

      // If on project page
      const projectMatch = pathname.match(/\/projects\/([^\/]+)/);
      if (projectMatch) {
        context.project_id = projectMatch[1];
      }

      // If viewing initiative
      const initiativeMatch = pathname.match(/\/initiatives\/([^\/]+)/);
      if (initiativeMatch) {
        context.initiative_id = initiativeMatch[1];
      }

      // Get workspace from settings
      context.workspace = getWorkspace();
      context.work_company = getWorkCompany();

      // Update store with context
      setContextData(context);
    }
  }, [isOpen, pathname]);

  // Form defaults based on context
  const form = useForm({
    defaultValues: {
      ...contextData,
      priority: "medium",
      status: "open",
      type: entityType === 'issue' ? 'task' : undefined,
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      {/* Modal content */}
    </Dialog>
  );
}
```

---

## Entity Type Switcher Component

```typescript
// frontend/components/unified-create/entity-type-switcher.tsx

import { motion } from 'framer-motion';
import {
  StickyNoteIcon,
  BugIcon,
  TargetIcon,
  FlagIcon,
  FileTextIcon,
  FolderIcon
} from 'lucide-react';

const entityTypes = [
  { type: 'note', label: 'Note', icon: StickyNoteIcon },
  { type: 'issue', label: 'Issue', icon: BugIcon },
  { type: 'initiative', label: 'Initiative', icon: TargetIcon },
  { type: 'milestone', label: 'Milestone', icon: FlagIcon },
  { type: 'document', label: 'Document', icon: FileTextIcon },
  { type: 'project', label: 'Project', icon: FolderIcon },
] as const;

export function EntityTypeSwitcher() {
  const { entityType, setEntityType } = useUnifiedCreate();

  return (
    <div className="flex gap-2 p-2 border-b">
      {entityTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => setEntityType(type)}
          className={cn(
            "relative px-3 py-1.5 text-sm rounded-md transition-colors",
            "flex items-center gap-2",
            entityType === type
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {entityType === type && (
            <motion.div
              layoutId="active-entity-bg"
              className="absolute inset-0 bg-muted rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## Form Component Structure

Each entity form follows this pattern:

```typescript
// frontend/components/unified-create/forms/note-form.tsx

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useCreateNote } from '@/hooks/use-notes';

export function NoteForm({ contextData, onSuccess }: FormProps) {
  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      workspace: contextData?.workspace ?? 'personal',
      work_company: contextData?.work_company,
    }
  });

  const createNote = useCreateNote();

  const onSubmit = form.handleSubmit((data) => {
    createNote.mutate(data, {
      onSuccess: (note) => {
        toast.success('Note created!');
        onSuccess(note);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <motion.div
        variants={fieldVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          autoFocus
          {...form.register('title', { required: true })}
        />
      </motion.div>

      <motion.div
        variants={fieldVariants}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          rows={4}
          {...form.register('content')}
        />
      </motion.div>

      {/* Tag selector */}
      <motion.div
        variants={fieldVariants}
        custom={2}
        initial="hidden"
        animate="visible"
      >
        <TagSelector {...form} />
      </motion.div>
    </form>
  );
}
```

---

## Implementation Order

### Week 1: Backend Notes + Core Modal

1. **Day 1-2: Backend Notes Entity**
   - Create Note model (`turbo/core/models/note.py`)
   - Create Note schemas (`turbo/core/schemas/note.py`)
   - Create Note repository (`turbo/core/repositories/note_repository.py`)
   - Create Note service (`turbo/core/services/note_service.py`)
   - Add database migration for notes table

2. **Day 3: Notes API**
   - Create Notes endpoints (`turbo/api/v1/endpoints/notes.py`)
   - Add notes router to API
   - Test CRUD operations

3. **Day 4-5: Frontend Notes Infrastructure**
   - Create notes API client (`frontend/lib/api/notes.ts`)
   - Create notes hooks (`frontend/hooks/use-notes.ts`)
   - Create notes page (`frontend/app/notes/page.tsx`)
   - Add Note types to `frontend/lib/types.ts`

### Week 2: Unified Modal Shell

4. **Day 1-2: Modal Foundation**
   - Create `UnifiedCreateModal` component
   - Create `EntityTypeSwitcher` component
   - Set up Zustand store (`use-unified-create.ts`)
   - Add global keyboard shortcut (Cmd+K)
   - Wire up to layout wrapper

5. **Day 3: Note Form**
   - Create `NoteForm` component
   - Integrate with modal
   - Test creation flow end-to-end

### Week 3: Entity Forms

6. **Day 1: Issue Form**
   - Refactor existing `create-issue-dialog` into `IssueForm`
   - Integrate with unified modal
   - Add all issue types

7. **Day 2: Initiative Form**
   - Create `InitiativeForm` component
   - Add to unified modal

8. **Day 3: Milestone Form**
   - Create `MilestoneForm` component
   - Add to unified modal

9. **Day 4: Document Form**
   - Create `DocumentForm` component
   - Add to unified modal

10. **Day 5: Project Form**
    - Create `ProjectForm` component
    - Add to unified modal

### Week 4: Polish & Refinement

11. **Day 1-2: Animations**
    - Add Framer Motion to all form transitions
    - Entity type switcher animations
    - Field stagger animations
    - Modal enter/exit animations

12. **Day 3: Keyboard Navigation**
    - Tab cycling through entity types
    - Number shortcuts (Cmd+1-6)
    - Form submission (Cmd+Enter)
    - Test all keyboard flows

13. **Day 4: Context Awareness**
    - Auto-detect current page context
    - Pre-fill project/initiative IDs
    - Smart defaults based on location
    - Recent selections memory

14. **Day 5: Final Polish**
    - Auto-save incomplete forms to localStorage
    - Success toasts with entity links
    - Error handling and validation
    - Responsive design testing
    - Accessibility audit

---

## Success Metrics

- **Speed**: User can create any entity in <5 seconds
- **Keyboard-first**: 100% keyboard navigable
- **Smooth**: 60fps animations throughout
- **Accessible**: WCAG AA compliant
- **Context-aware**: Smart defaults in 80% of cases
- **Delightful**: Users prefer this to separate dialogs

---

## Future Enhancements

### Quick Add Mode
- Ultra-minimal form (title only)
- Press Enter twice to create instantly
- Details can be added later

### Templates
- Save common entity patterns
- "Create from template" option
- Pre-filled fields based on template

### Bulk Creation
- CSV import
- Multi-entity creation
- Batch operations

### AI Assistance
- Smart field suggestions
- Auto-complete based on context
- Related entity recommendations

### Voice Input
- Speech-to-text for title/content
- Hands-free creation
- Accessibility benefit

---

## Conclusion

This unified creation modal will dramatically improve the user experience by:

1. **Reducing friction** - Single shortcut for all entity creation
2. **Increasing speed** - Optimized for <5 second workflows
3. **Improving consistency** - Same UX across all entity types
4. **Enhancing discoverability** - All entity types visible at once
5. **Supporting power users** - Comprehensive keyboard shortcuts

The result is a high-quality, polished feature that becomes the primary way users create content in Turbo.
