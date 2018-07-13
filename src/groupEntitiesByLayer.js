export default (entities) => {
  return entities.reduce((acc, entity) => {
    const layer = entity.layer
    if (!acc[layer]) {
      acc[layer] = []
    }
    acc[layer].push(entity)
    return acc
  }, {})
}
