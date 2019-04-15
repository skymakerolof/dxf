import { pd } from 'pretty-data'
import { Box2 } from 'vecks'

import entityToPolyline from './entityToPolyline'
import denormalise from './denormalise'
import getRGBForEntity from './getRGBForEntity'
import logger from './util/logger'

export const rgbToColorAttribute = (rgb) => {
  if (rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255) {
    return '#000000'
  } else {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }
}

const createTransformedBBoxAndElement = (bboxPoints, transforms, strokeElement) => {
  let transformedElement = ''
  const matrices = transforms.map(transform => {
    const tx = transform.x || 0
    const ty = transform.y || 0
    const sx = transform.scaleX || 1
    const sy = transform.scaleY || 1
    const angle = (transform.rotation || 0) / 180 * Math.PI
    const { cos, sin } = Math
    let a, b, c, d, e, f
    if (transform.extrusionZ === -1) {
      a = -sx * cos(angle)
      b = sx * sin(angle)
      c = sy * sin(angle)
      d = sy * cos(angle)
      e = -tx
      f = ty
    } else {
      a = sx * cos(angle)
      b = sx * sin(angle)
      c = -sy * sin(angle)
      d = sy * cos(angle)
      e = tx
      f = ty
    }
    return [a, b, c, d, e, f]
  })

  matrices.forEach(([a, b, c, d, e, f]) => {
    bboxPoints = bboxPoints.map(point => ({
      x: point.x * a + point.y * c + e,
      y: point.x * b + point.y * d + f
    }))
  })
  const transformedBBox = bboxPoints.reduce((acc, point) => {
    return acc.expandByPoint(point)
  }, new Box2())

  matrices.reverse()
  matrices.forEach(([a, b, c, d, e, f]) => {
    transformedElement += `<g transform="matrix(${a} ${b} ${c} ${d} ${e} ${f})">`
  })
  transformedElement += strokeElement
  matrices.forEach(transform => {
    transformedElement += '</g>'
  })

  return { bbox: transformedBBox, element: transformedElement }
}

const polyline = (color, entity) => {
  const vertices = entityToPolyline(entity)
  let bboxPoints = vertices.map(([x, y]) => ({ x, y }))
  const d = vertices.reduce((acc, point, i) => {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  const element = `<path stroke="${color}" d="${d}" />`
  return createTransformedBBoxAndElement(bboxPoints, entity.transforms, element)
}

const circle = (color, entity) => {
  let bboxPoints = [{
    x: entity.x + entity.r,
    y: entity.y + entity.r
  }, {
    x: entity.x - entity.r,
    y: entity.y + entity.r
  }, {
    x: entity.x - entity.r,
    y: entity.y - entity.r
  }, {
    x: entity.x + entity.r,
    y: entity.y - entity.r
  }]
  const element = `<circle stroke="${color}" cx="${entity.x}" cy="${entity.y}" r="${entity.r}" />`
  return createTransformedBBoxAndElement(bboxPoints, entity.transforms, element)
}

/**
 * Rotate a set of points.
 *
 * @param points the points
 * @param angle the rotation angle
 */
const rotate = (p, angle) => {
  return {
    x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
    y: p.y * Math.cos(angle) + p.x * Math.sin(angle)
  }
}

const ellipseOrArc = (color, cx, cy, rx, ry, startAngle, endAngle, rotationAngle) => {
  let bboxPoints = [{
    x: rx,
    y: ry
  }, {
    x: rx,
    y: -ry
  }, {
    x: -rx,
    y: -ry
  }, {
    x: -rx,
    y: ry
  }].map(p => {
    const rotated = rotate(p, rotationAngle)
    return {
      x: cx + rotated.x,
      y: cy + rotated.y
    }
  })
  if ((Math.abs(startAngle - endAngle) < 1e-9) || (Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9)) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    const element = `<g transform="rotate(${rotationAngle / Math.PI * 180} ${cx}, ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
    </g>`
    return { bboxPoints, element }
  } else {
    const s1 = {
      x: Math.cos(startAngle) * rx,
      y: Math.sin(startAngle) * ry
    }
    const s2 = rotate(s1, rotationAngle)
    const startPoint = {
      x: cx + s2.x,
      y: cy + s2.y
    }
    const e1 = {
      x: Math.cos(endAngle) * rx,
      y: Math.sin(endAngle) * ry
    }
    const e2 = rotate(e1, rotationAngle)
    const endPoint = {
      x: cx + e2.x,
      y: cy + e2.y
    }
    const adjustedEndAngle = endAngle < startAngle
      ? endAngle + Math.PI * 2
      : endAngle
    const largeArcFlag = adjustedEndAngle - startAngle < Math.PI ? 0 : 1
    const d = `M ${startPoint.x} ${startPoint.y} A ${rx} ${ry} ${rotationAngle / Math.PI * 180} ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
    // <circle stroke="#090" fill="#090" cx="${startPoint.x}" cy="${startPoint.y}" r="2" />
    // <circle stroke-width="2" stroke="#00a" fill="none" cx="${endPoint.x}" cy="${endPoint.y}" r="3" />
    // <circle stroke="#a00" fill="#a00" cx="${cx}" cy="${cy}" r="2" />
    const element = `<g>
      <path stroke="${color}" d="${d}" />
    </g>`
    return { bboxPoints, element }
  }
}

const ellipse = (color, entity) => {
  const rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY)
  const ry = entity.axisRatio * rx
  const majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX)
  const { bboxPoints, element } = ellipseOrArc(color, entity.x, entity.y, rx, ry, entity.startAngle, entity.endAngle, majorAxisRotation)
  return createTransformedBBoxAndElement(bboxPoints, entity.transforms, element)
}
const arc = (color, entity) => {
  console.log('**', entity)
  const { bboxPoints, element } = ellipseOrArc(color, entity.x, entity.y, entity.r, entity.r, entity.startAngle, entity.endAngle, 0)
  return createTransformedBBoxAndElement(bboxPoints, entity.transforms, element)
}

const entityToBoundsAndElement = (color, entity) => {
  switch (entity.type) {
    case 'CIRCLE': return circle(color, entity)
    case 'ELLIPSE': return ellipse(color, entity)
    case 'ARC': return arc(color, entity)
    case 'LINE':
    case 'LWPOLYLINE':
    case 'SPLINE':
    case 'POLYLINE': {
      return polyline(color, entity)
    }
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default (parsed) => {
  const entities = denormalise(parsed)
  const { bbox, elements } = entities.reduce((acc, entity) => {
    const rgb = getRGBForEntity(parsed.tables.layers, entity)
    const boundsAndElement = entityToBoundsAndElement(rgbToColorAttribute(rgb), entity)
    if (boundsAndElement) {
      const { bbox, element } = boundsAndElement
      acc.bbox.expandByPoint(bbox.min)
      acc.bbox.expandByPoint(bbox.max)
      acc.elements.push(element)
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
