var fs = require('fs');
var path = require('path');

var dxf = require('..');
var floorPlan1 = fs.readFileSync(path.join(__dirname, 'floorplan1.dxf'), 'utf-8');
var collection = dxf.parseString(floorPlan1);

console.log(collection.header);
console.log(collection.blocks);
console.log(collection.lines);
console.log(collection.lwpolylines);
console.log(collection.circles);
console.log(collection.arcs);
