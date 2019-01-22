import { Box2 } from 'vecks'

import logger from './util/logger'


const circle = (entity) => {
  console.log('**', entity)
  const bbox = new Box2()
    .expandByPoint({
      x: entity.x + entity.r,
      y: entity.y + entity.r
    })
    .expandByPoint({
      x: entity.x - entity.r,
      y: entity.y - entity.r
    })
  const element = `<circle cx=${entity.x} cy=${entity.y} r=${entity.r} />`
  return { bbox, element }
}

const entityToBoundsAndElement = (entity) => {
  switch (entity.type) {
    case 'CIRCLE': return circle(entity)
    default:
      logger.warn('entity type not supported in SVG rendering:', entity.type)
      return null
  }
}

export default (entities) => {
  const { bbox, elements } = entities.reduce((acc, entity) => {
    const result = entityToBoundsAndElement(entity)
    if (result) {
      const { bbox, element } = result
      acc.bbox.expandByPoint(bbox.min)
      acc.bbox.expandByPoint(bbox.max)
      acc.elements.push(element)
    }
    return acc
  }, {
    bbox: new Box2(),
    elements: []
  })
  console.log('@@', bbox)

  const viewBox = bbox.min.x === Infinity
    ? { x: 0, y: 0, width: 0, height: 0 }
    : { x: bbox.min.x, y: -bbox.max.y, width: bbox.max.x - bbox.min.x, height: bbox.max.y - bbox.min.y }

  return `
<?xml version="1.0"?>
<svg
  xmlns="http://www.w3.org/2000/svg
  xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"'
  preserveAspectRatio="xMinYMin meet"'
  viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
  width="100%" height="100%"
>
  <g stroke="#000" stroke-width="1%" fill="none" transform="matrix(1,0,0,-1,0,0)">
    <path  d="M 0 0 L 1 1" />
    ${elements.join('\n')}
  </g>
</svg>`
}
