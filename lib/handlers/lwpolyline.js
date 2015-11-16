module.exports = function(emitter, commonValueHandler) {

  var entity;
  var point;

  emitter.on('entityValue', function(type, value) {
    if (type === 0 && value === 'LWPOLYLINE') {
      entity = {
        points: [],
        closed: false,
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
          if (value === 'END') { // Done loading poly line
            emitter.emit('lwpolyline', entity);
            entity = undefined;
          }
          break;
        case 70:
          switch (value) {
          case 0:
            entity.closed = false;
            break;
          case 1:
            entity.closed = true;
            break;
          }
          break;
        case 90:
          entity.size = value;
          break;
        case 10:
          point = {
            x: value,
            y: 0,
            bulge: 0
          };
          entity.points.push(point);
          break;
        case 20:
          point.y = value;
          break;
        case 42:
          // Bulge (multiple entries; one entry for each vertex)  (optional; default = 0).
          point.bulge = value;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for Lwpolyline, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

};
