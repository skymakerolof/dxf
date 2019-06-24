import { pd } from 'pretty-data'
import { Box2 } from 'vecks'

import entityToPolyline from './entityToPolyline'
import denormalise from './denormalise'
import getRGBForEntity from './getRGBForEntity'
import logger from './util/logger'
import rotate from './util/rotate'
import rgbToColorAttribute from './util/rgbToColorAttribute'
import transformBoundingBoxAndElement from './transformBoundingBoxAndElement'

const addFlipXIfApplicable = (entity, { bbox, element }) => {
  if (entity.extrusionZ === -1) {
    return {
      bbox: new Box2()
        .expandByPoint({ x: -bbox.min.x, y: bbox.min.y })
        .expandByPoint({ x: -bbox.max.x, y: bbox.max.y }),
      element: `<g transform="matrix(-1 0 0 1 0 0)">
        ${element}
      </g>`
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
  const bbox = vertices.reduce((acc, [x, y]) => acc.expandByPoint({ x, y }), new Box2())
  const d = vertices.reduce((acc, point, i) => {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  // Empirically it appears that flipping horzontally does not apply to polyline
  return transformBoundingBoxAndElement(bbox, `<path d="${d}" />`, entity.transforms)
}

/**
 * Create a <circle /> element for the CIRCLE entity.
 */
const circle = (entity) => {
  let bbox0 = new Box2()
    .expandByPoint({
      x: entity.x + entity.r,
      y: entity.y + entity.r
    })
    .expandByPoint({
      x: entity.x - entity.r,
      y: entity.y - entity.r
    })
  let element0 = `<circle cx="${entity.x}" cy="${entity.y}" r="${entity.r}" />`
  let { bbox, element } = addFlipXIfApplicable(entity, { bbox: bbox0, element: element0 })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

/**
 * Create a a <path d="A..." /> or <ellipse /> element for the ARC or ELLIPSE
 * DXF entity (<ellipse /> if start and end point are the same).
 */
const ellipseOrArc = (cx, cy, rx, ry, startAngle, endAngle, rotationAngle, flipX) => {
  const bbox = [
    { x: rx, y: ry },
    { x: rx, y: ry },
    { x: -rx, y: -ry },
    { x: -rx, y: ry }
  ].reduce((acc, p) => {
    const rotated = rotate(p, rotationAngle)
    acc.expandByPoint({
      x: cx + rotated.x,
      y: cy + rotated.y
    })
    return acc
  }, new Box2())
  if ((Math.abs(startAngle - endAngle) < 1e-9) || (Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9)) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    const element = `<g transform="rotate(${rotationAngle / Math.PI * 180} ${cx}, ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
    </g>`
    return { bbox, element }
  } else {
    const startOffset = rotate({
      x: Math.cos(startAngle) * rx,
      y: Math.sin(startAngle) * ry
    }, rotationAngle)
    const startPoint = {
      x: cx + startOffset.x,
      y: cy + startOffset.y
    }
    const endOffset = rotate({
      x: Math.cos(endAngle) * rx,
      y: Math.sin(endAngle) * ry
    }, rotationAngle)
    const endPoint = {
      x: cx + endOffset.x,
      y: cy + endOffset.y
    }
    const adjustedEndAngle = endAngle < startAngle
      ? endAngle + Math.PI * 2
      : endAngle
    const largeArcFlag = adjustedEndAngle - startAngle < Math.PI ? 0 : 1
    const d = `M ${startPoint.x} ${startPoint.y} A ${rx} ${ry} ${rotationAngle / Math.PI * 180} ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
    const element = `<path d="${d}" />`
    return { bbox, element }
  }
}

/**
 * An ELLIPSE is defined by the major axis, convert to X and Y radius with
 * a rotation angle
 */
const ellipse = (entity) => {
  const rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY)
  const ry = entity.axisRatio * rx
  const majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX)
  let { bbox: bbox0, element: element0 } = ellipseOrArc(entity.x, entity.y, rx, ry, entity.startAngle, entity.endAngle, majorAxisRotation)
  let { bbox, element } = addFlipXIfApplicable(entity, { bbox: bbox0, element: element0 })
  return transformBoundingBoxAndElement(bbox, element, entity.transforms)
}

/**
 * An ARC is an ellipse with equal radii
 */
const arc = (entity) => {
  let { bbox: bbox0, element: element0 } = ellipseOrArc(
    entity.x, entity.y,
    entity.r, entity.r,
    entity.startAngle, entity.endAngle,
    0,
    entity.extrusionZ === -1)
  let { bbox, element } = addFlipXIfApplicable(entity, { bbox: bbox0, element: element0 })
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
    case 'LINE':
    case 'LWPOLYLINE':
    case 'SPLINE':
    case 'POLYLINE': {
      return polyline(entity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default (parsed) => {
  let entities = denormalise(parsed)
  const { bbox, elements } = entities.reduce((acc, entity, i) => {
    const rgb = getRGBForEntity(parsed.tables.layers, entity)
    const boundsAndElement = entityToBoundsAndElement(entity)
    // Ignore entities like MTEXT that don't produce SVG elements
    if (boundsAndElement) {
      const { bbox, element } = boundsAndElement
      acc.bbox.expandByPoint(bbox.min)
      acc.bbox.expandByPoint(bbox.max)
      acc.elements.push(`<g stroke="${rgbToColorAttribute(rgb)}">${element}</g>`)
    }
    return acc
  }, {
    bbox: new Box2(),
    elements: []
  })

  const viewBox = bbox.min.x === Infinity
    ? {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
    : {
      x: bbox.min.x,
      y: -bbox.max.y,
      width: bbox.max.x - bbox.min.x,
      height: bbox.max.y - bbox.min.y
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
    ${pd.xml(elements.join('\n'))}
  </g>
</svg>`
}
