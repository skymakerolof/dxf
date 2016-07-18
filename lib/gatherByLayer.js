'use strict';

const cloneDeep = require('lodash.clonedeep');

const colors = require('./util/colors');

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
          console.error('no block found for insert. block:', insert.block);
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

        // Use the insert layer
        const blockEntities = block.entities.map((be) => {
          const be2 = cloneDeep(be);
          be2.layer = insert.layer;
          return be2;
        });
        current = current.concat(gatherEntities(blockEntities, transforms2));
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
      const layerTable = parseResult.tables.layers[e.layer];
      // console.log('!!!', e.layer, layerTable);
      const c = colors[layerTable.colorNumber];
      acc[e.layer] = {
        color: c,
        entities: [],
      };
    }
    acc[e.layer].entities.push(e);
    return acc;
  }, {});

};
