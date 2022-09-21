import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(join(__dirname, '/../resources/attribute.dxf'), 'utf-8')

describe('ATTRIBUTEDEF', () => {
  it('can be parsed', () => {
    const _parsed = parseString(dxfContents)
    const attdef = _parsed.blocks[5].entities.find(e => e.type === 'ATTDEF')

    expect(attdef).toEqual({
      type: 'ATTDEF',
      subclassMarker: 'AcDbAttributeDefinition',
      thickness: 0,
      scaleX: 1,
      mtext: {},
      text: {
        x: 3172.145385426004,
        y: 5382.329832272604,
        z: 0,
        textHeight: 2.5,
        string: ''
      },
      handle: '2CF',
      layer: '0',
      lock: '     1',
      prompt: '',
      tag: 'ATRIBUTOTEST',
      attributeFlags: 0
    })
  })
})
