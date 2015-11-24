let trip = require('triptych');
let Model = trip.Model;

let dxf = require('../../../');

class DXFModel extends Model {

  constructor(contents) {
    super();

    var collection = dxf.parseString(contents);
    this.polylines = dxf.interpolate(collection.gatherDisplayEntities());
  }

}

module.exports = DXFModel;
