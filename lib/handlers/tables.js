'use strict';

const layerHandler = (tuples) => {
  return tuples.reduce((layer, tuple) => {
    const type = tuple[0];
    const value = tuple[1];
    switch (type) {
      case 2:
        layer.name = value;
        break;
      case 6:
        layer.lineTypeName = value;
        break;
      case 62:
        layer.colorNumber = value;
        break;
      case 70:
        layer.flags = value;
        break;
      case 390:
        layer.lineWeightEnum = value;
        break;
      default:
    }
    return layer;
  }, {type: 'LAYER'});
};

const styleHandler = (tuples) => {
  return tuples.reduce((style, tuple) => {
    const type = tuple[0];
    const value = tuple[1];
    switch (type) {
      case 2:
        style.name = value;
        break;
      case 6:
        style.lineTypeName = value;
        break;
      case 40:
        style.fixedTextHeight = value;
        break;
      case 41:
        style.widthFactor = value;
        break;
      case 50:
        style.obliqueAngle = value;
        break;
      case 71:
        style.flags = value;
        break;
      case 42:
        style.lastHeightUsed = value;
        break;
      case 3:
        style.primaryFontFileName = value;
        break;
      case 4:
        style.bigFontFileName = value;
        break;
      default:
    }
    return style;
  }, {type: 'STYLE'});
};

const tableHandler = (tuples, tableType, handler) => {

  const layers = {};

  let layerTuples = [];
  tuples.forEach(tuple => {
    const type = tuple[0];
    const value = tuple[1];
    // The first entry in the table has type 2 and not 0, but
    // both indicate the start of the layer
    if (((type === 0) || (type === 2)) && (value === tableType)) {
      if (layerTuples.length) {
        const layer = handler(layerTuples);
        // Not sure what to do about layer entire with no name
        if (layer.name) {
          layers[layer.name] = layer;
        }
      }
      layerTuples = [];
    } else {
      layerTuples.push(tuple);
    }
  });

  return layers;
};

module.exports = function(tuples) {

  let tableGroups = [];
  let tableTuples;
  tuples.forEach((tuple) => {
    // const type = tuple[0];
    const value = tuple[1];
    if (value === 'TABLE') {
      tableTuples = [];
      tableGroups.push(tableTuples);
    } else if (value === 'ENDTAB') {
      tableTuples = undefined;
    } else {
      tableTuples.push(tuple);
    }
  });

  let stylesTuples = [];
  let layersTuples = [];
  let ltypesTuples = [];
  tableGroups.forEach(group => {
    if (group[0][1] === 'STYLE') {
      stylesTuples = group;
    } else if (group[0][1] === 'LTYPE') {
      ltypesTuples = group;
    } else if (group[0][1] === 'LAYER') {
      layersTuples = group;
    }
  });

  return {
    layers: tableHandler(layersTuples, 'LAYER', layerHandler),
    styles: tableHandler(stylesTuples, 'STYLE', styleHandler),
  };

};
