import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Switch, Route, Link } from 'react-router-dom'

import { parseString, toSVG } from '../../src'

const names = [
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
  'issue29',
  'issue39'
]
const dxfs = names.map(name => require(`../resources/${name}.dxf`))
const svgs = dxfs.map(contents => toSVG(parseString(contents)))

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
