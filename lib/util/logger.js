'use strict';

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function info() {
  if (_config2.default.verbose) {
    console.info.apply(undefined, arguments);
  }
}

function warn() {
  if (_config2.default.verbose) {
    console.warn.apply(undefined, arguments);
  }
}

function error() {
  console.error.apply(undefined, arguments);
}

module.exports.config = _config2.default;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;