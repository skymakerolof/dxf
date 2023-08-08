export const TYPE = 'VERTEX'

const ensureFaces = (entity) => {
  entity.faces = entity.faces || []
  if ('x' in entity && !entity.x) delete entity.x
  if ('y' in entity && !entity.y) delete entity.y
  if ('z' in entity && !entity.z) delete entity.z
}

export const process = (tuples) => {
  return tuples.reduce((entity, tuple) => {
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
      case 42:
        entity.bulge = value
        break
      case 71:
        ensureFaces(entity)
        entity.faces[0] = value
        break
      case 72:
        ensureFaces(entity)
        entity.faces[1] = value
        break
      case 73:
        ensureFaces(entity)
        entity.faces[2] = value
        break
      case 74:
        ensureFaces(entity)
        entity.faces[3] = value
        break
      default:
        break
    }
    return entity
  }, {})
}

export default { TYPE, process }
