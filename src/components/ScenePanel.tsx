// 3D viewport area with react-three-fiber canvas
import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useFieldStore } from '@/state/store'
import SourceSphere from './SourceSphere'
import TestChargeSphere from './TestChargeSphere'
import FieldVectors from './FieldVectors'
import ForceArrow from './ForceArrow'
import ChargeAura from './ChargeAura'
import FieldFlow from './FieldFlow'
import './ScenePanel.css'

type FieldVisualizationMode = 'vector' | 'streamline' | null

function Scene({
  onDragStart,
  onDragEnd,
  fieldVisualizationMode,
  showForceArrow,
  showChargeAura,
  showSymbols,
  fieldDisplayScale,
  gridSize,
  fieldFlowDensity,
  fieldFlowPulseSpeed,
  fieldFlowPulseIntensity,
}: {
  onDragStart: () => void
  onDragEnd: () => void
  fieldVisualizationMode: FieldVisualizationMode
  showForceArrow: boolean
  showChargeAura: boolean
  showSymbols: boolean
  fieldDisplayScale: number
  gridSize: number
  fieldFlowDensity: number
  fieldFlowPulseSpeed: number
  fieldFlowPulseIntensity: number
}) {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)
  const testCharge = useFieldStore((state) => state.testCharge)
  const updateSource = useFieldStore((state) => state.updateSource)
  const updateTestCharge = useFieldStore((state) => state.updateTestCharge)

  // Track which source is selected for dragging
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)

  const handleSourcePositionChange = (id: string, position: [number, number, number]) => {
    updateSource(id, { position })
  }

  const handleTestChargePositionChange = (position: [number, number, number]) => {
    if (testCharge) {
      updateTestCharge({ position })
    }
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      {/* Grid for spatial reference */}
      <Grid
        renderOrder={-1}
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#444"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#666"
        fadeDistance={25}
        fadeStrength={1}
      />

      {/* Coordinate axes (simple visual helper) */}
      <axesHelper args={[5]} />

      {/* Field vector visualization */}
      {fieldVisualizationMode === 'vector' && (
        <FieldVectors enabled={true} fieldDisplayScale={fieldDisplayScale} gridSize={gridSize} />
      )}

      {/* Streamline Field visualization - curved field lines with animated pulses */}
      {fieldVisualizationMode === 'streamline' && (
        <FieldFlow
          enabled={true}
          density={fieldFlowDensity}
          pulseSpeed={fieldFlowPulseSpeed}
          pulseIntensity={fieldFlowPulseIntensity}
        />
      )}

      {/* Render all sources */}
      {sources.map((source) => (
        <group key={source.id}>
          <SourceSphere
            source={source}
            mode={mode}
            selected={selectedSourceId === source.id}
            onSelect={() => setSelectedSourceId(selectedSourceId === source.id ? null : source.id)}
            onPositionChange={(position) => handleSourcePositionChange(source.id, position)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            showSymbols={showSymbols}
          />
          {/* Charge aura around source */}
          {showChargeAura && (
            <ChargeAura
              position={source.position}
              value={source.value}
              mode={mode}
            />
          )}
        </group>
      ))}

      {/* Render test charge if it exists */}
      {testCharge && (
        <>
          <TestChargeSphere
            testCharge={testCharge}
            onPositionChange={handleTestChargePositionChange}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
          {/* Force arrow on test charge */}
          <ForceArrow testCharge={testCharge} mode={mode} sources={sources} enabled={showForceArrow} />
        </>
      )}
    </>
  )
}

interface ScenePanelProps {
  fieldVisualizationMode: FieldVisualizationMode
  showForceArrow: boolean
  showChargeAura: boolean
  showSymbols: boolean
  fieldDisplayScale: number
  gridSize: number
  fieldFlowDensity: number
  fieldFlowPulseSpeed: number
  fieldFlowPulseIntensity: number
}

export default function ScenePanel({
  fieldVisualizationMode,
  showForceArrow,
  showChargeAura,
  showSymbols,
  fieldDisplayScale,
  gridSize,
  fieldFlowDensity,
  fieldFlowPulseSpeed,
  fieldFlowPulseIntensity,
}: ScenePanelProps) {
  const orbitControlsRef = useRef<any>(null)

  const handleDragStart = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false
    }
  }

  const handleDragEnd = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true
    }
  }

  return (
    <div className="scene-panel">
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true }}
      >
        <Scene
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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
        <OrbitControls
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={50}
        />
      </Canvas>
    </div>
  )
}

