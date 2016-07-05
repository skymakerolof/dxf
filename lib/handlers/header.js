'use strict';

module.exports = function(tuples) {

  let state;
  const header = {};

  tuples.forEach((tuple) => {
    const type = tuple[0];
    const value = tuple[1];

    switch (value) {
      case '$EXTMIN':
        header.extMin = {};
        state = 'extMin';
        return;
      case '$EXTMAX':
        header.extMax = {};
        state = 'extMax';
        return;
      default:
        if (state === 'extMin') {
          switch (type) {
            case 10:
              header.extMin.x = value;
              break;
            case 20:
              header.extMin.y = value;
              break;
            case 30:
              header.extMin.z = value;
              state = undefined;
              break;
          }
        }
        if (state === 'extMax') {
          switch (type) {
            case 10:
              header.extMax.x = value;
              break;
            case 20:
              header.extMax.y = value;
              break;
            case 30:
              header.extMax.z = value;
              state = undefined;
              break;
          }
        }
    }
  });

  return header;
};
