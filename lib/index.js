var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Parse the type and value into the native representation
function parseType(type, value) {
  // Currentl only support < 100
  if (!((type >= 0 && (type < 100)))) {
    return undefined;
  }
  if (type < 10) {
    return value;
  } else if (type < 60) {
    return parseFloat(value, 10);
  } else {
    return parseInt(value, 10);
  }
}

function Parser() {

  this.parseString = function(string) {
    var lines = string.split(/\r\n|\r|\n/g);
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      if (line.trim === 'EOF') {
        break;
      }
      this.emit('line', line);
    }
  };

}

util.inherits(Parser, EventEmitter);


function LineHandler(parent) {

  var state = 'type';
  var type;
  var that = this;
  parent.on('line', function(line) {
    switch(state) {
      case 'type':
        type = parseInt(line.trim(), 10);
        state = 'value';
        return;
      case 'value':
        that.emit('value', type, parseType(type, line.trim()));
        state = 'type';
        return;
    }
  });

}

util.inherits(LineHandler, EventEmitter);

function SectionHandler(parent) {

  var state;
  var that = this;
  parent.on('value', function(type, value) {
    switch(value) {
      case 'SECTION':
        state = 'startSection';
        return;
      case 'ENDSEC':
        that.emit('endSection');
        state = 'endSection';
        return;
      default:
        if (state === 'startSection') {
          that.emit('sectionType', type, value);
          state = 'inSection';
        } else if (state === 'inSection') {
          that.emit('value', type, value);
        }
        return;
    }
  });

}

util.inherits(SectionHandler, EventEmitter);

function HeaderHandler(parent) {

  var inHeader = true;
  var values = [];

  parent.on('sectionType', function(type, value) {
    if (value === 'HEADER') {
      inHeader = true;
    }
  });

  parent.on('endSection', function() {
    inHeader = false;
  });

  parent.on('value', function(type, value) {
    if (inHeader) {
      values.push({type: value});
    }
  });

  this.__defineGetter__('values', function() {
    return values;
  });

}

util.inherits(SectionHandler, EventEmitter);


module.exports = function(string) {
  var parser = new Parser();
  var lineHandler = new LineHandler(parser);
  var sectionHandler = new SectionHandler(lineHandler);
  var headerHandler = new HeaderHandler(sectionHandler);
  parser.parseString(string);
  return headerHandler.values;
};
