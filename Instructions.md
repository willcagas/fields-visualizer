Nice, let’s turn Cursor into your little physics dev goblin 🧪⚡

Below is a **step-by-step build script**: a sequence of prompts you can paste into Cursor, in order, to get to **v1 of your 3D fields app**.

I’ll assume:

* **React + TypeScript**
* **Vite** (or whatever Cursor likes; it can adapt)
* **Three.js via `@react-three/fiber` + `@react-three/drei`**
* 3D scene, but **field vectors sampled on a plane** (still looks fully 3D and easy to rotate around).

---

## Phase 0 – Scaffold the project

### 🧾 Prompt 0 – Create React + TS project

> You are my coding assistant inside Cursor.
> I want to build a React + TypeScript browser app for a Grade 12 physics class.
> First, scaffold a new React + TypeScript project using Vite (or the recommended modern tooling in this environment).
> Then install these dependencies:
>
> * three
> * @react-three/fiber
> * @react-three/drei
>
> Name the project something like `field-visualizer`.
> After scaffolding, set up a basic `App.tsx` that just renders "Hello fields" so we know everything works.
> Don’t write explanations, just the commands / files you will create or modify.

---

## Phase 1 – Layout & basic UI skeleton

### 🧾 Prompt 1 – App layout with sidebar + 3D area

> Now replace the basic `App.tsx` with a more structured layout.
> I want:
>
> * A full-screen app with dark background.
> * Left side: a 3D viewport area (this will contain the react-three-fiber canvas later).
> * Right side: a sidebar for controls and formulas.
>
> Create:
>
> * `App.tsx` with a flex layout:
>
>   * `<ScenePanel />` on the left (flex-grow)
>   * `<Sidebar />` on the right (fixed width, like 320px).
> * `ScenePanel.tsx` placeholder component.
> * `Sidebar.tsx` placeholder component showing headings like “Mode”, “Charges”, “Test Charge”, “Formulas”.
>
> Use TypeScript and basic CSS (either a simple CSS file or CSS modules).
> Don’t implement any 3D or physics yet, just a clean, responsive layout.

---

## Phase 2 – Add 3D scene basics

### 🧾 Prompt 2 – Hook up react-three-fiber scene

> In `ScenePanel.tsx`, integrate `@react-three/fiber` and `@react-three/drei` to render a basic 3D scene.
> Requirements:
>
> * Use `<Canvas>` from `@react-three/fiber`.
> * Add:
>
>   * A perspective camera (appropriate fov, positioned so we see the origin).
>   * Some basic ambient and directional light.
>   * `<OrbitControls>` (from `@react-three/drei`) so I can rotate and zoom.
>   * A simple ground/grid or coordinate axes so students feel the 3D space (e.g. `<Grid />` or your own lines).
>
> Keep everything typed with TypeScript.
> No physics yet; just a nice orbitable 3D scene.

---

## Phase 3 – Define core types & state

We want a central model that everything uses: electric & grav fields.

### 🧾 Prompt 3 – Create types for sources & mode

> I want to define core types and state for field visualization.
> Create a new file, e.g. `src/physics/types.ts`, with:
>
> * `type FieldMode = "electric" | "gravity";`
> * `interface FieldSource { id: string; position: [number, number, number]; value: number; kind: "source"; }`
>
>   * For electric: `value` will be charge Q (C in abstract units).
>   * For gravity: `value` will be mass m (kg in abstract units).
> * `interface TestCharge { position: [number, number, number]; value: number; }`
>
>   * For electric: test charge q.
>   * For gravity: test mass.
>
> Also export a type like:
>
> * `interface FieldState { mode: FieldMode; sources: FieldSource[]; testCharge: TestCharge | null; }`
>
> Use TypeScript and export these types.

### 🧾 Prompt 4 – Create global state (store or context)

