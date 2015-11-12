let $ = require('triptych').$;

let linesDXF = require("raw!../../resources/lines.dxf");
let DXFController = require('./DXFController');

new DXFController(linesDXF, '#lines');

function resize() {
  $('td .viewport').css('height', $('td .viewport').width() + 'px');
}
$(window).resize(resize);
resize();
