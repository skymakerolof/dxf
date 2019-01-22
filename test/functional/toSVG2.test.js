import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Switch, Route, Link } from 'react-router-dom'

import { DXFReader } from '../../src'

const names = [
  'circlesellipsesarcs'
]
const dxfs = names.map(name => require(`../resources/${name}.dxf`))
const svgs = dxfs.map(contents => new DXFReader(contents).toSVG())

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
