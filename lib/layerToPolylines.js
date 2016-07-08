
'use strict';

const bspline = require('b-spline');

const createArcForLWPolyine = require('./util/createArcForLWPolyline');

/**
 * Rotate a set of points
 * @param points the points
 * @param angle the rotation angle
 */
const rotate = (points, angle) => {
  return points.map(function(p) {
    return [
      p[0]*Math.cos(angle) - p[1]*Math.sin(angle),
      p[1]*Math.cos(angle) + p[0]*Math.sin(angle),
    ];
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
const interpolateElliptic = (cx, cy, rx, ry, start, end, rotationAngle) => {
  if (end < start) {
    end += Math.PI*2;
  }

  // ----- Relative points -----

  // Start point
  let points = [];
  const dTheta = Math.PI*2/72;
  const EPS = 1e-6;
  for (let theta = start; theta < end - EPS; theta += dTheta) {
    points.push([
      Math.cos(theta)*rx,
      Math.sin(theta)*ry,
    ]);
  }
  points.push([
    Math.cos(end)*rx,
    Math.sin(end)*ry,
  ]);

  // ----- Rotate -----
  if (rotationAngle) {
    points = rotate(points, rotationAngle);
  }

  // ----- Offset center -----
  points = points.map(function(p) {
    return [cx + p[0], cy + p[1]];
  });

  return points;
};

const applyTransforms = (polyline, transforms) => {
  return transforms.reduce((acc, transform) => {
    return polyline.map(function(p) {
      if (transform.xScale || transform.yScale) {
        p = [
          p[0]*transform.xScale,
          p[1]*transform.yScale,
        ];
      }
      if (transform.rotation) {
        const angle = transform.rotation/180*Math.PI;
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
  }, polyline);
};

/**
 * Convert a parsed DXF to a set of polylines. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */
module.exports = function(layer) {

  return layer.reduce((acc, entity) => {

    let polyline;

    if (entity.type === 'LINE') {
      polyline = [
        [
          entity.start.x,
          entity.start.y,
        ],
        [
          entity.end.x,
          entity.end.y,
        ]
      ];
    }

    if ((entity.type === 'LWPOLYLINE') || (entity.type === 'POLYLINE')) {
      polyline = [];
      for (let i = 0, il = entity.vertices.length; i < il - 1; ++i) {
        const from = [entity.vertices[i].x, entity.vertices[i].y];
        const to = [entity.vertices[i + 1].x, entity.vertices[i + 1].y];
        polyline.push(from);
        if (entity.vertices[i].bulge) {
          polyline = polyline.concat(
            createArcForLWPolyine(from, to, entity.vertices[i].bulge));
        }
        if (i === il - 2) {
          polyline.push(to);
        }
      }
      if (entity.closed) {
        polyline.push(polyline[0]);
      }

    }

    if (entity.type === 'CIRCLE') {
      polyline = interpolateElliptic(
        entity.x, entity.y,
        entity.r, entity.r,
        0, Math.PI*2);
    }

    if (entity.type === 'ELLIPSE') {
      const rx = Math.sqrt(entity.majorX*entity.majorX + entity.majorY*entity.majorY);
      const ry = entity.axisRatio * rx;
      const majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX);

      polyline = interpolateElliptic(
        entity.x, entity.y,
        rx, ry,
        entity.startAngle,
        entity.endAngle,
        majorAxisRotation);
    }

    if (entity.type === 'ARC') {
      // Why on earth DXF has degree start & end angles for arc,
      // and radian start & end angles for ellipses is a mystery
      polyline = interpolateElliptic(
        entity.x, entity.y,
        entity.r, entity.r,
        entity.startAngle,
        entity.endAngle);
    }

    if (entity.type === 'SPLINE') {
      const controlPoints = entity.controlPoints.map(function(p) {
        return [p.x, p.y];
      });
      const order = entity.degree + 1;
      const knots = entity.knots;
      polyline = [];
      for(let t=0; t<=100; t+=1) {
        const p = bspline(t/100, order, controlPoints, knots);
        polyline.push(p);
      }
    }

    if (polyline) {
      acc.push(applyTransforms(polyline, entity.transforms));
    }
    return acc;
  }, []);

};
