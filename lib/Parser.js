var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Parser() {
  this.blocks = {};
}

util.inherits(Parser, EventEmitter);

Parser.prototype.parseString = function Parser_parseString(string) {
  var lines = string.split(/\r\n|\r|\n/g);
  var eof = false;

  // We might have a problem if text could be entered with a string of '    TEST'
  // trimming the value prematurely would end up with incorrect data.
  // It might be a good idea to pass through non trimmed value and trim it when we parse it later.
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (line.trim() === 'EOF') {
      eof = true;
      this.emit('EOF', true);
      break;
    }
    this.emit('asciiline', line);
  }
  if (eof === false) {
    this.emit('EOF', false);
  }
};


module.exports = Parser;
