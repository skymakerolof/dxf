import { pd } from 'pretty-data'
import { Box2 } from 'vecks'

import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import colors from './util/colors'
import logger from './util/logger'

const polylineToPath = (rgb, polyline) => {
  const color24bit = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16)
  let prepad = color24bit.toString(16)
  for (let i = 0, il = 6 - prepad.length; i < il; ++i) {
    prepad = '0' + prepad
  }
  let hex = '#' + prepad

  // SVG is white by default, so make white lines black
  if (hex === '#ffffff') {
    hex = '#000000'
  }

  const d = polyline.reduce(function (acc, point, i) {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  return '<path fill="none" stroke="' + hex + '" stroke-width="0.1%" d="' + d + '"/>'
}

/**
 * Convert the interpolate polylines to SVG
 */
export default (parsed) => {
  const entities = denormalise(parsed)
  const polylines = entities.map(e => {
    return entityToPolyline(e)
  })

  const bbox = new Box2()
  polylines.forEach(polyline => {
    polyline.forEach(point => {
      bbox.expandByPoint({ x: point[0], y: point[1] })
    })
  })

  const paths = []
  polylines.forEach((polyline, i) => {
    const entity = entities[i]
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
    const p2 = polyline.map(function (p) {
      return [p[0], -p[1]]
    })
    paths.push(polylineToPath(rgb, p2))
  })

  // If the DXF is empty the bounding box will have +-Infinity values,
  // so clamp values to zero in this case
  const viewBox = bbox.min.x === Infinity
    ? { x: 0, y: 0, width: 0, height: 0 }
    : { x: bbox.min.x, y: -bbox.max.y, width: bbox.max.x - bbox.min.x, height: bbox.max.y - bbox.min.y }

  let svgString = '<?xml version="1.0"?>'
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"'
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"'
  svgString += ' preserveAspectRatio="xMinYMin meet"'
  svgString += ` viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"`
  svgString += ' width="100%" height="100%">' + paths.join('') + '</svg>'
  return pd.xml(svgString)
}
