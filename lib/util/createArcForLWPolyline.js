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