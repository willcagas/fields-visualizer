// Field vector visualization - arrows showing field direction and magnitude
import { useMemo } from 'react'
import { Vector3 as ThreeVector3, Euler, Quaternion } from 'three'
import { useFieldStore } from '@/state/store'
import {
  computeElectricFieldAtPoint,
  computeGravitationalFieldAtPoint,
  type Vector3,
} from '@/physics/field'
import type { FieldMode, FieldSource } from '@/physics/types'

interface FieldVectorsProps {
  enabled?: boolean
  fieldDisplayScale?: number
  gridSize?: number // Half-width of the grid in each axis
}

// 3D Grid configuration
const GRID_STEP = { x: 2, y: 2, z: 2 } // Spacing between sample points
const MAX_ARROWS = 500 // Maximum number of arrows to prevent performance issues

// Arrow configuration - uniform size for clarity (industry standard approach)
const BASE_ARROW_LENGTH = 0.6 // Uniform base arrow length (scene units)
const SUBTLE_LENGTH_SCALING = 1.3 // Maximum scaling factor for subtle length variation (1.0 = uniform, >1.0 = subtle scaling)
const MIN_FIELD_THRESHOLD = 1e-10 // Skip extremely weak fields (very small threshold to show most fields)
const MIN_DISTANCE_FROM_SOURCE = 0.8 // Minimum distance from source to show arrow (scene units)

/**
 * Generate 3D grid points throughout a volume of space
 * Returns array of [x, y, z] positions
 */
function generateGridPoints(gridSize: number): [number, number, number][] {
  const points: [number, number, number][] = []

  // Triple nested loop over x, y, z
  for (let x = -gridSize; x <= gridSize; x += GRID_STEP.x) {
    for (let y = -gridSize; y <= gridSize; y += GRID_STEP.y) {
      for (let z = -gridSize; z <= gridSize; z += GRID_STEP.z) {
        points.push([x, y, z])
      }
    }
  }

  // If we exceed MAX_ARROWS, thin out the grid by skipping points
  if (points.length > MAX_ARROWS) {
    const skipFactor = Math.ceil(points.length / MAX_ARROWS)
    return points.filter((_, index) => index % skipFactor === 0)
  }

  return points
}

/**
 * Get distinct colors for multiple sources
 * Bright, vibrant colors to clearly distinguish sources
 * Matches source sphere colors for consistency
 */
function getDistinctSourceColor(sourceIndex: number, mode: FieldMode, source: FieldSource): string {
  if (mode === 'electric') {
    // Electric: use sign-based color (bright and vibrant)
    return source.value >= 0 ? '#ff3333' : '#3399ff' // Brighter red and blue
  } else {
    // Gravity: assign different bright shades for different masses
    const gravityColors = [
      '#ffdd00', // Bright yellow
      '#00ff88', // Bright green
      '#00aaff', // Bright blue
      '#ff6600', // Bright orange
      '#cc00ff', // Bright purple
    ]
    return gravityColors[sourceIndex % gravityColors.length]
  }
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
 * Find which source contributes most to the field at a given point
 * Returns the source index and its contribution magnitude
 */
function findDominantSource(
  point: [number, number, number],
  sources: FieldSource[],
  mode: FieldMode
): { sourceIndex: number; contribution: number } | null {
  if (sources.length === 0) return null

  let maxContribution = 0
  let dominantIndex = 0

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    const r = Math.max(distance(point, source.position), 0.1) // Avoid singularity
    const rSquared = r * r

    // Calculate individual field contribution magnitude
    let contribution: number
    if (mode === 'electric') {
      contribution = Math.abs(source.value) / rSquared
    } else {
      contribution = Math.abs(source.value) / rSquared
    }

    if (contribution > maxContribution) {
      maxContribution = contribution
      dominantIndex = i
    }
  }

  return { sourceIndex: dominantIndex, contribution: maxContribution }
}

/**
 * Calculate arrow color based on dominant source and field magnitude
 * Uses magnitude-based colormap for better readability (industry standard)
 * 
 * Hybrid approach:
 * - Source identity indicated by hue (dominant source color)
 * - Magnitude indicated by brightness/intensity (bright = strong, dim = weak)
 */
