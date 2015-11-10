var pd = require('pretty-data').pd;

var BoundingBox = require('./BoundingBox');

// Escape HTML function from here:
// http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function(s) {
    return entityMap[s];
  });
}

var degToRad = Math.PI / 180;

// Output a float as a string.
// Consider this like %03f formatting. 3 decimal places that are significant no tailing zeros.
function floatToString(n) {
  n = n.toFixed(3).replace(/\.?0+$/, "");
  return n;
}

// Return a x,y point for use in SVG string.
// TODO: Use transformation matrix?
function pointToString(x, y, transform, delimiter) {
  var out = '';
  if (delimiter === undefined) {
    delimiter = ',';
  }
  if (!transform) {
    transform = {
      scale: 1,
      translate_x: 0,
      translate_y: 0
    };
  }
  out += floatToString(transform.scale * x - transform.translate_x) +
    delimiter + floatToString(-transform.scale * y - transform.translate_y) + " ";
  return out;
}

// function line_toSVGPath(line, transform) {
//   return 'M' + pointToString(line.start.x, line.start.y, transform) +
//     ' L' + pointToString(line.end.x, line.end.y, transform);
// }

function polyline_toSVGPath(polyline, transform) {
  var output = '';

  // Clone points to their own array
  var points = [];
  for (var j = 0; j < polyline.points.length; j++) {
    points.push({
      x: polyline.points[j].x,
      y: polyline.points[j].y,
      bulge: polyline.points[j].bulge
    });
  }
  var xold;
  var yold;
  var bulge;
  var r;

  if (polyline.points.length > 1) {
    // Add another point if closed path.
    if (polyline.closed) {
      points.push({
        x: points[0].x,
        y: points[0].y,
        bulge: 0
      });
    }

    xold = points[0].x;
    yold = points[0].y;
    output += 'M ' + pointToString(xold, yold, transform);

    for (j = 1; j < points.length; j++) {
      bulge = points[j - 1].bulge;
      if (bulge !== 0) {
        // sweep CCW
        var sweep = 0;
        if (bulge < 0) {
          // sweep CW
          sweep = 1;
          bulge = -bulge;
        }
        // large-arc-flag
        var large = 0;
        if (bulge > 1) {
          large = 1;
        }

        // Output an Arc.
        r = Math.sqrt(((points[j].x - xold) * (points[j].x - xold)) +
          ((points[j].y - yold) * (points[j].y - yold)));
        r = 0.25 * r * (bulge + 1.0 / bulge);
        output += ' A ' + floatToString(r) + ',' +
          floatToString(r) + ' 0 ' + large + ',' + sweep + ' ' +
          pointToString(points[j].x, points[j].y, transform);
      } else {
        output += ' L ' + pointToString(points[j].x, points[j].y, transform);
      }

      xold = points[j].x;
      yold = points[j].y;
    }

    if (polyline.closed) {
      output += 'z';
    }
  }
  return output;
}

