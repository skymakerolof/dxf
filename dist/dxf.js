(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dxf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BoundingBox = function () {
  function BoundingBox() {
    _classCallCheck(this, BoundingBox);

    var minX = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minY = Infinity;

    Object.defineProperty(this, 'minX', {
      get: function get() {
        return minX;
      }
    });

    Object.defineProperty(this, 'maxX', {
      get: function get() {
        return maxX;
      }
    });

    Object.defineProperty(this, 'maxY', {
      get: function get() {
        return maxY;
      }
    });

    Object.defineProperty(this, 'minY', {
      get: function get() {
        return minY;
      }
    });

    Object.defineProperty(this, 'width', {
      get: function get() {
        return maxX - minX;
      }
    });

    Object.defineProperty(this, 'height', {
      get: function get() {
        return maxY - minY;
      }
    });

    this.expandByPoint = function (x, y) {
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
      }
    };
  }

  _createClass(BoundingBox, [{
    key: 'toString',
    value: function toString() {
      return 'min: ' + this.minX + ',' + this.minY + ' max: ' + this.maxX + ',' + this.maxY;
    }
  }, {
    key: 'expandByTranslatedBox',
    value: function expandByTranslatedBox(box, x, y) {
      this.expandByPoint(box.minX + x, box.maxY + y);
      this.expandByPoint(box.maxX + x, box.minY + y);
    }
  }, {
    key: 'expandByBox',
    value: function expandByBox(box) {
      this.expandByPoint(box.minX, box.maxY);
      this.expandByPoint(box.maxX, box.minY);
    }
  }]);

  return BoundingBox;
}();

exports.default = BoundingBox;
},{}],2:[function(require,module,exports){
"use strict";

module.exports = {
  verbose: false
};
},{}],3:[function(require,module,exports){
'use strict';

var cloneDeep = require('lodash.clonedeep');

var logger = require('./util/logger');

module.exports = function (parseResult) {
  var blocksByName = parseResult.blocks.reduce(function (acc, b) {
    acc[b.name] = b;
    return acc;
  }, {});

  var gatherEntities = function gatherEntities(entities, transforms) {
    var current = [];
    entities.forEach(function (e) {
      if (e.type === 'INSERT') {
        var insert = e;
        var block = blocksByName[insert.block];
        if (!block) {
          logger.error('no block found for insert. block:', insert.block);
          return;
        }
        var t = {
          x: insert.x + block.x,
          y: insert.y + block.y,
          xScale: insert.xscale,
          yScale: insert.yscale,
          rotation: insert.rotation
          // Add the insert transform and recursively add entities
        };var transforms2 = transforms.slice(0);
        transforms2.push(t);

        // Use the insert layer
        var blockEntities = block.entities.map(function (be) {
          var be2 = cloneDeep(be);
          be2.layer = insert.layer;
          return be2;
        });
        current = current.concat(gatherEntities(blockEntities, transforms2));
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        var e2 = cloneDeep(e);
        e2.transforms = transforms.slice().reverse();
        current.push(e2);
      }
    });
    return current;
  };

  return gatherEntities(parseResult.entities, []);
};
},{"./util/logger":27,"lodash.clonedeep":39}],4:[function(require,module,exports){
'use strict';

var bspline = require('b-spline');

var logger = require('./util/logger');

var createArcForLWPolyine = require('./util/createArcForLWPolyline');

/**
 * Rotate a set of points
 * @param points the points
 * @param angle the rotation angle
 */
var rotate = function rotate(points, angle) {
  return points.map(function (p) {
    return [p[0] * Math.cos(angle) - p[1] * Math.sin(angle), p[1] * Math.cos(angle) + p[0] * Math.sin(angle)];
  });
};

/**
 * @param cx center X
 * @param cy center Y
 * @param rx radius X
 * @param ry radius Y
 * @param start start angle in radians
 * @param start end angle in radians
 */
var interpolateElliptic = function interpolateElliptic(cx, cy, rx, ry, start, end, rotationAngle) {
  if (end < start) {
    end += Math.PI * 2;
  }

  // ----- Relative points -----

  // Start point
  var points = [];
  var dTheta = Math.PI * 2 / 72;
  var EPS = 1e-6;
  for (var theta = start; theta < end - EPS; theta += dTheta) {
    points.push([Math.cos(theta) * rx, Math.sin(theta) * ry]);
  }
  points.push([Math.cos(end) * rx, Math.sin(end) * ry]);

  // ----- Rotate -----
  if (rotationAngle) {
    points = rotate(points, rotationAngle);
  }

  // ----- Offset center -----
  points = points.map(function (p) {
    return [cx + p[0], cy + p[1]];
  });

  return points;
};

var applyTransforms = function applyTransforms(polyline, transforms) {
  transforms.forEach(function (transform) {
    polyline = polyline.map(function (p) {
      // Use a copy to avoid side effects
      var p2 = [p[0], p[1]];
      if (transform.xScale) {
        p2[0] = p2[0] * transform.xScale;
      }
      if (transform.yScale) {
        p2[1] = p2[1] * transform.yScale;
      }
      if (transform.rotation) {
        var angle = transform.rotation / 180 * Math.PI;
        p2 = [p2[0] * Math.cos(angle) - p2[1] * Math.sin(angle), p2[1] * Math.cos(angle) + p2[0] * Math.sin(angle)];
      }
      if (transform.x) {
        p2[0] = p2[0] + transform.x;
      }
      if (transform.y) {
        p2[1] = p2[1] + transform.y;
      }
      return p2;
    });
  });
  return polyline;
};

/**
 * Convert a parsed DXF entity to a polyline. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */
module.exports = function (entity) {
  var polyline = void 0;

  if (entity.type === 'LINE') {
    polyline = [[entity.start.x, entity.start.y], [entity.end.x, entity.end.y]];
  }

  if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
    polyline = [];
    if (entity.polygonMesh || entity.polyfaceMesh) {
      // Do not attempt to render meshes
    } else if (entity.vertices.length) {
      if (entity.closed) {
        entity.vertices = entity.vertices.concat(entity.vertices[0]);
      }
      for (var i = 0, il = entity.vertices.length; i < il - 1; ++i) {
        var from = [entity.vertices[i].x, entity.vertices[i].y];
        var to = [entity.vertices[i + 1].x, entity.vertices[i + 1].y];
        polyline.push(from);
        if (entity.vertices[i].bulge) {
          polyline = polyline.concat(createArcForLWPolyine(from, to, entity.vertices[i].bulge));
        }
        // The last iteration of the for loop
        if (i === il - 2) {
          polyline.push(to);
        }
      }
    } else {
      logger.warn('Polyline entity with no vertices');
    }
  }

  if (entity.type === 'CIRCLE') {
    polyline = interpolateElliptic(entity.x, entity.y, entity.r, entity.r, 0, Math.PI * 2);
  }

  if (entity.type === 'ELLIPSE') {
    var rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY);
    var ry = entity.axisRatio * rx;
    var majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX);
    polyline = interpolateElliptic(entity.x, entity.y, rx, ry, entity.startAngle, entity.endAngle, majorAxisRotation);
    var flipY = entity.extrusionZ === -1;
    if (flipY) {
      polyline = polyline.map(function (p) {
        return [-(p[0] - entity.x) + entity.x, p[1]];
      });
    }
  }

  if (entity.type === 'ARC') {
    // Why on earth DXF has degree start & end angles for arc,
    // and radian start & end angles for ellipses is a mystery
    polyline = interpolateElliptic(entity.x, entity.y, entity.r, entity.r, entity.startAngle, entity.endAngle, undefined, false);

    // I kid you not, ARCs and ELLIPSEs handle this differently,
    // as evidenced by how AutoCAD actually renders these entities
    var _flipY = entity.extrusionZ === -1;
    if (_flipY) {
      polyline = polyline.map(function (p) {
        return [-p[0], p[1]];
      });
    }
  }

  if (entity.type === 'SPLINE') {
    var controlPoints = entity.controlPoints.map(function (p) {
      return [p.x, p.y];
    });
    var degree = entity.degree;
    var knots = entity.knots;
    polyline = [];
    // In trying to keep the polyline size to a reasonable value,
    // the number of interpolated points is proportional to the
    // number of control points
    var numInterpolations = controlPoints.length * 100;

    for (var t = 0; t <= numInterpolations; t += 1) {
      // https://github.com/bjnortier/dxf/issues/28
      // b-spline interpolation can fail due to a floating point
      // error - ignore these until the lib is fixed
      try {
        var p = bspline(t / numInterpolations, degree, controlPoints, knots);
        polyline.push(p);
      } catch (e) {
        // ignore this point
      }
    }
  }

  if (!polyline) {
    logger.warn('unsupported entity for converting to polyline:', entity.type);
    return [];
  }
  return applyTransforms(polyline, entity.transforms);
};
},{"./util/createArcForLWPolyline":26,"./util/logger":27,"b-spline":28}],5:[function(require,module,exports){
'use strict';

module.exports = function (entities) {
  return entities.reduce(function (acc, entity) {
    var layer = entity.layer;
    if (!acc[layer]) {
      acc[layer] = [];
    }
    acc[layer].push(entity);
    return acc;
  }, {});
};
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _entities = require('./entities');

var _entities2 = _interopRequireDefault(_entities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (tuples) {
  var state = void 0;
  var blocks = [];
  var block = void 0;
  var entitiesTuples = [];

  tuples.forEach(function (tuple) {
    var type = tuple[0];
    var value = tuple[1];

    if (value === 'BLOCK') {
      state = 'block';
      block = {};
      entitiesTuples = [];
      blocks.push(block);
    } else if (value === 'ENDBLK') {
      if (state === 'entities') {
        block.entities = (0, _entities2.default)(entitiesTuples);
      } else {
        block.entities = [];
      }
      entitiesTuples = undefined;
      state = undefined;
    } else if (state === 'block' && type !== 0) {
      switch (type) {
        case 1:
          block.xref = value;
          break;
        case 2:
          block.name = value;
          break;
        case 10:
          block.x = value;
          break;
        case 20:
          block.y = value;
          break;
        case 30:
          block.z = value;
          break;
        default:
          break;
      }
    } else if (state === 'block' && type === 0) {
      state = 'entities';
      entitiesTuples.push(tuple);
    } else if (state === 'entities') {
      entitiesTuples.push(tuple);
    }
  });

  return blocks;
};
},{"./entities":7}],7:[function(require,module,exports){
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
},{"../util/logger":27,"./entity/arc":8,"./entity/circle":9,"./entity/ellipse":11,"./entity/insert":12,"./entity/line":13,"./entity/lwpolyline":14,"./entity/mtext":15,"./entity/point":16,"./entity/polyline":17,"./entity/solid":18,"./entity/spline":19,"./entity/vertex":20}],8:[function(require,module,exports){
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
},{"./common":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'CIRCLE';

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
      case 40:
        entity.r = value;
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
},{"./common":10}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (type, value) {
  switch (type) {
    case 6:
      // Linetype name (present if not BYLAYER).
      // The special name BYBLOCK indicates a
      // floating linetype. (optional)
      return {
        lineTypeName: value
      };
    case 8:
      return {
        layer: value
      };
    case 48:
      // Linetype scale (optional)
      return {
        lineTypeScale: value
      };
    case 60:
      // Object visibility (optional): 0 = visible, 1 = invisible.
      return {
        visible: value === 0
      };
    case 62:
      // Color number (present if not BYLAYER).
      // Zero indicates the BYBLOCK (floating) color.
      // 256 indicates BYLAYER.
      // A negative value indicates that the layer is turned off. (optional)
      return {
        colorNumber: value
      };
    case 210:
      return {
        extrusionX: value
      };
    case 220:
      return {
        extrusionY: value
      };
    case 230:
      return {
        extrusionZ: value
      };
    default:
      return {};
  }
};
},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'ELLIPSE';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        entity.x = value;
        break;
      case 11:
        entity.majorX = value;
        break;
      case 20:
        entity.y = value;
        break;
      case 21:
        entity.majorY = value;
        break;
      case 30:
        entity.z = value;
        break;
      case 31:
        entity.majorZ = value;
        break;
      case 40:
        entity.axisRatio = value;
        break;
      case 41:
        entity.startAngle = value;
        break;
      case 42:
        entity.endAngle = value;
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
},{"./common":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'INSERT';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 2:
        entity.block = value;
        break;
      case 10:
        entity.x = value;
        break;
      case 20:
        entity.y = value;
        break;
      case 30:
        entity.z = value;
        break;
      case 41:
        entity.xscale = value;
        break;
      case 42:
        entity.yscale = value;
        break;
      case 43:
        entity.zscale = value;
        break;
      case 44:
        entity.columnSpacing = value;
        break;
      case 45:
        entity.rowSpacing = value;
        break;
      case 50:
        entity.rotation = value;
        break;
      case 70:
        entity.columnCount = value;
        break;
      case 71:
        entity.rowCount = value;
        break;
      case 210:
        entity.xExtrusion = value;
        break;
      case 220:
        entity.yExtrusion = value;
        break;
      case 230:
        entity.zExtrusion = value;
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
},{"./common":10}],13:[function(require,module,exports){
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
},{"./common":10}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'LWPOLYLINE';

var process = exports.process = function process(tuples) {
  var vertex = void 0;
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 70:
        entity.closed = (value & 1) === 1;
        break;
      case 10:
        vertex = {
          x: value,
          y: 0
        };
        entity.vertices.push(vertex);
        break;
      case 20:
        vertex.y = value;
        break;
      case 39:
        entity.thickness = value;
        break;
      case 42:
        // Bulge (multiple entries; one entry for each vertex)  (optional; default = 0).
        vertex.bulge = value;
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
},{"./common":10}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'MTEXT';

var simpleCodes = {
  10: 'x',
  20: 'y',
  30: 'z',
  40: 'nominalTextHeight',
  41: 'refRectangleWidth',
  71: 'attachmentPoint',
  72: 'drawingDirection',
  7: 'styleName',
  11: 'xAxisX',
  21: 'xAxisY',
  31: 'xAxisZ',
  42: 'horizontalWidth',
  43: 'verticalHeight',
  73: 'lineSpacingStyle',
  44: 'lineSpacingFactor',
  90: 'backgroundFill',
  420: 'bgColorRGB0',
  421: 'bgColorRGB1',
  422: 'bgColorRGB2',
  423: 'bgColorRGB3',
  424: 'bgColorRGB4',
  425: 'bgColorRGB5',
  426: 'bgColorRGB6',
  427: 'bgColorRGB7',
  428: 'bgColorRGB8',
  429: 'bgColorRGB9',
  430: 'bgColorName0',
  431: 'bgColorName1',
  432: 'bgColorName2',
  433: 'bgColorName3',
  434: 'bgColorName4',
  435: 'bgColorName5',
  436: 'bgColorName6',
  437: 'bgColorName7',
  438: 'bgColorName8',
  439: 'bgColorName9',
  45: 'fillBoxStyle',
  63: 'bgFillColor',
  441: 'bgFillTransparency',
  75: 'columnType',
  76: 'columnCount',
  78: 'columnFlowReversed',
  79: 'columnAutoheight',
  48: 'columnWidth',
  49: 'columnGutter',
  50: 'columnHeights'
};

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];

    if (simpleCodes.hasOwnProperty(type)) {
      entity[simpleCodes[type]] = value;
    } else if (type === 1 || type === 3) {
      entity.string += value;
    } else if (type === 50) {
      // Rotation angle in radians
      entity.xAxisX = Math.cos(value);
      entity.xAxisY = Math.sin(value);
    } else {
      Object.assign(entity, (0, _common2.default)(type, value));
    }

    return entity;
  }, {
    type: TYPE,
    string: ''
  });
};

