import common from './common'

export const TYPE = '3DFACE'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          entity.vertices[0].x = value
          break
        case 20:
          entity.vertices[0].y = value
          break
        case 30:
          entity.vertices[0].z = value
          break
        case 11:
          entity.vertices[1].x = value
          break
        case 21:
          entity.vertices[1].y = value
          break
        case 31:
          entity.vertices[1].z = value
          break
        case 12:
          entity.vertices[2].x = value
          break
        case 22:
          entity.vertices[2].y = value
          break
        case 32:
          entity.vertices[2].z = value
          break
        case 13:
          entity.vertices[3].x = value
          break
        case 23:
          entity.vertices[3].y = value
          break
        case 33:
          entity.vertices[3].z = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      vertices: [{}, {}, {}, {}],
    },
  )
}

export default { TYPE, process }
