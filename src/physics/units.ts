// Unit conversion between scene units and real-world meters
// 1 scene unit corresponds to this many meters in the physics world
export const METERS_PER_SCENE_UNIT = 0.1 // 0.1 m = 10 cm per scene unit

/**
 * Convert scene coordinates to meters
 * @param pos Position in scene units [x, y, z]
 * @returns Position in meters [x, y, z]
 */
export function sceneToMeters(pos: [number, number, number]): [number, number, number] {
  return [
    pos[0] * METERS_PER_SCENE_UNIT,
    pos[1] * METERS_PER_SCENE_UNIT,
    pos[2] * METERS_PER_SCENE_UNIT,
  ]
}

/**
 * Convert meters to scene coordinates
 * @param pos Position in meters [x, y, z]
 * @returns Position in scene units [x, y, z]
 */
export function metersToScene(pos: [number, number, number]): [number, number, number] {
  return [
    pos[0] / METERS_PER_SCENE_UNIT,
    pos[1] / METERS_PER_SCENE_UNIT,
    pos[2] / METERS_PER_SCENE_UNIT,
  ]
}

