'use strict';

const common = require('./common');

const TYPE = 'POLYLINE';

module.exports.TYPE = TYPE;

module.exports.process = (tuples) => {

  return tuples.reduce((entity, tuple) => {
    const type = tuple[0];
    const value = tuple[1];
    switch (type) {
      case 70:
        entity.closed = (value & 1) === 1;
        break;
      case 39:
        entity.thickness = value;
        break;
      default:
        Object.assign(entity, common(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE,
    vertices: [],
  });
};
