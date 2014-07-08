
module.exports = function(emitter) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (value === 'LINE') {
      entity = {
        start: {},
        end: {},
      };
    }
    if (entity) {
      switch(type) {
        case 330:
          entity.block = value;
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
        case 11:
          entity.end.x = value;
          break;
        case 21:
          entity.end.y = value;
          break;
        case 31:
          entity.end.z = value;
          emitter.emit('line', entity);
          entity = undefined;
          break;
      }
    }
  });

};