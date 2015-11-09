// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/layer_al_u05_c.htm
module.exports = function(emitter) {
  var layer;

  emitter.on('tableValue', function(type, value) {
    if (type === 0 && value === 'LAYER') {
      layer = {
        name: '',
        linetype: '',
        children: []
      };
      return;
    }
    if (layer) {
      switch (type) {
        case 0: // Type/class definition
          if (value === 'END') {
            // Done loading text there has been a definition for another type.
            emitter.emit('layer', layer);
            layer = undefined;
          }
          break;
          // layer name
        case 2:
          layer.name = value;
          break;
        case 2:
          layer.lineType = value;
          break;
          // Standard Flags
          // 1 = Layer is frozen, otherwise layer is thawed
          // 2 = Layer is frozen by default in new viewports
          // 4 = Layer is locked
        case 70:
          layer.frozen = value & 1 === 1;
          layer.frozenNewViewport = value & 2 === 2;
          layer.locked = value & 4 === 4;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled tableValue for layer Type: ' + type + ' Value: "' + value + '"');
          }
          break;
      }
    }
  });

};
