import logger from '../util/logger'
import point from './entity/point'
import line from './entity/line'
import lwpolyline from './entity/lwpolyline'
import polyline from './entity/polyline'
import vertex from './entity/vertex'
import circle from './entity/circle'
import arc from './entity/arc'
import ellipse from './entity/ellipse'
import spline from './entity/spline'
import solid from './entity/solid'
import hatch from './entity/hatch'
import mtext from './entity/mtext'
import attdef from './entity/attdef'
import attrib from './entity/attrib'
import insert from './entity/insert'
import threeDFace from './entity/threeDFace'
import dimension from './entity/dimension'
import text from './entity/text'
import viewport from './entity/viewport'

const handlers = [
  point,
  line,
  lwpolyline,
  polyline,
  vertex,
  circle,
  arc,
  ellipse,
  spline,
  solid,
  hatch,
  mtext,
  attdef,
  attrib,
  text,
  insert,
  dimension,
  threeDFace,
  viewport,
].reduce((acc, mod) => {
  acc[mod.TYPE] = mod
  return acc
}, {})

export default (tuples) => {
  const entities = []
  const entityGroups = []
  let currentEntityTuples

  // First group them together for easy processing
  tuples.forEach((tuple) => {
    const type = tuple[0]
    if (type === 0) {
      currentEntityTuples = []
      entityGroups.push(currentEntityTuples)
    }
    currentEntityTuples.push(tuple)
  })

  let currentPolyline
  entityGroups.forEach((tuples) => {
    const entityType = tuples[0][1]
    const contentTuples = tuples.slice(1)

    if (handlers[entityType] !== undefined) {
      const e = handlers[entityType].process(contentTuples)
      // "POLYLINE" cannot be parsed in isolation, it is followed by
      // N "VERTEX" entities and ended with a "SEQEND" entity.
      // Essentially we convert POLYLINE to LWPOLYLINE - the extra
      // vertex flags are not supported
      if (entityType === 'POLYLINE') {
        currentPolyline = e
        entities.push(e)
      } else if (entityType === 'VERTEX') {
        if (currentPolyline) {
          currentPolyline.vertices.push(e)
        } else {
          logger.error('ignoring invalid VERTEX entity')
        }
      } else if (entityType === 'SEQEND') {
        currentPolyline = undefined
      } else {
        // All other entities
        entities.push(e)
      }
    } else {
      logger.warn('unsupported type in ENTITIES section:', entityType)
    }
  })

  return entities
}