exports.default = { TYPE: TYPE, process: process };
},{"./common":10}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'POINT';

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
},{"./common":10}],17:[function(require,module,exports){
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
},{"./common":10}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'SOLID';

var process = exports.process = function process(tuples) {
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        entity.corners[0].x = value;
        break;
      case 20:
        entity.corners[0].y = value;
        break;
      case 30:
        entity.corners[0].z = value;
        break;
      case 11:
        entity.corners[1].x = value;
        break;
      case 21:
        entity.corners[1].y = value;
        break;
      case 31:
        entity.corners[1].z = value;
        break;
      case 12:
        entity.corners[2].x = value;
        break;
      case 22:
        entity.corners[2].y = value;
        break;
      case 32:
        entity.corners[2].z = value;
        break;
      case 13:
        entity.corners[3].x = value;
        break;
      case 23:
        entity.corners[3].y = value;
        break;
      case 33:
        entity.corners[3].z = value;
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
    corners: [{}, {}, {}, {}]
  });
};

exports.default = { TYPE: TYPE, process: process };
},{"./common":10}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.TYPE = undefined;

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE = exports.TYPE = 'SPLINE';

var process = exports.process = function process(tuples) {
  var controlPoint = void 0;
  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        controlPoint = {
          x: value,
          y: 0
        };
        entity.controlPoints.push(controlPoint);
        break;
      case 20:
        controlPoint.y = value;
        break;
      case 30:
        controlPoint.z = value;
        break;
      case 40:
        entity.knots.push(value);
        break;
      case 42:
        entity.knotTolerance = value;
        break;
      case 43:
        entity.controlPointTolerance = value;
        break;
      case 44:
        entity.fitTolerance = value;
        break;
      case 70:
        // Spline flag (bit coded):
        // 1 = Closed spline
        // 2 = Periodic spline
        // 4 = Rational spline
        // 8 = Planar
        // 16 = Linear (planar bit is also set)
        entity.flag = value;
        entity.closed = (value & 1) === 1;
        break;
      case 71:
        entity.degree = value;
        break;
      case 72:
        entity.numberOfKnots = value;
        break;
      case 73:
        entity.numberOfControlPoints = value;
        break;
      case 74:
        entity.numberOfFitPoints = value;
        break;
      default:
        Object.assign(entity, (0, _common2.default)(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE,
    controlPoints: [],
    knots: []
  });
};

