module.exports = function(emitter, commonValueHandler) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (type === 0 && value === 'ELLIPSE') {
      entity = {};
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
            emitter.emit('ellipse', entity);
            entity = undefined;
          }
          break;
        case 330:
          entity.block = value;
          break;
        case 10:
          entity.x = value;
          break;
        case 11:
          entity.majorX = value;
          break;
        case 20:
          entity.y = value;
          break;
        case 21:
          entity.majorY = value;
          break;
        case 30:
          entity.z = value;
          break;
        case 31:
          entity.majorZ = value;
          break;
        case 40:
          entity.axisRatio = value;
          break;
        case 41:
          entity.startAngleRad = value;
          break;
        case 42:
          entity.endAngleRad = value;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for Ellipse, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

};
