const common = require('./common');

module.exports = (tuples) => {

  return tuples.reduce((line, tuple) => {
    const type = tuple[0];
    const value = tuple[1];
    switch (type) {
      case 10:
        line.start.x = value;
        break;
      case 20:
        line.start.y = value;
        break;
      case 30:
        line.start.z = value;
        break;
      case 39:
        line.thickness = value;
        break;
      case 11:
        line.end.x = value;
        break;
      case 21:
        line.end.y = value;
        break;
      case 31:
        line.end.z = value;
        break;
      default:
        Object.assign(line, common(type, value));
        break;
    }
    return line;
  }, {
    type: 'LINE',
    start: {},
    end: {},
  });

};
