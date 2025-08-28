import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  join(__dirname, '/../resources/testOle2Frame.dxf'),
  'utf-8',
)

describe('OLE2FRAME', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(1)
    const ent = entities[0]
    expect(ent.type).toEqual('OLE2FRAME')
    const dataInit = ent.data.slice(0, 50)
    expect(dataInit).toEqual(
      '8055A0B48A0A5B7E74401034BE68675CA54000000000000000',
    )
    expect(ent.handle).toEqual('2AD')
    expect(ent.layer).toEqual('0')
    expect(ent.version).toEqual(2)
    expect(ent.name).toEqual('Imagen de Paintbrush')
    expect(ent.upperLeftX).toEqual(327.8972268503367)
    expect(ent.upperLeftY).toEqual(2734.201971000534)
    expect(ent.upperLeftZ).toEqual(0)
    expect(ent.lowerRightX).toEqual(2319.795116294365)
    expect(ent.lowerRightY).toEqual(1544.235703538072)
    expect(ent.lowerRightZ).toEqual(0)
    expect(ent.objectType).toEqual(2)
    expect(ent.tile).toEqual(0)
    expect(ent.length).toEqual(777856)
  })
})
