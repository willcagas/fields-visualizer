// Physics utility functions for computing fields and forces
// Pure math functions - no rendering logic

import { COULOMB_CONSTANT, GRAVITATIONAL_CONSTANT, MIN_DISTANCE } from './constants'
import { sceneToMeters, METERS_PER_SCENE_UNIT } from './units'
import type { FieldSource, FieldMode } from './types'

export interface Vector3 {
  x: number
  y: number
  z: number
}

/**
 * Calculate distance between two 3D points
 */
function distance(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const dz = p2[2] - p1[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate unit vector from point1 to point2
 */
function unitVector(
  from: [number, number, number],
  to: [number, number, number]
): [number, number, number] {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dz = to[2] - from[2]
  const r = Math.max(distance(from, to), MIN_DISTANCE)
  return [dx / r, dy / r, dz / r]
}

/**
 * Compute electric field at a point due to all sources
 * E = k * Q / r^2 (inverse-square law)
 * Returns vector components {x, y, z}
 * 
 * Note: Positions are converted from scene units to meters before physics calculations
 */
export function computeElectricFieldAtPoint(
  point: [number, number, number],
  sources: FieldSource[]
): Vector3 {
  // Convert scene coordinates to meters for physics calculations
  const pointMeters = sceneToMeters(point)
  
  let Ex = 0
  let Ey = 0
  let Ez = 0

  for (const source of sources) {
    // Convert source position to meters
    const sourceMeters = sceneToMeters(source.position)
    
    // Calculate distance in meters
    const rMeters = Math.max(distance(pointMeters, sourceMeters), MIN_DISTANCE * METERS_PER_SCENE_UNIT)
    const rSquaredMeters = rMeters * rMeters
    
    // Electric field magnitude: E = k * Q / r^2 (in meters)
    const magnitude = (COULOMB_CONSTANT * source.value) / rSquaredMeters
    
    // Direction: unit vector from source to point (for positive charge)
    // For negative charges, field points toward source
    const [ux, uy, uz] = unitVector(sourceMeters, pointMeters)
    
    // Scale by magnitude and add to total (superposition)
    Ex += magnitude * ux
    Ey += magnitude * uy
    Ez += magnitude * uz
  }

  return { x: Ex, y: Ey, z: Ez }
}

/**
 * Compute gravitational field at a point due to all sources
 * g = G * M / r^2 (inverse-square law)
 * Returns vector components {x, y, z}
 * 
 * Note: Positions are converted from scene units to meters before physics calculations
 */
export function computeGravitationalFieldAtPoint(
  point: [number, number, number],
  sources: FieldSource[]
): Vector3 {
  // Convert scene coordinates to meters for physics calculations
  const pointMeters = sceneToMeters(point)
  
  let Gx = 0
  let Gy = 0
  let Gz = 0

  for (const source of sources) {
    // Convert source position to meters
    const sourceMeters = sceneToMeters(source.position)
    
    // Calculate distance in meters
    const rMeters = Math.max(distance(pointMeters, sourceMeters), MIN_DISTANCE * METERS_PER_SCENE_UNIT)
    const rSquaredMeters = rMeters * rMeters
    
    // Gravitational field magnitude: g = G * M / r^2 (in meters)
    const magnitude = (GRAVITATIONAL_CONSTANT * source.value) / rSquaredMeters
    
    // Direction: unit vector from point to source (always attractive)
    const [ux, uy, uz] = unitVector(pointMeters, sourceMeters)
    
    // Scale by magnitude and add to total (superposition)
    Gx += magnitude * ux
    Gy += magnitude * uy
    Gz += magnitude * uz
  }

  return { x: Gx, y: Gy, z: Gz }
}

/**
 * Compute force on test charge/mass at a point
 * For electric: F = q * E
 * For gravity: F = m * g
 * Returns vector components {x, y, z}
 */
export function computeForceOnTestCharge(
  point: [number, number, number],
  testValue: number,
  mode: FieldMode,
  sources: FieldSource[]
): Vector3 {
  let field: Vector3

  if (mode === 'electric') {
    // Electric force: F = q * E
    const E = computeElectricFieldAtPoint(point, sources)
    field = E
  } else {
    // Gravitational force: F = m * g
    const g = computeGravitationalFieldAtPoint(point, sources)
    field = g
  }

  // Multiply field by test charge/mass value
  return {
    x: field.x * testValue,
    y: field.y * testValue,
    z: field.z * testValue,
  }
}

/**
 * Find the equilibrium point where net electric field is zero
 * Only works for exactly 2 sources in electric mode. For more sources, returns null.
 * Returns position in scene coordinates, or null if no equilibrium point found.
 */
export function findEquilibriumPoint(
  sources: FieldSource[],
  mode: FieldMode
): [number, number, number] | null {
  // Only works for exactly 2 sources in electric mode
  if (sources.length !== 2 || mode !== 'electric') {
    return null
  }

  const [q1, q2] = sources
  const p1 = q1.position
  const p2 = q2.position

  // Convert to meters for calculations
  const p1Meters = sceneToMeters(p1)
  const p2Meters = sceneToMeters(p2)

  // Calculate distance between sources in meters
  const d = distance(p1Meters, p2Meters)
  if (d < MIN_DISTANCE * METERS_PER_SCENE_UNIT) {
    return null // Sources too close together
  }

  // Get charge magnitudes and signs
  const q1Mag = Math.abs(q1.value)
  const q2Mag = Math.abs(q2.value)
  const q1Sign = Math.sign(q1.value)
  const q2Sign = Math.sign(q2.value)
  const areLikeCharges = q1Sign * q2Sign > 0

  // Unit vector from q1 to q2
  const [ux, uy, uz] = unitVector(p1Meters, p2Meters)
  
  let eqMeters: [number, number, number]
  
  if (areLikeCharges) {
    // LIKE CHARGES: Equilibrium point is BETWEEN them
    // Forces oppose each other only in the middle
    // Solve: k|q1|/r1² = k|q2|/(d-r1)² where r1 is distance from q1
    // This simplifies to: r1/d = √(|q1|) / (√(|q1|) + √(|q2|))
    const sqrtQ1 = Math.sqrt(q1Mag)
    const sqrtQ2 = Math.sqrt(q2Mag)
    const denominator = sqrtQ1 + sqrtQ2
    if (denominator === 0) return null
    
    const r1 = (sqrtQ1 / denominator) * d
    
    // Equilibrium is between q1 and q2, at distance r1 from q1
    eqMeters = [
      p1Meters[0] + ux * r1,
      p1Meters[1] + uy * r1,
      p1Meters[2] + uz * r1,
    ]
  } else {
    // OPPOSITE CHARGES: Equilibrium point is OUTSIDE the pair
    // It must be closer to the weaker charge (smaller magnitude)
    // Between opposite charges, fields point in same direction and cannot cancel
    
    // Determine which charge is weaker
    const weakerIsQ1 = q1Mag < q2Mag
    const weakMag = weakerIsQ1 ? q1Mag : q2Mag
    const strongMag = weakerIsQ1 ? q2Mag : q1Mag
    
    // Solve: k|q_weak|/x² = k|q_strong|/(x+d)²
    // Where x is distance from weaker charge, d is distance between charges
    // This simplifies to: √(|q_strong|)x = √(|q_weak|)(x+d)
    // Rearranging: x(√(|q_strong|) - √(|q_weak|)) = √(|q_weak|)d
    // x = √(|q_weak|)d / (√(|q_strong|) - √(|q_weak|))
    const sqrtWeak = Math.sqrt(weakMag)
    const sqrtStrong = Math.sqrt(strongMag)
    const denominator = sqrtStrong - sqrtWeak
    
    if (denominator <= 0) return null // Shouldn't happen if magnitudes differ
    
    const x = (sqrtWeak * d) / denominator
    
    // Calculate equilibrium point position in meters
    // Position is at distance x from weaker charge, on the side away from stronger charge
    if (weakerIsQ1) {
      // Equilibrium is outside q1, away from q2
      // Go in direction opposite to unit vector (away from q2)
      eqMeters = [
        p1Meters[0] - ux * x,
        p1Meters[1] - uy * x,
        p1Meters[2] - uz * x,
      ]
    } else {
      // Equilibrium is outside q2, away from q1
      // Go in direction of unit vector from q2 (away from q1)
      eqMeters = [
        p2Meters[0] + ux * x,
        p2Meters[1] + uy * x,
        p2Meters[2] + uz * x,
      ]
    }
  }

  // Convert back to scene coordinates
  let equilibriumScene: [number, number, number] = [
    eqMeters[0] / METERS_PER_SCENE_UNIT,
    eqMeters[1] / METERS_PER_SCENE_UNIT,
    eqMeters[2] / METERS_PER_SCENE_UNIT,
  ]

  // Refine the equilibrium point using iterative Newton-Raphson method
  // This compensates for numerical precision issues and unit conversion errors
  // We want to find where E_total = 0, so we minimize |E|²
  const MAX_ITERATIONS = 10
  const TOLERANCE = 1e-15 // Very small tolerance for field magnitude
  
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // Calculate field at current position
    const field = computeElectricFieldAtPoint(equilibriumScene, sources)
    const fieldMag = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
    
    // If field is essentially zero, we're done
    if (fieldMag < TOLERANCE) {
      break
    }
    
    // Calculate gradient of |E|² to find direction to move
    // For two charges along a line, the gradient points along that line
    // Move opposite to the field direction (since we want E = 0)
    
    // Normalize field to get direction
    if (fieldMag < 1e-20) break // Already very small
    
    const stepSize = fieldMag * 1e-6 // Small step size to avoid overshooting
    const stepDirection: [number, number, number] = [
      -field.x / fieldMag,
      -field.y / fieldMag,
      -field.z / fieldMag,
    ]
    
    // Convert step to scene units
    const stepScene: [number, number, number] = [
      stepDirection[0] * stepSize / METERS_PER_SCENE_UNIT,
      stepDirection[1] * stepSize / METERS_PER_SCENE_UNIT,
      stepDirection[2] * stepSize / METERS_PER_SCENE_UNIT,
    ]
    
    // Update position
    equilibriumScene = [
      equilibriumScene[0] + stepScene[0],
      equilibriumScene[1] + stepScene[1],
      equilibriumScene[2] + stepScene[2],
    ]
  }
  
  return equilibriumScene
}

/**
 * Compute electric potential at a point due to all sources
 * V = k * Q / r (scalar, in Volts)
 * Uses superposition: potential from each source adds algebraically
 * 
 * Note: Positions are converted from scene units to meters before physics calculations
 */
export function computeElectricPotentialAtPoint(
  point: [number, number, number],
  sources: FieldSource[]
): number {
  // Convert scene coordinates to meters for physics calculations
  const pointMeters = sceneToMeters(point)
  
  let potential = 0

  for (const source of sources) {
    // Convert source position to meters
    const sourceMeters = sceneToMeters(source.position)
    
    // Calculate distance in meters
    const rMeters = Math.max(distance(pointMeters, sourceMeters), MIN_DISTANCE * METERS_PER_SCENE_UNIT)
    
    // Electric potential: V = k * Q / r (scalar addition)
    potential += (COULOMB_CONSTANT * source.value) / rMeters
  }

  return potential // In Volts (J/C)
}

/**
 * Compute gravitational potential at a point due to all sources
 * U = -G * M / r (scalar, in J/kg)
 * Note: Negative sign indicates attractive potential (work needed to escape)
 * Uses superposition: potential from each source adds algebraically
 * 
 * Note: Positions are converted from scene units to meters before physics calculations
 */
export function computeGravitationalPotentialAtPoint(
  point: [number, number, number],
  sources: FieldSource[]
): number {
  // Convert scene coordinates to meters for physics calculations
  const pointMeters = sceneToMeters(point)
  
  let potential = 0

  for (const source of sources) {
    // Convert source position to meters
    const sourceMeters = sceneToMeters(source.position)
    
    // Calculate distance in meters
    const rMeters = Math.max(distance(pointMeters, sourceMeters), MIN_DISTANCE * METERS_PER_SCENE_UNIT)
    
    // Gravitational potential: U = -G * M / r (scalar addition)
    // Negative because work is required to move mass away from source
    potential -= (GRAVITATIONAL_CONSTANT * source.value) / rMeters
  }

  return potential // In J/kg
}

/**
 * Compute potential difference between two points
 * For electric: ΔV = V₂ - V₁
 * For gravity: ΔU = U₂ - U₁
 * Returns the potential difference (scalar)
 */
export function computePotentialDifference(
  point1: [number, number, number],
  point2: [number, number, number],
  mode: FieldMode,
  sources: FieldSource[]
): number {
  let potential1: number
  let potential2: number

  if (mode === 'electric') {
    potential1 = computeElectricPotentialAtPoint(point1, sources)
    potential2 = computeElectricPotentialAtPoint(point2, sources)
  } else {
    potential1 = computeGravitationalPotentialAtPoint(point1, sources)
    potential2 = computeGravitationalPotentialAtPoint(point2, sources)
  }

  return potential2 - potential1
}

