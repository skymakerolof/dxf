var fs = require('fs');
// var assert = require('chai').assert;

var dxf = require('../..');

function createTest(type) {
  return function() {
    var dxfString = fs.readFileSync(__dirname + '/../resources/' + type + '.dxf', 'utf-8');

    var parser = dxf.createParser();
    var collector = dxf.createCollector(parser);

    parser.parseString(dxfString);

    var svg = dxf.toSVG(collector);
    fs.writeFileSync(__dirname + '/output/' + type + '.output.svg', svg, 'utf-8');
  };
}

describe.only('svg entities', function() {

  it('lines', createTest('lines'));
  it('polylines', createTest('polylines'));
  it('circlesellipsesarcs', createTest('circlesellipsesarcs'));
  it('splines', createTest('splines'));
  it('texts', createTest('texts'));
  it('dimensions', createTest('dimensions'));
  it('layers', createTest('layers'));
  it('blocks', createTest('blocks'));
  it('hatches', createTest('hatches'));

});
