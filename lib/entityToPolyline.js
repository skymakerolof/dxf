'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bSpline = require('b-spline');

var _bSpline2 = _interopRequireDefault(_bSpline);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _createArcForLWPolyline = require('./util/createArcForLWPolyline');

var _createArcForLWPolyline2 = _interopRequireDefault(_createArcForLWPolyline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Rotate a set of points.
 *
 * @param points the points
 * @param angle the rotation angle
 */
var rotate = function rotate(points, angle) {
  return points.map(function (p) {
    return [p[0] * Math.cos(angle) - p[1] * Math.sin(angle), p[1] * Math.cos(angle) + p[0] * Math.sin(angle)];
  });
};

/**
 * Interpolate an ellipse
 * @param cx center X
 * @param cy center Y
 * @param rx radius X
 * @param ry radius Y
 * @param start start angle in radians
 * @param start end angle in radians
 */
var interpolateEllipse = function interpolateEllipse(cx, cy, rx, ry, start, end, rotationAngle) {
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

/**
 * Interpolate a b-spline. The algorithm examins the knot vector
 * to create segments for interpolation. The parameterisation value
 * is re-normalised back to [0,1] as that is what the lib expects (
 * and t i de-normalised in the b-spline library)
 *
 * @param controlPoints the control points
 * @param degree the b-spline degree
 * @param knots the knot vector
 * @returns the polyline
 */
var interpolateBSpline = function interpolateBSpline(controlPoints, degree, knots, interpolationsPerSplineSegment) {
  var polyline = [];
  var controlPointsForLib = controlPoints.map(function (p) {
    return [p.x, p.y];
  });

  var segmentTs = [knots[degree]];
  var domain = [knots[degree], knots[knots.length - 1 - degree]];

  for (var k = degree + 1; k < knots.length - degree; ++k) {
    if (segmentTs[segmentTs.length - 1] !== knots[k]) {
      segmentTs.push(knots[k]);
    }
  }

  interpolationsPerSplineSegment = interpolationsPerSplineSegment || 25;
  for (var i = 1; i < segmentTs.length; ++i) {
    var uMin = segmentTs[i - 1];
    var uMax = segmentTs[i];
    for (var _k = 0; _k <= interpolationsPerSplineSegment; ++_k) {
      // https://github.com/bjnortier/dxf/issues/28
      // b-spline interpolation can fail due to a floating point
      // error - ignore these until the lib is fixed
      try {
        var u = _k / interpolationsPerSplineSegment * (uMax - uMin) + uMin;
        var t = (u - domain[0]) / (domain[1] - domain[0]);
        var p = (0, _bSpline2.default)(t, degree, controlPointsForLib, knots);
        polyline.push(p);
      } catch (e) {
        // ignore this point
      }
    }
  }
  return polyline;
};

/**
 * Apply the transforms to the polyline.
 *
 * @param polyline the polyline
 * @param transform the transforms array
 * @returns the transformed polyline
 */
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

exports.default = function (entity, options) {
  options = options || {};
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
          polyline = polyline.concat((0, _createArcForLWPolyline2.default)(from, to, entity.vertices[i].bulge));
        }
        // The last iteration of the for loop
        if (i === il - 2) {
          polyline.push(to);
        }
      }
    } else {
      _logger2.default.warn('Polyline entity with no vertices');
    }
  }

  if (entity.type === 'CIRCLE') {
    polyline = interpolateEllipse(entity.x, entity.y, entity.r, entity.r, 0, Math.PI * 2);
  }

  if (entity.type === 'ELLIPSE') {
    var rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY);
    var ry = entity.axisRatio * rx;
    var majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX);
    polyline = interpolateEllipse(entity.x, entity.y, rx, ry, entity.startAngle, entity.endAngle, majorAxisRotation);
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
    polyline = interpolateEllipse(entity.x, entity.y, entity.r, entity.r, entity.startAngle, entity.endAngle, undefined, false);

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
    polyline = interpolateBSpline(entity.controlPoints, entity.degree, entity.knots, options.interpolationsPerSplineSegment);
  }

  if (!polyline) {
    _logger2.default.warn('unsupported entity for converting to polyline:', entity.type);
    return [];
  }
  return applyTransforms(polyline, entity.transforms);
};