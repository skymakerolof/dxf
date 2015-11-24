var Parser = require('./Parser');
var ASCIILineHandler = require('./handlers/ASCIILineHandler');
var CommonValueHandler = require('./handlers/CommonValueHandler');
var StyleHandler = require('./handlers/style');
var LTypeHandler = require('./handlers/ltype');
var LayerHandler = require('./handlers/layer');
var HeaderHandler = require('./handlers/header');
var BlocksHandler = require('./handlers/blocks');
var BlockHandler = require('./handlers/block');
var EntitiesHandler = require('./handlers/entities');
var TableHandler = require('./handlers/tables');
var SectionsHandler = require('./handlers/sections');
var LWPolylineHandler = require('./handlers/lwpolyline');
var LineHandler = require('./handlers/line');
var SplineHandler = require('./handlers/spline');
var CircleHandler = require('./handlers/circle');
var HatchHandler = require('./handlers/hatch');
var ArcHandler = require('./handlers/arc');
var EllipseHandler = require('./handlers/ellipse');
var TextHandler = require('./handlers/text');
var InsertHandler = require('./handlers/insert');
var DimensionHandler = require('./handlers/dimension');

function createParser() {
  var parser = new Parser();
  new ASCIILineHandler(parser);
  new SectionsHandler(parser);
  new HeaderHandler(parser);
  new BlocksHandler(parser);
  new BlockHandler(parser);
  new EntitiesHandler(parser);
  new TableHandler(parser);
  new LWPolylineHandler(parser, CommonValueHandler);
  new LineHandler(parser, CommonValueHandler);
  new SplineHandler(parser, CommonValueHandler);
  new CircleHandler(parser, CommonValueHandler);
  new EllipseHandler(parser, CommonValueHandler);
  new HatchHandler(parser, CommonValueHandler);
  new ArcHandler(parser, CommonValueHandler);
  new TextHandler(parser, CommonValueHandler);
  new InsertHandler(parser, CommonValueHandler);
  new DimensionHandler(parser, CommonValueHandler);
  new StyleHandler(parser);
  new LTypeHandler(parser);
  new LayerHandler(parser);
  return parser;
}

module.exports.createParser = createParser;

var Accumulator = require('./Accumulator');

module.exports.createAccumulator = function(parser) {
  return new Accumulator(parser);
};

module.exports.parseString = function(string) {
  var parser = createParser();
  var acc = new Accumulator(parser);
  parser.parseString(string);
  return acc.collection;
};

module.exports.BoundingBox = require('./BoundingBox');
module.exports.interpolate = require('./interpolate');
module.exports.toSVG = require('./to-svg');
