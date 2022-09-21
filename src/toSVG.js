import { Box2 } from 'vecks'

import entityToPolyline from './entityToPolyline'
import denormalise from './denormalise'
import getRGBForEntity from './getRGBForEntity'
import logger from './util/logger'
import rotate from './util/rotate'
import rgbToColorAttribute from './util/rgbToColorAttribute'
import toPiecewiseBezier, { multiplicity } from './util/toPiecewiseBezier'
import transformBoundingBoxAndElement from './util/transformBoundingBoxAndElement'

const addFlipXIfApplicable = (entity, { bbox, element }) => {
  if (entity.extrusionZ === -1) {
    return {
      bbox: new Box2()
        .expandByPoint({ x: -bbox.min.x, y: bbox.min.y })
        .expandByPoint({ x: -bbox.max.x, y: bbox.max.y }),
      element: `<g transform="matrix(-1 0 0 1 0 0)">
        ${element}
      </g>`,
    }
  } else {
    return { bbox, element }
  }
}

/**
 * Create a <path /> element. Interpolates curved entities.
 */
const polyline = (entity) => {
  const vertices = entityToPolyline(entity)
  const bbox = vertices.reduce(
    (acc, [x, y]) => acc.expandByPoint({ x, y }),
    new Box2(),
  )
  const d = vertices.reduce((acc, point, i) => {
    acc += i === 0 ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  // Empirically it appears that flipping horzontally does not apply to polyline
  return transformBoundingBoxAndElement(
    bbox,
    `<path d="${d}" />`,
    entity.transforms,
  )
}

/**
 * Create a <circle /> element for the CIRCLE entity.
 */
const circle = (entity) => {
  const bbox0 = new Box2()
    .expandByPoint({
      x: entity.x + entity.r,
      y: entity.y + entity.r,
    })
    .expandByPoint({
      x: entity.x - entity.r,
      y: entity.y - entity.r,
    })
  const element0 = `<circle cx="${entity.x}" cy="${entity.y}" r="${entity.r}" />`
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

/**
 * Create a a <path d="A..." /> or <ellipse /> element for the ARC or ELLIPSE
 * DXF entity (<ellipse /> if start and end point are the same).
 */
const ellipseOrArc = (
  cx,
  cy,
  majorX,
  majorY,
  axisRatio,
  startAngle,
  endAngle,
  flipX,
) => {
  const rx = Math.sqrt(majorX * majorX + majorY * majorY)
  const ry = axisRatio * rx
  const rotationAngle = -Math.atan2(-majorY, majorX)

  const bbox = bboxEllipseOrArc(
    cx,
    cy,
    majorX,
    majorY,
    axisRatio,
    startAngle,
    endAngle,
    flipX,
  )

  if (
    Math.abs(startAngle - endAngle) < 1e-9 ||
    Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9
  ) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    const element = `<g transform="rotate(${
      (rotationAngle / Math.PI) * 180
    } ${cx}, ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
    </g>`
    return { bbox, element }
  } else {
    const startOffset = rotate(
      {
        x: Math.cos(startAngle) * rx,
        y: Math.sin(startAngle) * ry,
      },
      rotationAngle,
    )
    const startPoint = {
      x: cx + startOffset.x,
      y: cy + startOffset.y,
    }
    const endOffset = rotate(
      {
        x: Math.cos(endAngle) * rx,
        y: Math.sin(endAngle) * ry,
      },
      rotationAngle,
    )
    const endPoint = {
      x: cx + endOffset.x,
      y: cy + endOffset.y,
    }
    const adjustedEndAngle =
      endAngle < startAngle ? endAngle + Math.PI * 2 : endAngle
    const largeArcFlag = adjustedEndAngle - startAngle < Math.PI ? 0 : 1
    const d = `M ${startPoint.x} ${startPoint.y} A ${rx} ${ry} ${
      (rotationAngle / Math.PI) * 180
    } ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
    const element = `<path d="${d}" />`
    return { bbox, element }
  }
}

/**
 * Compute the bounding box of an elliptical arc, given the DXF entity parameters
 */
const bboxEllipseOrArc = (
  cx,
  cy,
  majorX,
  majorY,
  axisRatio,
  startAngle,
  endAngle,
  flipX,
) => {
  // The bounding box will be defined by the starting point of the ellipse, and ending point,
  // and any extrema on the ellipse that are between startAngle and endAngle.
  // The extrema are found by setting either the x or y component of the ellipse's
  // tangent vector to zero and solving for the angle.

  // Ensure start and end angles are > 0 and well-ordered
  while (startAngle < 0) startAngle += Math.PI * 2
  while (endAngle <= startAngle) endAngle += Math.PI * 2

  // When rotated, the extrema of the ellipse will be found at these angles
  const angles = []

  if (Math.abs(majorX) < 1e-12 || Math.abs(majorY) < 1e-12) {
    // Special case for majorX or majorY = 0
    for (let i = 0; i < 4; i++) {
      angles.push((i / 2) * Math.PI)
    }
  } else {
    // reference https://github.com/bjnortier/dxf/issues/47#issuecomment-545915042
    angles[0] = Math.atan((-majorY * axisRatio) / majorX) - Math.PI // Ensure angles < 0
    angles[1] = Math.atan((majorX * axisRatio) / majorY) - Math.PI
    angles[2] = angles[0] - Math.PI
    angles[3] = angles[1] - Math.PI
  }

  // Remove angles not falling between start and end
  for (let i = 4; i >= 0; i--) {
    while (angles[i] < startAngle) angles[i] += Math.PI * 2
    if (angles[i] > endAngle) {
      angles.splice(i, 1)
    }
  }

  // Also to consider are the starting and ending points:
  angles.push(startAngle)
  angles.push(endAngle)

  // Compute points lying on the unit circle at these angles
  const pts = angles.map((a) => ({
    x: Math.cos(a),
    y: Math.sin(a),
  }))

  // Transformation matrix, formed by the major and minor axes
  const M = [
    [majorX, -majorY * axisRatio],
    [majorY, majorX * axisRatio],
  ]

  // Rotate, scale, and translate points
  const rotatedPts = pts.map((p) => ({
    x: p.x * M[0][0] + p.y * M[0][1] + cx,
    y: p.x * M[1][0] + p.y * M[1][1] + cy,
  }))

  // Compute extents of bounding box
  const bbox = rotatedPts.reduce((acc, p) => {
    acc.expandByPoint(p)
    return acc
  }, new Box2())

  return bbox
}

/**
 * An ELLIPSE is defined by the major axis, convert to X and Y radius with
 * a rotation angle
 */
const ellipse = (entity) => {
  const { bbox: bbox0, element: element0 } = ellipseOrArc(
    entity.x,
    entity.y,
    entity.majorX,
    entity.majorY,
    entity.axisRatio,
    entity.startAngle,
    entity.endAngle,
  )
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

/**
 * An ARC is an ellipse with equal radii
 */
const arc = (entity) => {
  const { bbox: bbox0, element: element0 } = ellipseOrArc(
    entity.x,
    entity.y,
    entity.r,
    0,
    1,
    entity.startAngle,
    entity.endAngle,
    entity.extrusionZ === -1,
  )
  const { bbox, element } = addFlipXIfApplicable(entity, {
    bbox: bbox0,
    element: element0,
  })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

export const piecewiseToPaths = (k, knots, controlPoints) => {
  const paths = []
  let controlPointIndex = 0
  let knotIndex = k
  while (knotIndex < knots.length - k + 1) {
    const m = multiplicity(knots, knotIndex)
    const cp = controlPoints.slice(controlPointIndex, controlPointIndex + k)
    if (k === 4) {
      paths.push(
        `<path d="M ${cp[0].x} ${cp[0].y} C ${cp[1].x} ${cp[1].y} ${cp[2].x} ${cp[2].y} ${cp[3].x} ${cp[3].y}" />`,
      )
    } else if (k === 3) {
      paths.push(
        `<path d="M ${cp[0].x} ${cp[0].y} Q ${cp[1].x} ${cp[1].y} ${cp[2].x} ${cp[2].y}" />`,
      )
    }
    controlPointIndex += m
    knotIndex += m
  }
  return paths
}

const bezier = (entity) => {
  let bbox = new Box2()
  entity.controlPoints.forEach((p) => {
    bbox = bbox.expandByPoint(p)
  })
  const k = entity.degree + 1
  const piecewise = toPiecewiseBezier(k, entity.controlPoints, entity.knots)
  const paths = piecewiseToPaths(k, piecewise.knots, piecewise.controlPoints)
  const element = `<g>${paths.join('')}</g>`
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

/**
 * Switcth the appropriate function on entity type. CIRCLE, ARC and ELLIPSE
 * produce native SVG elements, the rest produce interpolated polylines.
 */
const entityToBoundsAndElement = (entity) => {
  switch (entity.type) {
    case 'CIRCLE':
      return circle(entity)
    case 'ELLIPSE':
      return ellipse(entity)
    case 'ARC':
      return arc(entity)
    case 'SPLINE': {
      const hasWeights = entity.weights && entity.weights.some((w) => w !== 1)
      if ((entity.degree === 2 || entity.degree === 3) && !hasWeights) {
        try {
          return bezier(entity)
        } catch (err) {
          return polyline(entity)
        }
      } else {
        return polyline(entity)
      }
    }
    case 'LINE':
    case 'LWPOLYLINE':
    case 'POLYLINE': {
      return polyline(entity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default (parsed) => {
  const entities = denormalise(parsed)
  const { bbox, elements } = entities.reduce(
    (acc, entity, i) => {
      const rgb = getRGBForEntity(parsed.tables.layers, entity)
      const boundsAndElement = entityToBoundsAndElement(entity)
      // Ignore entities like MTEXT that don't produce SVG elements
      if (boundsAndElement) {
        const { bbox, element } = boundsAndElement
        // Ignore invalid bounding boxes
        if (bbox.valid) {
          acc.bbox.expandByPoint(bbox.min)
          acc.bbox.expandByPoint(bbox.max)
        }
        acc.elements.push(
          `<g stroke="${rgbToColorAttribute(rgb)}">${element}</g>`,
        )
      }
      return acc
    },
    {
      bbox: new Box2(),
      elements: [],
    },
  )

  const viewBox = bbox.valid
    ? {
        x: bbox.min.x,
        y: -bbox.max.y,
        width: bbox.max.x - bbox.min.x,
        height: bbox.max.y - bbox.min.y,
      }
    : {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
  return `<?xml version="1.0"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
  preserveAspectRatio="xMinYMin meet"
  viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
  width="100%" height="100%"
>
  <g stroke="#000000" stroke-width="0.1%" fill="none" transform="matrix(1,0,0,-1,0,0)">
    ${elements.join('\n')}
  </g>
</svg>`
}
