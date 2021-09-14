export default (entity) => {
  // workaround: hide special entity
  if (entity.colorNumber === 0 && entity.lineTypeName === 'ByBlock' && entity.type === 'LINE') {
    return 0
  }
  return 1
}
