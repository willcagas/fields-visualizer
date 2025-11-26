// Core types for field visualization

export type FieldMode = "electric" | "gravity";

/**
 * Represents a field source (charge in electric mode, mass in gravity mode)
 */
export interface FieldSource {
  id: string;
  position: [number, number, number];
  value: number; // Charge Q (electric) or mass m (gravity) in abstract units
  kind: "source";
}

/**
 * Represents a test charge (electric mode) or test mass (gravity mode)
 */
export interface TestCharge {
  position: [number, number, number];
  value: number; // Test charge q (electric) or test mass m (gravity)
}

/**
 * Complete state of the field visualization
 */
export interface FieldState {
  mode: FieldMode;
  sources: FieldSource[];
  testCharge: TestCharge | null;
}