function getArrowColor(
  point: [number, number, number],
  fieldMagnitude: number,
  maxMagnitude: number,
  minMagnitude: number,
  sources: FieldSource[],
  mode: FieldMode
): string {
  if (sources.length === 0) return '#999'

  // Find which source dominates at this point
  const dominant = findDominantSource(point, sources, mode)
  if (!dominant) return '#999'

  // Get the base color from the dominant source (hue indicates source)
  const baseColor = getDistinctSourceColor(dominant.sourceIndex, mode, sources[dominant.sourceIndex])

  // Extract RGB from hex color
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  if (maxMagnitude === 0 || maxMagnitude <= minMagnitude) return baseColor

  // Use logarithmic normalization for color intensity to handle high dynamic range
  // This prevents all arrows from looking the same color when there's a wide range
  const effectiveMin = Math.max(minMagnitude, maxMagnitude * 1e-6)
  const logMin = Math.log10(effectiveMin)
  const logMax = Math.log10(maxMagnitude)
  const logMag = Math.log10(fieldMagnitude)
  
  // Map magnitude to brightness with improved visibility for distant arrows
  // Minimum brightness increased to 0.45 to ensure distant arrows remain visible
  // Strong fields still reach full brightness (1.0)
  let brightness: number
  if (logMax > logMin) {
    const normalizedLog = (logMag - logMin) / (logMax - logMin)
    // Use a gentler curve: weak fields start at 0.45 brightness, strong fields at 1.0
    // This ensures even very distant arrows remain clearly visible
    brightness = 0.45 + normalizedLog * 0.55
  } else {
    brightness = fieldMagnitude >= maxMagnitude ? 1.0 : 0.6
  }

  // Clamp brightness to reasonable bounds - increased minimum to 0.45
  brightness = Math.max(0.45, Math.min(1.0, brightness))

  return `rgb(${Math.round(r * brightness)}, ${Math.round(g * brightness)}, ${Math.round(b * brightness)})`
}

interface FieldArrowProps {
  position: [number, number, number]
  field: Vector3
  color: string
  normalizedStrength: number // Strength between 0 and 1 (mag / maxMag)
  fieldDisplayScale?: number
}

