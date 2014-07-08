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
      this.emit('asciiline', line);
    }
  };

}

util.inherits(Parser, EventEmitter);

function ASCIILineHandler(emitter) {

  var state = 'type';
  var type;
  emitter.on('asciiline', function(line) {
    switch(state) {
      case 'type':
        type = parseInt(line.trim(), 10);
        state = 'value';
        return;
      case 'value':
        emitter.emit('value', type, parseType(type, line.trim()));
        state = 'type';
        return;
    }
  });

}

var EntitiesHandler = require('./handlers/entities');
var SectionsHandler = require('./handlers/sections');
var LWPolylineHandler = require('./handlers/lwpolyline');
var LineHandler = require('./handlers/line');
var CircleHandler = require('./handlers/circle');
var ArcHandler = require('./handlers/arc');

module.exports.create = function() {
  var parser = new Parser();
  new ASCIILineHandler(parser);
  new SectionsHandler(parser);
  new EntitiesHandler(parser);
  new LWPolylineHandler(parser);
  new LineHandler(parser);
  new CircleHandler(parser);
  new ArcHandler(parser);
  return parser;
};