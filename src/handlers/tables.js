import logger from '../util/logger'

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
      center: {},
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
  tableGroups.forEach((group) => {
    if (group[0][1] === 'STYLE') {
      stylesTuples = group
    } else if (group[0][1] === 'LTYPE') {
      logger.warn('LTYPE in tables not supported')
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
  }
}