> Now create a central state store for this field data.
> Use either React Context + reducer or Zustand (pick one, but keep it simple and strongly typed).
>
> Requirements for the store:
>
> * Holds:
>
>   * `mode: "electric" | "gravity"`
>   * `sources: FieldSource[]`
>   * `testCharge: TestCharge | null`
> * Actions:
>
>   * `setMode(mode)`
>   * `addSource(position, value)` (auto-generate id)
>   * `updateSource(id, partialUpdate)` (for moving or changing value)
>   * `removeSource(id)`
>   * `setTestCharge(position, value)`
>   * `updateTestCharge(partialUpdate)`
> * Provide a React hook, e.g. `useFieldStore()` or `useFieldContext()`, that components can call.
>
> Wire this provider at the top level (in `main.tsx` or `App.tsx`) so `ScenePanel` and `Sidebar` can both access it.

---

## Phase 4 – Render charges in 3D & basic interactions

### 🧾 Prompt 5 – Render sources as spheres in 3D

> In `ScenePanel.tsx`, instead of an empty scene, render the sources as 3D spheres.
>
> Steps:
>
> * Use the global field state to get `sources`.
> * For each source:
>
>   * Render a small sphere at `position`.
>   * Color:
>
>     * For electric mode:
>
>       * Positive value: warm color (e.g. red/orange)
>       * Negative value: cool color (blue)
>     * For gravity mode:
>
>       * All masses same color (e.g. green or yellow)
> * Keep them reasonably sized (e.g. radius 0.2–0.5 depending on units).
>
> Also render the test charge if it exists as a different colored sphere.

### 🧾 Prompt 6 – Make charges draggable in 3D

> Now allow dragging sources in 3D.
>
> Use `TransformControls` or `DragControls` from `@react-three/drei` so that:
>
> * I can click a source sphere and drag it around in the x–z plane (and optionally y).
> * When the position changes, call the store's `updateSource` to update the underlying position.
>
> Also allow the test charge to be draggable with the same mechanism.
>
> Make sure the controls don’t fight with `OrbitControls`.
> If necessary, disable orbiting while dragging.

---

## Phase 5 – Physics helpers: E / F computation

We’ll start with electric, but formula is generic.

### 🧾 Prompt 7 – Implement physics utility functions (no rendering yet)

> Create a new file `src/physics/field.ts` to contain physics helper functions.
>
> Implement functions (with TypeScript types):
>
> * `computeElectricFieldAtPoint(point, sources): { Ex: number; Ey: number; Ez: number }`
>
>   * Use a simple inverse-square law for each source.
>   * Avoid singularities by enforcing a minimum distance.
>   * Sum contributions from all sources.
> * `computeGravitationalFieldAtPoint(point, sources): { Gx: number; Gy: number; Gz: number }`
>
>   * Same as above but using gravitational constant symbolically.
> * `computeForceOnTestCharge(point, testValue, mode, sources)`
>
>   * For electric: F = q * E
>   * For gravity: F = m * g (g is the gravitational field from masses).
>
> For now, it’s fine to use arbitrary scaled constants (e.g. `k = 1`, `G = 1`) because we care about relative behavior more than real units. Keep the constants exported so we can show them in formulas later.
>
> Don’t do any rendering inside this file — just math.

---

## Phase 6 – Visualize field vectors in 3D

We’ll sample field vectors on a plane (say y = 0), so it’s still 3D, but manageable.

### 🧾 Prompt 8 – Field vector grid on a plane

> In `ScenePanel.tsx` (or a new child component `FieldVectors`), visualize the field as arrows.
>
> Requirements:
>
> * Sample points on a regular grid in the x–z plane at y = 0.
>   For example x, z from -5 to +5 with a spacing you choose.
> * For each sample point:
>
>   * Use `computeElectricFieldAtPoint` or `computeGravitationalFieldAtPoint` depending on the current mode.
>   * Compute the field vector and its magnitude.
>   * Render a 3D arrow (e.g. using Three.js `ArrowHelper` or a custom cylinder+cone) showing direction and scaled length.
> * Scale arrow length by the magnitude, but clamp so short is still visible, and very strong doesn’t explode.
> * Optionally, vary arrow color based on magnitude.
>
> Read sources and mode from global state.
> Keep frame rate reasonable — if necessary, recompute only when sources change, not every frame.

