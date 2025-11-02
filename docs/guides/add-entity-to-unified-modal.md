# Adding a New Entity to the Unified Create Modal

This guide walks you through adding a new entity type to the Unified Create Modal.

## Prerequisites

Before starting, ensure:
- Backend entity model, repository, service, and API endpoints exist
- React Query hooks for the entity are implemented
- TypeScript types are defined in `frontend/lib/types.ts`

## Step-by-Step Guide

### 1. Add Entity Type to TypeScript Types

**File:** `frontend/lib/types.ts`

```typescript
// Add to EntityType union
export type EntityType =
  | 'note'
  | 'issue'
  | 'your-entity'  // Add here
  | 'initiative'
  | 'milestone'
  | 'document'
  | 'project';

// Add entity-specific types
export interface YourEntityBase {
  title: string;
  description?: string;
  // ... other fields
}

export interface YourEntityCreate extends YourEntityBase {
  project_id?: string;
  // ... create-specific fields
}

export interface YourEntity extends YourEntityBase {
  id: string;
  created_at: string;
  updated_at: string;
  // ... response fields
}
```

### 2. Create the Form Component

**File:** `frontend/components/unified-create/forms/your-entity-form.tsx`

```typescript
"use client";

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateYourEntity } from '@/hooks/use-your-entity';
import type { ContextData } from '@/hooks/use-unified-create';
import type { YourEntityCreate } from '@/lib/types';

interface YourEntityFormProps {
  contextData: ContextData | null;
  onSuccess: () => void;
}

// Animation variants for staggered field entrance
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
};

export function YourEntityForm({ contextData, onSuccess }: YourEntityFormProps) {
  // Initialize form with React Hook Form
  const form = useForm<YourEntityCreate>({
    defaultValues: {
      title: '',
      description: '',
      project_id: contextData?.project_id,
      // Use context data for smart defaults
      workspace: contextData?.workspace ?? 'personal',
    }
  });

  // Get the mutation hook
  const createEntity = useCreateYourEntity();

  // Handle form submission
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createEntity.mutateAsync(data);
      toast.success('Entity created successfully!');
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create entity'
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      {/* Field 1: Title */}
      <motion.div
        variants={fieldVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          autoFocus
          placeholder="Enter title..."
          {...form.register('title', { required: true })}
        />
      </motion.div>

      {/* Field 2: Description */}
      <motion.div
        variants={fieldVariants}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Add details..."
          {...form.register('description')}
        />
      </motion.div>

      {/* Add more fields as needed */}

      {/* Submit Button */}
      <motion.div
        variants={fieldVariants}
        custom={2}
        initial="hidden"
        animate="visible"
        className="flex justify-end gap-2 pt-2"
      >
        <Button
          type="submit"
          disabled={createEntity.isPending}
        >
          {createEntity.isPending ? 'Creating...' : 'Create Entity'}
        </Button>
      </motion.div>
    </form>
  );
}
```

### 3. Update Entity Type Switcher

**File:** `frontend/components/unified-create/entity-type-switcher.tsx`

Add your entity to the `entityTypes` array:

```typescript
import { YourIcon } from 'lucide-react';

const entityTypes = [
  { type: 'note' as const, label: 'Note', icon: StickyNote },
  { type: 'issue' as const, label: 'Issue', icon: Bug },
  { type: 'your-entity' as const, label: 'Your Entity', icon: YourIcon },
  // ... other types
];
```

**Icon Recommendations (from lucide-react):**
- Notes: `StickyNote`
- Issues/Bugs: `Bug`
- Initiatives: `Target`
- Milestones: `Flag`
- Documents: `FileText`
- Projects: `Folder`
- Tasks: `CheckSquare`
- Goals: `Crosshair`
- Ideas: `Lightbulb`

### 4. Add Form to Modal

**File:** `frontend/components/unified-create/unified-create-modal.tsx`

Import and add your form:

```typescript
import { YourEntityForm } from './forms/your-entity-form';

// In the render section:
<AnimatePresence mode="wait">
  <motion.div
    key={entityType}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {entityType === 'note' && (
      <NoteForm contextData={contextData} onSuccess={handleSuccess} />
    )}
    {entityType === 'your-entity' && (
      <YourEntityForm contextData={contextData} onSuccess={handleSuccess} />
    )}
    {/* ... other forms */}
  </motion.div>
</AnimatePresence>
```

### 5. Create React Query Hooks (if not exists)

**File:** `frontend/hooks/use-your-entity.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { YourEntity, YourEntityCreate } from '@/lib/types';

export function useCreateYourEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: YourEntityCreate) => {
      return api.post<YourEntity>('/api/v1/your-entities/', data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['your-entities'] });
    },
  });
}

export function useYourEntities() {
  return useQuery({
    queryKey: ['your-entities'],
    queryFn: () => api.get<YourEntity[]>('/api/v1/your-entities/'),
  });
}
```