function spline_toSVGPath(spline, transform) {
  var output = '';
  if (spline.points.length < 2) {
    // I don't think we can draw dots.
    return output;
  }

  // Process Line into SVG Line.

  // Move to start point
  var point = spline.points[0];
  output += 'M' + pointToString(point.x, point.y, transform) + ' C';

  // Output each line
  var n = spline.points.length;
  var controlcount = spline.points.length;
  var knotcount = spline.knots.length;

  // Clone points to their own array
  var points = [];
  for (var j = 0; j < controlcount; j++) {
    points.push({
      x: spline.points[j].x,
      y: spline.points[j].y
    });
  }

  // Copy knots into their own array
  var knots = [];
  for (j = 0; j < controlcount; j++) {
    knots[j] = spline.knots[j];
  }

  var a0;
  var a1;

  if (controlcount > 3 && knotcount === controlcount + 4) { // Cubic Spline
    if (controlcount > 4) {
      for (j = knotcount - 5; j > 3; j--) {
        if (knots[j] !== knots[j - 1] && knots[j] !== knots[j + 1]) {
          a0 = knots[j] - knots[j - 2] / (knots[j + 1] - knots[j - 2]);
          a1 = knots[j] - knots[j - 1] / (knots[j + 2] - knots[j - 1]);
          point = {
            x: (1.0 - a1) * points[j - 2].x + a1 * points[j - 1].x,
            y: (1.0 - a1) * points[j - 2].y + a1 * points[j - 1].y,
          };

          // Insert the calculated point from the knot into the control points.
          points.splice(j - 1, 0, point);
          points[j - 2].x = (1.0 - a0) * points[j - 3].x + a0 * points[j - 2].x;
          points[j - 2].y = (1.0 - a0) * points[j - 3].y + a0 * points[j - 2].y;
          knots.splice(j, 0, knots[j]);
        }

      }

      knotcount = knots.length;
      for (j = knotcount - 6; j > 3; j -= 2) {
        if (knots[j] !== knots[j + 2] &&
          knots[j - 1] !== knots[j + 1] &&
          knots[j - 2] !== knots[j]) {

          a1 = (knots[j] - knots[j - 1]) / (knots[j + 2] - knots[j - 1]);
          point = {
            x: (1.0 - a1) * points[j - 2].x + a1 * points[j - 1].x,
            y: (1.0 - a1) * points[j - 2].y + a1 * points[j - 1].y
          };
          points.splice(j - 1, 0, point);
        }
      }
    }

    controlcount = points.length;
    // Excluding the first point work in pairs of 3 to get the points for each curve part.
    n = Math.floor((controlcount - 1) / 3);
    output = 'M ' + pointToString(points[0].x, points[0].y, transform);
    for (j = 0; j < n; j++) {
      output += 'C ' +
          pointToString(points[3 * j + 1].x, points[3 * j + 1].y, transform) +
          ' ' + pointToString(points[3 * j + 2].x, points[3 * j + 2].y, transform) +
          ' ' + pointToString(points[3 * j + 3].x, points[3 * j + 3].y, transform) +
          ' ';
    }
  } else if (controlcount === 3 && knotcount === 6) { // Quadratic Spline
    output = 'M ' + pointToString(points[0].x, points[0].y, transform);
    output += ' Q ' + pointToString(points[1].x, points[1].y, transform) +
      ' ' + pointToString(points[2].x, points[2].y, transform);
  } else if (controlcount === 5 && knotcount === 8) { // Spliced Quadratic Spline
    output = 'M ' + pointToString(points[0].x, points[0].y, transform);
    output += ' Q ' + pointToString(points[1].x, points[1].y, transform) +
      ' ' + pointToString(points[2].x, points[2].y, transform);
    output += ' Q ' + pointToString(points[3].x, points[3].y, transform) +
      ' ' + pointToString(points[4].x, points[4].y, transform);
  }

  // Is it closed
  if (spline.closed) {
    output += 'z';
  }
  return output;
}

function arc_toSVGPath(arc, transform) {
  // http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
  // Find out the start point of the arc.
  // Rotation is Counter Clock-Wise in the DXF in degrees.
  var rx = arc.x + arc.r * Math.cos(arc.startAngleDeg * degToRad);
  var ry = arc.y + arc.r * Math.sin(arc.startAngleDeg * degToRad);

  // Assuming no x-axis rotation for arcs.
  var arcFlags = '0,0';

  // For SVG we need to determine if the arc is a large arc or a small arc.
  // See the link above for example in SVG documentation.
  if ((arc.endAngleDeg > arc.startAngleDeg) && ((arc.endAngleDeg - arc.startAngleDeg) > 180)) {
    arcFlags = '1,0';
  }

  // Find out the end point of the arc.
  var ex = arc.x + arc.r * Math.cos(arc.endAngleDeg * degToRad);
  var ey = arc.y + arc.r * Math.sin(arc.endAngleDeg * degToRad);
  return 'M' +
    pointToString(rx, ry, transform) + ' A' +
    floatToString(arc.r) + ',' +
    floatToString(arc.r) + ' 0 ' +
    arcFlags + ' ' +
    pointToString(ex, ey, transform);
}

