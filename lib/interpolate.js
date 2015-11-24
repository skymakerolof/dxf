var bspline = require('b-spline');

/**
 * Rotate a set of points
 * @param points the points
 * @param angle the rotation angle
 */
function rotate(points, angle) {
  return points.map(function(p) {
    return [
      p[0]*Math.cos(angle) - p[1]*Math.sin(angle),
      p[1]*Math.cos(angle) + p[0]*Math.sin(angle),
    ];
  });
}

/**
 * @param cx center X
 * @param cy center Y
 * @param rx radius X
 * @param ry radius Y
 * @param start start angle in radians
 * @param start end angle in radians
 */
function interpolateElliptic(cx, cy, rx, ry, start, end, rotationAngle) {
  if (end < start) {
    end += Math.PI*2;
  }

  // ----- Relative points -----

  // Start point
  var points = [];
  var dTheta = Math.PI*2/72;
  var EPS = 1e-6;
  for (var theta = start; theta < end - EPS; theta += dTheta) {
    var x = Math.cos(theta)*rx;
    var y = Math.sin(theta)*ry;
    points.push([x, y]);
  }
  points.push([
    Math.cos(end)*rx,
    Math.sin(end)*ry,
  ]);

  // ----- Rotate -----

  // If defined or not zero
  if (rotationAngle) {
    points = rotate(points, rotationAngle);
  }

  // ----- Offset center -----

  points = points.map(function(p) {
    return [cx + p[0], cy + p[1]];
  });

  return points;
}

function transformPolyline(polyline, transform) {
  // console.log('**', transform);
  return polyline.map(function(p) {
    if (transform.xScale || transform.yScale) {
      p = [
        p[0]*transform.xScale,
        p[1]*transform.yScale,
      ];
    }
    if (transform.rotation) {
      var angle = transform.rotation/180*Math.PI;
      p = [
        p[0]*Math.cos(angle) - p[1]*Math.sin(angle),
        p[1]*Math.cos(angle) + p[0]*Math.sin(angle),
      ];
    }
    if (transform.x || transform.y) {
      p = [
        p[0] + transform.x,
        p[1] + transform.y,
      ];
    }
    return p;
  });
}

/**
 * Convert a parsed DXF to a set of polylines. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */
module.exports = function(typedEntities) {
  var result = [];

  // ----- Lines -----
  if (typedEntities.lines) {
    result = typedEntities.lines.reduce(function(acc, line) {
      var polyline = [
        [
          line.start.x,
          line.start.y,
        ],
        [
          line.end.x,
          line.end.y,
        ]
      ];
      acc.push(transformPolyline(polyline, line.transform));
      return acc;
    }, result);
  }

  // ----- LWPolylines -----
  if (typedEntities.lwpolylines) {
    result = typedEntities.lwpolylines.reduce(function(acc, lwpolyline) {
      var polyline = lwpolyline.points.map(function(p) {
        return [p.x,p.y];
      });
      if (lwpolyline.closed) {
        polyline.push(polyline[0]);
      }
      acc.push(transformPolyline(polyline, lwpolyline.transform));
      return acc;
    }, result);
  }

  // ----- Circles, Arcs, Ellipses -----

  if (typedEntities.circles) {
    result = typedEntities.circles.reduce(function(acc, circle) {
      var polyline = interpolateElliptic(
        circle.x, circle.y,
        circle.r, circle.r,
        0, Math.PI*2);
      acc.push(transformPolyline(polyline, circle.transform));
      return acc;
    }, result);
  }

  if (typedEntities.ellipses) {
    result = typedEntities.ellipses.reduce(function(acc, ellipse) {
      var rx = Math.sqrt(ellipse.majorX*ellipse.majorX + ellipse.majorY*ellipse.majorY);
      var ry = ellipse.axisRatio * rx;
      var majorAxisRotation = -Math.atan2(-ellipse.majorY, ellipse.majorX);

      var polyline = interpolateElliptic(
        ellipse.x, ellipse.y,
        rx, ry,
        ellipse.startAngleRad, ellipse.endAngleRad,
        majorAxisRotation);
      acc.push(transformPolyline(polyline, ellipse.transform));
      return acc;
    }, result);
  }

  if (typedEntities.arcs) {
    result = typedEntities.arcs.reduce(function(acc, arc) {
      // Why on earth DXF has degree start & end angles for arc,
      // and radian start & end angles for ellipses is a mystery
      var polyline = interpolateElliptic(
        arc.x, arc.y,
        arc.r, arc.r,
        arc.startAngleDeg/180*Math.PI, arc.endAngleDeg/180*Math.PI);
      acc.push(transformPolyline(polyline, arc.transform));
      return acc;
    }, result);
  }

  // ----- Splines -----

  if (typedEntities.splines) {
    result = typedEntities.splines.reduce(function(acc, spline) {
      var controlPoints = spline.points.map(function(p) {
        return [p.x, p.y];
      });
      var order = spline.degree + 1;
      var knots = spline.knots;
      var polyline = [];
      for(var t=0; t<1; t+=0.01) {
        polyline.push(bspline(t, order, controlPoints, knots));
      }
      acc.push(transformPolyline(polyline, spline.transform));
      return acc;
    }, result);
  }

  return result;
};