### 6. Test Your Implementation

**Manual Testing:**

1. **Open Modal:** Press `Cmd+K`
2. **Switch to Your Entity:** Click your entity in the switcher
3. **Verify Animation:** Background should slide smoothly to your entity
4. **Fill Form:** Enter required fields
5. **Submit:** Click submit button
6. **Verify Success:** Toast notification appears, modal closes
7. **Check Data:** Verify entity was created in the database

**API Testing:**

```bash
# Create via API
curl -X POST http://localhost:8001/api/v1/your-entities/ \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Entity",
    "description": "Testing"
  }'

# Verify in frontend
# Open modal, switch to your entity type
# Should see smooth animation and working form
```

## Common Patterns

### Select Fields

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Controller
  name="priority"
  control={form.control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">Low</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="high">High</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

### Date Pickers

```typescript
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, 'PPP') : 'Pick a date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={(date) => form.setValue('due_date', date)}
    />
  </PopoverContent>
</Popover>
```

### Multi-Select Tags

```typescript
import { TagInput } from '@/components/ui/tag-input';

<TagInput
  tags={selectedTags}
  onTagsChange={(tags) => form.setValue('tag_ids', tags.map(t => t.id))}
  placeholder="Add tags..."
/>
```

### Conditional Fields

```typescript
const watchType = form.watch('type');

{watchType === 'bug' && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
  >
    <Label>Severity</Label>
    <Select {...form.register('severity')}>
      {/* ... */}
    </Select>
  </motion.div>
)}
```

## Backend Checklist

Ensure your backend has:

### Model
```python
class YourEntity(Base):
    __tablename__ = "your_entities"

    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    # ... other fields

    # Relationships with eager loading
    tags = relationship("Tag", secondary=your_entity_tags, lazy="select")
```

### Repository
```python
class YourEntityRepository(BaseRepository[YourEntity, YourEntityCreate, YourEntityUpdate]):

    async def get_all(self, limit: int = 100, offset: int = 0) -> list[YourEntity]:
        # IMPORTANT: Use selectinload for relationships
        stmt = select(self._model).options(
            selectinload(self._model.tags)
        ).limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
```

### Service
```python
class YourEntityService:
    async def create_entity(self, entity_data: YourEntityCreate) -> YourEntityResponse:
        entity = await self._repository.create(entity_data)

        # Index in knowledge graph
        await self._index_in_graph(entity)

        # Emit webhook event
        if self._webhook_service:
            await self._webhook_service.emit_event(
                event_type="your_entity.created",
                data={"entity_id": str(entity.id)}
            )

        return YourEntityResponse.model_validate(entity)
```

### API Endpoint
```python
@router.post("/", response_model=YourEntityResponse)
async def create_entity(
    entity_data: YourEntityCreate,
    service: YourEntityService = Depends(get_your_entity_service)
):
    try:
        return await service.create_entity(entity_data)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
```

## Troubleshooting

### Form not rendering
- Check entity type is added to `entityTypes` array
- Verify form component is imported in `unified-create-modal.tsx`
- Check browser console for errors

### Animation issues
- Ensure each motion.div has unique `custom` prop value
- Verify `fieldVariants` is defined
- Check Framer Motion is installed: `npm list framer-motion`

### Form validation not working
- Ensure fields use `{...form.register('field', { required: true })}`
- Check React Hook Form is installed: `npm list react-hook-form`
- Verify `handleSubmit` wraps your onSubmit function

### API errors
- Check network tab for request/response
- Verify API endpoint exists and accepts POST
- Check request body matches backend schema
- Ensure CORS is configured correctly

## Best Practices

1. **Use Context Data:** Pre-fill fields from `contextData` when available
2. **Auto-Focus:** Add `autoFocus` to first input field
3. **Loading States:** Show loading state during submission
4. **Error Handling:** Display specific error messages from API
5. **Reset Form:** Always call `form.reset()` after successful creation
6. **Optimistic Updates:** Consider optimistic UI updates for better UX
7. **Field Validation:** Add client-side validation before API call
8. **Accessibility:** Include proper labels and ARIA attributes
9. **Keyboard Support:** Ensure all interactions work with keyboard
10. **Animation Performance:** Use GPU-accelerated properties (opacity, transform)

## Examples

See the Note form for a complete reference implementation:
- Form: `frontend/components/unified-create/forms/note-form.tsx`
- Hook: `frontend/hooks/use-notes.ts`
- Types: Search for "Note" in `frontend/lib/types.ts`
- Backend: `turbo/core/models/note.py`, `turbo/core/services/note.py`

## Related Documentation

- [Unified Create Modal Overview](../UNIFIED_CREATE_MODAL.md)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [shadcn/ui Components](https://ui.shadcn.com/)
