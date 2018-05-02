'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'ARC';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        entity.x = value;
        break;
      case 20:
        entity.y = value;
        break;
      case 30:
        entity.z = value;
        break;
      case 39:
        entity.thickness = value;
        break;
      case 40:
        entity.r = value;
        break;
      case 50:
        // Some idiot decided that ELLIPSE angles are in radians but
        // ARC angles are in degrees
        entity.startAngle = value / 180 * Math.PI;
        break;
      case 51:
        entity.endAngle = value / 180 * Math.PI;
        break;
      default:
        Object.assign(entity, (0, _common2.default)(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE
  });
};

exports.default = { TYPE: TYPE, process: process };