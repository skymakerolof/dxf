module.exports = function(emitter, commonValueHandler) {

  var insert;

  emitter.on('entityValue', function(type, value) {
    if (type === 0 && value === 'INSERT') {
      insert = {
        xscale: 1,
        yscale: 1,
        zscale: 1,
        columnSpacing: 0,
        rowSpacing: 0,
        rotation: 0,
        columnCount: 1,
        rowCount: 1,
        xExtrusion: 0,
        yExtrusion: 0,
        zExtrusion: 1
      };
      return;
    }
    if (insert) {
      // If the type is handled by the common value handler
      if (commonValueHandler(insert, type, value)) {
        return;
      }
      switch (type) {
        case 0:
          if (value === 'END') {
            emitter.emit('insert', insert);
            insert = undefined;
          }
          break;
        case 2:
          insert.blockName = value;
          break;
        case 10:
          insert.x = value;
          break;
        case 20:
          insert.y = value;
          break;
        case 30:
          insert.z = value;
          break;
        case 41:
          insert.xscale = value;
          break;
        case 42:
          insert.yscale = value;
          break;
        case 43:
          insert.zscale = value;
          break;
        case 44:
          insert.columnSpacing = value;
          break;
        case 45:
          insert.rowSpacing = value;
          break;
        case 50:
          insert.rotation = value;
          break;
        case 70:
          insert.columnCount = value;
          break;
        case 71:
          insert.rowCount = value;
          break;
        case 210:
          insert.xExtrusion = value;
          break;
        case 220:
          insert.yExtrusion = value;
          break;
        case 230:
          insert.zExtrusion = value;
          break;

        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for Insert, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

};
