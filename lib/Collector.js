/**
* a Collector is an object that listens to the events
* being emitted by the parser and aggregates the types.
*/

function Collector(emitter) {

  var _this = this;
  _this.blocks = {};
  _this.layers = {};
  _this.styles = {};
  _this.ltypes = {};

  emitter.on('header', function(header) {
    _this.header = header;
  });

  emitter.on('block', function(block) {
    _this.blocks[block.name] = block;
  });

  emitter.on('layer', function(layer) {
    _this.layers[layer.name] = layer;
  });

  emitter.on('style', function(style) {
    _this.styles[style.name] = style;
  });

  emitter.on('ltype', function(ltype) {
    _this.ltypes[ltype.name] = ltype;
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
  'insert'
  ].forEach(function(type) {
    var plural = type === 'hatch' ? 'hatches' : type + 's';
    _this[plural] = [];
    emitter.on(type, function(obj) {
      _this[plural].push(obj);
    });
  });

}

module.exports = Collector;
