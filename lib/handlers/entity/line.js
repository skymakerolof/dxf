'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'LINE';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        entity.start.x = value;
        break;
      case 20:
        entity.start.y = value;
        break;
      case 30:
        entity.start.z = value;
        break;
      case 39:
        entity.thickness = value;
        break;
      case 11:
        entity.end.x = value;
        break;
      case 21:
        entity.end.y = value;
        break;
      case 31:
        entity.end.z = value;
        break;
      default:
        Object.assign(entity, (0, _common2.default)(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE,
    start: {},
    end: {}
  });
};

exports.default = { TYPE: TYPE, process: process };