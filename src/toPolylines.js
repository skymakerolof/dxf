import { Box2 } from 'vecks'

import colors from './util/colors'
import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import applyTransforms from './applyTransforms'
import logger from './util/logger'

export default (parsed) => {
  const entities = denormalise(parsed)
  const polylines = entities.map((entity) => {
    const layerTable = parsed.tables.layers[entity.layer]
    let rgb
    if (layerTable) {
      const colorNumber =
        'colorNumber' in entity ? entity.colorNumber : layerTable.colorNumber
      rgb = colors[colorNumber]
      if (rgb === undefined) {
        logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
        rgb = [0, 0, 0]
      }
    } else {
      logger.warn('no layer table for layer:' + entity.layer)
      rgb = [0, 0, 0]
    }

    return {
      rgb,
      vertices: applyTransforms(entityToPolyline(entity), entity.transforms),
    }
  })

  const bbox = new Box2()
  polylines.forEach((polyline) => {
    polyline.vertices.forEach((vertex) => {
      bbox.expandByPoint({ x: vertex[0], y: vertex[1] })
    })
  })

  return { bbox, polylines }
}
