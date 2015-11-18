var isEntityStart = require('./isEntityStart');

module.exports = function(emitter, commonValueHandler) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if ((type === 0) && entity && isEntityStart(value)) {
      emitter.emit('line', entity);
      entity = undefined;
    }
    if (type === 0 && value === 'LINE') {
      entity = {
        start: {},
        end: {},
        thickness: 0,
        block: emitter.currentBlock,
      };
      return;
    }
    if (entity) {

      // If the type is handled by the common value handler
      if (commonValueHandler(entity, type, value)) {
        return;
      }
      switch (type) {
        case 0:
          if (value === 'END') {
            emitter.emit('line', entity);
            entity = undefined;
          }
          break;
        case 330:
          entity.block = value;
          break;
        case 62:
          // Color number (present if not BYLAYER).
          // Zero indicates the BYBLOCK (floating) color. 256 indicates BYLAYER.
          // A negative value indicates that the layer is turned off. (optional)
          entity.colorNumber = value;
          break;
        case 10:
          entity.start.x = value;
          break;
        case 20:
          entity.start.y = value;
          break;
        case 30:
          entity.start.z = value;
          break;
        case 39:
          entity.thickness = value;
          break;
        case 11:
          entity.end.x = value;
          break;
        case 21:
          entity.end.y = value;
          break;
        case 31:
          entity.end.z = value;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for Line, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

  // TODO: Handle line type
};
