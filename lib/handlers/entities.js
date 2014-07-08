
module.exports = function(emitter) {

  var inEntities;
  emitter.on('sectionValue', function(type, value) {
    switch (value) {
      case 'ENTITIES':
        inEntities = true;
        return;
      default:
        if (inEntities) {
          emitter.emit('entityValue', type, value);
        }
    }
  });

  emitter.on('endSection', function() {
    inEntities = false;
  });

};
