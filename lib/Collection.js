var isString = require('lodash.isstring');
var cloneDeep = require('lodash.clonedeep');

var PRIMITIVES = require('./PRIMITIVES');
/**
 * A collection of DXF objectc
 */

function Collection() {
  this.blocks = {};
  this.layers = {};
  this.styles = {};
  this.ltypes = {};
  this.inserts = [];

  PRIMITIVES.forEach(function(primitive) {
    this[primitive] = [];
    for (var blockName in this.blocks) {
      this.blocks[blockName][primitive] = [];
    }
  }, this);

  this.gatherDisplayEntities = function(layers) {
    var _this = this;

    // 'layers' variable should be in the form:
    // '*'
    // ['0']
    // ['L1', 'L2']
    if (layers === undefined) {
      layers = '*';
    } else if (isString(layers) && (layers !== '*')) {
      layers = [layers];
    }
    function isSelected(l) {
      return (layers === '*') || (layers.indexOf(l) !== -1);
    }

    var displayEntities = {};

    // Collect entities
    var zeroTransform = {
      x: 0,
      y: 0,
      xScale: 1,
      yScale: 1,
      rotation: 0,
    };
    PRIMITIVES.forEach(function(primitive) {
      displayEntities[primitive] = [];
      _this[primitive].forEach(function(entity) {
        // Root entities are displayed if their layer is selected
        if (isSelected(entity.layer)) {
          entity.transform = zeroTransform;
          displayEntities[primitive].push(entity);
        }
      });
    }, this);

    this.inserts.forEach(function(insert) {
      // console.log('*', insert);
      var block = _this.blocks[insert.block];
      if (!block) {
        return;
      }
      var t = {
        x: insert.x + block.x,
        y: insert.y + block.y,
        xScale: insert.xscale,
        yScale: insert.yscale,
        rotation: insert.rotation,
      };
      PRIMITIVES.forEach(function(primitive) {
        if (block.entities[primitive]) {
          block.entities[primitive].forEach(function(entity) {
            // Clone since entities will have different transforms
            // and will lead to a hard to track bug.
            entity = cloneDeep(entity);

            // This is a bit counter-intuitive
            // This test example can be found
            // here: http://www.artwork.com/acad/engine/dxf2gbr8.htm
            //
            // - Autodesk Viewer: https://a360.autodesk.com/viewer/
            // - eDrawings viewer: http://www.edrawingsviewer.com/ed/download.htm
            //
            // The entity is not on layer 0 and the entity layer is selected
            // The entity is on layer 0 and the insert layer is selected
            var notZeroAndSelected =
              (entity.layer !== '0') && isSelected(entity.layer);
            var onZeroAndInsertLayerSelected =
              (entity.layer === '0') && isSelected(insert.layer);
            if (notZeroAndSelected || onZeroAndInsertLayerSelected) {
              entity.transform = t;
              displayEntities[primitive].push(entity);
            }
          });
        }
      }, this);
    });
    return displayEntities;
  };

}

Collection.PRIMITIVES = PRIMITIVES;

module.exports = Collection;
