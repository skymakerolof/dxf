
module.exports = function(emitter) {

  var entity;
  var point;

  emitter.on('entityValue', function(type, value) {
    if (value === 'LWPOLYLINE') {
      entity = {
        points: [],
      };
    }
    if (entity) {
      switch(type) {
        case 330:
          entity.block = value;
          break;
        case 70:
          switch(value) {
            case 0:
              entity.type = 'open';
              break;
            case 1:
              entity.type = 'closed';
              break;
          }
          break;
        case 90:
          entity.size = value;
          break;
        case 10:
          point = {x: value};
          break;
        case 20:
          point.y = value;
          entity.points.push(point);
          if (entity.points.length === entity.size) {
            emitter.emit('lwpolyline', entity);
            entity = undefined;
          }
          break;
        default:
      }
    }
  });

};