module.exports = function(emitter, commonValueHandler) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (type === 0 && value === 'CIRCLE') {
      entity = {
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
            // Done loading text there has been a definition for another type.
            emitter.emit('circle', entity);
            entity = undefined;
          }
          break;
        case 10:
          entity.x = value;
          break;
        case 20:
          entity.y = value;
          break;
        case 30:
          entity.z = value;
          break;
        case 40:
          entity.r = value;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for Circle, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

};
