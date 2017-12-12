'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toSVG = exports.groupEntitiesByLayer = exports.denormalise = exports.BoundingBox = exports.colors = exports.config = exports.parseString = undefined;

var _header = require('./handlers/header');

var _header2 = _interopRequireDefault(_header);

var _tables = require('./handlers/tables');

var _tables2 = _interopRequireDefault(_tables);

var _blocks = require('./handlers/blocks');

var _blocks2 = _interopRequireDefault(_blocks);

var _entities = require('./handlers/entities');

var _entities2 = _interopRequireDefault(_entities);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _BoundingBox = require('./BoundingBox');

var _BoundingBox2 = _interopRequireDefault(_BoundingBox);

var _denormalise = require('./denormalise');

var _denormalise2 = _interopRequireDefault(_denormalise);

var _groupEntitiesByLayer = require('./groupEntitiesByLayer');

var _groupEntitiesByLayer2 = _interopRequireDefault(_groupEntitiesByLayer);

var _toSVG = require('./toSVG');

var _toSVG2 = _interopRequireDefault(_toSVG);

var _colors = require('./util/colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toLines = function toLines(string) {
  var lines = string.split(/\r\n|\r|\n/g);
  var contentLines = lines.filter(function (l) {
    return l.trim !== 'EOF';
  });
  return contentLines;
};

// Parse the value into the native representation
var parseValue = function parseValue(type, value) {
  if (type >= 10 && type < 60) {
    return parseFloat(value, 10);
  } else if (type >= 210 && type < 240) {
    return parseFloat(value, 10);
  } else if (type >= 60 && type < 100) {
    return parseInt(value, 10);
  } else {
    return value;
  }
};

// Content lines are alternate lines of type and value
var convertToTypesAndValues = function convertToTypesAndValues(contentLines) {
  var state = 'type';
  var type = void 0;
  var typesAndValues = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = contentLines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (state === 'type') {
        type = parseInt(line, 10);
        state = 'value';
      } else {
        typesAndValues.push([type, parseValue(type, line)]);
        state = 'type';
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return typesAndValues;
};

var separateSections = function separateSections(tuples) {
  var sectionTuples = void 0;
  return tuples.reduce(function (sections, tuple) {
    if (tuple[0] === 0 && tuple[1] === 'SECTION') {
      sectionTuples = [];
    } else if (tuple[0] === 0 && tuple[1] === 'ENDSEC') {
      sections.push(sectionTuples);
      sectionTuples = undefined;
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple);
    }
    return sections;
  }, []);
};

// Each section start with the type tuple, then proceeds
// with the contents of the section
var reduceSection = function reduceSection(acc, section) {
  var sectionType = section[0][1];
  var contentTuples = section.slice(1);
  switch (sectionType) {
    case 'HEADER':
      acc.header = (0, _header2.default)(contentTuples);
      break;
    case 'TABLES':
      acc.tables = (0, _tables2.default)(contentTuples);
      break;
    case 'BLOCKS':
      acc.blocks = (0, _blocks2.default)(contentTuples);
      break;
    case 'ENTITIES':
      acc.entities = (0, _entities2.default)(contentTuples);
      break;
    default:
  }
  return acc;
};

var parseString = exports.parseString = function parseString(string) {
  var lines = toLines(string);
  var tuples = convertToTypesAndValues(lines);
  var sections = separateSections(tuples);
  var result = sections.reduce(reduceSection, {
    // In the event of empty sections
    header: {},
    blocks: [],
    entities: []
  });
  return result;
};

exports.config = _config2.default;
exports.colors = _colors2.default;
exports.BoundingBox = _BoundingBox2.default;
exports.denormalise = _denormalise2.default;
exports.groupEntitiesByLayer = _groupEntitiesByLayer2.default;
exports.toSVG = _toSVG2.default;