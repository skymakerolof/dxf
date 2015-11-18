module.exports = function(emitter) {

  var inBlocks;
  emitter.on('sectionValue', function(type, value) {
    switch (value) {
      case 'BLOCKS':
        inBlocks = true;
        return;
      default:
        if (inBlocks) {
          emitter.emit('blockValue', type, value);
        }
    }
  });

  emitter.on('endSection', function() {
    inBlocks = false;
  });

};
