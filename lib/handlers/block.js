module.exports = function(emitter) {

  var block;

  emitter.on('blockValue', function(type, value) {
    if (value === 'BLOCK') {
      block = {};
    }
    if (value === 'ENDBLK') {
      emitter.emit('block', block);
    }
    if (block) {
      switch(type) {
        case 5:
          block.handle = value;
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
    //     case 40:
    //       entity.r = value;
    //       emitter.emit('circle', entity);
    //       entity = undefined;
    //       break;
      }
    }
  });

};