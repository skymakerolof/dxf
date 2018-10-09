import bSpline from 'b-spline'

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
 * Convert a parsed DXF entity to native shapes.
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
    const flipY = entity.extrusionZ === -1
    if (flipY) {
      polyline = polyline.map(function (p) {
        return [
          -(p[0] - entity.x) + entity.x,
          p[1]
        ]
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
    const flipY = entity.extrusionZ === -1
    if (flipY) {
      polyline = polyline.map(function (p) {
        return [
          -p[0],
          p[1]
        ]
      })
    }
  }

  if (entity.type === 'SPLINE') {
    polyline = interpolateBSpline(
      entity.controlPoints,
      entity.degree,
      entity.knots,
      options.interpolationsPerSplineSegment)
  }

  if (!polyline) {
    logger.warn('unsupported entity for converting to polyline:', entity.type)
    return []
  }
  return applyTransforms(polyline, entity.transforms)
}
