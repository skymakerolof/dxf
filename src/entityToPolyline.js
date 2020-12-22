import bSpline from './util/bSpline'
import logger from './util/logger'
import createArcForLWPolyine from './util/createArcForLWPolyline'

/**
 * Rotate a set of points.
 *
 * @param points the points
 * @param angle the rotation angle
 */
const rotate = (points, angle) => {
  return points.map(function (p) {
    return [
      p[0] * Math.cos(angle) - p[1] * Math.sin(angle),
      p[1] * Math.cos(angle) + p[0] * Math.sin(angle)
    ]
  })
}

/**
 * Interpolate an ellipse
 * @param cx center X
 * @param cy center Y
 * @param rx radius X
 * @param ry radius Y
 * @param start start angle in radians
 * @param start end angle in radians
 */
const interpolateEllipse = (cx, cy, rx, ry, start, end, rotationAngle) => {
  if (end < start) {
    end += Math.PI * 2
  }

  // ----- Relative points -----

  // Start point
  let points = []
  const dTheta = Math.PI * 2 / 72
  const EPS = 1e-6
  for (let theta = start; theta < end - EPS; theta += dTheta) {
    points.push([
      Math.cos(theta) * rx,
      Math.sin(theta) * ry
    ])
  }
  points.push([
    Math.cos(end) * rx,
    Math.sin(end) * ry
  ])

  // ----- Rotate -----
  if (rotationAngle) {
    points = rotate(points, rotationAngle)
  }

  // ----- Offset center -----
  points = points.map(function (p) {
    return [cx + p[0], cy + p[1]]
  })

  return points
}

/**
 * Interpolate a b-spline. The algorithm examins the knot vector
 * to create segments for interpolation. The parameterisation value
 * is re-normalised back to [0,1] as that is what the lib expects (
 * and t i de-normalised in the b-spline library)
 *
 * @param controlPoints the control points
 * @param degree the b-spline degree
 * @param knots the knot vector
 * @returns the polyline
 */
export const interpolateBSpline = (controlPoints, degree, knots, interpolationsPerSplineSegment, weights) => {
  const polyline = []
  const controlPointsForLib = controlPoints.map(function (p) {
    return [p.x, p.y]
  })

  const segmentTs = [knots[degree]]
  const domain = [knots[degree], knots[knots.length - 1 - degree]]

  for (let k = degree + 1; k < knots.length - degree; ++k) {
    if (segmentTs[segmentTs.length - 1] !== knots[k]) {
      segmentTs.push(knots[k])
    }
  }

  interpolationsPerSplineSegment = interpolationsPerSplineSegment || 25
  for (let i = 1; i < segmentTs.length; ++i) {
    const uMin = segmentTs[i - 1]
    const uMax = segmentTs[i]
    for (let k = 0; k <= interpolationsPerSplineSegment; ++k) {
      const u = k / interpolationsPerSplineSegment * (uMax - uMin) + uMin
      // Clamp t to 0, 1 to handle numerical precision issues
      let t = (u - domain[0]) / (domain[1] - domain[0])
      t = Math.max(t, 0)
      t = Math.min(t, 1)
      const p = bSpline(t, degree, controlPointsForLib, knots, weights)
      polyline.push(p)
    }
  }
  return polyline
}

/**
 * Convert a parsed DXF entity to a polyline. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */
export default (entity, options) => {
  options = options || {}
  let polyline

  if (entity.type === 'LINE') {
    polyline = [
      [
        entity.start.x,
        entity.start.y
      ],
      [
        entity.end.x,
        entity.end.y
      ]
    ]
  }

  if ((entity.type === 'LWPOLYLINE') || (entity.type === 'POLYLINE')) {
    polyline = []
    if (entity.polygonMesh || entity.polyfaceMesh) {
      // Do not attempt to render meshes
    } else if (entity.vertices.length) {
      if (entity.closed) {
        entity.vertices = entity.vertices.concat(entity.vertices[0])
      }
      for (let i = 0, il = entity.vertices.length; i < il - 1; ++i) {
        const from = [entity.vertices[i].x, entity.vertices[i].y]
        const to = [entity.vertices[i + 1].x, entity.vertices[i + 1].y]
        polyline.push(from)
        if (entity.vertices[i].bulge) {
          polyline = polyline.concat(
            createArcForLWPolyine(from, to, entity.vertices[i].bulge))
        }
        // The last iteration of the for loop
        if (i === il - 2) {
          polyline.push(to)
        }
      }
    } else {
      logger.warn('Polyline entity with no vertices')
    }
  }

  if (entity.type === 'CIRCLE') {
    polyline = interpolateEllipse(
      entity.x, entity.y,
      entity.r, entity.r,
      0, Math.PI * 2)
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p) {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'ELLIPSE') {
    const rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY)
    const ry = entity.axisRatio * rx
    const majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX)
    polyline = interpolateEllipse(
      entity.x, entity.y,
      rx, ry,
      entity.startAngle,
      entity.endAngle,
      majorAxisRotation)
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p) {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'ARC') {
    // Why on earth DXF has degree start & end angles for arc,
    // and radian start & end angles for ellipses is a mystery
    polyline = interpolateEllipse(
      entity.x, entity.y,
      entity.r, entity.r,
      entity.startAngle,
      entity.endAngle,
      undefined,
      false)

    // I kid you not, ARCs and ELLIPSEs handle this differently,
    // as evidenced by how AutoCAD actually renders these entities
    if (entity.extrusionZ === -1) {
      polyline = polyline.map(function (p) {
        return [-p[0], p[1]]
      })
    }
  }

  if (entity.type === 'SPLINE') {
    polyline = interpolateBSpline(
      entity.controlPoints,
      entity.degree,
      entity.knots,
      options.interpolationsPerSplineSegment,
      entity.weights)
  }

  if (!polyline) {
    logger.warn('unsupported entity for converting to polyline:', entity.type)
    return []
  }
  return polyline
}
