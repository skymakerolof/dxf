import common from './common'

export const TYPE = 'VIEWPORT'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 1:
          entity.layout = parseFloat(value)
          break
        case 10:
          entity.center.x = parseFloat(value)
          break
        case 20:
          entity.center.y = parseFloat(value)
          break
        case 30:
          entity.center.z = parseFloat(value)
          break
        case 12:
          entity.centerDCS.x = parseFloat(value)
          break
        case 22:
          entity.centerDCS.y = parseFloat(value)
          break
        case 13:
          entity.snap.x = parseFloat(value)
          break
        case 23:
          entity.snap.y = parseFloat(value)
          break
        case 14:
          entity.snapSpacing.x = parseFloat(value)
          break
        case 24:
          entity.snapSpacing.y = parseFloat(value)
          break
        case 15:
          entity.gridSpacing.x = parseFloat(value)
          break
        case 25:
          entity.gridSpacing.y = parseFloat(value)
          break
        case 16:
          entity.direction.x = parseFloat(value)
          break
        case 26:
          entity.direction.y = parseFloat(value)
          break
        case 36:
          entity.direction.z = parseFloat(value)
          break
        case 17:
          entity.target.x = parseFloat(value)
          break
        case 27:
          entity.target.y = parseFloat(value)
          break
        case 37:
          entity.target.z = parseFloat(value)
          break
        case 40:
          entity.width = parseFloat(value)
          break
        case 41:
          entity.height = parseFloat(value)
          break
        case 50:
          entity.snapAngle = parseFloat(value)
          break
        case 51:
          entity.angle = parseFloat(value)
          break
        case 68:
          entity.status = value
          break
        case 69:
          entity.id = value
          break
        case 90:
          entity.flags = value
          break
        case 110:
          entity.x = parseFloat(value)
          break
        case 120:
          entity.y = parseFloat(value)
          break
        case 130:
          entity.z = parseFloat(value)
          break
        case 111:
          entity.xAxisX = parseFloat(value)
          break
        case 121:
          entity.xAxisY = parseFloat(value)
          break
        case 131:
          entity.xAxisZ = parseFloat(value)
          break
        case 112:
          entity.xAxisX = parseFloat(value)
          break
        case 122:
          entity.xAxisY = parseFloat(value)
          break
        case 132:
          entity.xAxisZ = parseFloat(value)
          break
        case 146:
          entity.elevation = parseFloat(value)
          break
        case 281:
          entity.render = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      center: {},
      centerDCS: {},
      snap: {},
      snapSpacing: {},
      gridSpacing: {},
      direction: {},
      target: {},
    },
  )
}

export default { TYPE, process }
