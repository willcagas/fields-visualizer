// Global state store for field visualization using Zustand
import { create } from 'zustand'
import type { FieldMode, FieldSource, TestCharge } from '@/physics/types'
import type { PresetConfig } from '@/utils/presets'

interface FieldStore {
  // State
  mode: FieldMode
  sources: FieldSource[]
  testCharge: TestCharge | null

  // Actions
  setMode: (mode: FieldMode) => void
  addSource: (position: [number, number, number], value: number) => void
  updateSource: (id: string, updates: Partial<Pick<FieldSource, 'position' | 'value'>>) => void
  removeSource: (id: string) => void
  setTestCharge: (position: [number, number, number], value: number) => void
  updateTestCharge: (updates: Partial<TestCharge>) => void
  removeTestCharge: () => void
  loadPreset: (preset: PresetConfig) => void
}

// Generate unique IDs for sources
function generateId(): string {
  return `source-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export const useFieldStore = create<FieldStore>((set) => ({
  // Initial state
  mode: 'electric',
  sources: [],
  testCharge: null,

  // Actions
  setMode: (mode) => set({ mode }),

  addSource: (position, value) =>
    set((state) => ({
      sources: [
        ...state.sources,
        {
          id: generateId(),
          position,
          value,
          kind: 'source' as const,
        },
      ],
    })),

  updateSource: (id, updates) =>
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, ...updates } : source
      ),
    })),

  removeSource: (id) =>
    set((state) => ({
      sources: state.sources.filter((source) => source.id !== id),
    })),

  setTestCharge: (position, value) =>
    set({
      testCharge: { position, value },
    }),

  updateTestCharge: (updates) =>
    set((state) => ({
      testCharge: state.testCharge ? { ...state.testCharge, ...updates } : null,
    })),

  removeTestCharge: () => set({ testCharge: null }),

  loadPreset: (preset) => {
    // Generate IDs for sources
    const sourcesWithIds: FieldSource[] = preset.sources.map((source) => ({
      ...source,
      id: generateId(),
    }))

    // Update mode if preset specifies one
    const updates: Partial<FieldStore> = {
      sources: sourcesWithIds,
      testCharge: preset.testCharge,
    }

    if (preset.mode) {
      updates.mode = preset.mode
    }

    set(updates as FieldStore)
  },
}))

