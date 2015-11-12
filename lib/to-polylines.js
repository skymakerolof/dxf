/**
 * Convert a parsed DXF to a set of polylines. These can be used to render the
 * the DXF in SVG, Canvas, WebGL etc., without depending on native support
 * of primitive objects (ellispe, spline etc.)
 */

function toPolylines(collector, transform) {
  var result = [];

  result = collector.lines.reduce(function(acc, line) {
    acc.push([
      line.start.x + transform.dx,
      line.start.y + transform.dy,
    ]);
    acc.push([
      line.end.x + transform.dx,
      line.end.y + transform.dy,
    ]);
    return acc;
  }, result);

  return result;
}

module.exports = toPolylines;