exports.default = { TYPE: TYPE, process: process };
},{"./common":10}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TYPE = exports.TYPE = 'VERTEX';

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
      case 42:
        entity.bulge = value;
        break;
      default:
        break;
    }
    return entity;
  }, {});
};

exports.default = { TYPE: TYPE, process: process };
},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (tuples) {
  var state = void 0;
  var header = {};

  tuples.forEach(function (tuple) {
    var type = tuple[0];
    var value = tuple[1];

    switch (value) {
      case '$EXTMIN':
        header.extMin = {};
        state = 'extMin';
        return;
      case '$EXTMAX':
        header.extMax = {};
        state = 'extMax';
        return;
      default:
        if (state === 'extMin') {
          switch (type) {
            case 10:
              header.extMin.x = value;
              break;
            case 20:
              header.extMin.y = value;
              break;
            case 30:
              header.extMin.z = value;
              state = undefined;
              break;
          }
        }
        if (state === 'extMax') {
          switch (type) {
            case 10:
              header.extMax.x = value;
              break;
            case 20:
              header.extMax.y = value;
              break;
            case 30:
              header.extMax.z = value;
              state = undefined;
              break;
          }
        }
    }
  });

  return header;
};
},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = require('../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var layerHandler = function layerHandler(tuples) {
  return tuples.reduce(function (layer, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/layer_dxf_04.htm
    switch (type) {
      case 2:
        layer.name = value;
        break;
      case 6:
        layer.lineTypeName = value;
        break;
      case 62:
        layer.colorNumber = value;
        break;
      case 70:
        layer.flags = value;
        break;
      case 290:
        layer.plot = parseInt(value) !== 0;
        break;
      case 370:
        layer.lineWeightEnum = value;
        break;
      default:
    }
    return layer;
  }, { type: 'LAYER' });
};

var styleHandler = function styleHandler(tuples) {
  return tuples.reduce(function (style, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 2:
        style.name = value;
        break;
      case 6:
        style.lineTypeName = value;
        break;
      case 40:
        style.fixedTextHeight = value;
        break;
      case 41:
        style.widthFactor = value;
        break;
      case 50:
        style.obliqueAngle = value;
        break;
      case 71:
        style.flags = value;
        break;
      case 42:
        style.lastHeightUsed = value;
        break;
      case 3:
        style.primaryFontFileName = value;
        break;
      case 4:
        style.bigFontFileName = value;
        break;
      default:
    }
    return style;
  }, { type: 'STYLE' });
};

var tableHandler = function tableHandler(tuples, tableType, handler) {
  var tableRowsTuples = [];

  var tableRowTuples = void 0;
  tuples.forEach(function (tuple) {
    var type = tuple[0];
    var value = tuple[1];
    if ((type === 0 || type === 2) && value === tableType) {
      tableRowTuples = [];
      tableRowsTuples.push(tableRowTuples);
    } else {
      tableRowTuples.push(tuple);
    }
  });

  return tableRowsTuples.reduce(function (acc, rowTuples) {
    var tableRow = handler(rowTuples);
    if (tableRow.name) {
      acc[tableRow.name] = tableRow;
    } else {
      _logger2.default.warn('table row without name:', tableRow);
    }
    return acc;
  }, {});
};

exports.default = function (tuples) {
  var tableGroups = [];
  var tableTuples = void 0;
  tuples.forEach(function (tuple) {
    // const type = tuple[0];
    var value = tuple[1];
    if (value === 'TABLE') {
      tableTuples = [];
      tableGroups.push(tableTuples);
    } else if (value === 'ENDTAB') {
      tableGroups.push(tableTuples);
    } else {
      tableTuples.push(tuple);
    }
  });

  var stylesTuples = [];
  var layersTuples = [];
  tableGroups.forEach(function (group) {
    if (group[0][1] === 'STYLE') {
      stylesTuples = group;
    } else if (group[0][1] === 'LTYPE') {
      _logger2.default.warn('LTYPE in tables not supported');
    } else if (group[0][1] === 'LAYER') {
      layersTuples = group;
    }
  });

  return {
    layers: tableHandler(layersTuples, 'LAYER', layerHandler),
    styles: tableHandler(stylesTuples, 'STYLE', styleHandler)
  };
};
},{"../util/logger":27}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.entityToPolyline = exports.toSVG = exports.groupEntitiesByLayer = exports.denormalise = exports.BoundingBox = exports.colors = exports.config = exports.parseString = undefined;

var _header = require('./handlers/header');

var _header2 = _interopRequireDefault(_header);

var _tables = require('./handlers/tables');

var _tables2 = _interopRequireDefault(_tables);

var _blocks = require('./handlers/blocks');

var _blocks2 = _interopRequireDefault(_blocks);

var _entities = require('./handlers/entities');

var _entities2 = _interopRequireDefault(_entities);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _BoundingBox = require('./BoundingBox');

var _BoundingBox2 = _interopRequireDefault(_BoundingBox);

var _denormalise = require('./denormalise');

var _denormalise2 = _interopRequireDefault(_denormalise);

var _groupEntitiesByLayer = require('./groupEntitiesByLayer');

var _groupEntitiesByLayer2 = _interopRequireDefault(_groupEntitiesByLayer);

var _toSVG = require('./toSVG');

var _toSVG2 = _interopRequireDefault(_toSVG);

var _colors = require('./util/colors');

var _colors2 = _interopRequireDefault(_colors);

var _entityToPolyline = require('./entityToPolyline');

var _entityToPolyline2 = _interopRequireDefault(_entityToPolyline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toLines = function toLines(string) {
  var lines = string.split(/\r\n|\r|\n/g);
  var contentLines = lines.filter(function (l) {
    return l.trim !== 'EOF';
  });
  return contentLines;
};

// Parse the value into the native representation
var parseValue = function parseValue(type, value) {
  if (type >= 10 && type < 60) {
    return parseFloat(value, 10);
  } else if (type >= 210 && type < 240) {
    return parseFloat(value, 10);
  } else if (type >= 60 && type < 100) {
    return parseInt(value, 10);
  } else {
    return value;
  }
};

// Content lines are alternate lines of type and value
var convertToTypesAndValues = function convertToTypesAndValues(contentLines) {
  var state = 'type';
  var type = void 0;
  var typesAndValues = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = contentLines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (state === 'type') {
        type = parseInt(line, 10);
        state = 'value';
      } else {
        typesAndValues.push([type, parseValue(type, line)]);
        state = 'type';
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return typesAndValues;
};

var separateSections = function separateSections(tuples) {
  var sectionTuples = void 0;
  return tuples.reduce(function (sections, tuple) {
    if (tuple[0] === 0 && tuple[1] === 'SECTION') {
      sectionTuples = [];
    } else if (tuple[0] === 0 && tuple[1] === 'ENDSEC') {
      sections.push(sectionTuples);
      sectionTuples = undefined;
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple);
    }
    return sections;
  }, []);
};

// Each section start with the type tuple, then proceeds
// with the contents of the section
var reduceSection = function reduceSection(acc, section) {
  var sectionType = section[0][1];
  var contentTuples = section.slice(1);
  switch (sectionType) {
    case 'HEADER':
      acc.header = (0, _header2.default)(contentTuples);
      break;
    case 'TABLES':
      acc.tables = (0, _tables2.default)(contentTuples);
      break;
    case 'BLOCKS':
      acc.blocks = (0, _blocks2.default)(contentTuples);
      break;
    case 'ENTITIES':
      acc.entities = (0, _entities2.default)(contentTuples);
      break;
    default:
  }
  return acc;
};

var parseString = exports.parseString = function parseString(string) {
  var lines = toLines(string);
  var tuples = convertToTypesAndValues(lines);
  var sections = separateSections(tuples);
  var result = sections.reduce(reduceSection, {
    // In the event of empty sections
    header: {},
    blocks: [],
    entities: []
  });
  return result;
};

exports.config = _config2.default;
exports.colors = _colors2.default;
exports.BoundingBox = _BoundingBox2.default;
exports.denormalise = _denormalise2.default;
exports.groupEntitiesByLayer = _groupEntitiesByLayer2.default;
exports.toSVG = _toSVG2.default;
exports.entityToPolyline = _entityToPolyline2.default;
},{"./BoundingBox":1,"./config":2,"./denormalise":3,"./entityToPolyline":4,"./groupEntitiesByLayer":5,"./handlers/blocks":6,"./handlers/entities":7,"./handlers/header":21,"./handlers/tables":22,"./toSVG":24,"./util/colors":25}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prettyData = require('pretty-data');

