/**
 * Convert a parsed DXF to a set of polylines. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */

function toPolylines(collector) {
  var result = [];

  // ----- Lines -----
  result = collector.lines.reduce(function(acc, line) {
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

  // ----- LWPolylines -----
  result = collector.lwpolylines.reduce(function(acc, lwpolyline) {
    acc.push(lwpolyline.points.map(function(p) {
      return [p.x,p.y];
    }));
    return acc;
  }, result);


  return result;
}

module.exports = toPolylines;
