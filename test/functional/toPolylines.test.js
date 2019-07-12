import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Switch, Route, Link } from 'react-router-dom'
import { pd } from 'pretty-data'

import { Helper, config } from '../../src'
import rgbToColorAttribute from '../../src/util/rgbToColorAttribute'

config.verbose = true

const polylineToPath = (rgb, polyline) => {
  const colorAttrib = rgbToColorAttribute(rgb)
  const d = polyline.reduce(function (acc, point, i) {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  return `<path fill="none" stroke="${colorAttrib}" stroke-width="0.1%" d="${d}"/>`
}

/**
 * Convert the interpolate polylines to SVG
 */
const toSVG = ({ bbox, polylines }) => {
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

const names = [
  'lines',
  'lwpolylines',
  'polylines',
  'squareandcircle',
  'circlesellipsesarcs',
  'ellipticalarcs',
  'ellipticalarcs2',
  'splines',
  'blocks1',
  'blocks2',
  'layers',
  'supported_entities',
  'empty',
  'floorplan',
  'Ceco.NET-Architecture-Tm-53',
  'openscad_export',
  'issue21',
  'issue27a',
  'issue27b',
  'issue27c',
  'issue28',
  'issue29',
  'issue39',
  'issue42',
  'splineA'
]
const dxfs = names.map(name => require(`../resources/${name}.dxf`))
const svgs = dxfs.map(contents => toSVG(new Helper(contents).toPolylines()))

const Thumbnail = ({ index, name, svg }) => <Link
  to={`/${index}`}
>
  <div
    style={{ display: 'inline-block', margin: 20, padding: 20, backgroundColor: '#fff' }}
    dangerouslySetInnerHTML={{ __html: svg }}
  />
</Link>

// All the test cases
const All = () => <div>
  {svgs.map((svg, i) => <Thumbnail key={i} index={i} name={names[i]} svg={svg} />)}
</div>

// One SVG only
const One = (props) => {
  return <div
    style={{ backgroundColor: '#fff' }}
    dangerouslySetInnerHTML={{ __html: svgs[props.match.params.index] }}
  />
}

render(<HashRouter>
  <div>
    <Switch>
      <Route path='/' exact component={All} />
      <Route path='/:index' component={One} />
    </Switch>
  </div>
</HashRouter>, document.getElementById('contents'))
