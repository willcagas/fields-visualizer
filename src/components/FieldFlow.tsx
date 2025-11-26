// Field Flow visualization - global-scale field lines spanning the entire scene
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFieldStore } from '@/state/store'
import {
  computeElectricFieldAtPoint,
  computeGravitationalFieldAtPoint,
  type Vector3,
} from '@/physics/field'
import type { FieldMode, FieldSource } from '@/physics/types'

interface FieldFlowProps {
  enabled: boolean
  density?: number // Number of seed points (default ~200)
  pulseSpeed?: number // Speed multiplier (default 1.0)
  pulseIntensity?: number // Brightness multiplier (default 1.0)
}

// Fixed line thickness constant
const LINE_THICKNESS = 3.0

// Constants for field line tracing - tuned for global-scale coverage
const SEED_SPHERE_RADIUS = 6.0 // Radius of sphere shell for seed points
const DEFAULT_DENSITY = 200 // Default number of seed points (~200 lines)

const MAX_STEPS_PER_DIRECTION = 600 // Steps in each direction (forward/backward)
const STEP_SIZE = 0.05 // Step size for integration (scene units)
const MIN_FIELD_MAGNITUDE = 1e-15 // Very low threshold - let lines continue far
const MIN_DISTANCE_FROM_SOURCE = 0.15 // Stop when too close to any source
const TRACE_BOUNDS = 20.0 // Large bounding box - lines can extend far

// Animation constants
const BASE_PULSE_SPEED = 0.5 // Base speed of pulse along line
const BASE_BRIGHTNESS = 0.3 // Base brightness of line
const PULSE_EXTRA_BRIGHTNESS = 1.0 // How much brighter the pulse is (increased for visibility)
const PULSE_WIDTH = 0.12 // Width of pulse region (slightly wider for visibility)

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
 * Normalize a 3D vector
 */
function normalize(v: Vector3): Vector3 {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (mag < 1e-10) return { x: 0, y: 0, z: 0 }
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag }
}

/**
 * Generate seed points on a sphere shell for global field line coverage
 * Uses uniform distribution on sphere surface
 */
function generateSphereShellSeeds(
  sources: FieldSource[],
  numSeeds: number
): [number, number, number][] {
  const seeds: [number, number, number][] = []
  
  // Use Fibonacci sphere algorithm for uniform distribution on sphere
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians
  
  for (let i = 0; i < numSeeds; i++) {
    const y = 1 - (i / (numSeeds - 1)) * 2 // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y) // radius at y
    const theta = goldenAngle * i // Golden angle increment
    
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    
    // Scale to desired radius and create seed point
    const seed: [number, number, number] = [
      x * SEED_SPHERE_RADIUS,
      y * SEED_SPHERE_RADIUS,
      z * SEED_SPHERE_RADIUS,
    ]
    
    // Skip if too close to any source
    let tooClose = false
    for (const source of sources) {
      const dist = distance(seed, source.position)
      if (dist < MIN_DISTANCE_FROM_SOURCE) {
        tooClose = true
        break
      }
    }
    
    if (!tooClose) {
      seeds.push(seed)
    }
  }
  
  return seeds
}

/**
 * Check if position is outside bounds
 */
function isOutsideBounds(pos: [number, number, number]): boolean {
  return (
    Math.abs(pos[0]) > TRACE_BOUNDS ||
    Math.abs(pos[1]) > TRACE_BOUNDS ||
    Math.abs(pos[2]) > TRACE_BOUNDS
  )
}

/**
 * Check if position is too close to any source
 */
function isTooCloseToSource(pos: [number, number, number], sources: FieldSource[]): boolean {
  for (const source of sources) {
    const dist = distance(pos, source.position)
    if (dist < MIN_DISTANCE_FROM_SOURCE) {
      return true
    }
  }
  return false
}

/**
 * Trace field line in one direction (forward or backward) from a starting point
 */
function traceInDirection(
  startPos: [number, number, number],
  sources: FieldSource[],
  mode: FieldMode,
  direction: 1 | -1 // +1 for forward, -1 for backward
): [number, number, number][] {
  const points: [number, number, number][] = []
  let pos: [number, number, number] = [...startPos]
  
  for (let i = 0; i < MAX_STEPS_PER_DIRECTION; i++) {
    // Check bounds
    if (isOutsideBounds(pos)) {
      break
    }
    
    // Check if too close to source
    if (isTooCloseToSource(pos, sources)) {
      break
    }
    
    // Compute field at current position
    let field: Vector3
    if (mode === 'electric') {
      field = computeElectricFieldAtPoint(pos, sources)
    } else {
      field = computeGravitationalFieldAtPoint(pos, sources)
    }
    
    const fieldMag = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
    
    // Stop if field is too weak
    if (fieldMag < MIN_FIELD_MAGNITUDE) {
      break
    }
    
    // Store current point (don't store the seed point itself here - it will be added separately)
    points.push([...pos])
    
    // Step along field direction (multiply by direction sign)
    const dir = normalize(field)
    if (dir.x === 0 && dir.y === 0 && dir.z === 0) {
      break
    }
    
    pos = [
      pos[0] + dir.x * STEP_SIZE * direction,
      pos[1] + dir.y * STEP_SIZE * direction,
      pos[2] + dir.z * STEP_SIZE * direction,
    ]
  }
  
  return points
}

