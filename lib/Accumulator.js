/**
* a Collector is an object that listens to the events
* being emitted by the parser and aggregates the types.
*/

var Collection = require('./Collection');

function Accumulator(emitter) {

  var collection = new Collection();

  emitter.on('header', function(header) {
    collection.header = header;
  });

  emitter.on('block', function(block) {
    if (collection.blocks[block.name]) {
      // Block may only emitted after the entities it contains,
      // so move the entities onto the block object
      var entities = collection.blocks[block.name].entities;
      collection.blocks[block.name] = block;
      collection.blocks[block.name].entities = entities;
    } else {
      collection.blocks[block.name] = block;
    }
  });

  emitter.on('layer', function(layer) {
    collection.layers[layer.name] = layer;
  });

  emitter.on('style', function(style) {
    collection.styles[style.name] = style;
  });

  emitter.on('ltype', function(ltype) {
    collection.ltypes[ltype.name] = ltype;
  });

  [
    'line',
    'spline',
    'lwpolyline',
    'circle',
    'hatch',
    'arc',
    'ellipse',
    'text',
    'dimension',
  ].forEach(function(type) {
    var primitive = type === 'hatch' ? 'hatches' : type + 's';
    emitter.on(type, function(obj) {
      if (obj.block) {
        if (!collection.blocks[obj.block]) {
          collection.blocks[obj.block] = {
            entities: {},
          };
        }
        var block = collection.blocks[obj.block];
        if (!block.entities[primitive]) {
          block.entities[primitive] = [];
        }
        block.entities[primitive].push(obj);
      } else {
        collection[primitive].push(obj);
      }
    });
  });

  emitter.on('insert', function(obj) {
    collection.inserts.push(obj);
  });

  this.__defineGetter__('collection', function() {
    return collection;
  });

}

module.exports = Accumulator;
