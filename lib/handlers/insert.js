var isEntityStart = require('./isEntityStart');

module.exports = function(emitter, commonEntityValueHandler) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if ((type === 0) && entity && isEntityStart(value)) {
      emitter.emit('insert', entity);
      entity = undefined;
    }
    if (type === 0 && value === 'INSERT') {
      console.log('STARTINSERT', emitter.currentBlock);
      entity = {
        block: emitter.currentBlock,
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
    if (entity) {
      // If the type is handled by the common value handler
      if (commonEntityValueHandler(entity, type, value)) {
        return;
      }
      switch (type) {
        case 0:
          if (value === 'END') {
            console.log('ENDINSERT');
            emitter.emit('insert', entity);
            entity = undefined;
          }
          break;
        case 2:
          console.log('INSERTBLK', value);
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
        case 41:
          entity.xscale = value;
          break;
        case 42:
          entity.yscale = value;
          break;
        case 43:
          entity.zscale = value;
          break;
        case 44:
          entity.columnSpacing = value;
          break;
        case 45:
          entity.rowSpacing = value;
          break;
        case 50:
          entity.rotation = value;
          break;
        case 70:
          entity.columnCount = value;
          break;
        case 71:
          entity.rowCount = value;
          break;
        case 210:
          entity.xExtrusion = value;
          break;
        case 220:
          entity.yExtrusion = value;
          break;
        case 230:
          entity.zExtrusion = value;
          break;

        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for entity, Type: %s Value: %s', type, value);
          }
          break;
      }
    }
  });

};