var _BoundingBox = require('./BoundingBox');

var _BoundingBox2 = _interopRequireDefault(_BoundingBox);

var _denormalise = require('./denormalise');

var _denormalise2 = _interopRequireDefault(_denormalise);

var _entityToPolyline = require('./entityToPolyline');

var _entityToPolyline2 = _interopRequireDefault(_entityToPolyline);

var _colors = require('./util/colors');

var _colors2 = _interopRequireDefault(_colors);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var polylineToPath = function polylineToPath(rgb, polyline) {
  var color24bit = rgb[2] | rgb[1] << 8 | rgb[0] << 16;
  var prepad = color24bit.toString(16);
  for (var i = 0, il = 6 - prepad.length; i < il; ++i) {
    prepad = '0' + prepad;
  }
  var hex = '#' + prepad;

  // SVG is white by default, so make white lines black
  if (hex === '#ffffff') {
    hex = '#000000';
  }

  var d = polyline.reduce(function (acc, point, i) {
    acc += i === 0 ? 'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="' + hex + '" stroke-width="0.1%" d="' + d + '"/>';
};

/**
 * Convert the interpolate polylines to SVG
 */

exports.default = function (parsed) {
  var entities = (0, _denormalise2.default)(parsed);
  var polylines = entities.map(function (e) {
    return (0, _entityToPolyline2.default)(e);
  });

  var bbox = new _BoundingBox2.default();
  polylines.forEach(function (polyline) {
    polyline.forEach(function (point) {
      bbox.expandByPoint(point[0], point[1]);
    });
  });

  var paths = [];
  polylines.forEach(function (polyline, i) {
    var entity = entities[i];
    var layerTable = parsed.tables.layers[entity.layer];
    if (!layerTable) {
      throw new Error('no layer table for layer:' + entity.layer);
    }

    var colorNumber = 'colorNumber' in entity ? entity.colorNumber : layerTable.colorNumber;
    var rgb = _colors2.default[colorNumber];
    if (rgb === undefined) {
      _logger2.default.warn('Color index', colorNumber, 'invalid, defaulting to black');
      rgb = [0, 0, 0];
    }

    var p2 = polyline.map(function (p) {
      return [p[0], -p[1]];
    });
    paths.push(polylineToPath(rgb, p2));
  });

  var svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' + bbox.minX + ' ' + -bbox.maxY + ' ' + bbox.width + ' ' + bbox.height + '"';
  svgString += ' width="100%" height="100%">' + paths.join('') + '</svg>';
  return _prettyData.pd.xml(svgString);
};
},{"./BoundingBox":1,"./denormalise":3,"./entityToPolyline":4,"./util/colors":25,"./util/logger":27,"pretty-data":42}],25:[function(require,module,exports){
"use strict";

module.exports = [[0, 0, 0], [255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 255, 255], [65, 65, 65], [128, 128, 128], [255, 0, 0], [255, 170, 170], [189, 0, 0], [189, 126, 126], [129, 0, 0], [129, 86, 86], [104, 0, 0], [104, 69, 69], [79, 0, 0], [79, 53, 53], [255, 63, 0], [255, 191, 170], [189, 46, 0], [189, 141, 126], [129, 31, 0], [129, 96, 86], [104, 25, 0], [104, 78, 69], [79, 19, 0], [79, 59, 53], [255, 127, 0], [255, 212, 170], [189, 94, 0], [189, 157, 126], [129, 64, 0], [129, 107, 86], [104, 52, 0], [104, 86, 69], [79, 39, 0], [79, 66, 53], [255, 191, 0], [255, 234, 170], [189, 141, 0], [189, 173, 126], [129, 96, 0], [129, 118, 86], [104, 78, 0], [104, 95, 69], [79, 59, 0], [79, 73, 53], [255, 255, 0], [255, 255, 170], [189, 189, 0], [189, 189, 126], [129, 129, 0], [129, 129, 86], [104, 104, 0], [104, 104, 69], [79, 79, 0], [79, 79, 53], [191, 255, 0], [234, 255, 170], [141, 189, 0], [173, 189, 126], [96, 129, 0], [118, 129, 86], [78, 104, 0], [95, 104, 69], [59, 79, 0], [73, 79, 53], [127, 255, 0], [212, 255, 170], [94, 189, 0], [157, 189, 126], [64, 129, 0], [107, 129, 86], [52, 104, 0], [86, 104, 69], [39, 79, 0], [66, 79, 53], [63, 255, 0], [191, 255, 170], [46, 189, 0], [141, 189, 126], [31, 129, 0], [96, 129, 86], [25, 104, 0], [78, 104, 69], [19, 79, 0], [59, 79, 53], [0, 255, 0], [170, 255, 170], [0, 189, 0], [126, 189, 126], [0, 129, 0], [86, 129, 86], [0, 104, 0], [69, 104, 69], [0, 79, 0], [53, 79, 53], [0, 255, 63], [170, 255, 191], [0, 189, 46], [126, 189, 141], [0, 129, 31], [86, 129, 96], [0, 104, 25], [69, 104, 78], [0, 79, 19], [53, 79, 59], [0, 255, 127], [170, 255, 212], [0, 189, 94], [126, 189, 157], [0, 129, 64], [86, 129, 107], [0, 104, 52], [69, 104, 86], [0, 79, 39], [53, 79, 66], [0, 255, 191], [170, 255, 234], [0, 189, 141], [126, 189, 173], [0, 129, 96], [86, 129, 118], [0, 104, 78], [69, 104, 95], [0, 79, 59], [53, 79, 73], [0, 255, 255], [170, 255, 255], [0, 189, 189], [126, 189, 189], [0, 129, 129], [86, 129, 129], [0, 104, 104], [69, 104, 104], [0, 79, 79], [53, 79, 79], [0, 191, 255], [170, 234, 255], [0, 141, 189], [126, 173, 189], [0, 96, 129], [86, 118, 129], [0, 78, 104], [69, 95, 104], [0, 59, 79], [53, 73, 79], [0, 127, 255], [170, 212, 255], [0, 94, 189], [126, 157, 189], [0, 64, 129], [86, 107, 129], [0, 52, 104], [69, 86, 104], [0, 39, 79], [53, 66, 79], [0, 63, 255], [170, 191, 255], [0, 46, 189], [126, 141, 189], [0, 31, 129], [86, 96, 129], [0, 25, 104], [69, 78, 104], [0, 19, 79], [53, 59, 79], [0, 0, 255], [170, 170, 255], [0, 0, 189], [126, 126, 189], [0, 0, 129], [86, 86, 129], [0, 0, 104], [69, 69, 104], [0, 0, 79], [53, 53, 79], [63, 0, 255], [191, 170, 255], [46, 0, 189], [141, 126, 189], [31, 0, 129], [96, 86, 129], [25, 0, 104], [78, 69, 104], [19, 0, 79], [59, 53, 79], [127, 0, 255], [212, 170, 255], [94, 0, 189], [157, 126, 189], [64, 0, 129], [107, 86, 129], [52, 0, 104], [86, 69, 104], [39, 0, 79], [66, 53, 79], [191, 0, 255], [234, 170, 255], [141, 0, 189], [173, 126, 189], [96, 0, 129], [118, 86, 129], [78, 0, 104], [95, 69, 104], [59, 0, 79], [73, 53, 79], [255, 0, 255], [255, 170, 255], [189, 0, 189], [189, 126, 189], [129, 0, 129], [129, 86, 129], [104, 0, 104], [104, 69, 104], [79, 0, 79], [79, 53, 79], [255, 0, 191], [255, 170, 234], [189, 0, 141], [189, 126, 173], [129, 0, 96], [129, 86, 118], [104, 0, 78], [104, 69, 95], [79, 0, 59], [79, 53, 73], [255, 0, 127], [255, 170, 212], [189, 0, 94], [189, 126, 157], [129, 0, 64], [129, 86, 107], [104, 0, 52], [104, 69, 86], [79, 0, 39], [79, 53, 66], [255, 0, 63], [255, 170, 191], [189, 0, 46], [189, 126, 141], [129, 0, 31], [129, 86, 96], [104, 0, 25], [104, 69, 78], [79, 0, 19], [79, 53, 59], [51, 51, 51], [80, 80, 80], [105, 105, 105], [130, 130, 130], [190, 190, 190], [255, 255, 255]];
},{}],26:[function(require,module,exports){
'use strict';

var _vecks = require('vecks');

/**
 * Create the arcs point for a LWPOLYLINE. The start and end are excluded
 *
 * See diagram.png in this directory for description of points and angles used.
 */
module.exports = function (from, to, bulge, resolution) {
  // Resolution in degrees
  if (!resolution) {
    resolution = 5;
  }

  // If the bulge is < 0, the arc goes clockwise. So we simply
  // reverse a and b and invert sign
  // Bulge = tan(theta/4)
  var theta = void 0;
  var a = void 0;
  var b = void 0;

  if (bulge < 0) {
    theta = Math.atan(-bulge) * 4;
    a = new _vecks.V2(from[0], from[1]);
    b = new _vecks.V2(to[0], to[1]);
  } else {
    // Default is counter-clockwise
    theta = Math.atan(bulge) * 4;
    a = new _vecks.V2(to[0], to[1]);
    b = new _vecks.V2(from[0], from[1]);
  }

  var ab = b.sub(a);
  var lengthAB = ab.length();
  var c = a.add(ab.multiply(0.5));

  // Distance from center of arc to line between form and to points
  var lengthCD = Math.abs(lengthAB / 2 / Math.tan(theta / 2));
  var normAB = ab.norm();

  var d = void 0;
  if (theta < Math.PI) {
    var normDC = new _vecks.V2(normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2), normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2));
    // D is the center of the arc
    d = c.add(normDC.multiply(-lengthCD));
  } else {
    var normCD = new _vecks.V2(normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2), normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2));
    // D is the center of the arc
    d = c.add(normCD.multiply(lengthCD));
  }

  // Add points between start start and eng angle relative
  // to the center point
  var startAngle = Math.atan2(b.y - d.y, b.x - d.x) / Math.PI * 180;
  var endAngle = Math.atan2(a.y - d.y, a.x - d.x) / Math.PI * 180;
  if (endAngle < startAngle) {
    endAngle += 360;
  }
  var r = b.sub(d).length();

  var startInter = Math.floor(startAngle / resolution) * resolution + resolution;
  var endInter = Math.ceil(endAngle / resolution) * resolution - resolution;

  var points = [];
  for (var i = startInter; i <= endInter; i += resolution) {
    points.push(d.add(new _vecks.V2(Math.cos(i / 180 * Math.PI) * r, Math.sin(i / 180 * Math.PI) * r)));
  }
  // Maintain the right ordering to join the from and to points
  if (bulge < 0) {
    points.reverse();
  }
  return points.map(function (p) {
    return [p.x, p.y];
  });
};
},{"vecks":51}],27:[function(require,module,exports){
'use strict';

var config = require('../config');

function info() {
  if (config.verbose) {
    console.info.apply(undefined, arguments);
  }
}

function warn() {
  if (config.verbose) {
    console.warn.apply(undefined, arguments);
  }
}

function error() {
  console.error.apply(undefined, arguments);
}

module.exports.config = config;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;
},{"../config":2}],28:[function(require,module,exports){


function interpolate(t, degree, points, knots, weights, result) {

  var i,j,s,l;              // function-scoped iteration variables
  var n = points.length;    // points count
  var d = points[0].length; // point dimensionality

  if(degree < 1) throw new Error('degree must be at least 1 (linear)');
  if(degree > (n-1)) throw new Error('degree must be less than or equal to point count - 1');

  if(!weights) {
    // build weight vector of length [n]
    weights = [];
    for(i=0; i<n; i++) {
      weights[i] = 1;
    }
  }

  if(!knots) {
    // build knot vector of length [n + degree + 1]
    var knots = [];
    for(i=0; i<n+degree+1; i++) {
      knots[i] = i;
    }
  } else {
    if(knots.length !== n+degree+1) throw new Error('bad knot vector length');
  }

  var domain = [
    degree,
    knots.length-1 - degree
  ];

  // remap t to the domain where the spline is defined
  var low  = knots[domain[0]];
  var high = knots[domain[1]];
  t = t * (high - low) + low;

  if(t < low || t > high) throw new Error('out of bounds');

  // find s (the spline segment) for the [t] value provided
  for(s=domain[0]; s<domain[1]; s++) {
    if(t >= knots[s] && t <= knots[s+1]) {
      break;
    }
  }

  // convert points to homogeneous coordinates
  var v = [];
  for(i=0; i<n; i++) {
    v[i] = [];
    for(j=0; j<d; j++) {
      v[i][j] = points[i][j] * weights[i];
    }
    v[i][d] = weights[i];
  }

  // l (level) goes from 1 to the curve degree + 1
  var alpha;
  for(l=1; l<=degree+1; l++) {
    // build level l of the pyramid
    for(i=s; i>s-degree-1+l; i--) {
      alpha = (t - knots[i]) / (knots[i+degree+1-l] - knots[i]);

      // interpolate each component
      for(j=0; j<d+1; j++) {
        v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
      }
    }
  }

  // convert back to cartesian and return
  var result = result || [];
  for(i=0; i<d; i++) {
    result[i] = v[s][i] / v[s][d];
  }

  return result;
}


module.exports = interpolate;

},{}],29:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],30:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],31:[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keys = require('lodash.keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"lodash._basecopy":35,"lodash.keys":32}],32:[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash._getnative":38,"lodash.isarguments":40,"lodash.isarray":41}],33:[function(require,module,exports){
(function (global){
/**
 * lodash 3.3.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayCopy = require('lodash._arraycopy'),
    arrayEach = require('lodash._arrayeach'),
    baseAssign = require('lodash._baseassign'),
    baseFor = require('lodash._basefor'),
    isArray = require('lodash.isarray'),
    keys = require('lodash.keys');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
cloneableTags[dateTag] = cloneableTags[float32Tag] =
cloneableTags[float64Tag] = cloneableTags[int8Tag] =
cloneableTags[int16Tag] = cloneableTags[int32Tag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[stringTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[mapTag] = cloneableTags[setTag] =
cloneableTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Native method references. */
var ArrayBuffer = global.ArrayBuffer,
    Uint8Array = global.Uint8Array;

/**
 * The base implementation of `_.clone` without support for argument juggling
 * and `this` binding `customizer` functions.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {Function} [customizer] The function to customize cloning values.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The object `value` belongs to.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates clones with source counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return arrayCopy(value, result);
    }
  } else {
    var tag = objToString.call(value),
        isFunc = tag == funcTag;

    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return baseAssign(result, value);
      }
    } else {
      return cloneableTags[tag]
        ? initCloneByTag(value, tag, isDeep)
        : (object ? value : {});
    }
  }
  // Check for circular references and return its corresponding clone.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == value) {
      return stackB[length];
    }
  }
  // Add the source value to the stack of traversed objects and associate it with its clone.
  stackA.push(value);
  stackB.push(result);

  // Recursively populate clone (susceptible to call stack limits).
  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
    result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
  });
  return result;
}

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

/**
 * Creates a clone of the given array buffer.
 *
 * @private
 * @param {ArrayBuffer} buffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function bufferClone(buffer) {
  var result = new ArrayBuffer(buffer.byteLength),
      view = new Uint8Array(result);

  view.set(new Uint8Array(buffer));
  return result;
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add array properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  var Ctor = object.constructor;
  if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
    Ctor = Object;
  }
  return new Ctor;
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return bufferClone(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      var buffer = object.buffer;
      return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      var result = new Ctor(object.source, reFlags.exec(object));
      result.lastIndex = object.lastIndex;
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseClone;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash._arraycopy":29,"lodash._arrayeach":30,"lodash._baseassign":31,"lodash._basefor":36,"lodash.isarray":41,"lodash.keys":34}],34:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"dup":32,"lodash._getnative":38,"lodash.isarguments":40,"lodash.isarray":41}],35:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],36:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * Creates a base function for methods like `_.forIn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = baseFor;

},{}],37:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],38:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],39:[function(require,module,exports){
/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseClone = require('lodash._baseclone'),
    bindCallback = require('lodash._bindcallback');

/**
 * Creates a deep clone of `value`. If `customizer` is provided it's invoked
 * to produce the cloned values. If `customizer` returns `undefined` cloning
 * is handled by the method instead. The `customizer` is bound to `thisArg`
 * and invoked with up to three argument; (value [, index|key, object]).
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
 * The enumerable properties of `arguments` objects and objects created by
 * constructors other than `Object` are cloned to plain `Object` objects. An
 * empty object is returned for uncloneable values such as functions, DOM nodes,
 * Maps, Sets, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to deep clone.
 * @param {Function} [customizer] The function to customize cloning values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {*} Returns the deep cloned value.
 * @example
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * var deep = _.cloneDeep(users);
 * deep[0] === users[0];
 * // => false
 *
 * // using a customizer callback
 * var el = _.cloneDeep(document.body, function(value) {
 *   if (_.isElement(value)) {
 *     return value.cloneNode(true);
 *   }
 * });
 *
 * el === document.body
 * // => false
 * el.nodeName
 * // => BODY
 * el.childNodes.length;
 * // => 20
 */
function cloneDeep(value, customizer, thisArg) {
  return typeof customizer == 'function'
    ? baseClone(value, true, bindCallback(customizer, thisArg, 3))
    : baseClone(value, true);
}

module.exports = cloneDeep;

},{"lodash._baseclone":33,"lodash._bindcallback":37}],40:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isArguments;

},{}],41:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],42:[function(require,module,exports){
/**
* pretty-data - nodejs plugin to pretty-print or minify data in XML, JSON and CSS formats.
*  
* Version - 0.40.0
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/pretty-data/
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*	pd.xml(data ) - pretty print XML;
*	pd.json(data) - pretty print JSON;
*	pd.css(data ) - pretty print CSS;
*	pd.sql(data)  - pretty print SQL;
*
*	pd.xmlmin(data [, preserveComments] ) - minify XML; 
*	pd.jsonmin(data)                      - minify JSON; 
*	pd.cssmin(data [, preserveComments] ) - minify CSS; 
*	pd.sqlmin(data)                       - minify SQL; 
*
* PARAMETERS:
*
*	@data  			- String; XML, JSON, CSS or SQL text to beautify;
* 	@preserveComments	- Bool (optional, used in minxml and mincss only); 
*				  Set this flag to true to prevent removing comments from @text; 
*	@Return 		- String;
*	
* USAGE:
*	
*	var pd  = require('pretty-data').pd;
*
*	var xml_pp   = pd.xml(xml_text);
*	var xml_min  = pd.xmlmin(xml_text [,true]);
*	var json_pp  = pd.json(json_text);
*	var json_min = pd.jsonmin(json_text);
*	var css_pp   = pd.css(css_text);
*	var css_min  = pd.cssmin(css_text [, true]);
*	var sql_pp   = pd.sql(sql_text);
*	var sql_min  = pd.sqlmin(sql_text);
*
* TEST:
*	comp-name:pretty-data$ node ./test/test_xml
*	comp-name:pretty-data$ node ./test/test_json
*	comp-name:pretty-data$ node ./test/test_css
*	comp-name:pretty-data$ node ./test/test_sql
*/


function pp() {
	this.shift = ['\n']; // array of shifts
	this.step = '  ', // 2 spaces
		maxdeep = 100, // nesting level
		ix = 0;

	// initialize array with shifts //
	for(ix=0;ix<maxdeep;ix++){
		this.shift.push(this.shift[ix]+this.step); 
	}

};	
	
// ----------------------- XML section ----------------------------------------------------

pp.prototype.xml = function(text) {

	var ar = text.replace(/>\s{0,}</g,"><")
				 .replace(/</g,"~::~<")
				 .replace(/xmlns\:/g,"~::~xmlns:")
				 .replace(/xmlns\=/g,"~::~xmlns=")
				 .split('~::~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0;

		for(ix=0;ix<len;ix++) {
			// start comment or <![CDATA[...]]> or <!DOCTYPE //
			if(ar[ix].search(/<!/) > -1) { 
				str += this.shift[deep]+ar[ix];
				inComment = true; 
				// end comment  or <![CDATA[...]]> //
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) { 
					inComment = false; 
				}
			} else 
			// end comment  or <![CDATA[...]]> //
			if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) { 
				str += ar[ix];
				inComment = false; 
			} else 
			// <elm></elm> //
			if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
				/^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) { 
				str += ar[ix];
				if(!inComment) deep--;
			} else
			 // <elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
				str = !inComment ? str += this.shift[deep++]+ar[ix] : str += ar[ix];
			} else 
			 // <elm>...</elm> //
			if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
				str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
			} else 
			// </elm> //
			if(ar[ix].search(/<\//) > -1) { 
				str = !inComment ? str += this.shift[--deep]+ar[ix] : str += ar[ix];
			} else 
			// <elm/> //
			if(ar[ix].search(/\/>/) > -1 ) { 
				str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
			} else 
			// <? xml ... ?> //
			if(ar[ix].search(/<\?/) > -1) { 
				str += this.shift[deep]+ar[ix];
			} else 
			// xmlns //
			if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) { 
				str += this.shift[deep]+ar[ix];
			} 
			
			else {
				str += ar[ix];
			}
		}
		
	return  (str[0] == '\n') ? str.slice(1) : str;
}

