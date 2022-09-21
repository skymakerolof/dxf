/**
 * Rotate a points by the given angle.
 *
 * @param points the points
 * @param angle the rotation angle
 */
export default (p, angle) => {
  return {
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
    y: p.y * Math.cos(angle) + p.x * Math.sin(angle),
  }
}
