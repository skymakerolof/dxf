'use strict';

const pd = require('pretty-data').pd;

const BoundingBox = require('./BoundingBox');

function polylineToPath(polyline) {
  var d = polyline.reduce(function(acc, point, i) {
    acc += (i === 0) ?'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="black" stroke-width="0.5" d="' + d + '"/>';
}

/**
 * Convert the interpolate polylines to SVG
 */
module.exports = function(polylines) {

  var bbox = polylines.reduce(function(acc, polyline) {
    return polyline.reduce(function(acc, point) {
      acc.expandByPoint(point[0], point[1]);
      return acc;
    }, acc);
  }, new BoundingBox());

  var contents = polylines.reduce(function(acc, polyline) {
    // SVG is Y reversed
    var p2 = polyline.map(function(p) {
      return [p[0], bbox.maxY - p[1]];
    });

    acc += polylineToPath(p2);
    return acc;
  }, '');

  let svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' +
    (-1 + bbox.minX) + ' ' +
    (-1) + ' ' +
    (bbox.width + 2) + ' ' +
    (bbox.height + 2) + '"';
  svgString += ' width="100%" height="100%">' + contents + '</svg>';
  return pd.xml(svgString);
};
