# Fields Visualizer - Architecture Documentation

## Overview

A browser-based 3D field visualizer for Grade 12 physics, built with React + TypeScript + Vite and Three.js via react-three-fiber.

## Project Structure

```
fields-visualizer/
├── src/
│   ├── physics/              # Physics logic (separated from rendering)
│   │   ├── types.ts          # TypeScript types (FieldMode, FieldSource, TestCharge, FieldState)
│   │   ├── constants.ts      # Physics constants (k, G, MIN_DISTANCE)
│   │   └── field.ts          # Field computation functions (E, g, F calculations)
│   │
│   ├── state/                # Global state management
│   │   └── (store/context)   # Zustand store or React Context + reducer
│   │
│   ├── components/           # React components
│   │   ├── ScenePanel.tsx    # Main 3D viewport container
│   │   ├── Sidebar.tsx       # Control panel UI
│   │   ├── FieldVectors.tsx  # Field arrow visualization
│   │   ├── SourceSphere.tsx  # Individual source rendering
│   │   ├── TestChargeSphere.tsx
│   │   ├── ForceArrow.tsx
│   │   ├── FormulaPanel.tsx
│   │   ├── ModeToggle.tsx
│   │   ├── SourceList.tsx
│   │   ├── TestChargeControls.tsx
│   │   └── PresetsPanel.tsx
│   │
│   ├── utils/                # Helper functions
│   │   └── (vector math, distance, formatting)
│   │
│   ├── styles/               # CSS files
│   │   ├── index.css         # Global styles
│   │   └── App.css           # App-specific styles
│   │
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
│
├── public/                   # Static assets
├── dist/                     # Build output (for Netlify)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Instructions.md           # Build script and requirements
```

## Key Architectural Principles

### 1. Separation of Concerns

- **Physics logic** (`src/physics/`) is completely separate from rendering
  - Pure functions, no React dependencies
  - Easy to test and modify physics behavior independently

- **State management** is centralized
  - Single source of truth for `mode`, `sources`, `testCharge`
  - Accessible from both 3D scene and sidebar

- **Components** are organized by responsibility
  - Layout (ScenePanel, Sidebar)
  - 3D rendering (spheres, arrows, vectors)
  - UI controls (forms, buttons, toggles)

### 2. Type Safety

- Strong TypeScript typing throughout
- Core types defined in `src/physics/types.ts`
- Path aliases configured for cleaner imports

### 3. Scalability

- Architecture supports future features:
  - Field line tracing
  - Potential visualization
  - Presets system
  - Screenshot/export functionality

## State Management

### State Structure

```typescript
{
  mode: "electric" | "gravity",
  sources: FieldSource[],
  testCharge: TestCharge | null
}
```

### Actions

- `setMode(mode)` - Switch between electric/gravity
- `addSource(position, value)` - Add new field source
- `updateSource(id, partialUpdate)` - Update source position/value
- `removeSource(id)` - Remove source
- `setTestCharge(position, value)` - Add/update test charge
- `updateTestCharge(partialUpdate)` - Update test charge

## Physics Implementation

### Field Calculations

- **Electric Field**: `E = k * Q / r²`
- **Gravitational Field**: `g = G * M / r²`
- **Force**: `F = qE` (electric) or `F = mg` (gravity)

### Constants

- Scaled values for visual clarity (k = 1, G = 1)
- Minimum distance to avoid singularities
- Qualitative accuracy over unit precision

### Key Functions

- `computeElectricFieldAtPoint(point, sources)` → vector field
- `computeGravitationalFieldAtPoint(point, sources)` → vector field
- `computeForceOnTestCharge(point, testValue, mode, sources)` → force vector

## 3D Visualization

### Rendering Pipeline

1. **Scene Setup** (ScenePanel)
   - Canvas, camera, lights, OrbitControls
   - Grid/axes for spatial reference

2. **Objects** (Phase 4)
   - Source spheres (colored by mode and value)
   - Test charge sphere

3. **Field Visualization** (Phase 6)
   - Grid sampling on y=0 plane
   - Arrow rendering for field vectors
   - Clamped magnitude for visibility

4. **Force Visualization** (Phase 7)
   - Single arrow at test charge position
   - Updates dynamically with movement

### Interaction

- OrbitControls for scene navigation
- TransformControls/DragControls for object manipulation
- Controls properly coordinated to avoid conflicts

## UI Layout

### Structure

```
┌─────────────────────────────────┬──────────┐
│                                 │          │
│      ScenePanel (flex-grow)     │ Sidebar  │
│        3D Canvas Viewport       │  (320px) │
│                                 │          │
│                                 │ - Mode   │
│                                 │ - Sources│
│                                 │ - Test   │
│                                 │ - Formulas│
│                                 │ - Presets│
└─────────────────────────────────┴──────────┘
```

### Styling

- Dark theme for better 3D visualization
- Full-screen layout
- Responsive to window size
- Clean, readable typography

## Path Aliases

Configured for cleaner imports:

```typescript
import { FieldMode } from '@/physics/types'
import { computeElectricFieldAtPoint } from '@/physics/field'
import ScenePanel from '@/components/ScenePanel'
import { useFieldStore } from '@/state/store'
```

## Build & Deployment

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

Output: `dist/` directory

### Netlify Deployment

- Build command: `npm run build`
- Publish directory: `dist`
- Static hosting, no backend required

## Development Phases

See `Instructions.md` for detailed phase-by-phase build script:

1. Phase 0: Project scaffold ✅
2. Phase 1: Layout & UI skeleton
3. Phase 2: 3D scene basics
4. Phase 3: Types & state
5. Phase 4: Render charges & interactions
6. Phase 5: Physics helpers
7. Phase 6: Field vector visualization
8. Phase 7: Force arrow
9. Phase 8: Sidebar controls
10. Phase 9: Formula panel
11. Phase 10: Comparison text
12. Phase 11: Presets
13. Phase 12: Deployment prep

## Future Enhancements

- Field line tracing
- Potential visualization (equipotential lines/surfaces)
- Performance optimizations (memoization, lazy computation)
- Screenshot/export functionality
- Additional presets

