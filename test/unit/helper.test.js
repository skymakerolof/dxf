import fs from 'fs'
import { join } from 'path'
import expect from 'expect'
import { parseString } from 'xml2js'
import { Box2 } from 'vecks'

import { Helper } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/1x1rectangle.dxf'), 'utf-8')

describe('Helper', () => {
  it('should be constructed with a string', () => {
    expect(() => {
      return new Helper(null)
    }).toThrow('Helper constructor expects a DXF string')
  })

  it('parsed automatically', () => {
    const helper = new Helper(dxfContents)
    expect(helper.parsed.entities.length).toEqual(1)
  })

  it('denormalises automatically', () => {
    const helper = new Helper(dxfContents)
    expect(helper.denormalised.length).toEqual(1)
  })

  it('can group by layer', () => {
    const helper = new Helper(dxfContents)
    expect(helper.groups.Default.length).toEqual(1)
  })

  it('can output an SVG', (done) => {
    const helper = new Helper(dxfContents)
    const svg = helper.toSVG()
    parseString(svg, (err, result) => {
      if (err) {
        throw Error(err)
      }
      expect(result.svg.$.viewBox).toEqual('0 -10 10 10')
      done()
    })
  })

  it('can output polylines', () => {
    const helper = new Helper(dxfContents)
    const { bbox, polylines } = helper.toPolylines()
    expect(bbox.equals(new Box2({ x: 0, y: 0 }, { x: 10, y: 10 }))).toEqual(true)
    expect(polylines).toEqual([{
      rgb: [0, 0, 79],
      vertices: [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
    }])
  })
})
