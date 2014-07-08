
module.exports = function(emitter) {

  var inSection;
  emitter.on('value', function(type, value) {
    switch(value) {
      case 'SECTION':
        inSection = true;
        return;
      case 'ENDSEC':
        emitter.emit('endSection');
        inSection = false;
        return;
      default:
        if (inSection) {
          emitter.emit('sectionValue', type, value);
        }
    }
  });

};