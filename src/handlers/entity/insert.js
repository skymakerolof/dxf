import common from './common'

export const TYPE = 'INSERT'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          entity.block = value
          break
        case 10:
          entity.x = value
          break
        case 20:
          entity.y = value
          break
        case 30:
          entity.z = value
          break
        case 41:
          entity.scaleX = value
          break
        case 42:
          entity.scaleY = value
          break
        case 43:
          entity.scaleZ = value
          break
        case 44:
          entity.columnSpacing = value
          break
        case 45:
          entity.rowSpacing = value
          break
        case 50:
          entity.rotation = value
          break
        case 70:
          entity.columnCount = value
          break
        case 71:
          entity.rowCount = value
          break
        case 210:
          entity.extrusionX = value
          break
        case 220:
          entity.extrusionY = value
          break
        case 230:
          entity.extrusionZ = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
    },
  )
}

export default { TYPE, process }
