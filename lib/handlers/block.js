// Circular dependencies are currently broken in Browserify see:
// https://github.com/substack/node-browserify/issues/1068

module.exports = function(emitter) {

  var block;
  var handleChildEntity = false;

  emitter.on('blockValue', function(type, value) {
    if (type === 0 && value === 'BLOCK') {
      if (block === undefined) {
        console.log('!STARTBLK');
        block = {
          entities: {},
        };
      } else {
        throw new Error('nested blocks not implemented');
      }
      return;
    }

    if (block) {
      if ((type === 0) && (value === 'ENDBLK')) {
        console.log('!ENDBLK', emitter.currentBlock);
        // parser = undefined;
        emitter.emit('block', block);
        block = undefined;
        handleChildEntity = false;
        delete emitter.currentBlock;
        return;
      }

      if ((type === 0) && (value === 'END')) {
        // After END, child entities are encountered
        handleChildEntity = true;
        return;
      }

      if (handleChildEntity) {
        emitter.emit('entityValue', type, value);
        return;
      }

      // Handle Block Values
      switch (type) {
        case 1: // Xref path name
          block.xref = value;
          break;
        case 2: // Block name
          console.log('!BLKNAME', value);
          block.name = value;
          emitter.currentBlock = value;
          break;
        case 10:
          block.x = value;
          break;
        case 20:
          block.y = value;
          break;
        case 30:
          block.z = value;
          break;
        case 60: // Object visibility (optional): 0 = visible, 1 = invisible.
          block.visibility = value === '0';
          break;
        case 70:
          block.type = value;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled blockValue for Block, Type: %s Value: %s',
              type, value);
          }
          break;
      }
    }
  });

};
