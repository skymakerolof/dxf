var fs = require('fs');
// var assert = require('chai').assert;

var dxf = require('../..');

function createTest(type) {
  return function() {
    var dxfString = fs.readFileSync(__dirname + '/../resources/' + type + '.dxf', 'utf-8');

    var parser = dxf.createParser();
    var collector = dxf.createCollector(parser);

    parser.parseString(dxfString);

    var svg = collector.toSVG('0');
    fs.writeFileSync(__dirname + '/output/' + type + '.output.svg', svg, 'utf-8');
  };
}

describe.only('svg entities', function() {

  it('lines', createTest('lines'));
  it('polylines', createTest('polylines'));
  it('circlesellipsesarcs', createTest('circlesellipsesarcs'));
  it('splines', createTest('splines'));

});
