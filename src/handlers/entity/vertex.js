export const TYPE = 'VERTEX'

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
      default:
        break
    }
    return entity
  }, {})
}

export default { TYPE, process }
