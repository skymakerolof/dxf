import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString } from '../../src'
const dxfContents = fs.readFileSync(
  join(__dirname, '/../resources/table_entity.dxf'),
  'utf-8',
)

describe('ACAD_TABLE', () => {
  it('can be parsed', () => {
    const entities = parseString(dxfContents).entities
    expect(entities.length).toEqual(1)
	  expect(entities[0]).toEqual({
		  layer: "0",
		  block: "*T1",
		  handle: '9C',
		  x: 105,
		  y: 145,
		  z: 0,
		  rotate: 0,
		  width: 456,
		  height: 29,
		  colCount: 3,
		  rowCount: 3,
		  type: 'ACAD_TABLE',
		  cells: [
			  {
				  "text": "Title",
				  "x": 105,
				  "y": 145,
				  "z": 0,
				  "width": 456,
				  "height": 11,
				  "textHeight": 6.798,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "",
				  "x": 257,
				  "y": 145,
				  "z": 0,
				  "width": 152,
				  "height": 11,
				  "textHeight": 6.798,
				  "cellType": "text",
				  "cellMerge": 1
			  },
			  {
				  "text": "",
				  "x": 409,
				  "y": 145,
				  "z": 0,
				  "width": 152,
				  "height": 11,
				  "textHeight": 6.798,
				  "cellType": "text",
				  "cellMerge": 1
			  },
			  {
				  "text": "1",
				  "x": 105,
				  "y": 156,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "2",
				  "x": 257,
				  "y": 156,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "3",
				  "x": 409,
				  "y": 156,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "4",
				  "x": 105,
				  "y": 165,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "5",
				  "x": 257,
				  "y": 165,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  },
			  {
				  "text": "6",
				  "x": 409,
				  "y": 165,
				  "z": 0,
				  "width": 152,
				  "height": 9,
				  "textHeight": 5.562,
				  "cellType": "text",
				  "cellMerge": 0
			  }
		  ],
	  })
  })
})
