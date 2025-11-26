# State Management

Global state store for the field visualization using Zustand.

## Usage

The store is accessible via the `useFieldStore()` hook anywhere in the component tree (no provider needed).

### Example

```typescript
import { useFieldStore } from '@/state/store'

function MyComponent() {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)
  const setMode = useFieldStore((state) => state.setMode)
  const addSource = useFieldStore((state) => state.addSource)

  // Use state and actions...
}
```

## Store Structure

- **mode**: `"electric" | "gravity"`
- **sources**: Array of field sources (charges/masses)
- **testCharge**: Test charge/mass or null

## Available Actions

- `setMode(mode)` - Switch between electric/gravity mode
- `addSource(position, value)` - Add a new field source
- `updateSource(id, updates)` - Update a source's position or value
- `removeSource(id)` - Remove a source by ID
- `setTestCharge(position, value)` - Set or add test charge
- `updateTestCharge(updates)` - Update test charge position or value
- `removeTestCharge()` - Remove the test charge
