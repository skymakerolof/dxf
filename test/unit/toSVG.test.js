import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { DXFReader, config } from '../../src'
config.verbose = true

describe.only('SVG', () => {
  it('can read and render a very simple SVG', () => {
    const dxf = fs.readFileSync(join(__dirname, '/../resources/1x1rectangle.dxf'), 'utf-8')
    const svg = new DXFReader(dxf)
      .toSVG()
    expect(svg).toEqual('')
  })
})
