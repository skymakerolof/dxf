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

function LineHandler(emitter) {

  var state = 'type';
  var type;
  emitter.on('line', function(line) {
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

function SectionHandler(emitter) {

  var inSection;
  emitter.on('value', function(type, value) {
    switch(value) {
      case 'SECTION':
        inSection = true;
        return;
      case 'ENDSEC':
        emitter.emit('endSection');
        inSection = false;
        return;
      default:
        if (inSection) {
          emitter.emit('sectionValue', type, value);
        }
    }
  });

}

function EntitiesHandler(emitter) {

  var inEntities;
  emitter.on('sectionValue', function(type, value) {
    switch (value) {
      case 'ENTITIES':
        inEntities = true;
        return;
      default:
        if (inEntities) {
          emitter.emit('entityValue', type, value);
        }
    }
  });

  emitter.on('endSection', function() {
    inEntities = false;
  });

}

function LWPolylineHandler(emitter) {

  var currentPolyline;
  var point;

  emitter.on('entityValue', function(type, value) {
    if (value === 'LWPOLYLINE') {
      currentPolyline = {
        points: [],
      };
    }
  });

  emitter.on('entityValue', function(type, value) {
    if (currentPolyline) {
      switch(type) {
        case 70:
          currentPolyline.type = value;
          break;
        case 90:
          currentPolyline.size = value;
          break;
        case 10:
          point = {x: value};
          break;
        case 20:
          point.y = value;
          currentPolyline.points.push(point);
          if (currentPolyline.points.length === currentPolyline.size) {
            emitter.emit('lwpolyline', currentPolyline);
            currentPolyline = undefined;
          }
          break;
        default:
      }
    }
  });

}

module.exports = function() {
  var parser = new Parser();
  new LineHandler(parser);
  new SectionHandler(parser);
  new EntitiesHandler(parser);
  new LWPolylineHandler(parser);
  return parser;
};