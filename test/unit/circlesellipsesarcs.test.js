import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/circlesellipsesarcs.dxf'), 'utf-8')

describe('CIRCLE ELLIPSE ARC', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(5)

    expect(entities[0]).toEqual({
      type: 'ELLIPSE',
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      startAngle: 0,
      endAngle: 6.283185307179586,
      axisRatio: 0.5588235294117645,
      majorX: -50,
      majorY: 30,
      majorZ: 0,
      x: 140,
      y: 50,
      z: 0
    })
    expect(entities[1]).toEqual({
      type: 'ELLIPSE',
      axisRatio: 0.5205479452054796,
      colorNumber: 256,
      layer: '0',
      lineTypeName: 'ByLayer',
      startAngle: 0.6113462377070888,
      endAngle: 3.859405532016142,
      majorX: 30,
      majorY: -80,
      majorZ: 0,
      x: 130,
      y: 180,
      z: 0
    })
    expect(entities[2]).toEqual({
      type: 'ARC',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      startAngle: 3.141592653589793,
      endAngle: 0.19739555984988089,
      x: 50,
      y: 140,
      r: 50
    })
    expect(entities[3]).toEqual({
      type: 'ARC',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      startAngle: 5.355890089177973,
      endAngle: 0.540419500270584,
      x: 0,
      y: 210,
      r: 58.309518948453
    })
    expect(entities[4]).toEqual({
      type: 'CIRCLE',
      layer: '0',
      lineTypeName: 'ByLayer',
      colorNumber: 256,
      x: 20,
      y: 30,
      r: 40
    })
  })
})
