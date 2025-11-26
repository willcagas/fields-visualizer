// Test charge/mass sphere
import { useRef, useState, useEffect } from 'react'
import { Mesh } from 'three'
import { TransformControls } from '@react-three/drei'
import type { TestCharge } from '@/physics/types'

interface TestChargeSphereProps {
  testCharge: TestCharge
  onPositionChange: (position: [number, number, number]) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

export default function TestChargeSphere({
  testCharge,
  onPositionChange,
  onDragStart,
  onDragEnd,
}: TestChargeSphereProps) {
  const meshRef = useRef<Mesh>(null)
  const controlsRef = useRef<any>(null)
  const [selected, setSelected] = useState(false)

  // Test charge gets a distinct color (purple/magenta)
  const color = '#b197fc'

  // Update mesh position when testCharge position changes (from external updates)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...testCharge.position)
    }
  }, [testCharge.position])

  return (
    <>
      {selected && meshRef.current && (
        <TransformControls
          ref={controlsRef}
          object={meshRef.current}
          mode="translate"
          showX={true}
          showY={true}
          showZ={true}
          onMouseDown={() => {
            onDragStart?.()
          }}
          onMouseUp={() => {
            onDragEnd?.()
            // Update position when drag ends
            if (meshRef.current) {
              const position = meshRef.current.position
              onPositionChange([position.x, position.y, position.z])
            }
          }}
          onObjectChange={() => {
            // Update position in real-time while dragging
            if (meshRef.current) {
              const position = meshRef.current.position
              onPositionChange([position.x, position.y, position.z])
            }
          }}
        />
      )}
      <mesh
        ref={meshRef}
        position={testCharge.position}
        onClick={(e) => {
          e.stopPropagation()
          setSelected(!selected)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  )
}