---

## Phase 7 – Test charge & force arrow

### 🧾 Prompt 9 – Force arrow on test charge

> Add a visual indicator for the net force on the test charge.
>
> In the 3D scene:
>
> * If `testCharge` exists:
>
>   * Use the `computeForceOnTestCharge` helper for the current mode.
>   * Render an arrow starting at the test charge’s position pointing in the direction of the net force.
>   * Scale its length visibly and maybe give it a distinct color (like bright yellow or magenta).
>
> Also ensure the test charge is draggable as before, and the force arrow updates when it moves or when sources change.

---

## Phase 8 – Sidebar controls for sources & mode

### 🧾 Prompt 10 – Mode toggle + source list UI

> Now enhance `Sidebar.tsx` to control the simulation.
>
> UI elements:
>
> * Mode section:
>
>   * A toggle or buttons for `"Electric"` vs `"Gravity"` that call `setMode` in the store.
> * Sources section:
>
>   * A list of current sources, each with:
>
>     * Label like “Source 1”, “Source 2”
>     * Numeric input (or slider) for `value` (charge or mass)
>     * A remove button
>   * A button “Add source” that creates a new source at a default position and value.
> * Test charge section:
>
>   * Buttons:
>
>     * “Add test charge at origin” (if none)
>     * “Remove test charge”
>   * Input for its `value` (q or m).
> * Toggles:
>
>   * Checkbox for “Show field arrows”
>   * Checkbox for “Show force arrow on test charge”
>
> You can manage UI-only booleans (like show/hide toggles) in component state or extend the global store if cleaner.

---

## Phase 9 – Formula panel with live values

### 🧾 Prompt 11 – Show formulas and live numeric substitution

> Add a “Formulas” section in `Sidebar.tsx` (or a dedicated component `FormulaPanel.tsx` used inside Sidebar).
>
> Requirements:
>
> * When mode is `"electric"`, show:
>
>   * `F = k * q1 * q2 / r^2`
>   * `E = k * Q / r^2`
>   * Optionally `V = k * Q / r`
> * When mode is `"gravity"`, show:
>
>   * `F = G * m1 * m2 / r^2`
>   * `g = G * M / r^2`
>
> Also, pick a “current interaction” to display numerically, for example:
>
> * If there is a test charge and at least one source:
>
>   * Take the nearest source to the test charge.
>   * Compute r, F, and E/g between those two.
>   * Show the formula with substituted numbers, like:
>
>     * `F = k * (Q = ...) * (q = ...) / (r = ...)^2 = ...`
>
> Keep formatting simple (plain text or basic JSX with subscript-like labels).
> Make sure the numbers update when the user drags charges or changes values.

---

## Phase 10 – Compare electric vs gravitational intuitively

This is mostly about copy + UI hints.

### 🧾 Prompt 12 – Explanatory labels for mode comparison

> Add some explanatory text in the Sidebar to emphasize the relationship between electric and gravitational fields:
>
> * When in electric mode:
>
>   * Short note: “Same inverse-square law as gravity, but charges can attract or repel.”
> * When in gravity mode:
>
>   * Short note: “All masses attract. Structure is the same as the electric formula, but with G and masses.”
>
> Also, ensure that when switching between modes:
>
> * The positions stay the same.
> * Only the interpretation (and formulas/constants) changes.
>
> Optionally, highlight changed symbols (k vs G, q/Q vs m/M) in the formulas.

---

## Phase 11 – Simple presets for classroom use

### 🧾 Prompt 13 – Preset scenarios

