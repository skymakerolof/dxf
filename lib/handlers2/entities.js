'use strict';

const lineHandler = require('./entity/line');
const lwpolylineHandler = require('./entity/lwpolyline');
const circleHandler = require('./entity/circle');
const arcHandler = require('./entity/arc');
const ellipseHandler = require('./entity/ellipse');

module.exports = (tuples) => {

  const entities = [];
  const entityGroups = [];
  let currentEntityTuples;

  // First group them together for easy processing
  tuples.forEach((tuple) => {
    const type = tuple[0];
    if (type === 0) {
      currentEntityTuples = [];
      entityGroups.push(currentEntityTuples);
    }
    currentEntityTuples.push(tuple);
  });

  entityGroups.forEach((tuples) => {
    const entityType = tuples[0][1];
    const contentTuples = tuples.slice(1);
    switch(entityType) {
      case 'LINE':
        entities.push(lineHandler(contentTuples));
        break;
      case 'LWPOLYLINE':
        entities.push(lwpolylineHandler(contentTuples));
        break;
      case 'CIRCLE':
        entities.push(circleHandler(contentTuples));
        break;
      case 'ARC':
        entities.push(arcHandler(contentTuples));
        break;
      case 'ELLIPSE':
        entities.push(ellipseHandler(contentTuples));
        break;
      default:
        console.warn('unsupported entity type:', tuples[0]);
    }
  });

  return entities;
};
