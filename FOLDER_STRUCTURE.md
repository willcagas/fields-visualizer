# Folder Structure Reference

Quick reference for the project folder structure.

```
fields-visualizer/
│
├── src/                           # Source code
│   │
│   ├── physics/                   # Physics logic (pure math, no rendering)
│   │   ├── types.ts              # Core TypeScript types
│   │   ├── constants.ts          # Physics constants (k, G, MIN_DISTANCE)
│   │   └── field.ts              # Field computation functions
│   │
│   ├── state/                     # Global state management
│   │   └── (store/context)       # Zustand or React Context + reducer
│   │
│   ├── components/                # React components
│   │   ├── ScenePanel.tsx        # 3D viewport container
│   │   ├── Sidebar.tsx           # Control panel
│   │   ├── FieldVectors.tsx      # Field arrow visualization
│   │   ├── SourceSphere.tsx      # Source rendering
│   │   ├── TestChargeSphere.tsx  # Test charge rendering
│   │   ├── ForceArrow.tsx        # Force visualization
│   │   ├── FormulaPanel.tsx      # Formula display
│   │   ├── ModeToggle.tsx        # Mode switcher
│   │   ├── SourceList.tsx        # Source management UI
│   │   ├── TestChargeControls.tsx
│   │   └── PresetsPanel.tsx      # Scenario presets
│   │
│   ├── utils/                     # Helper functions
│   │   └── (vector math, formatting, etc.)
│   │
│   ├── styles/                    # CSS files
│   │   ├── index.css             # Global styles
│   │   └── App.css               # App-specific styles
│   │
│   ├── assets/                    # Static assets
│   │
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
│
├── public/                        # Public static files
├── dist/                          # Build output (Netlify deploy)
│
├── package.json
├── tsconfig.json                  # TypeScript base config
├── tsconfig.app.json              # App-specific TS config
├── vite.config.ts                 # Vite configuration
├── ARCHITECTURE.md                # Detailed architecture docs
├── FOLDER_STRUCTURE.md            # This file
├── Instructions.md                # Build script
└── README.md                      # Project overview
```

## Path Aliases

Use these aliases for cleaner imports:

```typescript
// Instead of: import { FieldMode } from '../../physics/types'
import { FieldMode } from '@/physics/types'

// Instead of: import ScenePanel from '../components/ScenePanel'
import ScenePanel from '@/components/ScenePanel'

// Available aliases:
// @/* → ./src/*
// @/physics/* → ./src/physics/*
// @/components/* → ./src/components/*
// @/state/* → ./src/state/*
// @/utils/* → ./src/utils/*
// @/styles/* → ./src/styles/*
```

## File Organization Principles

1. **Physics logic** stays in `src/physics/` - no React dependencies
2. **State management** is centralized in `src/state/`
3. **Components** are organized by feature/concern
4. **Pure utilities** go in `src/utils/`
5. **Styles** can use CSS modules or global CSS as needed

