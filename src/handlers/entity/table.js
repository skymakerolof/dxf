//reference: https://help.autodesk.com/view/ACD/2023/ENU/?guid=GUID-D8CCD2F0-18A3-42BB-A64D-539114A07DA0

import common from './common'

export const TYPE = 'ACAD_TABLE'

export function process(tuples) {

	let table = {
		type: TYPE,
		rowCount: 0,
		colCount: 0,
		texts: [],
		rowHeight: [],
		colWidth: [],
		textHeight: [],

		cellType: [],
		cellMerge:  [],

		borderWidth: [],
		borderHeight: [],
	}

	let text = null
	let tableState = false

	let doWithLowVersion = false
	let preCode = null

	tuples.forEach(tuple => {
		const [code, value] = tuple;

		switch (code) {
			case 2:
          		table.block = value
          		break

			case 10:
				table.x = value
				break
			case 20:
				table.y = value
				break
			case 30:
				table.z = value
				break

			case 91:
				if (!tableState) {
					table.rowCount = Number(value)
				}
				break

			case 92:
				if (!tableState) {
					table.colCount = Number(value)
				}
				break

			case 140:
				if (tableState) {
					table.textHeight.push(Number(value)) 
				}
				break

			case 141:
				if (tableState) {
					table.rowHeight.push(Number(value)) 
				}
				break
			case 142:
				if (tableState) {
					table.colWidth.push(Number(value)) 
				}
				break

			case 145:
				if (tableState) {
					table.rotate = Number(value)
				}
				break

			case 171:
				if (tableState) {
					table.cellType.push(Number(value) === 1 ? 'text' : 'block')
				}
				break
			case 173:
				if (tableState) {
					table.cellMerge.push(Number(value))
				}
				break

			case 175:
				if (tableState) {
					table.borderWidth.push(Number(value))
				}
				break
			case 176:
				if (tableState) {
					table.borderHeight.push(Number(value))
				}
				break
			
			case 1:   // ASCII string content
				if (tableState) {
					doWithLowVersion = true
					if (text != null) {
						table.texts.push(text)
					}
					text = value
				}
				break
			case 302: // repeat Unicode string content (自 AutoCAD 2007 开始)
				if (tableState) {
					if (!doWithLowVersion) {
						if (text != null) {
							table.texts.push(text)
						}

						text = value
					}
					doWithLowVersion = false
				}
				break

			case 2:   // repeat ASCII string content
				if (tableState && 1 === preCode) {
					doWithLowVersion = true
					if (text != null) {
						text = `${text}\n${value}`
					} else {
						text = `${value}`
					}
				}
				break
			case 303: // repeat Unicode string content (自 AutoCAD 2007 开始)
				if (tableState && 302 === preCode) {
					if (!doWithLowVersion) {
						if (text != null) {
							text = `${text}\n${value}`
						} else {
							text = `${value}`
						}
					}
					doWithLowVersion = false
				}
				break
			default:
				Object.assign(table, common(code, value));
		}	

		if (!tableState && table.rowCount > 0 && table.colCount > 0) {
			tableState = true
		}

		preCode = code;
	});

	if (text != null) {
		table.texts.push(text)
	}

	table.cells = [];
	let offsetX = table.x
	let offsetY = table.y
	table.height = table.rowHeight.reduce((a, b) => a + b, 0);
	table.width = table.colWidth.reduce((a, b) => a + b, 0);

	for (let i = 0; i < table.texts.length; i++) {
		let colIdx = i % table.colCount 
		let rowIdx = parseInt(i / table.colCount)
		let width = (table.colWidth[ colIdx ] || 1) * (table.borderWidth[i] || 1);
		let height = (table.rowHeight[ rowIdx ] || 1) * (table.borderHeight[i] || 1);

		let txt = table.texts[i]
		let gridCell = {
			text: txt,
			x: offsetX,
			y: offsetY,
			z: table.z,
			width: width,
			height: height,
			textHeight: table.textHeight[i] || height  * 0.618,
			cellType: table.cellType[i] || 'text',
			cellMerge: table.cellMerge[i] || 0,
		}
		table.cells.push(gridCell)

		if (i % table.colCount === (table.colCount - 1)) {
			offsetX = table.x
			offsetY += table.rowHeight[ rowIdx ] || 1
		} else {
			offsetX += table.colWidth[ colIdx ] || 1
		}	
	}

	delete table.texts
	delete table.rowHeight
	delete table.colWidth
	delete table.textHeight
	delete table.cellType
	delete table.cellMerge
	delete table.borderWidth
	delete table.borderHeight

	return table
}

export default { TYPE, process }