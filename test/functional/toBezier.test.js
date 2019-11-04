import React from 'react'
import { render } from 'react-dom'
import { HashRouter } from 'react-router-dom'

import { interpolateBSpline } from '../../src/entityToPolyline'
import toPiecewiseBezier from '../../src/util/toPiecewiseBezier'
import { piecewiseToPaths } from '../../src/toSVG'

const controlPoints = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 0, y: 20 },
  { x: 10, y: 20 }
]
const k = 4
const knots = [0, 0, 0, 0, 1, 2, 3, 3, 3, 3]
const viewBox = '-1 -21 12 22'

// const controlPoints = [
//   { x: 0, y: 0 },
//   { x: 122.4178296875701, y: -38.53600688262475 },
//   { x: 77.52934654015353, y: 149.4771453152231 },
//   { x: 200, y: 100 }
// ]
// const k = 3
// const knots = [0, 0, 0, 0.5, 1, 1, 1]
// const viewBox = '-1 -160 200 200'

const interpolated0 = interpolateBSpline(controlPoints, k - 1, knots)

const polylineToPath = (polyline) => {
  const d = polyline.reduce(function (acc, point, i) {
    acc += (i === 0) ? 'M' : 'L'
    acc += point[0] + ',' + point[1]
    return acc
  }, '')
  return <path d={d} />
}

const piecewise = toPiecewiseBezier(k, controlPoints, knots)
const interpolated1 = interpolateBSpline(piecewise.controlPoints, k - 1, piecewise.knots)
const paths = piecewiseToPaths(k, piecewise.knots, piecewise.controlPoints, k.knots)

render(
  <HashRouter>
    <div>
      <svg
        preserveAspectRatio='xMinYMin meet'
        viewBox={viewBox}
        width='200'
        height='400'
      >
        <g stroke='#000' fill='none' strokeWidth='0.1' transform='matrix(1,0,0,-1,0,0)'>
          {polylineToPath(interpolated0)}
        </g>
      </svg>
      <svg
        preserveAspectRatio='xMinYMin meet'
        viewBox={viewBox}
        width='200'
        height='400'
      >
        <g stroke='#000' fill='none' strokeWidth='0.1' transform='matrix(1,0,0,-1,0,0)'>
          {polylineToPath(interpolated1)}
        </g>
      </svg>
      <svg
        preserveAspectRatio='xMinYMin meet'
        viewBox={viewBox}
        width='200'
        height='400'
      >
        <g
          stroke='#000' fill='none' strokeWidth='0.1' transform='matrix(1,0,0,-1,0,0)'
          dangerouslySetInnerHTML={{ __html: paths }}
        />
      </svg>
    </div>
  </HashRouter>,
  document.getElementById('contents'))
