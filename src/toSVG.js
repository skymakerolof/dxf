import { pd } from 'pretty-data'

import toPolylines from './toPolylines'

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
  const { bbox, polylines } = toPolylines(parsed)
  const paths = polylines.map((polyline, i) => {
    const vertices = polyline.vertices.map(v => {
      return [v[0], -v[1]]
    })
    return polylineToPath(polyline.rgb, vertices)
  })

  // If the DXF is empty the bounding box will have +-Infinity values,
  // so clamp values to zero in this case
  const viewBox = bbox.min.x === Infinity
    ? { x: 0, y: 0, width: 0, height: 0 }
    : { x: bbox.min.x, y: -bbox.max.y, width: bbox.max.x - bbox.min.x, height: bbox.max.y - bbox.min.y }

  let svgString = `
<?xml version="1.0"?>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
    preserveAspectRatio="xMinYMin meet"
    viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
    width="100%"
    height="100%"
  >
    ${paths.join('\n')}
</svg>`
  return pd.xml(svgString)
}
