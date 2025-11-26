// Formula panel with live numeric substitution
import { useMemo, useState } from 'react'
import { useFieldStore } from '@/state/store'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import {
  computeElectricFieldAtPoint,
  computeGravitationalFieldAtPoint,
  computeForceOnTestCharge,
  computeElectricPotentialAtPoint,
  computeGravitationalPotentialAtPoint,
} from '@/physics/field'
import { COULOMB_CONSTANT, GRAVITATIONAL_CONSTANT } from '@/physics/constants'
import { sceneToMeters } from '@/physics/units'
import type { FieldSource } from '@/physics/types'
import './FormulaPanel.css'

/**
 * Calculate distance between two 3D points in scene units
 */
function distance(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const dz = p2[2] - p1[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Find the nearest source to the test charge
 */
function findNearestSource(
  testPosition: [number, number, number],
  sources: FieldSource[]
): FieldSource | null {
  if (sources.length === 0) return null

  let nearest = sources[0]
  let minDist = distance(testPosition, sources[0].position)

  for (const source of sources) {
    const dist = distance(testPosition, source.position)
    if (dist < minDist) {
      minDist = dist
      nearest = source
    }
  }

  return nearest
}

export default function FormulaPanel() {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)
  const testCharge = useFieldStore((state) => state.testCharge)

  // Calculate live values for nearest source interaction
  const liveValues = useMemo(() => {
    if (!testCharge || sources.length === 0) {
      return null
    }

    const nearestSource = findNearestSource(testCharge.position, sources)
    if (!nearestSource) return null

    // Convert scene distance to meters (multiply by METERS_PER_SCENE_UNIT)
    const testPosMeters = sceneToMeters(testCharge.position)
    const sourcePosMeters = sceneToMeters(nearestSource.position)
    const rMeters = distance(testPosMeters, sourcePosMeters)
    const rSquared = rMeters * rMeters

    // Calculate field at test charge position
    let fieldMagnitude = 0
    if (mode === 'electric') {
      const field = computeElectricFieldAtPoint(testCharge.position, sources)
      fieldMagnitude = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
    } else {
      const field = computeGravitationalFieldAtPoint(testCharge.position, sources)
      fieldMagnitude = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
    }

    // Calculate force
    const force = computeForceOnTestCharge(testCharge.position, testCharge.value, mode, sources)
    const forceMagnitude = Math.sqrt(force.x ** 2 + force.y ** 2 + force.z ** 2)

    // Calculate individual field contribution from nearest source (for formula display)
    let sourceFieldMagnitude = 0
    if (mode === 'electric') {
      const fieldFromSource = computeElectricFieldAtPoint(testCharge.position, [nearestSource])
      sourceFieldMagnitude = Math.sqrt(fieldFromSource.x ** 2 + fieldFromSource.y ** 2 + fieldFromSource.z ** 2)
    } else {
      const fieldFromSource = computeGravitationalFieldAtPoint(testCharge.position, [nearestSource])
      sourceFieldMagnitude = Math.sqrt(fieldFromSource.x ** 2 + fieldFromSource.y ** 2 + fieldFromSource.z ** 2)
    }

    // Calculate potential at test charge position (total from all sources)
    let potential = 0
    if (mode === 'electric') {
      potential = computeElectricPotentialAtPoint(testCharge.position, sources)
    } else {
      potential = computeGravitationalPotentialAtPoint(testCharge.position, sources)
    }

    // Calculate potential from nearest source only (for formula display)
    let sourcePotential = 0
    if (mode === 'electric') {
      sourcePotential = computeElectricPotentialAtPoint(testCharge.position, [nearestSource])
    } else {
      sourcePotential = computeGravitationalPotentialAtPoint(testCharge.position, [nearestSource])
    }

    // Calculate potential at origin (for potential difference calculation)
    const origin: [number, number, number] = [0, 0, 0]
    let potentialAtOrigin = 0
    if (mode === 'electric') {
      potentialAtOrigin = computeElectricPotentialAtPoint(origin, sources)
    } else {
      potentialAtOrigin = computeGravitationalPotentialAtPoint(origin, sources)
    }
    const potentialDifference = potential - potentialAtOrigin

    // Calculate distances from test charge to all sources
    const sourceDistances = sources.map((source) => {
      const sourcePosMeters = sceneToMeters(source.position)
      const distMeters = distance(testPosMeters, sourcePosMeters)
      return {
        source,
        distance: distMeters,
        distanceSquared: distMeters * distMeters,
      }
    })

    // Calculate distance between sources (if there are exactly 2 sources)
    let distanceBetweenSources: number | null = null
    if (sources.length === 2) {
      const source1PosMeters = sceneToMeters(sources[0].position)
      const source2PosMeters = sceneToMeters(sources[1].position)
      distanceBetweenSources = distance(source1PosMeters, source2PosMeters)
    }

    return {
      nearestSource,
      r: rMeters, // Distance in meters for display (to nearest source)
      rSquared,
      fieldMagnitude,
      forceMagnitude,
      sourceFieldMagnitude,
      potential, // Total potential at test charge position
      sourcePotential, // Potential from nearest source only
      potentialDifference, // Potential difference from origin
      sourceDistances, // Distances to all sources
      distanceBetweenSources, // Distance between the two sources (if exactly 2)
    }
  }, [mode, testCharge, sources])

  // Format number for display (regular text, not LaTeX)
  const formatNumber = (num: number, decimals: number = 2): string => {
    // Use scientific notation for very large or very small numbers
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && num !== 0)) {
      return num.toExponential(decimals)
    }
    return num.toFixed(decimals)
  }

  // Format number for LaTeX display (uses proper scientific notation)
  const formatNumberLatex = (num: number, decimals: number = 2, useBrackets: boolean = true): string => {
    if (num === 0) return '0'
    
    // Use scientific notation for very large or very small numbers
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && num !== 0)) {
      const exp = num.toExponential(decimals)
      const [base, exponent] = exp.split('e')
      const expNum = parseInt(exponent)
      const notation = `${base} \\times 10^{${expNum}}`
      return useBrackets ? `\\left(${notation}\\right)` : notation
    }
    return num.toFixed(decimals)
  }

  // Format constant for display (always show in scientific notation if it's a constant)
  const formatConstant = (num: number): string => {
    if (num >= 1e6 || num < 1e-3) {
      return num.toExponential(2)
    }
    return num.toString()
  }

  // Format constant for LaTeX display
  const formatConstantLatex = (num: number): string => {
    if (num >= 1e6 || num < 1e-3) {
      const exp = num.toExponential(2)
      const [base, exponent] = exp.split('e')
      const expNum = parseInt(exponent)
      return `\\left(${base} \\times 10^{${expNum}}\\right)`
    }
    return num.toString()
  }

  // Formula definitions with names, LaTeX, and explanations
  const electricFormulas = [
    {
      name: "Coulomb's Law",
      latex: "F = k \\frac{q_1 q_2}{r^2}",
      explanation: "Coulomb's Law describes the electrostatic force between two point charges. F is the force magnitude, k is Coulomb's constant (8.99 × 10⁹ N·m²/C²), q₁ and q₂ are the charge values, and r is the distance between them. Like charges repel, opposite charges attract."
    },
    {
      name: "Electric Field",
      latex: "E = k \\frac{Q}{r^2}",
      explanation: "The electric field E at a point describes the force per unit charge that would be experienced by a test charge placed at that location. Q is the source charge creating the field, r is the distance from the source, and k is Coulomb's constant. The field points away from positive charges and toward negative charges."
    },
    {
      name: "Electric Potential",
      latex: "V = k \\frac{Q}{r}",
      explanation: "Electric potential V is a scalar quantity that represents the potential energy per unit charge at a point in space. Q is the source charge, r is the distance from the source, and k is Coulomb's constant. Potential is positive near positive charges and negative near negative charges. Potential difference (ΔV) represents the work needed to move a charge between two points."
    },
    {
      name: "Electric Potential Difference",
      latex: "\\Delta V = V_2 - V_1 = k Q \\left(\\frac{1}{r_2} - \\frac{1}{r_1}\\right)",
      explanation: "Electric potential difference ΔV measures the change in electric potential between two points. It represents the work per unit charge required to move a charge from point 1 to point 2. A positive ΔV means work must be done against the field, while negative ΔV means the field does work."
    }
  ]

  const gravityFormulas = [
    {
      name: "Newton's Law of Universal Gravitation",
      latex: "F = G \\frac{m_1 m_2}{r^2}",
      explanation: "Newton's Law describes the gravitational force between two masses. F is the force magnitude, G is the gravitational constant (6.674 × 10⁻¹¹ N·m²/kg²), m₁ and m₂ are the masses, and r is the distance between them. Gravity is always attractive."
    },
    {
      name: "Gravitational Field",
      latex: "g = G \\frac{M}{r^2}",
      explanation: "The gravitational field strength g at a point describes the acceleration due to gravity at that location. M is the source mass creating the field, r is the distance from the source, and G is the gravitational constant. This is equivalent to the force per unit mass."
    },
    {
      name: "Gravitational Potential",
      latex: "U = -G \\frac{M}{r}",
      explanation: "Gravitational potential U is a scalar quantity representing the potential energy per unit mass at a point. M is the source mass, r is the distance from the source, and G is the gravitational constant. The negative sign indicates that work is required to move a mass away from the source. Potential is always negative, approaching zero at infinity."
    },
    {
      name: "Gravitational Potential Difference",
      latex: "\\Delta U = U_2 - U_1 = -G M \\left(\\frac{1}{r_2} - \\frac{1}{r_1}\\right)",
      explanation: "Gravitational potential difference ΔU measures the change in gravitational potential between two points. It represents the work per unit mass required to move a mass from point 1 to point 2. A positive ΔU (moving away) requires work against gravity, while negative ΔU (moving closer) releases gravitational potential energy."
    }
  ]

  const formulas = mode === 'electric' ? electricFormulas : gravityFormulas

  return (
    <div className="formula-panel">
      {/* Static formulas */}
      <div className="formulas-static">
        <h4 className="formula-subtitle">Formulas</h4>
        <div className="formula-list">
          {formulas.map((formulaDef, index) => (
            <FormulaItem
              key={index}
              name={formulaDef.name}
              latex={formulaDef.latex}
              explanation={formulaDef.explanation}
            />
          ))}
        </div>
      </div>

      {/* Live numeric substitution */}
      {liveValues && (
        <div className="formulas-live">
          <h4 className="formula-subtitle">Current Interaction</h4>
          <div className="live-formula">
            {/* Distances to all sources */}
            <div className="formula-line">
              <span className="formula-label">
                <strong>Distances</strong>
              </span>
            </div>
            {liveValues.sourceDistances.map((item, index) => (
              <div key={index} className="formula-line formula-distance-item">
                <span className="formula-label">
                  <InlineMath math={`r_{${index + 1}}`} /> <span className="formula-note">(from {mode === 'electric' ? 'q' : 'm'}<sub>{index + 1}</sub>):</span>
                  <span className="formula-value">
                    {formatNumber(item.distance)} m
                  </span>
                </span>
              </div>
            ))}
            {liveValues.distanceBetweenSources !== null && sources.length === 2 && (
              <>
                <div className="formula-line formula-distance-item">
                  <span className="formula-label">
                    <InlineMath math="d" /> <span className="formula-note">(between sources)</span>: <span className="formula-value">{formatNumber(liveValues.distanceBetweenSources)} m</span>
                  </span>
                </div>
                {/* Show the ratio for equilibrium point calculation */}
                {liveValues.sourceDistances.length >= 2 && (
                  <div className="formula-line formula-note">
                    Ratio <InlineMath math="\\frac{r_1}{d}" />: <span className="formula-value">{formatNumber(liveValues.sourceDistances[0].distance / liveValues.distanceBetweenSources, 3)}</span>
                    {mode === 'electric' && Math.abs(liveValues.sourceDistances[0].distance / liveValues.distanceBetweenSources - 1.35) < 0.1 ? ' ≈ 1.35 ✓' : ''}
                  </div>
                )}
              </>
            )}

            {/* Field formula */}
            <div className="formula-line formula-section-spacing">
              <span className="formula-label">
                <strong>{mode === 'electric' ? 'Electric Field (E)' : 'Gravitational Field (g)'}:</strong>
              </span>
            </div>
            <div className="formula-line formula-indented">
              <InlineMath math={mode === 'electric' ? 'E = k \\frac{Q}{r^2}' : 'g = G \\frac{M}{r^2}'} />
            </div>
            <div className="formula-substitution">
              <InlineMath math={`${mode === 'electric' ? 'E' : 'g'} = ${formatConstantLatex(mode === 'electric' ? COULOMB_CONSTANT : GRAVITATIONAL_CONSTANT)} \\times \\frac{${formatNumberLatex(liveValues.nearestSource.value)} \\text{ ${mode === 'electric' ? 'C' : 'kg'}}}{(${formatNumberLatex(liveValues.r)} \\text{ m})^2}`} />
            </div>
            <div className="formula-result">
              <InlineMath math={`${mode === 'electric' ? 'E' : 'g'} = ${formatNumberLatex(liveValues.sourceFieldMagnitude, 2, false)}`} /> {mode === 'electric' ? 'N/C' : 'm/s²'}
            </div>

            {/* Force formula */}
            {testCharge && (
              <>
                <div className="formula-line formula-section-spacing">
                  <span className="formula-label">
                    <strong>{mode === 'electric' ? 'Electric Force (F)' : 'Gravitational Force'}:</strong>
                  </span>
                </div>
                <div className="formula-line formula-indented">
                  <InlineMath math={mode === 'electric' ? 'F = q \\times E' : 'F = m \\times g'} />
                </div>
                <div className="formula-substitution">
                  <InlineMath math={`F = ${formatNumberLatex(testCharge.value)} \\text{ ${mode === 'electric' ? 'C' : 'kg'}} \\times ${formatNumberLatex(liveValues.sourceFieldMagnitude)} \\text{ ${mode === 'electric' ? 'N/C' : 'm/s²'}}`} />
                </div>
                <div className="formula-result">
                  {liveValues.forceMagnitude < 1e-15 ? (
                    <span style={{ color: '#4ade80' }}>F ≈ 0 N (at equilibrium point)</span>
                  ) : (
                    <>
                      <InlineMath math={`F = ${formatNumberLatex(liveValues.forceMagnitude, 2, false)}`} /> N
                    </>
                  )}
                </div>
              </>
            )}

            {/* Alternative: Full force formula */}
            <div className="formula-line formula-section-spacing">
              <span className="formula-label">
                <strong>{mode === 'electric' ? "Coulomb's Law" : "Newton's Law"}:</strong>
              </span>
            </div>
            <div className="formula-line formula-indented">
              <InlineMath math={mode === 'electric' ? 'F = k \\frac{q_1 q_2}{r^2}' : 'F = G \\frac{m_1 m_2}{r^2}'} />
            </div>
            <div className="formula-substitution">
              <InlineMath math={`F = ${formatConstantLatex(mode === 'electric' ? COULOMB_CONSTANT : GRAVITATIONAL_CONSTANT)} \\times \\frac{${formatNumberLatex(liveValues.nearestSource.value)} \\text{ ${mode === 'electric' ? 'C' : 'kg'}} \\times ${formatNumberLatex(testCharge?.value || 0)} \\text{ ${mode === 'electric' ? 'C' : 'kg'}}}{(${formatNumberLatex(liveValues.r)} \\text{ m})^2}`} />
            </div>
            <div className="formula-result">
              {liveValues.forceMagnitude < 1e-15 ? (
                <span style={{ color: '#4ade80' }}>F ≈ 0 N (at equilibrium point)</span>
              ) : (
                <>
                  <InlineMath math={`F = ${formatNumberLatex(liveValues.forceMagnitude)}`} /> N
                </>
              )}
            </div>

            {/* Potential formula */}
            <div className="formula-line formula-section-spacing">
              <span className="formula-label">
                <strong>{mode === 'electric' ? 'Electric Potential (V)' : 'Gravitational Potential (U)'}:</strong>
              </span>
            </div>
            <div className="formula-line formula-indented">
              <InlineMath math={mode === 'electric' ? 'V = k \\frac{Q}{r}' : 'U = -G \\frac{M}{r}'} />
            </div>
            <div className="formula-substitution">
              <InlineMath math={`${mode === 'electric' ? 'V' : 'U'} = ${mode === 'electric' ? formatConstantLatex(COULOMB_CONSTANT) : `-${formatConstantLatex(GRAVITATIONAL_CONSTANT)}`} \\times \\frac{${formatNumberLatex(liveValues.nearestSource.value)} \\text{ ${mode === 'electric' ? 'C' : 'kg'}}}{${formatNumberLatex(liveValues.r)} \\text{ m}}`} />
            </div>
            <div className="formula-result">
              <InlineMath math={`${mode === 'electric' ? 'V' : 'U'} = ${formatNumberLatex(liveValues.sourcePotential, 2, false)}`} /> {mode === 'electric' ? 'V' : 'J/kg'}
            </div>
            <div className="formula-line formula-note">
              Total potential at test charge position: {formatNumber(liveValues.potential)}
              {mode === 'electric' ? ' V' : ' J/kg'}
            </div>

            {/* Potential difference */}
            <div className="formula-line formula-section-spacing">
              <span className="formula-label">
                <strong>{mode === 'electric' ? 'Potential Difference (ΔV)' : 'Potential Difference (ΔU)'}:</strong>
              </span>
            </div>
            <div className="formula-line formula-indented">
              <InlineMath math={mode === 'electric' ? '\\Delta V = V_2 - V_1' : '\\Delta U = U_2 - U_1'} />
            </div>
            <div className="formula-substitution">
              <InlineMath math={`\\Delta ${mode === 'electric' ? 'V' : 'U'} = ${formatNumberLatex(liveValues.potential)} \\text{ ${mode === 'electric' ? 'V' : 'J/kg'}} - ${formatNumberLatex(liveValues.potential - liveValues.potentialDifference)} \\text{ ${mode === 'electric' ? 'V' : 'J/kg'}} = ${formatNumberLatex(liveValues.potentialDifference)} \\text{ ${mode === 'electric' ? 'V' : 'J/kg'}}`} />
            </div>
            <div className="formula-note">
              (from origin to test charge position)
            </div>
            <div className="formula-result">
              <InlineMath math={`\\Delta ${mode === 'electric' ? 'V' : 'U'} = ${formatNumberLatex(liveValues.potentialDifference, 2, false)}`} /> {mode === 'electric' ? 'V' : 'J/kg'}
            </div>
          </div>
        </div>
      )}

      {!liveValues && (
        <div className="formula-placeholder">
          {testCharge && sources.length === 0
            ? 'Add a source to see calculations'
            : !testCharge && sources.length > 0
              ? 'Add a test charge to see calculations'
              : 'Add sources and a test charge to see live calculations'}
        </div>
      )}
    </div>
  )
}

// Component for individual formula items with name and help tooltip
interface FormulaItemProps {
  name: string
  latex: string
  explanation: string
}

function FormulaItem({ name, latex, explanation }: FormulaItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipLocked, setTooltipLocked] = useState(false)

  const handleMouseEnter = () => {
    if (!tooltipLocked) {
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    if (!tooltipLocked) {
      setShowTooltip(false)
    }
  }

  const handleClick = () => {
    setTooltipLocked(!tooltipLocked)
    setShowTooltip(!tooltipLocked)
  }

  return (
    <div className="formula-item">
      <div className="formula-header">
        <span className="formula-name">{name}</span>
        <button
          className={`formula-help-button ${tooltipLocked ? 'locked' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          aria-label="Show formula explanation"
        >
          ?
        </button>
        {showTooltip && (
          <div className="formula-tooltip">
            <div className="formula-tooltip-content">
              {explanation}
            </div>
          </div>
        )}
      </div>
      <div className="formula-equation">
        <div className="formula-latex-container">
          <BlockMath math={latex} />
        </div>
      </div>
    </div>
  )
}

