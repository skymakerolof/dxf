var util = require('util');

var EventEmitter = require('events').EventEmitter;

// Parse the type and value into the native representation
function parseType(type, value) {
  // Currently only support < 100 and hex Ids (330-369)
  var isLessThan100 = (type >= 0) && (type < 100);
  var isHex = (type >= 330) && (type <= 369);
  if (!(isLessThan100 || isHex)) {
    return undefined;
  }
  if (type < 10) {
    return value;
  } else if (type < 60) {
    return parseFloat(value, 10);
  } else if (type < 100 ){
    return parseInt(value, 10);
  } else if ((type >= 300) && (type <= 369)) {
    return value;
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

var BlocksHandler = require('./handlers/blocks');
var BlockHandler = require('./handlers/block');
var EntitiesHandler = require('./handlers/entities');
var SectionsHandler = require('./handlers/sections');
var LWPolylineHandler = require('./handlers/lwpolyline');
var LineHandler = require('./handlers/line');
var CircleHandler = require('./handlers/circle');
var ArcHandler = require('./handlers/arc');

module.exports.createParser = function() {
  var parser = new Parser();
  new ASCIILineHandler(parser);
  new SectionsHandler(parser);
  new BlocksHandler(parser);
  new BlockHandler(parser);
  new EntitiesHandler(parser);
  new LWPolylineHandler(parser);
  new LineHandler(parser);
  new CircleHandler(parser);
  new ArcHandler(parser);
  return parser;
};

// A handle collector of all eventsj
function Collector(emitter) {

  var objs = {
    blocks: {},
    lines: [],
    lwpolylines: [],
    circles: [],
    arcs: [],
  };

  emitter.on('block', function(block) {
    objs.blocks[block.handle] = block;
  });

  ['line', 'lwpolyline', 'circle', 'arc'].forEach(function(type) {
    emitter.on(type, function(obj) {
      objs[type + 's'].push(obj);
    });
  });


  this.__defineGetter__('blocks', function() {
    return objs.blocks;
  });

  this.__defineGetter__('lines', function() {
    return objs.lines;
  });

  this.__defineGetter__('lwpolylines', function() {
    return objs.lwpolylines;
  });

  this.__defineGetter__('circles', function() {
    return objs.circles;
  });

  this.__defineGetter__('arcs', function() {
    return objs.arcs;
  });
}

module.exports.createCollector = function(parser) {
  return new Collector(parser);
};