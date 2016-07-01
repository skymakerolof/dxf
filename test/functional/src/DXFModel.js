'use strict';

const tripcore = require('trip.core');
const Model = tripcore.Model;

const lib = require('../../../');

class DXFModel extends Model {

  constructor(contents) {
    super();
    const collection = lib.parseString(contents);
    this.polylines = lib.interpolate(collection.gatherDisplayEntities());
  }

}

module.exports = DXFModel;