// ----------------------- JSON section ----------------------------------------------------

pp.prototype.json = function(text) {

	if ( typeof text === "string" ) {
		return JSON.stringify(JSON.parse(text), null, this.step);
	}
	if ( typeof text === "object" ) {
		return JSON.stringify(text, null, this.step);
	}
	return null;
}

// ----------------------- CSS section ----------------------------------------------------

pp.prototype.css = function(text) {

	var ar = text.replace(/\s{1,}/g,' ')
				.replace(/\{/g,"{~::~")
				.replace(/\}/g,"~::~}~::~")
				.replace(/\;/g,";~::~")
				.replace(/\/\*/g,"~::~/*")
				.replace(/\*\//g,"*/~::~")
				.replace(/~::~\s{0,}~::~/g,"~::~")
				.split('~::~'),
		len = ar.length,
		deep = 0,
		str = '',
		ix = 0;
		
		for(ix=0;ix<len;ix++) {

			if( /\{/.exec(ar[ix]))  { 
				str += this.shift[deep++]+ar[ix];
			} else 
			if( /\}/.exec(ar[ix]))  { 
				str += this.shift[--deep]+ar[ix];
			} else
			if( /\*\\/.exec(ar[ix]))  { 
				str += this.shift[deep]+ar[ix];
			}
			else {
				str += this.shift[deep]+ar[ix];
			}
		}
		return str.replace(/^\n{1,}/,'');
}

// ----------------------- SQL section ----------------------------------------------------

function isSubquery(str, parenthesisLevel) {
  return  parenthesisLevel - (str.replace(/\(/g,'').length - str.replace(/\)/g,'').length )
}

function split_sql(str, tab) {

    return str.replace(/\s{1,}/g," ")

        .replace(/ AND /ig,"~::~"+tab+tab+"AND ")
        .replace(/ BETWEEN /ig,"~::~"+tab+"BETWEEN ")
        .replace(/ CASE /ig,"~::~"+tab+"CASE ")
        .replace(/ ELSE /ig,"~::~"+tab+"ELSE ")
        .replace(/ END /ig,"~::~"+tab+"END ")
        .replace(/ FROM /ig,"~::~FROM ")
        .replace(/ GROUP\s{1,}BY/ig,"~::~GROUP BY ")
        .replace(/ HAVING /ig,"~::~HAVING ")
        //.replace(/ IN /ig,"~::~"+tab+"IN ")
        .replace(/ IN /ig," IN ")
        .replace(/ JOIN /ig,"~::~JOIN ")
        .replace(/ CROSS~::~{1,}JOIN /ig,"~::~CROSS JOIN ")
        .replace(/ INNER~::~{1,}JOIN /ig,"~::~INNER JOIN ")
        .replace(/ LEFT~::~{1,}JOIN /ig,"~::~LEFT JOIN ")
        .replace(/ RIGHT~::~{1,}JOIN /ig,"~::~RIGHT JOIN ")
        .replace(/ ON /ig,"~::~"+tab+"ON ")
        .replace(/ OR /ig,"~::~"+tab+tab+"OR ")
        .replace(/ ORDER\s{1,}BY/ig,"~::~ORDER BY ")
        .replace(/ OVER /ig,"~::~"+tab+"OVER ")
        .replace(/\(\s{0,}SELECT /ig,"~::~(SELECT ")
        .replace(/\)\s{0,}SELECT /ig,")~::~SELECT ")
        .replace(/ THEN /ig," THEN~::~"+tab+"")
        .replace(/ UNION /ig,"~::~UNION~::~")
        .replace(/ USING /ig,"~::~USING ")
        .replace(/ WHEN /ig,"~::~"+tab+"WHEN ")
        .replace(/ WHERE /ig,"~::~WHERE ")
        .replace(/ WITH /ig,"~::~WITH ")
        //.replace(/\,\s{0,}\(/ig,",~::~( ")
        //.replace(/\,/ig,",~::~"+tab+tab+"")
        .replace(/ ALL /ig," ALL ")
        .replace(/ AS /ig," AS ")
        .replace(/ ASC /ig," ASC ") 
        .replace(/ DESC /ig," DESC ") 
        .replace(/ DISTINCT /ig," DISTINCT ")
        .replace(/ EXISTS /ig," EXISTS ")
        .replace(/ NOT /ig," NOT ")
        .replace(/ NULL /ig," NULL ")
        .replace(/ LIKE /ig," LIKE ")
        .replace(/\s{0,}SELECT /ig,"SELECT ")
        .replace(/~::~{1,}/g,"~::~")
        .split('~::~');
}

pp.prototype.sql = function(text) {

    var ar_by_quote = text.replace(/\s{1,}/g," ")
                        .replace(/\'/ig,"~::~\'")
                        .split('~::~'),
        len = ar_by_quote.length,
        ar = [],
        deep = 0,
        tab = this.step,//+this.step,
        inComment = true,
        inQuote = false,
        parenthesisLevel = 0,
        str = '',
        ix = 0;

    for(ix=0;ix<len;ix++) {

        if(ix%2) {
            ar = ar.concat(ar_by_quote[ix]);
        } else {
            ar = ar.concat(split_sql(ar_by_quote[ix], tab) );
        }
    }

    len = ar.length;
    for(ix=0;ix<len;ix++) {

        parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);

        if( /\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix]))  { 
            ar[ix] = ar[ix].replace(/\,/g,",\n"+tab+tab+"")
        } 

        if( /\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix]))  { 
            deep++;
            str += this.shift[deep]+ar[ix];
        } else 
        if( /\'/.exec(ar[ix]) )  { 
            if(parenthesisLevel<1 && deep) {
                deep--;
            }
            str += ar[ix];
        }
        else  { 
            str += this.shift[deep]+ar[ix];
            if(parenthesisLevel<1 && deep) {
                deep--;
            }
        } 
    }

    str = str.replace(/^\n{1,}/,'').replace(/\n{1,}/g,"\n");
    return str;
}

