'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prettyData = require('pretty-data');

var _BoundingBox = require('./BoundingBox');

var _BoundingBox2 = _interopRequireDefault(_BoundingBox);

var _denormalise = require('./denormalise');

var _denormalise2 = _interopRequireDefault(_denormalise);

var _entityToPolyline = require('./entityToPolyline');

var _entityToPolyline2 = _interopRequireDefault(_entityToPolyline);

var _colors = require('./util/colors');

var _colors2 = _interopRequireDefault(_colors);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var polylineToPath = function polylineToPath(rgb, polyline) {
  var color24bit = rgb[2] | rgb[1] << 8 | rgb[0] << 16;
  var prepad = color24bit.toString(16);
  for (var i = 0, il = 6 - prepad.length; i < il; ++i) {
    prepad = '0' + prepad;
  }
  var hex = '#' + prepad;

  // SVG is white by default, so make white lines black
  if (hex === '#ffffff') {
    hex = '#000000';
  }

  var d = polyline.reduce(function (acc, point, i) {
    acc += i === 0 ? 'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="' + hex + '" stroke-width="0.1%" d="' + d + '"/>';
};

function mtextToText(point, text, anchor) {
  /*  DXF Attachment point:
      1 = Top left; 2 = Top center; 3 = Top right;
      4 = Middle left; 5 = Middle center; 6 = Middle right;
      7 = Bottom left; 8 = Bottom center; 9 = Bottom right */

  let textAnchor = 'start'
  let hang = ''
  switch (anchor) {
    case 1:
      hang = 'dominant-baseline: hanging;'
      break;
    case 2:
      hang = 'dominant-baseline: hanging;'
    case 5:
    case 8:
      textAnchor = 'middle'
      break;
    case 3:
      hang = 'dominant-baseline: hanging;'
    case 6:
    case 9:
      textAnchor = 'end'
      break;
  }

  return `<text x="${point[0]}" y="${point[1]}" text-anchor="${textAnchor}" style="font-size: 1px; ${hang}">${text}</text>`
}

/**
 * Convert the interpolate polylines to SVG
 */

exports.default = function (parsed) {
  var entities = (0, _denormalise2.default)(parsed);
  var polylines = entities.map(function (e) {
    return (0, _entityToPolyline2.default)(e);
  });

  // TODO: better combine with polylines to avoid two loops
  const mtexts = entities.filter(e => e.type === 'MTEXT')

  var bbox = new _BoundingBox2.default();
  polylines.forEach(function (polyline) {
    polyline.forEach(function (point) {
      bbox.expandByPoint(point[0], point[1]);
    });
  });

  var paths = [];
  polylines.forEach(function (polyline, i) {
    var entity = entities[i];
    var layerTable = parsed.tables.layers[entity.layer];
    if (!layerTable) {
      throw new Error('no layer table for layer:' + entity.layer);
    }

    // TODO: not sure if this prioritization is good (entity color first, layer color as fallback)
    var colorNumber = 'colorNumber' in entity ? entity.colorNumber : layerTable.colorNumber;
    var rgb = _colors2.default[colorNumber];
    if (rgb === undefined) {
      _logger2.default.warn('Color index', colorNumber, 'invalid, defaulting to black');
      rgb = [0, 0, 0];
    }

    var p2 = polyline.map(function (p) {
      return [p[0], -p[1]];
    });
    paths.push(polylineToPath(rgb, p2));
  });

<<<<<<< HEAD
  const texts = [];
  mtexts.forEach((mtext, i) => {
    texts.push(mtextToText([mtext.x, bbox.maxY - mtext.y], mtext.string, mtext.attachmentPoint))
  })

  let svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' +
    (-1 + bbox.minX) + ' ' +
    (-1) + ' ' +
    (bbox.width + 2) + ' ' +
    (bbox.height + 2) + '"';
  svgString += ' width="100%" height="100%">' + paths + texts + '</svg>';
  return pd.xml(svgString);
};
=======
  var svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' + bbox.minX + ' ' + -bbox.maxY + ' ' + bbox.width + ' ' + bbox.height + '"';
  svgString += ' width="100%" height="100%">' + paths.join('') + '</svg>';
  return _prettyData.pd.xml(svgString);
};
>>>>>>> d99e68b5be6bf261f98d7eae449899c772d89082
