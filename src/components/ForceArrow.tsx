// Force arrow visualization on test charge
import { useMemo } from 'react'
import { Vector3 as ThreeVector3, Euler, Quaternion } from 'three'
import { computeForceOnTestCharge } from '@/physics/field'
import type { TestCharge, FieldMode, FieldSource } from '@/physics/types'

interface ForceArrowProps {
  testCharge: TestCharge
  mode: FieldMode
  sources: FieldSource[]
  enabled?: boolean
}

// Force arrow configuration - normalized length range
const MIN_FORCE_LENGTH = 0.2 // Minimum visible force arrow length (scene units)
const MAX_FORCE_LENGTH = 1.5 // Maximum force arrow length (scene units)
const FORCE_COLOR = '#fffb00' // Bright yellow

export default function ForceArrow({
  testCharge,
  mode,
  sources,
  enabled = true,
}: ForceArrowProps) {
  // Compute force on test charge
  const force = useMemo(() => {
    if (!enabled || sources.length === 0) {
      return null
    }

    return computeForceOnTestCharge(testCharge.position, testCharge.value, mode, sources)
  }, [testCharge.position, testCharge.value, mode, sources, enabled])

  if (!enabled || !force || sources.length === 0) {
    return null
  }

  const magnitude = Math.sqrt(force.x ** 2 + force.y ** 2 + force.z ** 2)

  // Skip if force is too small
  if (magnitude < 1e-12) {
    return null
  }

  // Normalize force magnitude to a reasonable range using logarithmic scaling
  // This ensures forces across many orders of magnitude are visible
  // Reference range: 1e-15 N (very small) to 1e-6 N (large for textbook problems)
  const logForce = Math.log10(Math.max(magnitude, 1e-15))
  const logMin = Math.log10(1e-15) // Minimum force to visualize
  const logMax = Math.log10(1e-6)  // Maximum force for typical textbook problems
  
  // Normalize to 0-1 range based on logarithmic scale
  const normalizedStrength = Math.max(0, Math.min(1, (logForce - logMin) / (logMax - logMin)))
  
  // Map to arrow length range
  const length = MIN_FORCE_LENGTH + normalizedStrength * (MAX_FORCE_LENGTH - MIN_FORCE_LENGTH)
  const headLength = 0.25 * length
  const headWidth = 0.15 * length
  const shaftLength = length - headLength

  // Normalize force vector to get direction
  const direction = new ThreeVector3(force.x, force.y, force.z).normalize()

  // Calculate rotation to point in force direction
  const up = new ThreeVector3(0, 1, 0)
  const quaternion = new Quaternion().setFromUnitVectors(up, direction)
  const euler = new Euler().setFromQuaternion(quaternion)

  // Position for arrow shaft (starting at test charge position)
  const shaftPosition: [number, number, number] = [
    testCharge.position[0] + direction.x * (shaftLength / 2),
    testCharge.position[1] + direction.y * (shaftLength / 2),
    testCharge.position[2] + direction.z * (shaftLength / 2),
  ]

  // Position for arrow head (at end of shaft)
  const headPosition: [number, number, number] = [
    testCharge.position[0] + direction.x * shaftLength,
    testCharge.position[1] + direction.y * shaftLength,
    testCharge.position[2] + direction.z * shaftLength,
  ]

  return (
    <group>
      {/* Force arrow shaft (cylinder) */}
      <mesh position={shaftPosition} rotation={[euler.x, euler.y, euler.z]}>
        <cylinderGeometry args={[0.03, 0.03, shaftLength, 8]} />
        <meshStandardMaterial
          color={FORCE_COLOR}
          emissive={FORCE_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Force arrow head (cone) */}
      <mesh position={headPosition} rotation={[euler.x, euler.y, euler.z]}>
        <coneGeometry args={[headWidth, headLength, 32]} />
        <meshStandardMaterial
          color={FORCE_COLOR}
          emissive={FORCE_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

