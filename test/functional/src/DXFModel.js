let trip = require('triptych');
let Model = trip.Model;

let dxf = require('../../../');

class DXFModel extends Model {

  constructor(contents) {
    super();

    var parser = dxf.createParser();
    var collector = dxf.createCollector(parser);
    parser.parseString(contents);
    var polylines = dxf.toPolylines(collector);
    console.log(polylines);
  }

}

module.exports = DXFModel;
