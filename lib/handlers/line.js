
module.exports = function(emitter) {

  var currentLine;

  emitter.on('entityValue', function(type, value) {
    if (value === 'LINE') {
      currentLine = {
        start: {},
        end: {},
      };
    }
    if (currentLine) {
      switch(type) {
        case 10:
          currentLine.start.x = value;
          break;
        case 20:
          currentLine.start.y = value;
          break;
        case 30:
          currentLine.start.z = value;
          break;
        case 11:
          currentLine.end.x = value;
          break;
        case 21:
          currentLine.end.y = value;
          break;
        case 31:
          currentLine.end.z = value;
          // console.log('line', currentLine);
          emitter.emit('line', currentLine);
          currentLine = undefined;
          break;
      }
    }
  });

};