function FieldArrow({ position, field, color, normalizedStrength, fieldDisplayScale = 1.0 }: FieldArrowProps) {
  const magnitude = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
  
  // Skip only extremely weak fields
  if (magnitude < MIN_FIELD_THRESHOLD) return null
  
  // Industry standard: Use uniform arrow length for clarity, with optional subtle scaling
  // Length variation is minimal (1.0x to 1.3x) to avoid perspective/clutter issues
  // Color is the primary indicator of magnitude
  const lengthMultiplier = SUBTLE_LENGTH_SCALING > 1.0
    ? 1.0 + normalizedStrength * (SUBTLE_LENGTH_SCALING - 1.0)
    : 1.0
  
  const arrowLength = BASE_ARROW_LENGTH * lengthMultiplier * fieldDisplayScale
  
  // Make arrow heads more prominent and visible
  const headLength = 0.25 * arrowLength // Increased proportion for better visibility
  const headWidth = 0.15 * arrowLength  // Increased proportion for better visibility
  const shaftLength = arrowLength - headLength
  
  // Create direction vector (normalized)
  const direction = new ThreeVector3(field.x, field.y, field.z).normalize()
  
  // Calculate rotation to point in field direction
  // Cylinder and cone default to pointing up (0, 1, 0)
  // Use quaternion to rotate from up vector to direction vector
  const up = new ThreeVector3(0, 1, 0)
  const quaternion = new Quaternion().setFromUnitVectors(up, direction)
  const euler = new Euler().setFromQuaternion(quaternion)
  
  // Position for arrow shaft (centered at position, extending in direction)
  const shaftPosition: [number, number, number] = [
    position[0] + direction.x * (shaftLength / 2),
    position[1] + direction.y * (shaftLength / 2),
    position[2] + direction.z * (shaftLength / 2),
  ]
  
  // Position for arrow head (at end of shaft)
  const headPosition: [number, number, number] = [
    position[0] + direction.x * shaftLength,
    position[1] + direction.y * shaftLength,
    position[2] + direction.z * shaftLength,
  ]
  
  return (
    <group>
      {/* Arrow shaft (cylinder) */}
      <mesh
        position={shaftPosition}
        rotation={[euler.x, euler.y, euler.z]}
      >
        <cylinderGeometry args={[0.02, 0.02, shaftLength, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Arrow head (cone) */}
      <mesh
        position={headPosition}
        rotation={[euler.x, euler.y, euler.z]}
      >
        <coneGeometry args={[headWidth, headLength, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

export default function FieldVectors({ enabled = true, fieldDisplayScale = 1.0, gridSize = 8.0 }: FieldVectorsProps) {
  const mode = useFieldStore((state) => state.mode)
  const sources = useFieldStore((state) => state.sources)

  // Generate grid points and compute fields with normalized magnitudes
  const fieldData = useMemo(() => {
    if (!enabled || sources.length === 0) {
      return { 
        arrowData: [], 
        maxMagnitude: 0,
        minMagnitude: 0
      }
    }

    const gridPoints = generateGridPoints(gridSize)
    
    // First pass: compute all fields and magnitudes, find maximum
    interface ArrowData {
      position: [number, number, number]
      field: Vector3
      magnitude: number
    }
    
    const arrowDataArray: ArrowData[] = []
    let maxMagnitude = 0
    let minMagnitude = Infinity

    for (const point of gridPoints) {
      // Skip points that are too close to any source
      let tooClose = false
      for (const source of sources) {
        const dist = distance(point, source.position)
        if (dist < MIN_DISTANCE_FROM_SOURCE) {
          tooClose = true
          break
        }
      }
      
      if (tooClose) continue
      
      let field: Vector3
      
      if (mode === 'electric') {
        field = computeElectricFieldAtPoint(point, sources)
      } else {
        field = computeGravitationalFieldAtPoint(point, sources)
      }
      
      const magnitude = Math.sqrt(field.x ** 2 + field.y ** 2 + field.z ** 2)
      
      // Track maximum and minimum magnitudes for normalization
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude
      }
      if (magnitude < minMagnitude && magnitude > MIN_FIELD_THRESHOLD) {
        minMagnitude = magnitude
      }
      
      arrowDataArray.push({
        position: point,
        field,
        magnitude,
      })
    }

    return { arrowData: arrowDataArray, maxMagnitude, minMagnitude: minMagnitude === Infinity ? maxMagnitude : minMagnitude }
  }, [mode, sources, enabled, gridSize])

  if (!enabled || sources.length === 0) {
    return null
  }

  return (
    <>
      {fieldData.arrowData.map((arrowData) => {
        const { position, field, magnitude } = arrowData
        
        // Calculate normalized strength (0-1) for visualization using logarithmic scaling
        // This compresses the range so very strong fields don't dominate
        // Uses log scale: log(mag) mapped to 0-1 range between min and max
        let normalizedStrength = 0
        if (fieldData.maxMagnitude > 0 && magnitude > 0) {
          // Use logarithmic scaling to compress the dynamic range
          // This prevents the closest arrows from always being at maximum
          const effectiveMin = Math.max(fieldData.minMagnitude || fieldData.maxMagnitude * 1e-6, MIN_FIELD_THRESHOLD)
          const logMin = Math.log10(effectiveMin)
          const logMax = Math.log10(fieldData.maxMagnitude)
          const logMag = Math.log10(magnitude)
          
          if (logMax > logMin) {
            normalizedStrength = Math.max(0, Math.min(1, (logMag - logMin) / (logMax - logMin)))
          } else {
            normalizedStrength = magnitude >= fieldData.maxMagnitude ? 1.0 : 0.5
          }
        }
        
        const color = getArrowColor(position, magnitude, fieldData.maxMagnitude, fieldData.minMagnitude, sources, mode)
        
        return (
          <FieldArrow
            key={`arrow-${position[0]}-${position[1]}-${position[2]}`}
            position={position}
            field={field}
            color={color}
            normalizedStrength={normalizedStrength}
            fieldDisplayScale={fieldDisplayScale}
          />
        )
      })}
    </>
  )
}