// ----------------------- min section ----------------------------------------------------

pp.prototype.xmlmin = function(text, preserveComments) {

	var str = preserveComments ? text
				   : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"");
	return  str.replace(/>\s{0,}</g,"><"); 
}

pp.prototype.jsonmin = function(text) {
								  
    return  text.replace(/\s{0,}\{\s{0,}/g,"{")
                .replace(/\s{0,}\[$/g,"[")
                .replace(/\[\s{0,}/g,"[")
                .replace(/:\s{0,}\[/g,':[')
                .replace(/\s{0,}\}\s{0,}/g,"}")
                .replace(/\s{0,}\]\s{0,}/g,"]")
                .replace(/\"\s{0,}\,/g,'",')
                .replace(/\,\s{0,}\"/g,',"')
                .replace(/\"\s{0,}:/g,'":')
                .replace(/:\s{0,}\"/g,':"')
                .replace(/:\s{0,}\[/g,':[')
                .replace(/\,\s{0,}\[/g,',[')
                .replace(/\,\s{2,}/g,', ')
                .replace(/\]\s{0,},\s{0,}\[/g,'],[');   
}

pp.prototype.cssmin = function(text, preserveComments) {
	
	var str = preserveComments ? text
				   : text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g,"") ;
	return str.replace(/\s{1,}/g,' ')
			  .replace(/\{\s{1,}/g,"{")
			  .replace(/\}\s{1,}/g,"}")
			  .replace(/\;\s{1,}/g,";")
			  .replace(/\/\*\s{1,}/g,"/*")
			  .replace(/\*\/\s{1,}/g,"*/");
}	

pp.prototype.sqlmin = function(text) {
    return text.replace(/\s{1,}/g," ").replace(/\s{1,}\(/,"(").replace(/\s{1,}\)/,")");
}

// --------------------------------------------------------------------------------------------

exports.pd= new pp;	











},{}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _V = require('./V2');

var _V2 = _interopRequireDefault(_V);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Box2 = function () {
  function Box2(min, max) {
    _classCallCheck(this, Box2);

    this.min = min || new _V2.default(Infinity, Infinity);
    this.max = max || new _V2.default(-Infinity, -Infinity);
  }

  _createClass(Box2, [{
    key: 'expandByPoint',
    value: function expandByPoint(p) {
      this.min = new _V2.default(Math.min(this.min.x, p.x), Math.min(this.min.y, p.y));
      this.max = new _V2.default(Math.max(this.max.x, p.x), Math.max(this.max.y, p.y));
      return this;
    }
  }, {
    key: 'expandByPoints',
    value: function expandByPoints(points) {
      var _this = this;

      points.forEach(function (point) {
        _this.expandByPoint(point);
      }, this);
      return this;
    }
  }, {
    key: 'isPointInside',
    value: function isPointInside(p) {
      return p.x >= this.min.x && p.y >= this.min.y && p.x <= this.max.x && p.y <= this.max.y;
    }
  }]);

  return Box2;
}();

Box2.fromPoints = function (points) {
  return new Box2().expandByPoints(points);
};

exports.default = Box2;
},{"./V2":49}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Box3 = function () {
  function Box3(min, max) {
    _classCallCheck(this, Box3);

    this.min = min || {
      x: Infinity,
      y: Infinity,
      z: Infinity
    };
    this.max = max || {
      x: -Infinity,
      y: -Infinity,
      z: -Infinity
    };
  }

  _createClass(Box3, [{
    key: "expandByPoint",
    value: function expandByPoint(p) {
      this.min = {
        x: Math.min(this.min.x, p.x),
        y: Math.min(this.min.y, p.y),
        z: Math.min(this.min.z, p.z)
      };
      this.max = {
        x: Math.max(this.max.x, p.x),
        y: Math.max(this.max.y, p.y),
        z: Math.max(this.max.z, p.z)
      };
      return this;
    }
  }, {
    key: "expandByPoints",
    value: function expandByPoints(points) {
      var _this = this;

      points.forEach(function (point) {
        _this.expandByPoint(point);
      }, this);
      return this;
    }
  }, {
    key: "isPointInside",
    value: function isPointInside(p) {
      return p.x >= this.min.x && p.y >= this.min.y && p.z >= this.min.z && p.x <= this.max.x && p.y <= this.max.y && p.z <= this.max.z;
    }
  }]);

  return Box3;
}();

Box3.fromPoints = function (points) {
  return new Box3().expandByPoints(points);
};

exports.default = Box3;
},{}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _V = require('./V2');

var _V2 = _interopRequireDefault(_V);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var turn = function turn(p1, p2, p3) {
  var a = p1.x;
  var b = p1.y;
  var c = p2.x;
  var d = p2.y;
  var e = p3.x;
  var f = p3.y;
  var m = (f - b) * (c - a);
  var n = (d - b) * (e - a);
  return m > n + Number.EPSILON ? 1 : m + Number.EPSILON < n ? -1 : 0;
};

// http://stackoverflow.com/a/16725715/35448
var isIntersect = function isIntersect(e1, e2) {
  var p1 = e1.a;
  var p2 = e1.b;
  var p3 = e2.a;
  var p4 = e2.b;
  return turn(p1, p3, p4) !== turn(p2, p3, p4) && turn(p1, p2, p3) !== turn(p1, p2, p4);
};

var _getIntersection = function _getIntersection(m, n) {
  // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
  var x1 = m.a.x;
  var x2 = m.b.x;
  var y1 = m.a.y;
  var y2 = m.b.y;

  var x3 = n.a.x;
  var x4 = n.b.x;
  var y3 = n.a.y;
  var y4 = n.b.y;

  var x12 = x1 - x2;
  var x34 = x3 - x4;
  var y12 = y1 - y2;
  var y34 = y3 - y4;
  var c = x12 * y34 - y12 * x34;

  var px = ((x1 * y2 - y1 * x2) * x34 - x12 * (x3 * y4 - y3 * x4)) / c;
  var py = ((x1 * y2 - y1 * x2) * y34 - y12 * (x3 * y4 - y3 * x4)) / c;

  if (isNaN(px) || isNaN(py)) {
    return null;
  } else {
    return new _V2.default(px, py);
  }
};

var dist = function dist(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

var Line2 = function () {
  function Line2(a, b) {
    _classCallCheck(this, Line2);

    if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || a.x === undefined || a.y === undefined) {
      throw Error('expected first argument to have x and y properties');
    }
    if ((typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || b.x === undefined || b.y === undefined) {
      throw Error('expected second argument to have x and y properties');
    }
    this.a = new _V2.default(a);
    this.b = new _V2.default(b);
  }

  _createClass(Line2, [{
    key: 'length',
    value: function length() {
      return this.a.sub(this.b).length();
    }
  }, {
    key: 'intersects',
    value: function intersects(other) {
      if (!(other instanceof Line2)) {
        throw new Error('expected argument to be an instance of vecks.Line2');
      }
      return isIntersect(this, other);
    }
  }, {
    key: 'getIntersection',
    value: function getIntersection(other) {
      if (this.intersects(other)) {
        return _getIntersection(this, other);
      } else {
        return null;
      }
    }
  }, {
    key: 'containsPoint',
    value: function containsPoint(point) {
      var eps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1e-12;

      return Math.abs(dist(this.a, this.b) - dist(point, this.a) - dist(point, this.b)) < eps;
    }
  }]);

  return Line2;
}();

exports.default = Line2;
},{"./V2":49}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _V = require('./V3');

var _V2 = _interopRequireDefault(_V);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dist = function dist(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
};

var Line3 = function () {
  function Line3(a, b) {
    _classCallCheck(this, Line3);

    if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || a.x === undefined || a.y === undefined || a.z === undefined) {
      throw Error('expected first argument to have x, y and z properties');
    }
    if ((typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || b.x === undefined || b.y === undefined || b.y === undefined) {
      throw Error('expected second argument to have x, y and z properties');
    }
    this.a = new _V2.default(a);
    this.b = new _V2.default(b);
  }

  _createClass(Line3, [{
    key: 'length',
    value: function length() {
      return this.a.sub(this.b).length();
    }
  }, {
    key: 'containsPoint',
    value: function containsPoint(point) {
      var eps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1e-12;

      return Math.abs(dist(this.a, this.b) - dist(point, this.a) - dist(point, this.b)) < eps;
    }
  }]);

  return Line3;
}();

exports.default = Line3;
},{"./V3":50}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plane3 = function () {
  function Plane3(a, b, c, d) {
    _classCallCheck(this, Plane3);

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  // Distance to a point
  // http://mathworld.wolfram.com/Point-PlaneDistance.html eq 10


  _createClass(Plane3, [{
    key: 'distanceToPoint',
    value: function distanceToPoint(p0) {
      var dd = (this.a * p0.x + this.b * p0.y + this.c * p0.z + this.d) / Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c);
      return dd;
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return this.a === other.a && this.b === other.b && this.c === other.c && this.d === other.d;
    }
  }, {
    key: 'coPlanar',
    value: function coPlanar(other) {
      var coPlanarAndSameNormal = this.a === other.a && this.b === other.b && this.c === other.c && this.d === other.d;
      var coPlanarAndReversedNormal = this.a === -other.a && this.b === -other.b && this.c === -other.c && this.d === -other.d;
      return coPlanarAndSameNormal || coPlanarAndReversedNormal;
    }
  }]);

  return Plane3;
}();

// From point and normal


Plane3.fromPointAndNormal = function (p, n) {
  var a = n.x;
  var b = n.y;
  var c = n.z;
  var d = -(p.x * a + p.y * b + p.z * c);
  return new Plane3(n.x, n.y, n.z, d);
};

Plane3.fromPoints = function (points) {
  var firstCross = void 0;
  for (var i = 0, il = points.length; i < il; ++i) {
    var ab = points[(i + 1) % il].sub(points[i]);
    var bc = points[(i + 2) % il].sub(points[(i + 1) % il]);
    var cross = ab.cross(bc);
    if (!(isNaN(cross.length()) || cross.length() === 0)) {
      if (!firstCross) {
        firstCross = cross.norm();
      } else {
        var same = cross.norm().equals(firstCross, 1e-6);
        var opposite = cross.neg().norm().equals(firstCross, 1e-6);
        if (!(same || opposite)) {
          throw Error('points not on a plane');
        }
      }
    }
  }
  if (!firstCross) {
    throw Error('points not on a plane');
  }
  return Plane3.fromPointAndNormal(points[0], firstCross.norm());
};

exports.default = Plane3;
},{}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _V = require('./V3');

var _V2 = _interopRequireDefault(_V);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Quaternion implementation heavily adapted from the Quaternion implementation in THREE.js
// https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js

var Quaternion = function () {
  function Quaternion(x, y, z, w) {
    _classCallCheck(this, Quaternion);

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  _createClass(Quaternion, [{
    key: 'applyToVec3',
    value: function applyToVec3(v3) {
      var x = v3.x;
      var y = v3.y;
      var z = v3.z;

      var qx = this.x;
      var qy = this.y;
      var qz = this.z;
      var qw = this.w;

      // calculate quat * vector
      var ix = qw * x + qy * z - qz * y;
      var iy = qw * y + qz * x - qx * z;
      var iz = qw * z + qx * y - qy * x;
      var iw = -qx * x - qy * y - qz * z;

      // calculate result * inverse quat
      return new _V2.default(ix * qw + iw * -qx + iy * -qz - iz * -qy, iy * qw + iw * -qy + iz * -qx - ix * -qz, iz * qw + iw * -qz + ix * -qy - iy * -qx);
    }
  }]);

  return Quaternion;
}();

Quaternion.fromAxisAngle = function (axis, angle) {
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
  var axisNorm = axis.norm();
  var halfAngle = angle / 2;
  var s = Math.sin(halfAngle);
  return new Quaternion(axisNorm.x * s, axisNorm.y * s, axisNorm.z * s, Math.cos(halfAngle));
};

exports.default = Quaternion;
},{"./V3":50}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var V2 = function () {
  function V2(x, y) {
    _classCallCheck(this, V2);

    if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  _createClass(V2, [{
    key: 'equals',
    value: function equals(other) {
      return this.x === other.x && this.y === other.y;
    }
  }, {
    key: 'length',
    value: function length() {
      return Math.sqrt(this.dot(this));
    }
  }, {
    key: 'neg',
    value: function neg() {
      return new V2(-this.x, -this.y);
    }
  }, {
    key: 'add',
    value: function add(b) {
      return new V2(this.x + b.x, this.y + b.y);
    }
  }, {
    key: 'sub',
    value: function sub(b) {
      return new V2(this.x - b.x, this.y - b.y);
    }
  }, {
    key: 'multiply',
    value: function multiply(w) {
      return new V2(this.x * w, this.y * w);
    }
  }, {
    key: 'norm',
    value: function norm() {
      return this.multiply(1 / this.length());
    }
  }, {
    key: 'dot',
    value: function dot(b) {
      return this.x * b.x + this.y * b.y;
    }
  }]);

  return V2;
}();

exports.default = V2;
},{}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var V3 = function () {
  function V3(x, y, z) {
    _classCallCheck(this, V3);

    if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if (x === undefined) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  _createClass(V3, [{
    key: 'equals',
    value: function equals(other, eps) {
      if (eps === undefined) {
        eps = 0;
      }
      return Math.abs(this.x - other.x) <= eps && Math.abs(this.y - other.y) <= eps && Math.abs(this.z - other.z) <= eps;
    }
  }, {
    key: 'length',
    value: function length() {
      return Math.sqrt(this.dot(this));
    }
  }, {
    key: 'neg',
    value: function neg() {
      return new V3(-this.x, -this.y, -this.z);
    }
  }, {
    key: 'add',
    value: function add(b) {
      return new V3(this.x + b.x, this.y + b.y, this.z + b.z);
    }
  }, {
    key: 'sub',
    value: function sub(b) {
      return new V3(this.x - b.x, this.y - b.y, this.z - b.z);
    }
  }, {
    key: 'multiply',
    value: function multiply(w) {
      return new V3(this.x * w, this.y * w, this.z * w);
    }
  }, {
    key: 'norm',
    value: function norm() {
      return this.multiply(1 / this.length());
    }
  }, {
    key: 'dot',
    value: function dot(b) {
      return this.x * b.x + this.y * b.y + this.z * b.z;
    }
  }, {
    key: 'cross',
    value: function cross(b) {
      return new V3(this.y * b.z - this.z * b.y, this.z * b.x - this.x * b.z, this.x * b.y - this.y * b.x);
    }
  }]);

  return V3;
}();

exports.default = V3;
},{}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Line3 = exports.Line2 = exports.Quaternion = exports.Plane3 = exports.Box3 = exports.Box2 = exports.V3 = exports.V2 = undefined;

var _V = require('./V2');

var _V2 = _interopRequireDefault(_V);

var _V3 = require('./V3');

var _V4 = _interopRequireDefault(_V3);

var _Box = require('./Box2');

var _Box2 = _interopRequireDefault(_Box);

var _Box3 = require('./Box3');

var _Box4 = _interopRequireDefault(_Box3);

var _Plane = require('./Plane3');

var _Plane2 = _interopRequireDefault(_Plane);

var _Quaternion = require('./Quaternion');

var _Quaternion2 = _interopRequireDefault(_Quaternion);

var _Line = require('./Line2');

var _Line2 = _interopRequireDefault(_Line);

var _Line3 = require('./Line3');

var _Line4 = _interopRequireDefault(_Line3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.V2 = _V2.default;
exports.V3 = _V4.default;
exports.Box2 = _Box2.default;
exports.Box3 = _Box4.default;
exports.Plane3 = _Plane2.default;
exports.Quaternion = _Quaternion2.default;
exports.Line2 = _Line2.default;
exports.Line3 = _Line4.default;
},{"./Box2":43,"./Box3":44,"./Line2":45,"./Line3":46,"./Plane3":47,"./Quaternion":48,"./V2":49,"./V3":50}]},{},[23])(23)
});