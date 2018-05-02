'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _entities = require('./entities');

var _entities2 = _interopRequireDefault(_entities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (tuples) {
  var state = void 0;
  var blocks = [];
  var block = void 0;
  var entitiesTuples = [];

  tuples.forEach(function (tuple) {
    var type = tuple[0];
    var value = tuple[1];

    if (value === 'BLOCK') {
      state = 'block';
      block = {};
      entitiesTuples = [];
      blocks.push(block);
    } else if (value === 'ENDBLK') {
      if (state === 'entities') {
        block.entities = (0, _entities2.default)(entitiesTuples);
      } else {
        block.entities = [];
      }
      entitiesTuples = undefined;
      state = undefined;
    } else if (state === 'block' && type !== 0) {
      switch (type) {
        case 1:
          block.xref = value;
          break;
        case 2:
          block.name = value;
          break;
        case 10:
          block.x = value;
          break;
        case 20:
          block.y = value;
          break;
        case 30:
          block.z = value;
          break;
        default:
          break;
      }
    } else if (state === 'block' && type === 0) {
      state = 'entities';
      entitiesTuples.push(tuple);
    } else if (state === 'entities') {
      entitiesTuples.push(tuple);
    }
  });

  return blocks;
};