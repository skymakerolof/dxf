'use strict';

const entitiesHandler = require('./entities');

module.exports = function(tuples) {

  let state;
  const blocks = [];
  let block;
  let entitiesTuples = [];

  tuples.forEach((tuple) => {
    const type = tuple[0];
    const value = tuple[1];

    if (value === 'BLOCK') {
      console.log('BLOCK');
      state = 'block';
      block = {};
      blocks.push(block);
    } else if (value === 'ENDBLK') {
      console.log('ENDBLK');
      if (state === 'entities') {
        block.entities = entitiesHandler(entitiesTuples);
      }
      state = undefined;
    } else if ((state === 'block') && (type !== 0)) {
      switch (type) {
        case 1:
          block.xref = value;
          break;
        case 2:
          block.name = value;
          console.log('BLKNAME', value);
          break;
        case 10:
          block.x = value;
          break;
        case 20:
          block.y = value;
          break;
        case 30:
          block.z = value;
          break;
        default:
          break;
      }
    } else if ((state === 'block') && (type === 0)) {
      state = 'entities';
      entitiesTuples.push(tuple);
    } else if (state === 'entities') {
      entitiesTuples.push(tuple);
    }
  });

  return blocks;
};
