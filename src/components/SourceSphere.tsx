// Individual source sphere (charge/mass) with conditional coloring
import { useRef, useEffect } from 'react'
import { Mesh } from 'three'
import { TransformControls, Html } from '@react-three/drei'
import type { FieldMode, FieldSource } from '@/physics/types'

interface SourceSphereProps {
  source: FieldSource
  mode: FieldMode
  onPositionChange: (position: [number, number, number]) => void
  selected?: boolean
  onSelect?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  showSymbols?: boolean
}

export default function SourceSphere({
  source,
  mode,
  onPositionChange,
  selected = false,
  onSelect,
  onDragStart,
  onDragEnd,
  showSymbols = false,
}: SourceSphereProps) {
  const meshRef = useRef<Mesh>(null)
  const controlsRef = useRef<any>(null)

  // Get color based on mode and value
  const getColor = (): string => {
    if (mode === 'electric') {
      // Electric mode: positive = warm (red/orange), negative = cool (blue)
      return source.value >= 0 ? '#ff6b6b' : '#4dabf7'
    } else {
      // Gravity mode: all masses same color (green/yellow)
      return '#ffd43b'
    }
  }

  // Update mesh position when source position changes (from external updates)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...source.position)
    }
  }, [source.position])

  // Get symbol to display based on mode and value
  const getSymbol = (): string | null => {
    if (mode === 'electric') {
      return source.value >= 0 ? '+' : '−' // Use minus sign (U+2212) for better visibility
    } else {
      // Gravity mode: no symbol needed
      return null
    }
  }

  const symbol = getSymbol()

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
        position={source.position}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.3} />
      </mesh>
      {/* Symbol text in the center of the sphere */}
      {symbol && showSymbols && (
        <Html
          position={[
            source.position[0],
            source.position[1],
            source.position[2],
          ]}
          center
          distanceFactor={6}
          occlude={false}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transform: 'translate3d(-50%, -50%, 0)',
          }}
          zIndexRange={[1000, 0]}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: mode === 'electric' 
                ? (source.value >= 0 ? '#ffeeee' : '#eeeeff')
                : '#fffef0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1',
              display: 'inline-block',
              width: 'auto',
              height: 'auto',
              opacity: 0.9,
            }}
          >
            {symbol}
          </div>
        </Html>
      )}
    </>
  )
}