// function circle_toSVGPath(circle, transform) {
//   // See here: http://stackoverflow.com/questions/5737975/
//   // circle-drawing-with-svgs-arc-path/10477334#10477334
//   // M cx cy
//   //   m -r, 0
//   //   a r,r 0 1,1 (r * 2),0
//   //   a r,r 0 1,1 -(r * 2),0
//   var r = floatToString(circle.r * transform.scale);
//   return 'M' + pointToString(circle.x, circle.y, transform) +
//     ' m ' + (-r) + ', 0 a ' + r + ',' + r + ' 0 1,1 ' + (r * 2) +
//     ',0 a ' + r + ',' + r + ' 0 1,1 ' + (-r * 2) + ',0 ';
// }

function hatch_toSVGPath(hatch, transform) {
  var output = '';
  if (hatch.points && hatch.fills && hatch.edge_types && hatch.path_types && hatch.edge_counts) {
    if (hatch.points.length > 1) {
      var start_points_count = 1; // count start points
      var line_end_point_count = 0; // count line end points
      var circles_count = 0; // count circles
      var edge_type_count = 0; // count edge type flags
      var xc;
      var yc;
      var rm;
      var a1;
      var a2;
      var diff;
      var sweep;
      var large;

      for (var i = 0; i < hatch.edge_counts.length; i++) {
        xc = hatch.points[start_points_count].x;
        yc = hatch.points[start_points_count].y;

        if (hatch.edge_types[edge_type_count] === 2) { // arc
          rm = hatch.r[circles_count];
          a1 = hatch.angle1[circles_count];

          output += 'M' +
            pointToString(xc + rm * Math.cos(a1 * degToRad),
              yc + rm * Math.sin(a1 * degToRad),
            transform);
        } else {
          a1 = 0;
          output += 'M' + pointToString(xc, yc, transform);
        }

        for (var j = 0; j < hatch.edge_counts[i]; j++) {
          if (hatch.path_types[i] & 2) { // polyline
            if (j > 0) {
              output += ' L' + pointToString(
                hatch.points[start_points_count].x,
                hatch.points[start_points_count].y,
                transform);
            }
            if (j === hatch.edge_counts[i] - 1) {
              edge_type_count++;
            }
          } else if (hatch.edge_types[edge_type_count] === 2) { // arc
            xc = hatch.points[start_points_count].x;
            yc = hatch.points[start_points_count].y;
            rm = hatch.r[circles_count];
            a2 = hatch.angle2[circles_count];
            diff = (a2 - a1 + 360) % (360);

            // sweep CCW
            sweep = 1 - hatch.ccws[circles_count];

            // large-arc-flag
            large = 0;

            if (diff) {
              output += ' A' + floatToString(rm) + ',' +
                floatToString(rm) + ' 0,0 ' + large + ' ' +
                sweep + ' ' + pointToString(
                  xc + rm * Math.cos(a2 * degToRad),
                  yc + rm * Math.sin(a2 * degToRad),
                  transform);
            } else {
              output += ' A' + floatToString(rm) + ',' +
                floatToString(rm) + ' 0,0 ' + large + ' ' +
                sweep + ' ' + pointToString(
                  xc + rm * Math.cos((a1 + 180.0) * degToRad),
                  yc + rm * Math.sin((a1 + 180.0) * degToRad),
                  transform);
              output += ' A' + floatToString(rm) + ',' +
                floatToString(rm) + ' 0,0 ' + large + ' ' +
                sweep + ' ' + pointToString(
                  xc + rm * Math.cos(a1 * degToRad),
                  yc + rm * Math.sin(a1 * degToRad),
                  transform);
            }

            circles_count++;
            edge_type_count++;
          } else if (hatch.edge_types[edge_type_count] === 1) { // line
            output += ' L' + pointToString(
              hatch.line_points[line_end_point_count].x,
              hatch.line_points[line_end_point_count].y,
              transform);
            line_end_point_count++;
            edge_type_count++;
          }

          start_points_count++;
        }
        output += "z";
      }
    }
  }
  return output;
}

