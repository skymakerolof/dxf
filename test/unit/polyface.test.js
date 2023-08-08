import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  join(__dirname, '/../resources/polyfacemesh.dxf'),
  'utf-8',
)

describe('POLYFACE MESH', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(2)
    expect(entities[0]).toEqual({
      type: 'POLYLINE',
      vertices: [
        { x: 103.2542088585546, y: 135.8509812529935, z: 0 },
        { x: 92.64320885855477, y: 135.8509812529935, z: 0 },
        { x: 108.3072088585536, y: 132.817981252994, z: 0 },
        { x: 0.5752088585545608, y: 68.22898125299412, z: 0 },
        { x: 135.594208858553, y: 88.59198125299348, z: 0 },
        { x: 57.77920885855337, y: 1.403981252993389, z: 0 },
        { x: 88.34820885855378, y: 134.0819812529932, z: 0 },
        { x: 111.845208858555, y: 129.1539812529934, z: 0 },
        { x: 86.07420885855345, y: 136.9879812529941, z: 0 },
        { x: 96.30720885855362, y: 136.6089812529933, z: 0 },
        { x: 100.2232088585547, y: 136.6089812529933, z: 0 },
        { x: 114.8762088585549, y: 130.7959812529932, z: 0 },
        { x: 134.3312088585548, y: 79.24098125299292, z: 0 },
        { x: 37.7922088585533, y: 21.41698125299422, z: 0 },
        { faces: [-1, 2, -7, 3] },
        { faces: [-2, 1, 11, 10] },
        { faces: [-3, -4, -5, 8] },
        { faces: [-4, -3, 7, 9] },
        { faces: [-5, -4, 6, 13] },
        { faces: [-6, 4, 14] },
        { faces: [-8, 5, 12] },
      ],
      handle: '299',
      layer: '0',
      lineTypeName: 'Continuous',
      closed: false,
      polygonMesh: false,
      polyfaceMesh: true,
    })
  })
})
