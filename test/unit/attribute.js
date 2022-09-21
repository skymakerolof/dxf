import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/attribute.dxf'), 'utf-8')

describe('ATTRIBUTE', () => {
  it('can be parsed', () => {
    const _parsed = parseString(dxfContents)
    const attribute = _parsed.entities.find(e => e.type === 'ATTRIB')
    const attdef = _parsed.blocks[5].entities.find(e => e.type === 'ATTDEF')

    expect(attribute).toEqual({
      type: 'ATTRIB',
      subclassMarker: 'AcDbAttribute',
      thickness: 0,
      scaleX: 1,
      mtext: {},
      text: {
        x: 3172.145385426004,
        y: 5382.329832272604,
        z: 0,
        textHeight: 2.5,
        string: 'TESTTEST'
      },
      handle: '2D2',
      layer: '0',
      lock: '     1',
      tag: 'ATRIBUTOTEST',
      attributeFlags: 0
    })
  })
})
