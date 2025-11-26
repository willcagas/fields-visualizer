// Preset configurations for classroom scenarios
import type { FieldSource, TestCharge, FieldMode } from '@/physics/types'
import { metersToScene } from '@/physics/units'

export interface PresetConfig {
  mode?: FieldMode // Optional mode override
  sources: Omit<FieldSource, 'id'>[] // Sources without IDs (will be generated)
  testCharge: TestCharge | null
}

/**
 * Preset: Single source at origin
 */
export const PRESET_SINGLE_SOURCE: PresetConfig = {
  sources: [
    {
      position: [0, 0, 0],
      value: 2.0,
      kind: 'source',
    },
  ],
  testCharge: {
    position: [2, 0, 0],
    value: 1.0,
  },
}

/**
 * Preset: Dipole - positive and negative charges (electric only)
 */
export const PRESET_DIPOLE: PresetConfig = {
  mode: 'electric',
  sources: [
    {
      position: [-1, 0, 0],
      value: 2.0, // Positive charge
      kind: 'source',
    },
    {
      position: [1, 0, 0],
      value: -2.0, // Negative charge
      kind: 'source',
    },
  ],
  testCharge: {
    position: [0, 1, 0],
    value: 1.0,
  },
}

/**
 * Preset: Two equal like charges
 */
export const PRESET_TWO_LIKE_CHARGES: PresetConfig = {
  sources: [
    {
      position: [-2, 0, 0],
      value: 2.0,
      kind: 'source',
    },
    {
      position: [2, 0, 0],
      value: 2.0,
      kind: 'source',
    },
  ],
  testCharge: {
    position: [0, 0, 0],
    value: 1.0,
  },
}

/**
 * Preset: Planet + test mass (gravity mode)
 */
export const PRESET_PLANET_TEST_MASS: PresetConfig = {
  mode: 'gravity',
  sources: [
    {
      position: [0, 0, 0],
      value: 10.0, // Large mass (planet)
      kind: 'source',
    },
  ],
  testCharge: {
    position: [3, 0, 0],
    value: 1.0, // Test mass
  },
}

/**
 * Preset: Sample Problem 1 - Two Point Charges in 1D (Textbook)
 * 
 * Problem statement:
 * - Two point charges are 45 cm apart
 * - q1 = +3.3 × 10⁻⁹ C at x = -0.27 m (27 cm left of point P)
 * - q2 = -1.0 × 10⁻⁸ C at x = +0.18 m (18 cm right of point P)
 * - Test charge q = +2.0 × 10⁻¹² C at point P (origin)
 * 
 * Positions in meters (along x-axis):
 * - Point P: [0.0, 0.0, 0.0] m
 * - q1: [-0.27, 0.0, 0.0] m
 * - q2: [0.18, 0.0, 0.0] m
 */
export const PRESET_SAMPLE_PROBLEM_1: PresetConfig = {
  mode: 'electric',
  sources: [
    {
      position: metersToScene([-0.27, 0.0, 0.0]), // q1: 27 cm left of P
      value: 3.3e-9, // +3.3 × 10⁻⁹ C (positive charge)
      kind: 'source',
    },
    {
      position: metersToScene([0.18, 0.0, 0.0]), // q2: 18 cm right of P
      value: -1.0e-8, // -1.0 × 10⁻⁸ C (negative charge)
      kind: 'source',
    },
  ],
  testCharge: {
    position: metersToScene([0.0, 0.0, 0.0]), // Point P at origin
    value: 2.0e-12, // +2.0 × 10⁻¹² C (test charge)
  },
}