//
// // This SVG generating code does not currently handle block records.
// // Splines are questionable.
// // Example Usage: This can be rendered with RaphelJS
// function toSVGPath(collector, layers, transform) {
//   // Note all Y axis must be flipped this is handled in
//   // our pointToString function for the most part.
//   if (transform === undefined) {
//     var bbox = collector.getBBox(layers);
//     transform = {
//       scale: 1,
//       translate_x: bbox.left,
//       translate_y: bbox.bottom
//     };
//   }
//
//   if (layers === undefined) {
//     layers = ['*'];
//   }
//
//   if (typeof(layers) === 'string') {
//     layers = layers.split(',');
//   }
//
//   var i;
//   if (Array.isArray(layers)) {
//     for (i = 0; i < layers.length; i++) {
//       layers[i] = layers[i].trim();
//     }
//   }
//
//   var allLayers = layers.indexOf('*') !== -1;
//
//   var output = '';
//
//   // Process Lines
//   var lines = collector.lines;
//   for (i = 0; i < lines.length; i++) {
//     var line = lines[i];
//     if (allLayers || layers.indexOf(line.layer) !== -1) {
//       output += line_toSVGPath(line, transform) + ' ';
//     }
//   }
//
//   // Process Poly Line
//   var polylines = collector.lwpolylines;
//   for (i = 0; i < polylines.length; i++) {
//     var polyline = polylines[i];
//     if (allLayers || layers.indexOf(polyline.layer) !== -1) {
//       output += polyline_toSVGPath(polyline, transform) + ' ';
//     }
//   }
//
//   // Process Splines
//   var splines = collector.splines;
//   for (i = 0; i < splines.length; i++) {
//     var spline = splines[i];
//     if (allLayers || layers.indexOf(spline.layer) !== -1) {
//       output += spline_toSVGPath(spline, transform) + ' ';
//     }
//   }
//
//   // Process Arcs
//   var arcs = collector.arcs;
//   for (i = 0; i < arcs.length; i++) {
//     var arc = arcs[i];
//     if (allLayers || layers.indexOf(arc.layer) !== -1) {
//       output += arc_toSVGPath(arc, transform) + ' ';
//     }
//   }
//
//   // Process Circles
//   var circles = collector.circles;
//   for (i = 0; i < circles.length; i++) {
//     var circle = circles[i];
//     if (allLayers || layers.indexOf(circle.layer) !== -1) {
//       // For path we make a circle out of two arcs.
//       // (Although in hindsight it could be made from one?)
//       output += circle_toSVGPath(circle, transform) + ' ';
//     }
//   }
//
//   // Process Hatches
//   var hatches = collector.hatches;
//   for (i = 0; i < hatches.length; i++) {
//     var hatch = hatches[i];
//     if (allLayers || layers.indexOf(hatch.layer) !== -1) {
//       output += hatch_toSVGPath(hatch, transform) + ' ';
//     }
//   }
//
//   var blocks = collector.blocks;
//   for (i in blocks) {
//     if (i.charAt(0) !== '*' &&
// blocks.hasOwnProperty(i) && allLayers || layers.indexOf(i) !== -1) {
//       output += toSVGPath(blocks[i], '0', transform);
//     }
//   }
//   return output;
// }
//

