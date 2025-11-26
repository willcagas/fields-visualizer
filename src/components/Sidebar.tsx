// Control panel for field visualization
import { useState } from 'react'
import { useFieldStore } from '@/state/store'
import FormulaPanel from './FormulaPanel'
import NumberInput from './NumberInput'
import { findEquilibriumPoint } from '@/physics/field'
import { METERS_PER_SCENE_UNIT } from '@/physics/units'
import {
  PRESET_SINGLE_SOURCE,
  PRESET_DIPOLE,
  PRESET_TWO_LIKE_CHARGES,
  PRESET_PLANET_TEST_MASS,
  PRESET_SAMPLE_PROBLEM_1,
} from '@/utils/presets'
import './Sidebar.css'
import './FormulaPanel.css'

type FieldVisualizationMode = 'vector' | 'streamline' | null

// Component for section title with optional tooltip
interface SectionTitleWithTooltipProps {
  title: string
  tooltip?: string
}

function SectionTitleWithTooltip({ title, tooltip }: SectionTitleWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipLocked, setTooltipLocked] = useState(false)

  const handleMouseEnter = () => {
    if (!tooltipLocked && tooltip) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    if (!tooltipLocked) {
      setShowTooltip(false)
    }
  }

  const handleClick = () => {
    if (tooltip) {
      setTooltipLocked(!tooltipLocked)
      setShowTooltip(!tooltipLocked)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', width: '100%' }}>
      <h3 className="section-title" style={{ margin: 0 }}>{title}</h3>
      {tooltip && (
        <div style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
          <button
            className={`formula-help-button ${tooltipLocked ? 'locked' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            aria-label="Show tip"
          >
            ?
          </button>
          {showTooltip && (
            <div className="sidebar-tooltip-top">
              <div className="sidebar-tooltip-content-top">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Component for mode button with optional tooltip
interface ModeButtonWithTooltipProps {
  label: string
  isActive: boolean
  onClick: () => void
  tooltip?: string
}

function ModeButtonWithTooltip({ label, isActive, onClick, tooltip }: ModeButtonWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipLocked, setTooltipLocked] = useState(false)

  const handleMouseEnter = () => {
    if (!tooltipLocked && tooltip) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    if (!tooltipLocked) {
      setShowTooltip(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (tooltip && (e.target as HTMLElement).closest('.formula-help-button')) {
      // If clicking the tooltip button, don't change mode
      setTooltipLocked(!tooltipLocked)
      setShowTooltip(!tooltipLocked)
      e.stopPropagation()
    } else {
      onClick()
    }
  }

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <button
        className={`mode-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        style={{ flex: 1 }}
      >
        {label}
      </button>
      {tooltip && (
        <>
          <button
            className={`formula-help-button ${tooltipLocked ? 'locked' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            aria-label="Show tip"
            style={{ width: '16px', height: '16px', fontSize: '0.7em', flexShrink: 0 }}
          >
            ?
          </button>
          {showTooltip && (
            <div className="sidebar-tooltip-bottom">
              <div className="sidebar-tooltip-content-bottom">
                {tooltip}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface SidebarProps {
  fieldVisualizationMode: FieldVisualizationMode
  setFieldVisualizationMode: (value: FieldVisualizationMode) => void
  showForceArrow: boolean
  setShowForceArrow: (value: boolean) => void
  showChargeAura: boolean
  setShowChargeAura: (value: boolean) => void
  showSymbols: boolean
  setShowSymbols: (value: boolean) => void
  fieldDisplayScale: number
  setFieldDisplayScale: (value: number) => void
  gridSize: number
  setGridSize: (value: number) => void
  fieldFlowDensity: number
  setFieldFlowDensity: (value: number) => void
  fieldFlowPulseSpeed: number
  setFieldFlowPulseSpeed: (value: number) => void
  fieldFlowPulseIntensity: number
  setFieldFlowPulseIntensity: (value: number) => void
}

export default function Sidebar({
  fieldVisualizationMode,
  setFieldVisualizationMode,
  showForceArrow,
  setShowForceArrow,
  showChargeAura,
  setShowChargeAura,
  showSymbols,
  setShowSymbols,
  fieldDisplayScale,
  setFieldDisplayScale,
  gridSize,
  setGridSize,
  fieldFlowDensity,
  setFieldFlowDensity,
  fieldFlowPulseSpeed,
  setFieldFlowPulseSpeed,
  fieldFlowPulseIntensity,
  setFieldFlowPulseIntensity,
}: SidebarProps) {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)
  const testCharge = useFieldStore((state) => state.testCharge)
  
  const setMode = useFieldStore((state) => state.setMode)
  const addSource = useFieldStore((state) => state.addSource)
  const updateSource = useFieldStore((state) => state.updateSource)
  const removeSource = useFieldStore((state) => state.removeSource)
  const setTestCharge = useFieldStore((state) => state.setTestCharge)
  const updateTestCharge = useFieldStore((state) => state.updateTestCharge)
  const removeTestCharge = useFieldStore((state) => state.removeTestCharge)
  const loadPreset = useFieldStore((state) => state.loadPreset)

  const handleAddSource = () => {
    // Add source at default position (origin) with default value
    // Use realistic charge values (nC scale for electric, kg scale for gravity)
    const defaultValue = mode === 'electric' ? 1e-9 : 5.0
    addSource([0, 0, 0], defaultValue)
  }

  const handleAddTestCharge = () => {
    // Add test charge at origin with default value
    // Use realistic test charge value (pC scale)
    const defaultValue = mode === 'electric' ? 1e-12 : 1.0
    setTestCharge([0, 0, 0], defaultValue)
  }

  const handlePlaceAtEquilibrium = () => {
    // Find equilibrium point where net field is zero
    const equilibriumPos = findEquilibriumPoint(sources, mode)
    
    if (equilibriumPos) {
      // Use existing test charge value or realistic default
      const testValue = testCharge ? testCharge.value : (mode === 'electric' ? 1e-12 : 1.0)
      setTestCharge(equilibriumPos, testValue)
    }
  }

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        <span className="title-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 3 8 Q 8 3, 13 8 Q 18 13, 23 8" />
            <path d="M 3 18 Q 8 13, 13 18 Q 18 23, 23 18" />
          </svg>
        </span>
        <span className="title-text">Fieldflow</span>
      </h2>
      
      {/* Mode Selection */}
      <section className="sidebar-section">
        <h3 className="section-title">Mode</h3>
        <div className="mode-buttons">
          <ModeButtonWithTooltip
            label="Electric"
            isActive={mode === 'electric'}
            onClick={() => setMode('electric')}
            tooltip="Shows how charges create electrostatic forces in the space around them. Like charges repel each other, and unlike charges attract each other, and the strength of these forces depends on the charge and distance. These interactions form an electric field, showing how a small positive test charge would be affected in space."
          />
          <ModeButtonWithTooltip
            label="Gravitational"
            isActive={mode === 'gravity'}
            onClick={() => setMode('gravity')}
            tooltip="Shows how masses create gravitational forces in the space around them. All masses attract each other, and the strength of this force depends on mass and distance. These interactions form a gravitational field, which shows how a small test mass would be affected in space."
          />
        </div>
      </section>

      {/* Presets Section */}
      <section className="sidebar-section">
        <h3 className="section-title">Presets</h3>
        <div className="preset-buttons">
          <button
            onClick={() => loadPreset(PRESET_SINGLE_SOURCE)}
            className="preset-button"
          >
            Single Source
          </button>
          {mode === 'electric' && (
            <button
              onClick={() => loadPreset(PRESET_DIPOLE)}
              className="preset-button"
            >
              Dipole (+Q and –Q)
            </button>
          )}
          <button
            onClick={() => loadPreset(PRESET_TWO_LIKE_CHARGES)}
            className="preset-button"
          >
            Two Equal Like {mode === 'electric' ? 'Charges' : 'Masses'}
          </button>
          {mode === 'gravity' && (
            <button
              onClick={() => loadPreset(PRESET_PLANET_TEST_MASS)}
              className="preset-button"
            >
              Planet + Test Mass
            </button>
          )}
          {mode === 'electric' && (
            <button
              onClick={() => loadPreset(PRESET_SAMPLE_PROBLEM_1)}
              className="preset-button"
            >
              Two Point Charges in 1D
            </button>
          )}
        </div>
      </section>

      {/* Field Visualization Mode */}
      <section className="sidebar-section">
        <h3 className="section-title">Field</h3>
        <div className="mode-buttons">
          <button
            className={`mode-button ${fieldVisualizationMode === 'vector' ? 'active' : ''}`}
            onClick={() => setFieldVisualizationMode('vector')}
          >
            Vector Arrow
          </button>
          <button
            className={`mode-button ${fieldVisualizationMode === 'streamline' ? 'active' : ''}`}
            onClick={() => setFieldVisualizationMode('streamline')}
          >
            Streamline
          </button>
        </div>
        {fieldVisualizationMode === 'vector' && (
          <>
            <div className="slider-control">
              <label htmlFor="field-display-scale" className="slider-label">
                Field display scale: {fieldDisplayScale.toFixed(1)}
              </label>
              <input
                id="field-display-scale"
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={fieldDisplayScale}
                onChange={(e) => setFieldDisplayScale(parseFloat(e.target.value))}
                className="slider"
              />
            </div>
            <div className="slider-control">
              <label htmlFor="grid-size" className="slider-label">
                Field arrow grid size: {gridSize.toFixed(1)} units
              </label>
              <input
                id="grid-size"
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={gridSize}
                onChange={(e) => setGridSize(parseFloat(e.target.value))}
                className="slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', color: '#999', marginTop: '0.25rem' }}>
                <span>3 (6 total)</span>
                <span>10 (20 total)</span>
              </div>
            </div>
          </>
        )}
        {fieldVisualizationMode === 'streamline' && (
          <>
            <div className="slider-control">
              <label htmlFor="field-flow-density" className="slider-label">
                Field Line Density: {fieldFlowDensity} lines
              </label>
              <input
                id="field-flow-density"
                type="range"
                min="50"
                max="250"
                step="25"
                value={fieldFlowDensity}
                onChange={(e) => setFieldFlowDensity(parseInt(e.target.value))}
                className="slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', color: '#999', marginTop: '0.25rem' }}>
                <span>50 lines</span>
                <span>250 lines</span>
              </div>
            </div>
            <div className="slider-control">
              <label htmlFor="field-flow-pulse-speed" className="slider-label">
                Pulse Speed: {fieldFlowPulseSpeed.toFixed(2)}×
              </label>
              <input
                id="field-flow-pulse-speed"
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={fieldFlowPulseSpeed}
                onChange={(e) => setFieldFlowPulseSpeed(parseFloat(e.target.value))}
                className="slider"
              />
            </div>
            <div className="slider-control">
              <label htmlFor="field-flow-pulse-intensity" className="slider-label">
                Pulse Intensity: {fieldFlowPulseIntensity.toFixed(2)}×
              </label>
              <input
                id="field-flow-pulse-intensity"
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={fieldFlowPulseIntensity}
                onChange={(e) => setFieldFlowPulseIntensity(parseFloat(e.target.value))}
                className="slider"
              />
            </div>
          </>
        )}
      </section>

      {/* Sources Section */}
      <section className="sidebar-section">
        <SectionTitleWithTooltip
          title={mode === 'electric' ? 'Source Charges' : 'Source Masses'}
          tooltip={mode === 'electric' ? 'Tip: Use realistic values (e.g., 1e-9 for nC scale). Type "1e-9" in the input field.' : undefined}
        />
        <div className="source-list">
          {sources.map((source, index) => (
            <div key={source.id} className="source-item">
              <div className="source-label">Source {index + 1}</div>
              <div className="source-controls">
                <label className="input-label">
                  {mode === 'electric' ? 'Charge Q (C):' : 'Mass M (kg):'}
                  <NumberInput
                    value={source.value}
                    onChange={(value) => updateSource(source.id, { value })}
                    placeholder={mode === 'electric' ? 'e.g., 1e-9' : 'e.g., 5.0'}
                    title={mode === 'electric' ? 'Enter charge in Coulombs (use scientific notation like 1e-9 for nC scale)' : 'Enter mass in kg'}
                  />
                </label>
                <button
                  onClick={() => removeSource(source.id)}
                  className="remove-button"
                  title="Remove source"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAddSource} className="add-button">
          + Add {mode === 'electric' ? 'Charge' : 'Mass'}
        </button>
      </section>

      {/* Test Charge Section */}
      <section className="sidebar-section">
        <SectionTitleWithTooltip
          title={mode === 'electric' ? 'Test Charge' : 'Test Mass'}
          tooltip={mode === 'electric' ? 'Tip: Use realistic values (e.g., 1e-12 for pC scale). Type "1e-12" in the input field.' : undefined}
        />
        {testCharge ? (
          <div className="test-charge-controls">
            <label className="input-label">
              {mode === 'electric' ? 'Charge q (C):' : 'Mass m (kg):'}
              <NumberInput
                value={testCharge.value}
                onChange={(value) => updateTestCharge({ value })}
                placeholder={mode === 'electric' ? 'e.g., 1e-12' : 'e.g., 1.0'}
                title={mode === 'electric' ? 'Enter charge in Coulombs (use scientific notation like 1e-12 for pC scale)' : 'Enter mass in kg'}
              />
            </label>
            <button
              onClick={removeTestCharge}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ) : (
          <button onClick={handleAddTestCharge} className="add-button">
            Add {mode === 'electric' ? 'Test Charge' : 'Test Mass'} at Origin
          </button>
        )}
        {/* Equilibrium point button - only show for 2 sources in electric mode */}
        {mode === 'electric' && sources.length === 2 && (
          <button
            onClick={handlePlaceAtEquilibrium}
            className="add-button"
            style={{ marginTop: '0.5rem' }}
          >
            Place at Equilibrium Point (E = 0)
          </button>
        )}
      </section>

      {/* Visualization Toggles */}
      <section className="sidebar-section">
        <h3 className="section-title">Visualization</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showChargeAura}
            onChange={(e) => setShowChargeAura(e.target.checked)}
          />
          Show charge aura
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showSymbols}
            onChange={(e) => setShowSymbols(e.target.checked)}
          />
          Show charge symbols
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showForceArrow}
            onChange={(e) => setShowForceArrow(e.target.checked)}
          />
          Show force arrow
        </label>
        {/* Distance slider - only show when there are exactly 2 sources */}
        {sources.length === 2 && (() => {
          // Calculate current distance and midpoint
          const [source1, source2] = sources
          const dx = source2.position[0] - source1.position[0]
          const dy = source2.position[1] - source1.position[1]
          const dz = source2.position[2] - source1.position[2]
          const currentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz)
          const currentDistanceMeters = currentDistance * METERS_PER_SCENE_UNIT
          
          // Calculate midpoint
          const midpoint: [number, number, number] = [
            (source1.position[0] + source2.position[0]) / 2,
            (source1.position[1] + source2.position[1]) / 2,
            (source1.position[2] + source2.position[2]) / 2,
          ]
          
          // Calculate unit vector from source1 to source2
          const unitVector: [number, number, number] = currentDistance > 0.01
            ? [dx / currentDistance, dy / currentDistance, dz / currentDistance]
            : [1, 0, 0] // Default direction if sources are too close
          
          const handleDistanceChange = (newDistanceMeters: number) => {
            const newDistance = newDistanceMeters / METERS_PER_SCENE_UNIT
            const halfDistance = newDistance / 2
            
            // Update source1: midpoint - halfDistance * unitVector
            const newPos1: [number, number, number] = [
              midpoint[0] - halfDistance * unitVector[0],
              midpoint[1] - halfDistance * unitVector[1],
              midpoint[2] - halfDistance * unitVector[2],
            ]
            
            // Update source2: midpoint + halfDistance * unitVector
            const newPos2: [number, number, number] = [
              midpoint[0] + halfDistance * unitVector[0],
              midpoint[1] + halfDistance * unitVector[1],
              midpoint[2] + halfDistance * unitVector[2],
            ]
            
            updateSource(source1.id, { position: newPos1 })
            updateSource(source2.id, { position: newPos2 })
          }
          
          return (
            <div className="slider-control">
              <label htmlFor="source-distance" className="slider-label">
                Distance between sources: {currentDistanceMeters.toFixed(3)} m
              </label>
              <input
                id="source-distance"
                type="range"
                min="0.02"
                max="1.0"
                step="0.01"
                value={currentDistanceMeters}
                onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
                className="slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', color: '#999', marginTop: '0.25rem' }}>
                <span>0.02 m</span>
                <span>1.0 m</span>
              </div>
            </div>
          )
        })()}
      </section>

      {/* Calculations Section */}
      <section className="sidebar-section">
        <h3 className="section-title">Calculations</h3>
        <FormulaPanel />
      </section>

      {/* Footer */}
      <section className="sidebar-section" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #3a3a3a' }}>
        <div className="sidebar-footer">
          Made with ❤️ by{' '}
          <a 
            href="https://wcagas.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            William Cagas
          </a>
        </div>
      </section>
    </div>
  )
}


