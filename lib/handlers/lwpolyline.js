
module.exports = function(emitter) {

  var currentPolyline;
  var point;

  emitter.on('entityValue', function(type, value) {
    if (value === 'LWPOLYLINE') {
      currentPolyline = {
        points: [],
      };
    }
    if (currentPolyline) {
      switch(type) {
        case 70:
          switch(value) {
            case 0:
              currentPolyline.type = 'open';
              break;
            case 1:
              currentPolyline.type = 'closed';
              break;
          }
          break;
        case 90:
          currentPolyline.size = value;
          break;
        case 10:
          point = {x: value};
          break;
        case 20:
          point.y = value;
          currentPolyline.points.push(point);
          if (currentPolyline.points.length === currentPolyline.size) {
            emitter.emit('lwpolyline', currentPolyline);
            currentPolyline = undefined;
          }
          break;
        default:
      }
    }
  });

};