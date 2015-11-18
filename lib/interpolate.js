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

function addEntities(typedEntities, transform) {
  var result = [];

  // ----- Lines -----
  if (typedEntities.lines) {
    result = typedEntities.lines.reduce(function(acc, line) {
      acc.push([
        [
          line.start.x,
          line.start.y,
        ],
        [
          line.end.x,
          line.end.y,
        ]
      ]);
      return acc;
    }, result);
  }

  // ----- LWPolylines -----
  if (typedEntities.lwpolylines) {
    result = typedEntities.lwpolylines.reduce(function(acc, lwpolyline) {
      acc.push(lwpolyline.points.map(function(p) {
        return [p.x,p.y];
      }));
      return acc;
    }, result);
  }

  // ----- Circles, Arcs, Ellipses -----

  if (typedEntities.circles) {
    result = typedEntities.circles.reduce(function(acc, circle) {
      acc.push(interpolateElliptic(
        circle.x, circle.y,
        circle.r, circle.r,
        0, Math.PI*2));
      return acc;
    }, result);
  }

  if (typedEntities.ellipses) {
    result = typedEntities.ellipses.reduce(function(acc, ellipse) {
      var rx = Math.sqrt(ellipse.majorX*ellipse.majorX + ellipse.majorY*ellipse.majorY);
      var ry = ellipse.axisRatio * rx;
      var majorAxisRotation = -Math.atan2(-ellipse.majorY, ellipse.majorX);

      acc.push(interpolateElliptic(
        ellipse.x, ellipse.y,
        rx, ry,
        ellipse.startAngleRad, ellipse.endAngleRad,
        majorAxisRotation));
      return acc;
    }, result);
  }

  if (typedEntities.arcs) {
    result = typedEntities.arcs.reduce(function(acc, arc) {
      // Why on earth DXF has degree start & end angles for arc,
      // and radian start & end angles for ellipses is a mystery
      acc.push(interpolateElliptic(
        arc.x, arc.y,
        arc.r, arc.r,
        arc.startAngleDeg/180*Math.PI, arc.endAngleDeg/180*Math.PI));
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
      var points = [];
      for(var t=0; t<1; t+=0.01) {
        points.push(bspline(t, order, controlPoints, knots));
      }
      acc.push(points);
      return acc;
    }, result);
  }

  // ----- Transform -----

  if (transform) {
    result = result.map(function(polyline) {
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
    });
  }

  return result;
}

/**
 * Convert a parsed DXF to a set of polylines. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */

function toPolylines(collector) {

  // Transform the structure so that the entities belonging to
  // blocks are places in that block's entity list
  var rootEntities = {};
  var blockEntities = {};
  [
    'lines',
    'lwpolylines',
    'circles',
    'ellipses',
    'arcs',
    'splines',
    'hatches',
    'dimensions'
  ].forEach(function(typeLabel) {
    collector[typeLabel].forEach(function(obj) {
      if (obj.block !== undefined) {
        if (!blockEntities[obj.block]) {
          blockEntities[obj.block] = [];
        }
        if (!blockEntities[obj.block][typeLabel]) {
          blockEntities[obj.block][typeLabel] = [];
        }
        blockEntities[obj.block][typeLabel].push(obj);
      } else {
        if (!rootEntities[typeLabel]) {
          rootEntities[typeLabel] = [];
        }
        rootEntities[typeLabel].push(obj);
      }
    });
  });

  var result = addEntities(rootEntities);

  // ----- Inserts -----

  collector.inserts.forEach(function(insert) {
    var block = collector.blocks[insert.blockName];
    var transform = {
      x: insert.x,
      y: insert.y,
      xScale: insert.xscale,
      yScale: insert.yscale,
      rotation: insert.rotation,
    };
    result = result.concat(addEntities(blockEntities[block.name], transform));
  });

  return result;
}

module.exports = toPolylines;
