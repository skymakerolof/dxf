'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'POLYLINE';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 70:
        entity.closed = (value & 1) === 1;
        entity.polygonMesh = (value & 16) === 16;
        entity.polyfaceMesh = (value & 64) === 64;
        break;
      case 39:
        entity.thickness = value;
        break;
      default:
        Object.assign(entity, (0, _common2.default)(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE,
    vertices: []
  });
};

exports.default = { TYPE: TYPE, process: process };