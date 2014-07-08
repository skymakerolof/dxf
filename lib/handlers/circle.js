module.exports = function(emitter) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (value === 'CIRCLE') {
      entity = {};
    }
    if (entity) {
      switch(type) {
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
          emitter.emit('circle', entity);
          entity = undefined;
          break;
      }
    }
  });

};