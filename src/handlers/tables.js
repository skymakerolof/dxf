import logger from '../util/logger'

const ltypeHandler = (tuples) => {
  let element = null
  let offset = null
  return tuples.reduce(
    (layer, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      // https://documentation.help/AutoCAD-DXF/WS1a9193826455f5ff18cb41610ec0a2e719-7a4f.htm
      switch (type) {
        case 2:
          layer.name = value
          break
        case 3:
          layer.description = value
          break
        case 70:
          // Standard flag values (bit-coded values):
          //  16 = If set, table entry is externally dependent on an xref
          //  32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully resolved
          //  64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)
          layer.flag = value
          break
        case 72:
          // Alignment code (value is always 65, the ASCII code for A):
          layer.alignment = value
          break
        case 73:
          layer.elementCount = parseInt(value)
          break
        case 40:
          layer.patternLength = value
          break
        case 49:
          {
            element = Object.create({ scales: [], offset: [] })
            element.length = value
            layer.pattern.push(element)
          }
          break
        case 74:
          // Complex linetype element type (one per element). Default is 0 (no embedded shape/text) (bit-coded values)
          //  1 = If set, code 50 specifies an absolute rotation; if not set, code 50 specifies a relative rotation
          //  2 = Embedded element is a text string
          //  4 = Embedded element is a shape
          element.shape = value
          break
        case 75:
          element.shapeNumber = value
          break
        case 340:
          element.styleHandle = value
          break
        case 46:
          element.scales.push(value)
          break
        case 50:
          element.rotation = value
          break
        case 44:
          offset = Object.create({ x: value, y: 0 })
          element.offset.push(offset)
          break
        case 45:
          offset.y = value
          break
        case 9:
          element.text = value
          break
        default:
      }
      return layer
    },
    { type: 'LTYPE', pattern: [] },
  )
}

const layerHandler = (tuples) => {
  return tuples.reduce(
    (layer, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/layer_dxf_04.htm
      switch (type) {
        case 2:
          layer.name = value
          break
        case 6:
          layer.lineTypeName = value
          break
        case 62:
          layer.colorNumber = value
          break
        case 70:
          layer.flags = value
          break
        case 290:
          layer.plot = parseInt(value) !== 0
          break
        case 370:
          layer.lineWeightEnum = value
          break
        default:
      }
      return layer
    },
    { type: 'LAYER' },
  )
}

const styleHandler = (tuples) => {
  return tuples.reduce(
    (style, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          style.name = value
          break
        case 6:
          style.lineTypeName = value
          break
        case 40:
          style.fixedTextHeight = value
          break
        case 41:
          style.widthFactor = value
          break
        case 50:
          style.obliqueAngle = value
          break
        case 71:
          style.flags = value
          break
        case 42:
          style.lastHeightUsed = value
          break
        case 3:
          style.primaryFontFileName = value
          break
        case 4:
          style.bigFontFileName = value
          break
        default:
      }
      return style
    },
    { type: 'STYLE' },
  )
}

const vPortHandler = (tuples) => {
  return tuples.reduce(
    (vport, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          vport.name = value
          break
        case 5:
          vport.handle = value
          break
        case 70:
          vport.flags = value
          break
        case 10:
          vport.lowerLeft.x = parseFloat(value)
          break
        case 20:
          vport.lowerLeft.y = parseFloat(value)
          break
        case 11:
          vport.upperRight.x = parseFloat(value)
          break
        case 21:
          vport.upperRight.y = parseFloat(value)
          break
        case 12:
          vport.center.x = parseFloat(value)
          break
        case 22:
          vport.center.y = parseFloat(value)
          break
        case 14:
          vport.snapSpacing.x = parseFloat(value)
          break
        case 24:
          vport.snapSpacing.y = parseFloat(value)
          break
        case 15:
          vport.gridSpacing.x = parseFloat(value)
          break
        case 25:
          vport.gridSpacing.y = parseFloat(value)
          break
        case 16:
          vport.direction.x = parseFloat(value)
          break
        case 26:
          vport.direction.y = parseFloat(value)
          break
        case 36:
          vport.direction.z = parseFloat(value)
          break
        case 17:
          vport.target.x = parseFloat(value)
          break
        case 27:
          vport.target.y = parseFloat(value)
          break
        case 37:
          vport.target.z = parseFloat(value)
          break
        case 45:
          vport.height = parseFloat(value)
          break
        case 50:
          vport.snapAngle = parseFloat(value)
          break
        case 51:
          vport.angle = parseFloat(value)
          break
        case 110:
          vport.x = parseFloat(value)
          break
        case 120:
          vport.y = parseFloat(value)
          break
        case 130:
          vport.z = parseFloat(value)
          break
        case 111:
          vport.xAxisX = parseFloat(value)
          break
        case 121:
          vport.xAxisY = parseFloat(value)
          break
        case 131:
          vport.xAxisZ = parseFloat(value)
          break
        case 112:
          vport.xAxisX = parseFloat(value)
          break
        case 122:
          vport.xAxisY = parseFloat(value)
          break
        case 132:
          vport.xAxisZ = parseFloat(value)
          break
        case 146:
          vport.elevation = parseFloat(value)
          break
        default:
      }
      return vport
    },
    {
      type: 'VPORT',
      center: {},
      lowerLeft: {},
      upperRight: {},
      snap: {},
      snapSpacing: {},
      gridSpacing: {},
      direction: {},
      target: {},
    },
  )
}

const tableHandler = (tuples, tableType, handler) => {
  const tableRowsTuples = []

  let tableRowTuples
  tuples.forEach((tuple) => {
    const type = tuple[0]
    const value = tuple[1]
    if ((type === 0 || type === 2) && value === tableType) {
      tableRowTuples = []
      tableRowsTuples.push(tableRowTuples)
    } else {
      tableRowTuples.push(tuple)
    }
  })

  return tableRowsTuples.reduce((acc, rowTuples) => {
    const tableRow = handler(rowTuples)
    if (tableRow.name) {
      acc[tableRow.name] = tableRow
    } else {
      logger.warn('table row without name:', tableRow)
    }
    return acc
  }, {})
}

export default (tuples) => {
  const tableGroups = []
  let tableTuples
  tuples.forEach((tuple) => {
    // const type = tuple[0];
    const value = tuple[1]
    if (value === 'TABLE') {
      tableTuples = []
      tableGroups.push(tableTuples)
    } else if (value === 'ENDTAB') {
      tableGroups.push(tableTuples)
    } else {
      tableTuples.push(tuple)
    }
  })

  let stylesTuples = []
  let layersTuples = []
  let vPortTuples = []
  let ltypeTuples = []
  tableGroups.forEach((group) => {
    if (group[0][1] === 'STYLE') {
      stylesTuples = group
    } else if (group[0][1] === 'LTYPE') {
      ltypeTuples = group
    } else if (group[0][1] === 'LAYER') {
      layersTuples = group
    } else if (group[0][1] === 'VPORT') {
      vPortTuples = group
    }
  })

  return {
    layers: tableHandler(layersTuples, 'LAYER', layerHandler),
    styles: tableHandler(stylesTuples, 'STYLE', styleHandler),
    vports: tableHandler(vPortTuples, 'VPORT', vPortHandler),
    ltypes: tableHandler(ltypeTuples, 'LTYPE', ltypeHandler),
  }
}
