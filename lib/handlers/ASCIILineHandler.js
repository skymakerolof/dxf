// Parse the type and value into the native representation
function parseType(type, value) {
  // Currently only support < 100 and hex Ids (330-369)
  var isLessThan100 = (type >= 0) && (type < 100);
  var isHex = (type >= 330) && (type <= 369);
  if (!(isLessThan100 || isHex)) {
    return value;
  }
  if (type < 10) {
    return value;
  } else if (type < 60) {
    return parseFloat(value, 10);
  } else if (type < 100) {
    return parseInt(value, 10);
  } else if ((type >= 300) && (type <= 369)) {
    return value;
  }
}

function ASCIILineHandler(emitter) {

  var state = 'type';
  var type;

  // Also when we end the file we should say we have finished an element.
  // Just in-case any were still open for parsing values.
  emitter.on('EOF', function() {
    emitter.emit('value', type, 'END');
  });

  emitter.on('asciiline', function(line) {
    switch (state) {
      case 'type':
        type = parseInt(line, 10);
        state = 'value';
        return;
      case 'value':
        if (type === 0) {
          emitter.emit('value', type, 'END');
        }
        emitter.emit('value', type, parseType(type, line));
        state = 'type';
        return;
    }
  });

}

module.exports = ASCIILineHandler;
