# Fields Visualizer

A browser-based 3D field visualizer for Grade 12 physics, helping students understand electric and gravitational fields through interactive 3D visualization.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Three.js** via `@react-three/fiber` + `@react-three/drei` (3D rendering)
- **Static deployment** to Netlify

## Features

- 🎯 Interactive 3D visualization of electric and gravitational fields
- ⚡ Switch between electric and gravity modes
- 📍 Place and manipulate field sources (charges/masses)
- 🔬 Test charge/mass with force visualization
- 📐 Live formula display with numeric substitution
- 🎨 Dark theme optimized for 3D visualization
- 📱 Responsive layout for classroom use

## Project Structure

```
src/
├── physics/        # Physics calculations (separated from rendering)
├── components/     # React components
├── state/          # Global state management
├── utils/          # Helper functions
└── styles/         # CSS files
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Development

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Deployment to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` directory to Netlify

**Netlify settings:**
- Build command: `npm run build`
- Publish directory: `dist`

## Build Phases

This project follows a phased development approach. See `Instructions.md` for the complete step-by-step build script.

**Current Status:** Architecture setup complete ✅

## Educational Use

Designed for Grade 12 physics classrooms to help students visualize:
- Electric fields vs gravitational fields
- Inverse-square law relationships
- Force and field calculations
- Superposition principle

## License

MIT
