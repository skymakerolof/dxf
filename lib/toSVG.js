'use strict';

const pd = require('pretty-data').pd;

const BoundingBox = require('./BoundingBox');
const layerToPolylines = require('./layerToPolylines');

function polylineToPath(color, polyline) {
  const rgb = color[2] | (color[1] << 8) | (color[0] << 16);
  const hex = '#' + rgb.toString(16);

  console.log('>>>', polyline);
  var d = polyline.reduce(function(acc, point, i) {
    acc += (i === 0) ?'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="' + hex + '" stroke-width="0.5" d="' + d + '"/>';
}

/**
 * Convert the interpolate polylines to SVG
 */
module.exports = function(byLayer) {

  let coloredPolylines = [];
  for (let layerName in byLayer) {
    const layer = byLayer[layerName];
    coloredPolylines.push({
      color: layer.color,
      polylines: layerToPolylines(layer.entities),
    });
  }


  let bbox = new BoundingBox();
  coloredPolylines.forEach((coloredPolyline) => {
    coloredPolyline.polylines.forEach(polyline => {
      polyline.forEach(point => {
        bbox.expandByPoint(point[0], point[1]);
      });
    });
  });

  const paths = [];
  coloredPolylines.forEach((coloredPolyline) => {
    coloredPolyline.polylines.forEach(polyline => {
      var p2 = polyline.map(function(p) {
        return [p[0], bbox.maxY - p[1]];
      });
      paths.push(polylineToPath(coloredPolyline.color, p2));
    });
  });

  let svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' +
    (-1 + bbox.minX) + ' ' +
    (-1) + ' ' +
    (bbox.width + 2) + ' ' +
    (bbox.height + 2) + '"';
  svgString += ' width="100%" height="100%">' + paths + '</svg>';
  return pd.xml(svgString);
};
