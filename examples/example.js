var fs = require('fs');
var path = require('path');

var dxf = require('..');
var floorPlan1 = fs.readFileSync(path.join(__dirname, 'floorplan1.dxf'), 'utf-8');

var parser = dxf.createParser();
var collector = new dxf.createCollector(parser);
parser.parseString(floorPlan1);

console.log(collector.header);
console.log(collector.blocks);
console.log(collector.lines);
console.log(collector.lwpolylines);
console.log(collector.circles);
console.log(collector.arcs);