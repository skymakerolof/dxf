import { pd } from 'pretty-data'
import { Box2 } from 'vecks'

import colors from './util/colors'
import entityToPolyline from './entityToPolyline'
import denormalise from './denormalise'
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
  const bbox = bboxPoints.reduce((acc, point) => {
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

  return { bbox, element: transformedElement }
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

const circle = (color, circleEntity) => {
  let bboxPoints = [{
    x: circleEntity.x + circleEntity.r,
    y: circleEntity.y + circleEntity.r
  }, {
    x: circleEntity.x - circleEntity.r,
    y: circleEntity.y + circleEntity.r
  }, {
    x: circleEntity.x - circleEntity.r,
    y: circleEntity.y - circleEntity.r
  }, {
    x: circleEntity.x + circleEntity.r,
    y: circleEntity.y - circleEntity.r
  }]
  const element = `<circle stroke="${color}" cx=${circleEntity.x} cy=${circleEntity.y} r=${circleEntity.r} />`
  return createTransformedBBoxAndElement(bboxPoints, circleEntity.transforms, element)
}

const entityToBoundsAndElement = (color, entity) => {
  switch (entity.type) {
    case 'CIRCLE': return circle(color, entity)
    case 'LINE':
    case 'LWPOLYLINE':
    case 'ELLIPSE':
    case 'ARC':
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
    const layerTable = parsed.tables.layers[entity.layer]
    let rgb
    if (layerTable) {
      let colorNumber = ('colorNumber' in entity) ? entity.colorNumber : layerTable.colorNumber
      rgb = colors[colorNumber]
      if (rgb === undefined) {
        logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
        rgb = [0, 0, 0]
      }
    } else {
      logger.warn('no layer table for layer:' + entity.layer)
      rgb = [0, 0, 0]
    }
    const result = entityToBoundsAndElement(rgbToColorAttribute(rgb), entity)
    if (result) {
      const { bbox, element } = result
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

  return pd.xml(`
<?xml version="1.0"?>
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
</svg>`)
}
