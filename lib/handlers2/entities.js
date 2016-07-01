'use strict';

const handlers = [
  require('./entity/point'),
  require('./entity/line'),
  require('./entity/lwpolyline'),
  require('./entity/circle'),
  require('./entity/arc'),
  require('./entity/ellipse'),
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

  entityGroups.forEach((tuples) => {
    const entityType = tuples[0][1];
    const contentTuples = tuples.slice(1);
    if (handlers.hasOwnProperty(entityType)) {
      try {
        entities.push(handlers[entityType].process(contentTuples));
      } catch (e) {
        console.log('!!!', handlers[entityType]);
      }
    } else {
      console.warn('unsupported entity type:', entityType);
    }
  });

  return entities;
};
