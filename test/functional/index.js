import React, { Component } from 'react'
import { render } from 'react-dom'

import { parseString, toSVG } from '../../src'

const resources = [
  'lines',
  'lwpolylines',
  'polylines',
  'circlesellipsesarcs',
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
  'issue29'
]
const dxfs = resources.map(name => require(`../resources/${name}.dxf`))
const svgs = dxfs.map(contents => toSVG(parseString(contents)))

render(<div>
  {svgs.map((svg, i) => <div
    style={{ display: 'inline-block', margin: 20, padding: 20, backgroundColor: '#fff' }}
    key={i}
    dangerouslySetInnerHTML={{ __html: svg }}
  />)}
</div>, document.getElementById('contents'))
