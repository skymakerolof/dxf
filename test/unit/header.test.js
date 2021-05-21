import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/lines.dxf'), 'utf-8')

describe('header', () => {
  it('can parse the header', () => {
    const parsed = parseString(dxfContents)
    expect(parsed.header).toEqual({
      measurement: 1,
      insUnits: 4,
      extMin: {
        x: 0,
        y: 0,
        z: 0
      },
      extMax: {
        x: 100,
        y: 99.2820323027551,
        z: 0
      },
      dimArrowSize: 2.5
    })
  })
})
