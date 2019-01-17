import cloneDeep from 'lodash.clonedeep'

import logger from './util/logger'

export default (parseResult) => {
  const blocksByName = parseResult.blocks.reduce((acc, b) => {
    acc[b.name] = b
    return acc
  }, {})

  const gatherEntities = (entities, transforms) => {
    let current = []
    entities.forEach((e) => {
      if (e.type === 'INSERT') {
        const insert = e
        const block = blocksByName[insert.block]
        if (!block) {
          logger.error('no block found for insert. block:', insert.block)
          return
        }
        const t = {
          x: -block.x + insert.x,
          y: -block.y + insert.y,
          xScale: insert.xscale,
          yScale: insert.yscale,
          rotation: insert.rotation
        }
        // Add the insert transform and recursively add entities
        const transforms2 = transforms.slice(0)
        transforms2.push(t)

        // Use the insert layer
        const blockEntities = block.entities.map((be) => {
          const be2 = cloneDeep(be)
          be2.layer = insert.layer
          return be2
        })
        current = current.concat(gatherEntities(blockEntities, transforms2))
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        const e2 = cloneDeep(e)
        e2.transforms = transforms.slice().reverse()
        current.push(e2)
      }
    })
    return current
  }

  return gatherEntities(parseResult.entities, [])
}
