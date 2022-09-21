import common from './common'

export const TYPE = 'LWPOLYLINE'

export const process = (tuples) => {
  let vertex
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 70:
          entity.closed = (value & 1) === 1
          break
        case 10:
          vertex = {
            x: value,
            y: 0,
          }
          entity.vertices.push(vertex)
          break
        case 20:
          vertex.y = value
          break
        case 39:
          entity.thickness = value
          break
        case 42:
          // Bulge (multiple entries; one entry for each vertex)  (optional; default = 0).
          vertex.bulge = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      vertices: [],
    },
  )
}

export default { TYPE, process }
