module.exports = function(emitter) {

  var header;
  var extMin;
  var extMax;

  emitter.on('sectionValue', function(type, value) {
    switch (value) {
      case 'HEADER':
        header = {};
        return;
      case '$EXTMIN':
        extMin = {};
        return;
      case '$EXTMAX':
        extMax = {};
        return;
      default:
        if (extMin) {
          switch (type) {
            case 10:
              extMin.x = value;
              break;
            case 20:
              extMin.y = value;
              break;
            case 30:
              extMin.z = value;
              header.extMin = extMin;
              extMin = undefined;
              break;
          }
        }
        if (extMax) {
          switch (type) {
            case 10:
              extMax.x = value;
              break;
            case 20:
              extMax.y = value;
              break;
            case 30:
              extMax.z = value;
              header.extMax = extMax;
              extMax = undefined;
              break;
          }
        }
    }
  });

  emitter.on('endSection', function() {
    if (header) {
      emitter.emit('header', header);
      header = undefined;
    }
  });

};