// This function attempts to generate a bounding box for what would be rendered for an SVG.
function getBBox(collector, layers, depth) {
  if (layers === undefined) {
    layers = ['*'];
  }
  if (depth === undefined) {
    depth = 0;
  }
  if (typeof(layers) === 'string') {
    layers = layers.split(',');
  }
  var i;
  var j;
  if (Array.isArray(layers)) {
    for (i = 0; i < layers.length; i++) {
      layers[i] = layers[i].trim();
    }
  }
  var allLayers = layers.indexOf('*') !== -1;

  var bbox = new BoundingBox();

  // Process Lines
  var lines = collector.lines;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (allLayers || layers.indexOf(line.layer) !== -1) {
      bbox.expandByPoint(line.start.x, line.start.y);
      bbox.expandByPoint(line.end.x, line.end.y);
    }
  }
  // Process Poly Line
  var polylines = collector.lwpolylines;
  var point;
  for (i = 0; i < polylines.length; i++) {
    // Poly Lines can have a bulge which translates to an arc.
    // TODO: Handle arc of poly line when generating BBox.
    var polyline = polylines[i];
    if (allLayers || layers.indexOf(polyline.layer) !== -1) {
      for (j = 0; j < polyline.points.length; j++) {
        point = polyline.points[j];
        bbox.expandByPoint(point.x, point.y);
      }
    }
  }
  // Process Splines
  // TODO: Bounding box of spline. For now we are just using the control points.
  var splines = collector.splines;
  for (i = 0; i < splines.length; i++) {
    var spline = splines[i];
    if (allLayers || layers.indexOf(spline.layer) !== -1) {
      for (j = 0; j < spline.points.length; j++) {
        point = spline.points[j];
        bbox.expandByPoint(point.x, point.y);
      }
    }
  }
  // Process Arcs
  var arcs = collector.arcs;
  for (i = 0; i < arcs.length; i++) {
    var arc = arcs[i];
    if (allLayers || layers.indexOf(arc.layer) !== -1) {
      // TODO: bounding box of arc.
      bbox.expandByPoint(arc.x, arc.y);
    }
  }
  // Process Circles
  var circles = collector.circles;
  for (i = 0; i < circles.length; i++) {
    var circle = circles[i];
    if (allLayers || layers.indexOf(circle.layer) !== -1) {
      bbox.expandByPoint(circle.x - circle.r, circle.y - circle.r);
      bbox.expandByPoint(circle.x + circle.r, circle.y + circle.r);
    }
  }
  // TODO BBox of Text
  var texts = collector.texts;
  for (i = 0; i < texts.length; i++) {
    var text = texts[i];
    if (allLayers || layers.indexOf(texts.layer) !== -1) {
      // We could possibly find the size of text and then split into lines.
      // For text that is a render-able character we would then work out the size it takes up.
      // Tabs could be counted as 2 space?.
      // var currentCharCount = 0;
      // var charCount = 0;
      // var lineCount = 0;
      // for (var j=0; j< text.text.length; j++) {
      // TODO: Is writeable character /[^\x20-\x7E]+/g
      // if ('\r\n\t'.indexOf(text.text.charAt(j)) !== -1) {
      //     if (text.text.charAt(j)==='\n') {
      //         lineCount++;
      //         if (currentCharCount > charCount) {
      //             charCount = currentCharCount;
      //         }
      //         currentCharCount = 0;
      //         continue;
      //         }
      //     } else  {
      //         currentCharCount++;
      //     }
      // }
      // if (currentCharCount > charCount) {
      //     charCount = currentCharCount;
      // }
      // Assume fixed width/height of char and padding.
      bbox.expandByPoint(text.x, text.y);
    }
  }
  // Process Hatches
  var hatches = collector.hatches;
  for (i = 0; i < hatches.length; i++) {
    var hatch = hatches[i];
    if (allLayers || layers.indexOf(hatch.layer) !== -1) {
      var points = hatch.points;
      // TODO: Improve hatch bbox to include circles and line lengths.
      for (j = 0; j < points.length; j++) {
        point = points[j];
        bbox.expandByPoint(point.x, point.y);
      }
    }
  }


  var dimensions = collector.dimensions;
  for (i = 0; i < dimensions.length; i++) {
    var dimension = dimensions[i];
    if (allLayers || layers.indexOf(dimension.layer) !== -1) {
      if (dimension.block_name) {
        if (dimension.x < bbox.left) {
          bbox.left = dimension.x;
        }
        if (dimension.x > bbox.right) {
          bbox.right = dimension.x;
        }
        if (dimension.y < bbox.bottom) {
          bbox.bottom = dimension.y;
        }
        if (dimension.y > bbox.top) {
          bbox.top = dimension.y;
        }
        if (collector.blocks[dimension.block_name] && dimension.block_unique_reference) {
          var dimension_bbox = getBBox(collector.blocks[dimension.block_name], layers, depth + 1);
          if (dimension_bbox.left < bbox.left) {
            bbox.left = dimension_bbox.left;
          }
          if (dimension_bbox.right > bbox.right) {
            bbox.right = dimension_bbox.right;
          }
          if (dimension_bbox.bottom < bbox.bottom) {
            bbox.bottom = dimension_bbox.bottom;
          }
          if (dimension_bbox.top > bbox.top) {
            bbox.top = dimension_bbox.top;
          }
        }
      }
    }
  }

  var blockBoundingBoxes = {};
  var blocks = collector.blocks;
  for (var name in blocks) {
    var block = blocks[name];
    if (name.charAt(0) !== '*' && blocks.hasOwnProperty(name)) {
      var block_bbox = getBBox(block, '*', depth + 1);
      blockBoundingBoxes[block.name] = block_bbox;
    }
  }

  for (i = 0; i < collector.inserts.length; ++i) {
    var insert = collector.inserts[i];
    bbox.expandByTranslatedBox(blockBoundingBoxes[insert.blockName], insert.x, insert.y);
  }

  // If this is the uppermost level of recursion (first call).
  // Then zero any parts of bbox that are still unknown.
  if (depth === 0) {
    if (!isFinite(bbox.left)) {
      bbox.left = 0;
    }
    if (!isFinite(bbox.right)) {
      bbox.right = 0;
    }
    if (!isFinite(bbox.bottom)) {
      bbox.bottom = 0;
    }
    if (!isFinite(bbox.top)) {
      bbox.top = 0;
    }
  }
  // If we have appropriate values then calculate width and height.
  if (isFinite(bbox.left) && isFinite(bbox.right)) {
    bbox.width = bbox.right - bbox.left;
  }
  if (isFinite(bbox.top) && isFinite(bbox.bottom)) {
    bbox.height = bbox.top - bbox.bottom;
  }
  return bbox;
}

