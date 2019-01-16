import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString, denormalise, groupEntitiesByLayer } from '../../src'

describe('Group entities', () => {
  it('by layer', () => {
    const parsed = parseString(
      fs.readFileSync(join(__dirname, '../resources/floorplan.dxf'), 'utf-8'))
    const entities = denormalise(parsed)
    const byLayer = groupEntitiesByLayer(entities)

    expect(Object.keys(byLayer)).toEqual([
      '0',
      'A-DIMS-1',
      'A-NOTE',
      'ANNTEXT',
      'A-TEXT',
      'xref-Bishop-Overland-08$0$A-WALL',
      'xref-Bishop-Overland-08$0$A-CASE-1',
      'xref-Bishop-Overland-08$0$A-OPENING',
      'xref-Bishop-Overland-08$0$A-GARAGE-DOOR',
      'xref-Bishop-Overland-08$0$S-STEM-WALL',
      'xref-Bishop-Overland-08$0$S-FOOTER',
      'xref-Bishop-Overland-08$0$A-HEADER',
      'xref-Bishop-Overland-08$0$R-BEAM',
      'xref-Bishop-Overland-08$0$A-FOOTPRINT',
      'xref-Bishop-Overland-08$0$S-SLAB',
      'xref-Bishop-Overland-08$0$TEMP',
      'xref-Bishop-Overland-08$0$A-FIXTURE'
    ])

    const layerEntityCounts = Object.keys(byLayer).map(layer => {
      return byLayer[layer].length
    })
    expect(layerEntityCounts).toEqual([
      2, 55, 131, 45, 1, 177, 199, 159, 1, 26, 87, 27, 8, 5, 1, 3, 2
    ])
  })
})
