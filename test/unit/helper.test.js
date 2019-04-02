import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { Helper, config } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/1x1rectangle.dxf'), 'utf-8')

config.verbose = true

describe.only('Helper', () => {
  it('should be constructed with a string', () => {

  })

  it('parsed automatically', () => {
    const helper = new Helper(dxfContents)
    expect(helper.parsed.entities.length).toEqual(1)
  })

  it('denormalises automatically', () => {
    const helper = new Helper(dxfContents)
    expect(helper.denormalised.length).toEqual(1)
  })

  it('can output an SVG', () => {
    const helper = new Helper(dxfContents)
    helper.toSVG()
  })

  it.skip('can output polylines', () => {

  })
})
