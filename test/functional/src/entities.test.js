let $ = require('triptych').$;

let linesDXF = require("raw!../../resources/lines.dxf");
let polylinesDXF = require("raw!../../resources/lwpolylines.dxf");
let DXFController = require('./DXFController');

new DXFController(linesDXF, '#lines');
new DXFController(polylinesDXF, '#lwpolylines');

function resize() {
  $('td .viewport').css('height', $('td .viewport').width() + 'px');
}
$(window).resize(resize);
resize();
