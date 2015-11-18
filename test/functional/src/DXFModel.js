let trip = require('triptych');
let Model = trip.Model;

let dxf = require('../../../');

class DXFModel extends Model {

  constructor(contents) {
    super();

    var parser = dxf.createParser();
    var collector = dxf.createCollector(parser);
    parser.parseString(contents);
    this.polylines = dxf.interpolate(collector);
  }

}

module.exports = DXFModel;
