import common from './common'

export const TYPE = 'OLE2FRAME'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 70:
          entity.version = value
          break
        case 3:
          entity.name = value
          break
        case 10:
          entity.upperLeftX = value
          break
        case 20:
          entity.upperLeftY = value
          break
        case 30:
          entity.upperLeftZ = value
          break
        case 11:
          entity.lowerRightX = value
          break
        case 21:
          entity.lowerRightY = value
          break
        case 31:
          entity.lowerRightZ = value
          break
        case 71:
          // 1 = Link; 2 = Embedded; 3 = Static
          entity.objectType = value
          break
        case 72:
          // 0 = Object resides in model space, 1 = Object resides in paper space
          entity.tile = value
          break
        case 90:
          entity.length = value
          break
        case 310:
          entity.data += value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      data: '',
    },
  )
}

export default { TYPE, process }
