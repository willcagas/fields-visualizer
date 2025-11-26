import { useState } from 'react'
import ScenePanel from '@/components/ScenePanel'
import Sidebar from '@/components/Sidebar'
import './App.css'

function App() {
  // Lift visualization toggle state so both components can access it
  type FieldVisualizationMode = 'vector' | 'streamline' | null
  const [fieldVisualizationMode, setFieldVisualizationMode] = useState<FieldVisualizationMode>('vector') // Field visualization mode
  const [showForceArrow, setShowForceArrow] = useState(true)
  const [showChargeAura, setShowChargeAura] = useState(true) // Default ON
  const [showSymbols, setShowSymbols] = useState(true) // Default ON
  const [fieldDisplayScale, setFieldDisplayScale] = useState(1.0) // Default scale factor
  const [gridSize, setGridSize] = useState(8.0) // Default grid size (half-width)
  const [fieldFlowDensity, setFieldFlowDensity] = useState(100) // Number of field lines (sphere shell seeding)
  const [fieldFlowPulseSpeed, setFieldFlowPulseSpeed] = useState(1.0) // Pulse speed multiplier
  const [fieldFlowPulseIntensity, setFieldFlowPulseIntensity] = useState(1.0) // Pulse brightness multiplier

  return (
    <div className="app">
      <ScenePanel
        fieldVisualizationMode={fieldVisualizationMode}
        showForceArrow={showForceArrow}
        showChargeAura={showChargeAura}
        showSymbols={showSymbols}
        fieldDisplayScale={fieldDisplayScale}
        gridSize={gridSize}
        fieldFlowDensity={fieldFlowDensity}
        fieldFlowPulseSpeed={fieldFlowPulseSpeed}
        fieldFlowPulseIntensity={fieldFlowPulseIntensity}
      />
      <Sidebar
        fieldVisualizationMode={fieldVisualizationMode}
        setFieldVisualizationMode={setFieldVisualizationMode}
        showForceArrow={showForceArrow}
        setShowForceArrow={setShowForceArrow}
        showChargeAura={showChargeAura}
        setShowChargeAura={setShowChargeAura}
        showSymbols={showSymbols}
        setShowSymbols={setShowSymbols}
        fieldDisplayScale={fieldDisplayScale}
        setFieldDisplayScale={setFieldDisplayScale}
        gridSize={gridSize}
        setGridSize={setGridSize}
        fieldFlowDensity={fieldFlowDensity}
        setFieldFlowDensity={setFieldFlowDensity}
        fieldFlowPulseSpeed={fieldFlowPulseSpeed}
        setFieldFlowPulseSpeed={setFieldFlowPulseSpeed}
        fieldFlowPulseIntensity={fieldFlowPulseIntensity}
        setFieldFlowPulseIntensity={setFieldFlowPulseIntensity}
      />
      </div>
  )
}

export default App
