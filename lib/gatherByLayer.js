'use strict';

const cloneDeep = require('lodash.clonedeep');

module.exports = (parseResult) => {

  const blocksByName = parseResult.blocks.reduce((acc, b) => {
    acc[b.name] = b;
    return acc;
  }, {});

  const gatherEntities = (entities, transforms) => {
    let current = [];
    entities.forEach((e) => {
      if (e.type === 'INSERT') {
        const insert = e;
        const block = blocksByName[insert.block];
        if (!block) {
          console.error('no block found for insert');
          return;
        }
        const t = {
          x: insert.x + block.x,
          y: insert.y + block.y,
          xScale: insert.xscale,
          yScale: insert.yscale,
          rotation: insert.rotation,
        };
        // Add the insert transform and recursively add entities
        const transforms2 = transforms.slice(0);
        transforms2.push(t);
        current = current.concat(gatherEntities(block.entities, transforms2));
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        const e2 = cloneDeep(e);
        e2.transforms = transforms.slice().reverse();
        current.push(e2);
      }
    });
    return current;
  };

  // Start at the top level
  const gathered = gatherEntities(parseResult.entities, []);

  // Organise by layer
  return gathered.reduce((acc, e) => {
    if (!acc.hasOwnProperty(e.layer)) {
      acc[e.layer] = [];
    }
    acc[e.layer].push(e);
    return acc;
  }, {});

};