> Add a small “Presets” section in the Sidebar with buttons like:
>
> * “Single source”
> * “Dipole (+Q and –Q)” (electric mode only)
> * “Two equal like charges”
> * “Planet + test mass” (gravity mode)
>
> When a preset is clicked:
>
> * Replace the `sources` array and `testCharge` with a predefined configuration.
> * Center the camera or provide a good default view.
>
> This makes it easy to demo in class without manually placing everything.

---

## Phase 12 – Netlify deployability

### 🧾 Prompt 14 – Prepare for Netlify deployment

> Make sure the project is ready for Netlify deployment:
>
> * Confirm the build script in `package.json` (e.g. `vite build`).
> * Ensure assets are relative-path friendly.
> * If needed, add a short README section with “How to deploy to Netlify”:
>
>   * Build command: `npm run build`
>   * Publish directory: `dist`
>
> Also ensure the app works correctly when served from a static build (no dev-only assumptions).

---

## Optional polish prompts

When you’re happy and it works, you can add extra prompts like:

* **Styling polish**: “Make the UI look nicer with a slightly more modern dark theme, rounded cards, and clear typography.”
* **Performance**: “Optimize field arrow computation so it doesn’t lag with N sources; memoize or recompute only when needed.”
* **Screenshot button**: “Add a button that captures the canvas as an image using `toDataURL` and prompts download.”

---

If you want, next I can:

* Draft a **short lab worksheet structure** (objectives + questions) that perfectly matches this app’s interactions, so you can drop it straight into a PDF or Google Doc.


The provided build script is excellent, covering all necessary features for a v1 physics visualizer. Drawing on the structure and requirements laid out in the sources, I have refined the script below into a more detailed, point-by-point sequence of commands, ensuring maximum precision for execution within Cursor.

---

## Enhanced Build Script for Cursor

### Phase 0 – Scaffold the project and Install Dependencies

This phase establishes the foundational stack using React, TypeScript, Vite, and the required 3D rendering libraries.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 0 – Create React + TS project** | **Project Setup & Dependencies** | Scaffold a new project named `field-visualizer` using Vite with the React + TypeScript template. Install the core 3D dependencies: `three`, `@react-three/fiber`, and `@react-three/drei`. After installation, modify `src/App.tsx` to output "Hello fields" to confirm the basic environment is functioning. **Crucially, output only the commands and file contents, not explanations**. |

### Phase 1 – Layout & UI Skeleton

This phase creates the full-screen visual container, defining dedicated space for the interactive scene and the controls.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 1 – App layout with sidebar + 3D area** | **Structure & Styling** | Replace the basic `App.tsx` content with a clean, **full-screen flex layout** using a dark background. Create two primary components: `ScenePanel.tsx` (to occupy the left side with `flex-grow`) and `Sidebar.tsx` (to occupy the right side with a **fixed width of 320px**). Implement `Sidebar.tsx` as a placeholder showing clear headings for the future UI sections: “Mode”, “Charges”, “Test Charge”, and “Formulas”. Use TypeScript for all components. |

### Phase 2 – Add 3D Scene Basics

This phase integrates the 3D rendering engine and basic user interaction tools.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 2 – Hook up react-three-fiber scene** | **3D Viewport Initialization** | In `ScenePanel.tsx`, integrate the 3D viewport using the `<Canvas>` component from `@react-three/fiber`. Configure a **perspective camera** appropriately positioned to view the origin. Add necessary lighting: `<ambientLight>` and a `<directionalLight>`. Integrate **`<OrbitControls>`** from `@react-three/drei` to enable rotation and zooming of the scene. Include a visual helper (e.g., `<Grid>` from Drei or coordinate axes) to provide spatial context. |

### Phase 3 – Define Core Types & Global State

