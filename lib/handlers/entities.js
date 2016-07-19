'use strict';

const logger = require('../util/logger');
const handlers = [
  require('./entity/point'),
  require('./entity/line'),
  require('./entity/lwpolyline'),
  require('./entity/polyline'),
  require('./entity/vertex'),
  require('./entity/vertex'),
  require('./entity/circle'),
  require('./entity/arc'),
  require('./entity/ellipse'),
  require('./entity/spline'),
  require('./entity/solid'),
  require('./entity/mtext'),
  require('./entity/insert'),
].reduce((acc, mod) => {
  acc[mod.TYPE] = mod;
  return acc;
}, {});

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

  let currentPolyline;
  entityGroups.forEach((tuples) => {
    const entityType = tuples[0][1];
    const contentTuples = tuples.slice(1);

    if (handlers.hasOwnProperty(entityType)) {
      const e = handlers[entityType].process(contentTuples);
      // "POLYLINE" cannot be parsed in isolation, it is followed by
      // N "VERTEX" entities and ended with a "SEQEND" entity.
      // Essentially we convert POLYLINE to LWPOLYLINE - the extra
      // vertex flags are not supported
      if (entityType === 'POLYLINE') {
        currentPolyline = e;
        entities.push(e);
      } else if (entityType === 'VERTEX') {
        if (currentPolyline) {
          currentPolyline.vertices.push(e);
        } else {
          logger.error('ignoring invalid VERTEX entity');
        }
      } else if (entityType === 'SEQEND') {
        currentPolyline = undefined;
      } else {
        // All other entities
        entities.push(e);
      }
    } else {
      logger.warn('unsupported type in ENTITIES section:', entityType);
    }
  });

  return entities;
};
