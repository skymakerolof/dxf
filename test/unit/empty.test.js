import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString, denormalise } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/empty.dxf'), 'utf-8')

describe('Empty', () => {
  it('can parsed from a string', () => {
    const parsed = parseString(dxfContents)
    expect(parsed.blocks.length).toEqual(78)
    expect(parsed.entities.length).toEqual(1)

    const entities = denormalise(parsed)
    expect(entities).toEqual([{
           angle: 0,
           center: {
             x: 128.5,
             y: 97.5,
             z: 0,
           },
           centerDCS: {
             x: 128.5,
             y: 97.5,
           },
           colorNumber: 178,
           direction: {
             x: 0,
             y: 0,
             z: 1,
           },
           elevation: 0,
           flags: 557152,
           gridSpacing: {
             x: 10,
             y: 10,
           },
           handle: "10342",
           height: 222.18,
           id: 1,
           layer: "0",
           layout: NaN,
           paperSpace: 1,
           render: "     0",
           snap: {
             x: 0,
             y: 0,
           },
           snapAngle: 0,
           snapSpacing: {
             x: 10,
             y: 10,
           },
           status: 1,
           target: {
             x: 0,
             y: 0,
             z: 0,
           },
           transforms: [],
           type: "VIEWPORT",
           width: 314.226,
           x: 0,
           xAxisX: 0,
           xAxisY: 1,
           xAxisZ: 0,
           y: 0,
           z: 0,
         }
       ])
  })
})
