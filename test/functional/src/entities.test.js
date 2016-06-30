const $ = require('triptych').$;

// let linesDXF = require("raw!../../resources/lines.dxf");
// let polylinesDXF = require("raw!../../resources/lwpolylines.dxf");
// let circlesEllipsesArcsDXF = require("raw!../../resources/circlesellipsesarcs.dxf");
// let splinesDXF = require("raw!../../resources/splines.dxf");
// let layersDXF = require("raw!../../resources/layers.dxf");
// let blocksDXF = require("raw!../../resources/blocks.dxf");
const splineEntitiesDXF = require("raw!../../resources/spline_entities.dxf");

const DXFController = require('./DXFController');

//
// new DXFController(linesDXF, '#lines');
// new DXFController(polylinesDXF, '#lwpolylines');
// new DXFController(circlesEllipsesArcsDXF, '#circlesellipsesarcs');
// new DXFController(splinesDXF, '#splines');
// new DXFController(layersDXF, '#layers');
// new DXFController(blocksDXF, '#blocks');
new DXFController(splineEntitiesDXF, '#spline_entities');

function resize() {
  $('td .viewport').css('height', $('td .viewport').width() + 'px');
}
$(window).resize(resize);
resize();
