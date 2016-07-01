const common = require('./common');

module.exports = (tuples) => {

  return tuples.reduce((circle, tuple) => {
    const type = tuple[0];
    const value = tuple[1];
    switch (type) {
      case 10:
        circle.x = value;
        break;
      case 20:
        circle.y = value;
        break;
      case 30:
        circle.z = value;
        break;
      case 40:
        circle.r = value;
        break;
      default:
        Object.assign(circle, common(type, value));
        break;
    }
    return circle;
  }, {
    type: 'CIRCLE',
  });

};
