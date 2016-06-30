const $ = require('triptych').$;

const splineEntitiesDXF = require("raw!../../resources/spline_entities.dxf");

const DXFController = require('./DXFController');

new DXFController(splineEntitiesDXF, '#viewport');