This phase establishes the strongly typed data model and the central state management system.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 3 – Create types for sources & mode** | **Physics Data Structure** | Create `src/physics/types.ts`. Define the required TypeScript types: `type FieldMode = "electric" \| "gravity"`; `interface FieldSource` (including `id`, `position: [number, number, number]`, `value` (Q or m), and `kind: "source"`); and `interface TestCharge` (including `position` and `value` (q or m)). Finally, define `interface FieldState` to hold `mode`, an array of `sources`, and `testCharge` (which may be `null`). |
| **🧾 Prompt 4 – Create global state (store)** | **State Management Implementation** | Create a central store (using **Zustand or React Context/Reducer** is recommended for simplicity and performance). The store must hold the three state properties (`mode`, `sources`, `testCharge`). Define and export the necessary actions: `setMode(mode)`, `addSource(position, value)` (must auto-generate a unique `id`), `updateSource(id, partialUpdate)`, `removeSource(id)`, `setTestCharge(position, value)`, and `updateTestCharge(partialUpdate)`. Ensure this provider is wired at the top level (e.g., `App.tsx` or `main.tsx`). |

### Phase 4 – Render Charges & Basic Interactions

This phase renders the physical objects and enables dynamic movement.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 5 – Render sources as spheres in 3D** | **Conditional Rendering** | In `ScenePanel.tsx`, retrieve the `sources` and `testCharge` from the global state. Render each `FieldSource` as a small 3D sphere (e.g., radius 0.2–0.5). Implement conditional coloring logic based on `FieldMode`: **Electric Mode:** Positive value gets a warm color (red/orange); Negative value gets a cool color (blue). **Gravity Mode:** All masses use a uniform color (e.g., green/yellow). Render the `testCharge` (if present) as a sphere with a distinct color. |
| **🧾 Prompt 6 – Make charges draggable in 3D** | **Interactive 3D Controls** | Integrate **`TransformControls`** or `DragControls` from `@react-three/drei`. Wrap each source sphere and the test charge sphere (if present). Configure controls to allow dragging primarily in the x–z plane (or optionally x, y, z). Crucially, implement the drag handler (`onDragEnd`) to call the store’s `updateSource` or `updateTestCharge` action with the new position. Ensure that `OrbitControls` are automatically disabled while dragging to prevent interaction conflict. |

### Phase 5 – Physics Helpers: E / F Computation

This phase implements the mathematical core of the simulation, ensuring vector physics are computed correctly.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 7 – Implement physics utility functions** | **Inverse-Square Law Calculations** | Create `src/physics/field.ts`. Implement three strongly typed vector functions: 1. `computeElectricFieldAtPoint(point, sources)`: Calculates the net electric field $\vec{E}$ by summing vector contributions from all sources, enforcing a **minimum distance** to avoid singularities. 2. `computeGravitationalFieldAtPoint(point, sources)`: Calculates the net gravitational field $\vec{g}$ similarly. 3. `computeForceOnTestCharge(point, testValue, mode, sources)`: Calculates the net force $\vec{F}$ (using $F=qE$ for electric or $F=mg$ for gravity). Use simple scaled constants (e.g., $k=1$, $G=1$) for relative behavior, but export these constants for future display. |

### Phase 6 – Visualize Field Vectors in 3D

This phase visualizes the field intensity and direction across a grid.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 8 – Field vector grid on a plane** | **Grid Sampling & Arrow Rendering** | Create a `FieldVectors` component (or implement in `ScenePanel.tsx`). Define a regular grid of sample points (e.g., x, z from -5 to +5 on the $y=0$ plane). Iterate through this grid and, based on the current `mode`, call the appropriate physics helper (`computeElectricFieldAtPoint` or `computeGravitationalFieldAtPoint`). Render the resulting field vectors using a 3D arrow object (e.g., Three.js `ArrowHelper`). **Scale the arrow length by the vector magnitude,** ensuring the length is **clamped** to remain visible for weak fields and constrained for strong fields. Implement logic to only recompute the grid when sources or mode change, not every frame, to maintain frame rate. |

