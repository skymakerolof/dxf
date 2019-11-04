import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(
  __dirname, '/../resources/Ceco.NET-Architecture-Tm-53.dxf'), 'utf-8')

describe('Layer Styles', () => {
  it('can be parsed', () => {
    const result = parseString(dxfContents)
    const expected = {
      0: { colorNumber: 7 },
      'wall high': { colorNumber: 5 },
      'wall low': { colorNumber: 140 },
      texture: { colorNumber: 253 },
      equipment: { colorNumber: 40 },
      nivel: { colorNumber: 30 },
      doorswindows: { colorNumber: 41 },
      projection: { colorNumber: 134 },
      names: { colorNumber: 7 },
      Defpoints: { colorNumber: 7 },
      topography: { colorNumber: 132 },
      plants: { colorNumber: 83 },
      'Ceco.NET 53': { colorNumber: 254 }
    }

    const reduced = {}
    Object.keys(result.tables.layers).forEach(name => {
      const l = result.tables.layers[name]
      reduced[name] = { colorNumber: l.colorNumber }
    })
    expect(reduced).toEqual(expected)
  })
})
