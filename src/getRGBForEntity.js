import colors from './util/colors'
import logger from './util/logger'

export default (layers, entity) => {
  const layerTable = layers[entity.layer]
  if (layerTable) {
    const colorDefinedInEntity =
      'colorNumber' in entity && entity.colorNumber !== 256
    const colorNumber = colorDefinedInEntity
      ? entity.colorNumber
      : layerTable.colorNumber
    const rgb = colors[colorNumber]
    if (rgb) {
      return rgb
    } else {
      logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
      return [0, 0, 0]
    }
  } else {
    logger.warn('no layer table for layer:' + entity.layer)
    return [0, 0, 0]
  }
}
