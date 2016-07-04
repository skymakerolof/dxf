'use strict';

const v2 = require('vecks').vec2;

/**
 * Create the arcs point for a LWPOLYLINE. The start and end are excluded
 */
module.exports = (from, to, bulge, resolution) => {
  // Resolution in degrees
  if (!resolution) {
    resolution = 5;
  }
  const theta = Math.atan(bulge)*4;
  // console.log('theta', theta);

  const a = to;
  const b = from;
  const ab = v2.sub(b, a);
  const l_ab = v2.length(ab);
  // console.log('l_ab', l_ab);
 
  const c = v2.add(a, v2.multiply(ab, 0.5));

  // Distance from center of arc to line between form and to points
  const l_cd = Math.abs((l_ab/2)/Math.tan(theta/2));
  // console.log('c', c);
  // console.log('l_cd', l_cd);

  const norm_ab = v2.norm(ab);

  let d;
  if (theta < Math.PI) {
    const norm_dc = [
      norm_ab[0]*Math.cos(Math.PI/2) - norm_ab[1]*Math.sin(Math.PI/2),
      norm_ab[1]*Math.cos(Math.PI/2) + norm_ab[0]*Math.sin(Math.PI/2),
    ];

    // D is the center of the arc
    d = v2.add(c, v2.multiply(norm_dc, -l_cd));
  } else {
    const norm_cd = [
      norm_ab[0]*Math.cos(Math.PI/2) - norm_ab[1]*Math.sin(Math.PI/2),
      norm_ab[1]*Math.cos(Math.PI/2) + norm_ab[0]*Math.sin(Math.PI/2),
    ];

    // D is the center of the arc
    d = v2.add(c, v2.multiply(norm_cd, l_cd));
  }

  // console.log('d', d);

  // Add points between start start and eng angle relative
  // to the center point
  const startAngle = Math.atan2(b[1] - d[1], b[0] - d[0])/Math.PI*180;
  let endAngle = Math.atan2(a[1] - d[1], a[0] - d[0])/Math.PI*180;
  if (endAngle < 0) {
    endAngle += 360;
  }
  const r = v2.length(v2.sub(b, d));
  // console.log('startAngle', startAngle);
  // console.log('endAngle', endAngle);

  const startInter = Math.floor(startAngle/resolution)*resolution + resolution;
  const endInter = Math.ceil(endAngle/resolution)*resolution - resolution;
  // console.log('startInter', startInter);
  // console.log('endInter', endInter);

  const points = [];
  for (let i = startInter; i <= endInter; i += resolution) {
    points.push(v2.add(d, [
      Math.cos(i/180*Math.PI)*r,
      Math.sin(i/180*Math.PI)*r,
    ]));
  }
  return points;
};
