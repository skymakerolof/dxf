/**
* a Collector is an object that listens to the events
* being emitted by the parser and aggregates the types
*/

function Collector(emitter) {

  var objs = {
    blocks: {},
    layers: {},
    styles: {},
    ltypes: {}
  };

  emitter.on('header', function(header) {
    objs.header = header;
  });

  emitter.on('block', function(block) {
    objs.blocks[block.name] = block;

    // ensure that blocks inherit the same styles
    block.styles = objs.styles;
    block.ltypes = objs.ltypes;
  });

  emitter.on('layer', function(layer) {
    objs.layers[layer.name] = layer;
  });

  emitter.on('style', function(style) {
    objs.styles[style.name] = style;
  });

  emitter.on('ltype', function(ltype) {
    objs.ltypes[ltype.name] = ltype;
  });

  [
  'line',
  'spline',
  'lwpolyline',
  'circle',
  'hatch',
  'arc',
  'text',
  'dimension',
  'insert'
  ].forEach(function(type) {
    objs[type + 's'] = [];
    emitter.on(type, function(obj) {
      // If the object has a block set
      if (obj.block !== undefined) {
        var block = objs.blocks[obj.block];
        if (block) {
          obj.block_ref = block;
        }
      }

      if (!objs.layers[obj.layer]) {
        objs.layers[obj.layer] = {
          name: obj.layer,
          lineType: 'BYLAYER',
          children: []
        };
      }

      objs.layers[obj.layer].children.push({
        type: type,
        obj: obj
      });
      // Add object to the desired collection
      objs[type + 's'].push(obj);
    });
  });

  Object.defineProperty(this, 'inserts', {
    get: function() {
      return objs.inserts;
    }
  });

  Object.defineProperty(this, 'layers', {
    get: function() {
      return objs.layers;
    }
  });

  Object.defineProperty(this, 'styles', {
    get: function() {
      return objs.styles;
    },
  });

  Object.defineProperty(this, 'ltypes', {
    get: function() {
      return objs.ltypes;
    },
  });

  Object.defineProperty(this, 'header', {
    get: function() {
      return objs.header;
    }
  });

  Object.defineProperty(this, 'blocks', {
    get: function() {
      return objs.blocks;
    }
  });

  Object.defineProperty(this, 'lines', {
    get: function() {
      return objs.lines;
    }
  });

  Object.defineProperty(this, 'splines', {
    get: function() {
      return objs.splines;
    }
  });

  Object.defineProperty(this, 'lwpolylines', {
    get: function() {
      return objs.lwpolylines;
    }
  });

  Object.defineProperty(this, 'circles', {
    get: function() {
      return objs.circles;
    }
  });

  Object.defineProperty(this, 'hatches', {
    get: function() {
      return objs.hatchs;
    }
  });

  Object.defineProperty(this, 'arcs', {
    get: function() {
      return objs.arcs;
    }
  });

  Object.defineProperty(this, 'texts', {
    get: function() {
      return objs.texts;
    }
  });

  Object.defineProperty(this, 'dimensions', {
    get: function() {
      return objs.dimensions;
    }
  });

}

module.exports = Collector;
