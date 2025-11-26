// Charge aura visualization - translucent glowing sphere around sources
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, DoubleSide } from 'three'
import type { FieldMode } from '@/physics/types'

interface ChargeAuraProps {
  position: [number, number, number]
  value: number
  mode: FieldMode
}

// Aura configuration
const BASE_RADIUS = 0.5 // Base radius of the aura
const MAX_VALUE_TO_VISUALIZE = 10.0 // Clamp value for radius calculation
const SCALE_FACTOR = 0.15 // How much extra radius per unit value
const MIN_OPACITY = 0.25
const PULSE_AMPLITUDE = 0.05 // Subtle pulsing amplitude
const PULSE_SPEED = 2.0 // Pulses per second

export default function ChargeAura({ position, value, mode }: ChargeAuraProps) {
  const meshRef = useRef<Mesh>(null)

  // Get color based on mode and value
  const getAuraColor = (): string => {
    if (mode === 'electric') {
      // Electric mode: positive = warm (red/orange), negative = cool (blue)
      return value >= 0 ? '#ff4444' : '#4488ff' // Bright, vibrant colors
    } else {
      // Gravity mode: neutral color (green/yellow)
      return '#ffdd44' // Bright yellow for visibility
    }
  }

  // Calculate radius based on value magnitude
  const baseRadius = BASE_RADIUS
  const clampedValue = Math.min(Math.abs(value), MAX_VALUE_TO_VISUALIZE)
  const extraRadius = SCALE_FACTOR * clampedValue
  const targetRadius = baseRadius + extraRadius

  // Subtle pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      // Pulse opacity gently
      const pulse = Math.sin(time * PULSE_SPEED * Math.PI) * PULSE_AMPLITUDE
      const opacity = MIN_OPACITY + pulse
      
      // Update material opacity
      if (meshRef.current.material && 'opacity' in meshRef.current.material) {
        meshRef.current.material.opacity = opacity
      }
      
      // Slight scale pulse (very subtle)
      const scalePulse = 1 + Math.sin(time * PULSE_SPEED * Math.PI) * 0.05
      meshRef.current.scale.setScalar(scalePulse)
    }
  })

  const color = getAuraColor()

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[targetRadius, 32, 32]} />
      <meshPhongMaterial
        color={color}
        transparent
        opacity={MIN_OPACITY}
        emissive={color}
        emissiveIntensity={0.3}
        side={DoubleSide}
      />
    </mesh>
  )
}

