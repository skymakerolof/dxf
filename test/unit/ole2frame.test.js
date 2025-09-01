import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  join(__dirname, '/../resources/testOle2Frame.dxf'),
  'utf-8',
)

describe('OLE2FRAME', () => {
  let entities
  let ent
  let dataInit

  before(() => {
    entities = parseString(dxfContents).entities
    ent = entities[0]
    dataInit = ent.data
  })

  it('parses exactly one entity', () => {
    expect(entities.length).toEqual(1)
  })

  it('sets the entity type', () => {
    expect(ent.type).toEqual('OLE2FRAME')
  })

  it('extracts the data bytes', () => {
    expect(dataInit).toEqual('DEADBEEFCAFEBABE')
  })

  it('assigns a handle', () => {
    expect(ent.handle).toBeDefined()
  })

  it('reads the layer', () => {
    expect(ent.layer).toEqual('0')
  })

  it('reads the version', () => {
    expect(ent.version).toEqual(2)
  })

  it('reads the name', () => {
    expect(ent.name).toEqual('Paintbrush Picture')
  })

  it('reads upperLeftX', () => {
    expect(ent.upperLeftX).toEqual(0)
  })

  it('reads upperLeftY', () => {
    expect(ent.upperLeftY).toEqual(0)
  })

  it('reads upperLeftZ', () => {
    expect(ent.upperLeftZ).toEqual(0)
  })

  it('reads lowerRightX', () => {
    expect(ent.lowerRightX).toEqual(10)
  })

  it('reads lowerRightY', () => {
    expect(ent.lowerRightY).toEqual(-5)
  })

  it('reads lowerRightZ', () => {
    expect(ent.lowerRightZ).toEqual(0)
  })

  it('reads objectType', () => {
    expect(ent.objectType).toEqual(3)
  })

  it('reads tile', () => {
    expect(ent.tile).toEqual(0)
  })

  it('reads length', () => {
    expect(ent.length).toEqual(8)
  })
})