### Phase 7 – Test Charge & Force Arrow

This phase visualizes the direct result of the physics computation on the movable test charge.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 9 – Force arrow on test charge** | **Net Force Visualization** | Within the 3D scene, if a `testCharge` exists, use `computeForceOnTestCharge` to calculate the net force vector $\vec{F}$. Render a single, distinct, and visibly scaled arrow starting precisely at the test charge's position and pointing in the direction of the net force. Ensure this force arrow updates dynamically whenever the test charge moves, its value changes, or any source configuration is altered. |

### Phase 8 – Sidebar Controls

This phase builds the interactive control panel that manipulates the global state.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 10 – Mode toggle + source list UI** | **Control Panel Implementation** | Enhance `Sidebar.tsx` with structured UI elements: 1. **Mode Section:** Buttons or a toggle to switch between `"Electric"` and `"Gravity"` modes, triggering `setMode`. 2. **Sources Section:** A dynamic list that maps over the current `sources` array. For each source, include an editable input (or slider) for its `value`, a label (“Source 1,” etc.), and a **remove button**. Include a prominent **“Add source” button**. 3. **Test Charge Section:** Buttons to **“Add test charge at origin”** and **“Remove test charge,”** plus an input for its `value`. 4. **Visual Toggles:** Checkboxes to toggle the visibility of the field arrows and the force arrow on the test charge. |

### Phase 9 – Formula Panel with Live Values

This phase connects the physics engine back to the UI for educational display.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 11 – Show formulas and live numeric substitution** | **Educational Display** | Add a "Formulas" section in `Sidebar.tsx`. Display the mode-dependent formulas: **Electric:** $F = k \cdot q_1 \cdot q_2 / r^2$, $E = k \cdot Q / r^2$. **Gravity:** $F = G \cdot m_1 \cdot m_2 / r^2$, $g = G \cdot M / r^2$. Implement a **"current interaction"** feature: If a test charge exists, identify the nearest source to it. Calculate the distance ($r$), the force ($F$), and the field intensity ($E$ or $g$) between this specific pair. Display the calculated formula with **live numeric substitution** for $Q$ (or $M$), $q$ (or $m$), and $r$, showing the final calculated force/field value. Ensure the display updates in real-time as objects are moved or values are changed. |

### Phase 10 – Comparison and Context

This phase adds explanatory text for pedagogy.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 12 – Explanatory labels for mode comparison** | **Pedagogical Text** | Add explanatory text to the Sidebar to highlight field comparisons. When in electric mode, include a note: “Same inverse-square law as gravity, but charges can attract or repel.”. When in gravity mode, note: “All masses attract. Structure is the same as the electric formula, but with G and masses.”. Ensure object positions are retained when switching modes, focusing the change on interpretation and constants ($k$ vs $G$). |

### Phase 11 – Simple Presets

This phase adds quick-access buttons for common classroom scenarios.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 13 – Preset scenarios** | **Scenario Loading** | Add a "Presets" section to the Sidebar. Implement buttons that, when clicked, replace the existing `sources` and `testCharge` array with predefined configurations. Required presets include: **“Single source,”** **“Dipole (+Q and –Q)”** (electric only), **“Two equal like charges,”** and **“Planet + test mass”** (gravity only). Optionally, adjust the camera view to frame the new setup. |

### Phase 12 – Deployment Preparation

This phase prepares the application for static hosting.

| Prompt | Focus | Details |
| :--- | :--- | :--- |
| **🧾 Prompt 14 – Prepare for Netlify deployment** | **Build Configuration** | Confirm that the `package.json` contains a standard build script (e.g., `vite build`). Ensure that all assets and paths within the application are configured for relative addressing. Add a concise section to the `README.md` file confirming the deployment steps: Build command is `npm run build`, and the Publish directory is `dist`. Verify that the application functions correctly when served from a static, production build. |