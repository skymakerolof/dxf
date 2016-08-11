'use strict';

const fs = require('fs');
const keys = require('lodash.keys');
const assert = require('chai').assert;

const lib = require('../..');

describe('Group entities', () => {

  it('by layer', () => {

    const parsed = lib.parseString(
      fs.readFileSync(__dirname + '/../resources/floorplan.dxf', 'utf-8'));
    const entities = lib.denormalise(parsed);
    const byLayer = lib.groupEntitiesByLayer(entities);

    assert.deepEqual(keys(byLayer), [
      '0',
      'A-DIMS-1',
      'A-NOTE',
      'ANNTEXT',
      'A-TEXT',
      'xref-Bishop-Overland-08$0$A-WALL',
      'xref-Bishop-Overland-08$0$A-CASE-1',
      'xref-Bishop-Overland-08$0$A-OPENING',
      'xref-Bishop-Overland-08$0$A-GARAGE-DOOR',
      'xref-Bishop-Overland-08$0$S-STEM-WALL',
      'xref-Bishop-Overland-08$0$S-FOOTER',
      'xref-Bishop-Overland-08$0$A-HEADER',
      'xref-Bishop-Overland-08$0$R-BEAM',
      'xref-Bishop-Overland-08$0$A-FOOTPRINT',
      'xref-Bishop-Overland-08$0$S-SLAB',
      'xref-Bishop-Overland-08$0$TEMP',
      'xref-Bishop-Overland-08$0$A-FIXTURE'
    ]);

    const layerEntityCounts = keys(byLayer).map(layer => {
      return byLayer[layer].length;
    });
    assert.deepEqual(layerEntityCounts,
      [2, 55, 131, 45, 1, 177, 199, 159, 1, 26, 87, 27, 8, 5, 1, 3, 2]);
  });

});
