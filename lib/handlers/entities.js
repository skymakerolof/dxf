'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = require('../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _point = require('./entity/point');

var _point2 = _interopRequireDefault(_point);

var _line = require('./entity/line');

var _line2 = _interopRequireDefault(_line);

var _lwpolyline = require('./entity/lwpolyline');

var _lwpolyline2 = _interopRequireDefault(_lwpolyline);

var _polyline = require('./entity/polyline');

var _polyline2 = _interopRequireDefault(_polyline);

var _vertex = require('./entity/vertex');

var _vertex2 = _interopRequireDefault(_vertex);

var _circle = require('./entity/circle');

var _circle2 = _interopRequireDefault(_circle);

var _arc = require('./entity/arc');

var _arc2 = _interopRequireDefault(_arc);

var _ellipse = require('./entity/ellipse');

var _ellipse2 = _interopRequireDefault(_ellipse);

var _spline = require('./entity/spline');

var _spline2 = _interopRequireDefault(_spline);

var _solid = require('./entity/solid');

var _solid2 = _interopRequireDefault(_solid);

var _mtext = require('./entity/mtext');

var _mtext2 = _interopRequireDefault(_mtext);

var _insert = require('./entity/insert');

var _insert2 = _interopRequireDefault(_insert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlers = [_point2.default, _line2.default, _lwpolyline2.default, _polyline2.default, _vertex2.default, _circle2.default, _arc2.default, _ellipse2.default, _spline2.default, _solid2.default, _mtext2.default, _insert2.default].reduce(function (acc, mod) {
  acc[mod.TYPE] = mod;
  return acc;
}, {});

exports.default = function (tuples) {
  var entities = [];
  var entityGroups = [];
  var currentEntityTuples = void 0;

  // First group them together for easy processing
  tuples.forEach(function (tuple) {
    var type = tuple[0];
    if (type === 0) {
      currentEntityTuples = [];
      entityGroups.push(currentEntityTuples);
    }
    currentEntityTuples.push(tuple);
  });

  var currentPolyline = void 0;
  entityGroups.forEach(function (tuples) {
    var entityType = tuples[0][1];
    var contentTuples = tuples.slice(1);

    if (handlers.hasOwnProperty(entityType)) {
      var e = handlers[entityType].process(contentTuples);
      // "POLYLINE" cannot be parsed in isolation, it is followed by
      // N "VERTEX" entities and ended with a "SEQEND" entity.
      // Essentially we convert POLYLINE to LWPOLYLINE - the extra
      // vertex flags are not supported
      if (entityType === 'POLYLINE') {
        currentPolyline = e;
        entities.push(e);
      } else if (entityType === 'VERTEX') {
        if (currentPolyline) {
          currentPolyline.vertices.push(e);
        } else {
          _logger2.default.error('ignoring invalid VERTEX entity');
        }
      } else if (entityType === 'SEQEND') {
        currentPolyline = undefined;
      } else {
        // All other entities
        entities.push(e);
      }
    } else {
      _logger2.default.warn('unsupported type in ENTITIES section:', entityType);
    }
  });

  return entities;
};