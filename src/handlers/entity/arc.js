import common from './common'

export const TYPE = 'ARC'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.x = value
          break
        case 20:
          entity.y = value
          break
        case 30:
          entity.z = value
          break
        case 39:
          entity.thickness = value
          break
        case 40:
          entity.r = value
          break
        case 50:
          // *Someone* decided that ELLIPSE angles are in radians but
          // ARC angles are in degrees
          entity.startAngle = (value / 180) * Math.PI
          break
        case 51:
          entity.endAngle = (value / 180) * Math.PI
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
