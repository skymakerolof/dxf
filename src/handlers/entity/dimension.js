import common from './common'

export const TYPE = 'DIMENSION'

export const process = (tuples) => {
  return tuples.reduce((entity, tuple) => {
    const type = tuple[0]
    const value = tuple[1]
    switch (type) {
      case 2:
        entity.block = value
        break
      case 10:
        entity.start.x = value
        break
      case 20:
        entity.start.y = value
        break
      case 30:
        entity.start.z = value
        break
      case 11:
        entity.textMidpoint.x = value
        break
      case 21:
        entity.textMidpoint.y = value
        break
      case 31:
        entity.textMidpoint.z = value
        break
      case 13:
        entity.measureStart.x = value
        break
      case 23:
        entity.measureStart.y = value
        break
      case 33:
        entity.measureStart.z = value
        break
      case 14:
        entity.measureEnd.x = value
        break
      case 24:
        entity.measureEnd.y = value
        break
      case 34:
        entity.measureEnd.z = value
        break
      case 70:
        entity.dimensionType = value
        break
      case 71:
        entity.attachementPoint = value
        break
      case 210:
        entity.extrudeDirection.x = value
        break
      case 220:
        entity.extrudeDirection.y = value
        break
      case 230:
        entity.extrudeDirection.z = value
        break
      default:
        Object.assign(entity, common(type, value))
        break
    }
    return entity
  }, {
    type: TYPE,
    block: '',
    start: { x: 0, y: 0, z: 0 },
    measureStart: { x: 0, y: 0, z: 0 },
    measureEnd: { x: 0, y: 0, z: 0 },
    textMidpoint: { x: 0, y: 0, z: 0 },
    attachementPoint: 1,
    dimensionType: 0,
    extrudeDirection: { x: 0, y: 0, z: 0 }
  })
}

export default { TYPE, process }