// This function should go through all of the entities that can be rendered to SVG and render them.
// The function is recursive and is recalled for rendering blocks.
// Layers can be passed as a comma separated string or an array of strings.
//
// Example: collector.toSVG('Product, Dimensions')
// Would generate a SVG containing only the Product and Dimensions layers.
function toSVG(collector, layers, transform, asgroup) {
  // TODO: Load block records and render them accordingly.
  // Note all Y axis must be flipped.
  var bbox = getBBox(collector, layers);
  var i;
  // If a transformation has not been specified we want to calculate one.
  // if (transform === undefined) {
  //   bbox = getBBox(collector, layers);
  //
  //   // Work out the transform values.
  //   // For now we just move the data on the x axis so its anchored to 0.
  //   // And we don't move Y as it seems to be okay in the test files I have.
  //   transform = {
  //     scale: 1,
  //     translate_x: bbox.left,
  //     translate_y: 0
  //   };
  // } else if (transform === null) {
  //   // If transform was specified as null then don't translate/scale/rotate
  // }

  transform = {
    scale: 1,
    translate_x: 0,
    translate_y: 0
  };

  if (layers === undefined) {
    layers = ['*'];
  }

  if (typeof(layers) === 'string') {
    layers = layers.split(',');
  }

  if (Array.isArray(layers)) {
    for (i = 0; i < layers.length; i++) {
      layers[i] = layers[i].trim();
    }
  }

  var allLayers = layers.indexOf('*') !== -1;

  var output = '';
  var blocks = collector.blocks;
  var dimensions = collector.dimensions;
  var dimension;

  // If this SVG call is the top level in recursion.
  // Then we want to output some definitions.
  // These will be any markers used and blocks that will be used.
  if (asgroup === undefined) {
    // TODO Output markers based on line types?
    output += '<defs>';
    output += '<marker markerWidth="30" markerHeight="30" orient="auto" ' +
      'refX="30" refY="15" id="longDimensionArrow">';
    output += '  <path d="m0,15 l30,5 l0,-10z" />';
    output += '</marker>';
    output += '<marker markerWidth="30" markerHeight="30" orient="auto" ' +
      'refX="0" refY="15" id="longDimensionArrowEnd">';
    output += '  <path d="m30,15 l-30,5 l0,-10z" />';
    output += '</marker>';

    var dimensionBlockNames = [];
    for (i = 0; i < dimensions.length; i++) {
      dimension = dimensions[i];
      if (allLayers || layers.indexOf(dimension.layer) !== -1) {
        var block = blocks[dimension.block_name];
        if (dimension.type === 0) {
          // Hack for getting dimension marker for length to show arrows.
          // I could not identify line styling to do this.
          // Maybe it is better to throw away the dimension
          // block and redraw it according to the type of dimension?
          if (block.lines.length === 4) {
            block.lines[2].startMarker = 'longDimensionArrow';
            block.lines[3].startMarker = 'longDimensionArrow';
          } else {
            block.lines[2].startMarker = 'longDimensionArrow';
            block.lines[2].endMarker = 'longDimensionArrowEnd';
          }
        }
        dimensionBlockNames.push(dimension.block_name);
      }
    }
    for (i in blocks) {
      if (blocks.hasOwnProperty(i) && (dimensionBlockNames.indexOf(i) !== -1) ||
        (allLayers || layers.indexOf(i) !== -1)) {
        output += toSVG(blocks[i], '*', null, true /* asgroup */);
      }
    }
    output += '</defs>';
  }
  // Process Lines
  var lines = collector.lines;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (allLayers || layers.indexOf(line.layer) !== -1) {
      var startMarker = '';
      var endMarker = '';
      if (line.startMarker) {
        startMarker = 'marker-start: url(#' + line.startMarker + ');';
      }
      if (line.endMarker) {
        endMarker = 'marker-end: url(#' + line.endMarker + ');';
      }
      output += '<line style="' + startMarker + endMarker +
        '" x1="' + floatToString(line.start.x - transform.translate_x) +
        '" y1="' + floatToString(-line.start.y - transform.translate_y) +
        '" x2="' + floatToString(line.end.x - transform.translate_x) +
        '" y2="' + floatToString(-line.end.y - transform.translate_y) +
        '" stroke="black" stroke-width="' + (line.thickness || 1) + '"></line>';
    }
  }
  // Process Poly Line
  var polylines = collector.lwpolylines;
  for (i = 0; i < polylines.length; i++) {
    var polyline = polylines[i];
    if (allLayers || layers.indexOf(polyline.layer) !== -1) {
      output += '<path fill="none" stroke="black" stroke-width="1" d="' +
      polyline_toSVGPath(polyline, transform) + '"/>';
    }
  }
  // Process Splines
  var splines = collector.splines;
  for (i = 0; i < splines.length; i++) {
    var spline = splines[i];
    if (allLayers || layers.indexOf(spline.layer) !== -1) {
      output += '<path fill="none" stroke="black" stroke-width="1" d="' +
        spline_toSVGPath(spline, transform) + '"/>';
    }
  }
  // Process Arcs
  var arcs = collector.arcs;
  for (i = 0; i < arcs.length; i++) {
    var arc = arcs[i];
    if (allLayers || layers.indexOf(arc.layer) !== -1) {
      output += '<path fill="none" stroke="black" stroke-width="1" d="' +
        arc_toSVGPath(arc, transform) + '"/>';
    }
  }
  // Process Circles
  var circles = collector.circles;
  for (i = 0; i < circles.length; i++) {
    var circle = circles[i];
    if (allLayers || layers.indexOf(circle.layer) !== -1) {
      // Process Circle into two SVG Arcs
      var fill = 'none';
      var stroke = 'black';
      output += '<circle cx="' + floatToString(circle.x - transform.translate_x) +
        '" cy="' + floatToString(-circle.y - transform.translate_y) +
        '" r="' + floatToString(circle.r * transform.scale) +
        '" stroke="' + stroke + '" fill=" ' + fill +
        '" stroke-width="' + (circle.thickness || 1) + '" />';
    }
  }
  // Process Hatches
  var hatches = collector.hatches;
  for (i = 0; i < hatches.length; i++) {
    var hatch = hatches[i];
    if (allLayers || layers.indexOf(hatch.layer) !== -1) {
      output += '<path fill="none" stroke="black" stroke-width="1" d="' +
        hatch_toSVGPath(hatch, transform) + '"/>';
    }
  }
  // Process text layers
  var texts = collector.texts;
  for (i = 0; i < texts.length; i++) {
    var text = texts[i];
    if (allLayers || layers.indexOf(text.layer) !== -1) {
      // TODO: Handle font family better.
      // font-family="Verdana" font-size="55"
      // if text is rotated transform="rotate(30 20,40)
      // var style = collector.styles[text.styleName];
      // var fontFamily = 'romansregular';
      // if (style) {
      //     if (style.fontFamily === 'technic_.ttf') {
      //         fontFamily = 'technicalregular'
      //     }
      // }
      var anchor = 'middle';
      var valign = 'middle';
      // TODO: Get size of font working better, '+(text.height || 12)+'px
      // TODO: Handle rotation of fonts, scale, italic, underline etc.
      output += '<text x="' + floatToString(text.x - transform.translate_x) +
        '" y="' + floatToString(-text.y - transform.translate_y) +
        '" font-size="2em" font-weight="' + (text.thickness || 0) +
        '"  transform="rotate(' + text.rotation + ' ' +
        pointToString(text.x - transform.translate_x, -text.y - transform.translate_y) +
        ')" text-anchor="' + anchor + '" alignment-baseline="' + valign + '">' +
        escapeHtml(text.text) + '</text>';
    }
  }
  // An insert is a record saying how to render a block.
  // In SVG we can output the blocks as SVG in the defines area (defs)
  // See: http://tutorials.jenkov.com/svg/use-element.html for more information on the use element.
  var inserts = collector.inserts;
  for (i = 0; i < inserts.length; i++) {
    var insert = inserts[i];
    if (allLayers || layers.indexOf(insert.layer) !== -1) {
      output += '<use xlink:href="#' + insert.blockName +
        '" transform="translate(' + pointToString(insert.x, insert.y, transform) + ')" />';
    }
  }
  // Output the dimensions where possible.
  for (i = 0; i < dimensions.length; i++) {
    dimension = dimensions[i];
    if (allLayers || layers.indexOf(dimension.layer) !== -1) {
      if (dimension.block_name) {
        if (dimension.block_unique_reference) {
          output += '<use xlink:href="#' + dimension.block_name +
            '" transform="translate(' + pointToString(0, 0, transform) + ')" />';
        }
      }
    }
  }
  // Output an name as an ID if this Collector has a name.
  var id = '';
  if (collector.name !== undefined && collector.name !== '') {
    id = ' id="' + collector.name + '"';
  }
  if (output === '') {
    return output;
  }
  // Return group if requested.
  // The contents of blocks will be inside groups.
  if (asgroup) {
    return '<g' + id + '>' + output + '</g>';
  } else {
    // the SVG String to add to the output.
    // And view box that will crop the SVG to just the area of interest defined by the Bounding Box.
    var svgString = '<svg' + id + ' xmlns="http://www.w3.org/2000/svg"' +
      ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
    if (bbox) {
      svgString += ' preserveAspectRatio="xMinYMin meet"';
      svgString += ' viewBox="' +
        floatToString(-1 + bbox.left) +
        ' ' + floatToString(-1 - bbox.top) +
        ' ' + floatToString(bbox.width + 1) +
        ' ' + floatToString(bbox.height + 1) + '"';
    }
    var result = svgString + ' width="100%" height="100%">' + output + '</svg>';
    return pd.xml(result);
  }
}

module.exports = toSVG;
