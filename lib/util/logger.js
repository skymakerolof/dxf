'use strict';

var config = require('../config');

function info() {
  if (config.verbose) {
    console.info.apply(undefined, arguments);
  }
}

function warn() {
  if (config.verbose) {
    console.warn.apply(undefined, arguments);
  }
}

function error() {
  console.error.apply(undefined, arguments);
}

module.exports.config = config;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;