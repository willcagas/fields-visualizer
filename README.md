# Fieldflow

<div align="center">

**An interactive 3D field visualizer for physics education**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Visualize electric and gravitational fields in real-time with interactive 3D graphics

[Features](#-features) · [Installation](#-installation) · [Documentation](#-documentation)

</div>

---

## 📖 Overview

**Fieldflow** is a browser-based 3D field visualization tool designed for Grade 12 physics classrooms. It helps students understand electric and gravitational fields through interactive, real-time 3D visualizations. With intuitive controls and live formula calculations, Fieldflow makes abstract field concepts tangible and engaging.

### Key Highlights

- 🌊 **Streamline Field Visualization** - See field lines flow with animated pulses
- 📐 **Vector Field Mode** - Detailed arrow representations showing field direction and magnitude
- ⚡ **Dual Physics Modes** - Switch seamlessly between electric and gravitational fields
- 🔬 **Interactive Manipulation** - Drag sources and test charges to explore field behavior
- 📊 **Live Calculations** - Real-time formula display with numeric substitution
- 🎨 **Classroom-Ready** - Dark theme optimized for projectors and displays

## ✨ Features

### Field Visualization

- **Two Visualization Modes:**
  - **Vector Arrow Field** - Arrow grid showing field direction and strength through color intensity
  - **Streamline Field** - Curved field lines with animated pulses showing field flow
- **Adjustable Parameters:**
  - Field display scale
  - Grid size and density
  - Line density (50-250 lines)
  - Pulse speed and intensity

### Interactive Controls

- **Source Management:**
  - Add/remove multiple charges or masses
  - Drag sources to reposition in 3D space
  - Realistic value inputs with scientific notation support
  - Visual charge/mass indicators with color coding

- **Test Charge/Mass:**
  - Place test particles anywhere in 3D space
  - Visualize force vectors in real-time
  - Equilibrium point calculator (for electric dipoles)
  - Force magnitude and direction visualization

### Educational Tools

- **Live Formula Panel:**
  - Coulomb's Law (electric mode)
  - Newton's Law of Universal Gravitation (gravity mode)
  - Field strength equations
  - Potential energy formulas
  - All with real-time numeric substitution

- **Preset Scenarios:**
  - Single source
  - Electric dipole (+Q and -Q)
  - Two equal like charges/masses
  - Planet + test mass (gravity mode)
  - Two point charges in 1D (textbook problem)

- **Visual Enhancements:**
  - Charge/mass auras with pulsing effects
  - Symbol overlays (+/- for charges)
  - Force arrow visualization
  - Grid and coordinate axes for spatial reference

### User Experience

- **Intuitive Controls:**
  - 3D camera rotation and zoom with OrbitControls
  - Tooltips with helpful explanations
  - Responsive sidebar interface
  - Dark theme optimized for classroom use

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **3D Rendering:** Three.js via `@react-three/fiber` and `@react-three/drei`
- **State Management:** Zustand
- **Build Tool:** Vite
- **Math Rendering:** KaTeX (react-katex)
- **Deployment:** Netlify (static hosting)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fields-visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🚀 Usage

### Basic Workflow

1. **Select Mode:**
   - Choose between **Electric** or **Gravitational** field mode
   - Each mode has tooltips explaining the physics

2. **Load a Preset (or Create Custom):**
   - Click a preset button to load a pre-configured scenario
   - Or manually add sources using the "Add Charge/Mass" button

3. **Configure Visualization:**
   - Select **Vector Arrow** or **Streamline** field type
   - Adjust visualization parameters using sliders
   - Toggle additional visual elements (auras, symbols, force arrows)

4. **Explore:**
   - **Rotate:** Click and drag in the 3D view
   - **Zoom:** Scroll or pinch to zoom
   - **Pan:** Right-click and drag (or middle mouse button)
   - **Reposition:** Click and drag sources or test charges

5. **Analyze:**
   - View live formula calculations in the sidebar
   - Observe force vectors on test charges
   - Adjust values to see real-time updates

### Input Formats

- **Charges:** Enter in Coulombs (e.g., `1e-9` for 1 nC)
- **Masses:** Enter in kilograms (e.g., `5.0` for 5 kg)
- Scientific notation is supported (e.g., `1e-12`, `2.5e-6`)

### Keyboard Shortcuts

- **R:** Reset camera view (if implemented)
- **Space:** Pause/resume animations (if implemented)

## 📁 Project Structure

```
fields-visualizer/
├── src/
│   ├── components/          # React components
│   │   ├── ScenePanel.tsx   # Main 3D viewport
│   │   ├── Sidebar.tsx      # Control panel UI
│   │   ├── FieldVectors.tsx # Vector arrow visualization
│   │   ├── FieldFlow.tsx    # Streamline field lines
│   │   ├── SourceSphere.tsx # Charge/mass rendering
│   │   ├── TestChargeSphere.tsx
│   │   ├── ForceArrow.tsx
│   │   ├── FormulaPanel.tsx # Formula display
│   │   └── ...
│   ├── physics/             # Physics calculations
│   │   ├── field.ts         # Field computation functions
│   │   ├── constants.ts     # Physics constants (k, G)
│   │   ├── types.ts         # TypeScript types
│   │   └── units.ts         # Unit conversions
│   ├── state/               # Global state management
│   │   └── store.ts         # Zustand store
│   ├── utils/               # Helper functions
│   │   └── presets.ts       # Preset configurations
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
│   └── fieldflow-icon.svg   # App favicon
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🏗️ Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

### Code Organization

- **Components:** React components organized by functionality
- **Physics:** Pure math functions (no rendering logic)
- **State:** Global state management with Zustand
- **Utils:** Reusable helper functions and presets

### TypeScript

The project uses strict TypeScript with:
- Type-safe component props
- Physics calculation types
- State management types
- Path aliases for clean imports (`@/components`, `@/physics`, etc.)

## 🚢 Deployment

### Netlify Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Netlify Configuration:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18.x or higher

3. **Deploy:**
   - Connect your repository to Netlify
   - Configure build settings as above
   - Deploy automatically on git push

### Manual Deployment

The `dist` folder contains the production build ready for any static hosting service (GitHub Pages, Vercel, etc.).

## 🎓 Educational Use

### Learning Objectives

Fieldflow helps students visualize and understand:

- **Electric Fields:**
  - Coulomb's Law and inverse-square relationship
  - Field superposition principle
  - Dipole fields and field lines
  - Potential energy and electric potential

- **Gravitational Fields:**
  - Newton's Law of Universal Gravitation
  - Field strength and direction
  - Orbital mechanics concepts
  - Potential energy in gravitational fields

### Classroom Integration

- **Interactive Demonstrations:** Project on screen during lectures
- **Student Exploration:** Students manipulate scenarios independently
- **Problem Solving:** Use presets for textbook problems
- **Concept Reinforcement:** Visual connection to mathematical formulas

### Suggested Activities

1. **Compare Field Patterns:** Switch between electric and gravity modes with similar configurations
2. **Equilibrium Points:** Find where net field is zero in dipole configurations
3. **Field Strength Analysis:** Observe how arrow colors change with distance
4. **Superposition:** Add multiple sources and watch field lines interact

## 🔧 Configuration

### Customization Options

- **Field Display Scale:** Adjust vector arrow size (0.2x - 2.0x)
- **Grid Size:** Control arrow grid density (3-10 units)
- **Streamline Density:** Number of field lines (50-250)
- **Pulse Speed:** Animation speed multiplier (0.2x - 3.0x)
- **Pulse Intensity:** Brightness of pulse effect (0.5x - 3.0x)

## 📚 Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - Detailed system architecture
- [Build Instructions](./Instructions.md) - Step-by-step development guide
- [Component Reference](./src/components/README.md) - Component documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow TypeScript best practices
2. Maintain component separation (physics logic separate from rendering)
3. Add comments for complex physics calculations
4. Test with multiple source configurations
5. Ensure responsive design works on different screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) for 3D graphics
- UI components styled for educational clarity
- Physics calculations follow standard textbook formulas
- Designed with feedback from physics educators

---

<div align="center">

**Made with ⚡ for physics education**

</div>