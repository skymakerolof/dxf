var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var floorPlan = fs.readFileSync(__dirname + '/../resources/floorplan.dxf', 'utf-8');

describe('shapes', function() {

  describe('polylines', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('lwpolyline', function(entity) {
        entities.push(entity);
      });

      parser.parseString(floorPlan);

      assert.equal(entities.length, 124);
    });

  });

  describe('lines', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('line', function(entity) {
        entities.push(entity);
      });

      parser.parseString(floorPlan);

      assert.equal(entities.length, 624);
    });

  });

  describe('circles', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('circle', function(entity) {
        entities.push(entity);
      });

      parser.parseString(floorPlan);

      assert.equal(entities.length, 9);
    });

  });

});
