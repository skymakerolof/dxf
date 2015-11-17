let $ = require('triptych').$;

let linesDXF = require("raw!../../resources/lines.dxf");
let polylinesDXF = require("raw!../../resources/lwpolylines.dxf");
let circlesEllipsesArcsDXF = require("raw!../../resources/circlesellipsesarcs.dxf");
let splinesDXF = require("raw!../../resources/splines.dxf");

let DXFController = require('./DXFController');


new DXFController(linesDXF, '#lines');
new DXFController(polylinesDXF, '#lwpolylines');
new DXFController(circlesEllipsesArcsDXF, '#circlesellipsesarcs');
new DXFController(splinesDXF, '#splines');

function resize() {
  $('td .viewport').css('height', $('td .viewport').width() + 'px');
}
$(window).resize(resize);
resize();