/**
 * Trace a complete field line by integrating in both directions from a seed
 * Returns array of 3D points representing the full curve
 */
function traceFieldLine(
  seed: [number, number, number],
  sources: FieldSource[],
  mode: FieldMode
): [number, number, number][] {
  // Skip if seed is too close to any source
  if (isTooCloseToSource(seed, sources)) {
    return []
  }
  
  // Trace forward (along field direction)
  const pointsForward = traceInDirection(seed, sources, mode, 1)
  
  // Trace backward (opposite to field direction)
  const pointsBackward = traceInDirection(seed, sources, mode, -1)
  
  // Combine into single continuous line: backward (reversed) + seed + forward
  const fullLine: [number, number, number][] = [
    ...pointsBackward.reverse(),
    seed, // Include seed point in the middle
    ...pointsForward,
  ]
  
  return fullLine
}

/**
 * Individual field line component with animated pulse within the line
 */
interface FieldLineProps {
  points: [number, number, number][]
  color: THREE.Color
  phaseOffset: number
  pulseSpeed: number
  pulseIntensity: number
}

function FieldLine({ points, color, phaseOffset, pulseSpeed, pulseIntensity }: FieldLineProps) {
  // Create geometry with positions and colors
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)
    
    // Initialize positions and colors
    for (let i = 0; i < points.length; i++) {
      const idx = i * 3
      positions[idx] = points[i][0]
      positions[idx + 1] = points[i][1]
      positions[idx + 2] = points[i][2]
      
      // Initial colors at base brightness
      colors[idx] = color.r * BASE_BRIGHTNESS
      colors[idx + 1] = color.g * BASE_BRIGHTNESS
      colors[idx + 2] = color.b * BASE_BRIGHTNESS
    }
    
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geom
  }, [points, color])
  
  // Animate pulse along the full-length line
  useFrame(({ clock }) => {
    const colors = geometry.attributes.color as THREE.BufferAttribute
    if (!colors) return
    
    const t = clock.getElapsedTime()
    const phase = ((t * BASE_PULSE_SPEED * pulseSpeed + phaseOffset) % 1.0)
    const numPoints = points.length
    
    // Update colors for each vertex along the full line
    for (let i = 0; i < numPoints; i++) {
      const u = i / Math.max(1, numPoints - 1) // Normalized position along entire line (0 to 1)
      
      // Compute distance from pulse position
      let dist = Math.abs(u - phase)
      // Handle wrapping (since phase loops)
      dist = Math.min(dist, 1 - dist)
      
      // Compute pulse brightness using smooth falloff
      let pulseBrightness = 0
      if (dist < PULSE_WIDTH) {
        const x = dist / PULSE_WIDTH // 0..1 inside the pulse region
        // Pulse strongest at center (x=0), fades to 0 at edge (x=1)
        // Use squared falloff for smooth curve
        pulseBrightness = 1 - x * x
      }
      
      // Combine base brightness + pulse brightness
      const base = BASE_BRIGHTNESS
      const extra = PULSE_EXTRA_BRIGHTNESS * pulseIntensity
      const brightness = base + extra * pulseBrightness
      
      // Apply brightness to the line's base color
      const idx = i * 3
      colors.array[idx] = color.r * brightness
      colors.array[idx + 1] = color.g * brightness
      colors.array[idx + 2] = color.b * brightness
    }
    
    colors.needsUpdate = true
  })
  
  if (points.length < 2) return null
  
  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      linewidth: LINE_THICKNESS,
    })
  }, [])
  
  const line = useMemo(() => {
    return new THREE.Line(geometry, material)
  }, [geometry, material])
  
  return (
    <primitive object={line} />
  )
}

/**
 * Main FieldFlow component
 */
export default function FieldFlow({
  enabled,
  density = DEFAULT_DENSITY,
  pulseSpeed = 1.0,
  pulseIntensity = 1.0,
}: FieldFlowProps) {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)
  
  // Compute field lines when sources or mode change
  const fieldLines = useMemo(() => {
    if (!enabled || sources.length === 0) {
      return []
    }
    
    const lines: Array<{ points: [number, number, number][]; phaseOffset: number }> = []
    
    // Generate sphere shell seed points for global coverage
    const seeds = generateSphereShellSeeds(sources, density)
    
    // Trace a full field line (both directions) from each seed
    for (const seed of seeds) {
      const points = traceFieldLine(seed, sources, mode)
      
      // Only keep lines with enough points (at least 20 for smooth curves)
      if (points.length >= 20) {
        // Random phase offset so pulses don't all sync
        const phaseOffset = Math.random()
        lines.push({ points, phaseOffset })
      }
    }
    
    return lines
  }, [enabled, sources, mode, density])
  
  // Choose colors based on mode - bright and vibrant
  const baseColor = mode === 'electric' 
    ? new THREE.Color(0x00ffff) // Bright cyan for electric
    : new THREE.Color(0xffd700) // Gold for gravity
  
  if (!enabled || fieldLines.length === 0) {
    return null
  }
  
  return (
    <>
      {/* Render all field lines with animated pulses */}
      {fieldLines.map((line, idx) => (
        <FieldLine
          key={`line-${idx}`}
          points={line.points}
          color={baseColor}
          phaseOffset={line.phaseOffset}
          pulseSpeed={pulseSpeed}
          pulseIntensity={pulseIntensity}
        />
      ))}
    </>
  )
}
