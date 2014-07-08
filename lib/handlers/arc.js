module.exports = function(emitter) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (value === 'ARC') {
      entity = {};
    }
    if (entity) {
      switch(type) {
        case 330:
          entity.block = value;
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
        case 50:
          entity.startAngleDeg = value;
          break;
        case 51:
          entity.endAngleDeg = value;
          emitter.emit('arc', entity);
          entity = undefined;
          break;
      }
    }
  });

};