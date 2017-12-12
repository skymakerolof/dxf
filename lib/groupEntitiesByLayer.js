'use strict';

module.exports = function (entities) {
  return entities.reduce(function (acc, entity) {
    var layer = entity.layer;
    if (!acc[layer]) {
      acc[layer] = [];
    }
    acc[layer].push(entity);
    return acc;
  }, {});
};