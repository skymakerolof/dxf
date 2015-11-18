var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');

describe('shapes', function() {

  describe('polylines', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('lwpolyline', function(entity) {
        entities.push(entity);
      });

      parser.parseString(fs.readFileSync(
        __dirname + '/../resources/lwpolylines.dxf', 'utf-8'));

      assert.equal(entities.length, 2);
    });

  });

  describe('lines', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('line', function(entity) {
        entities.push(entity);
      });

      parser.parseString(fs.readFileSync(
        __dirname + '/../resources/lines.dxf', 'utf-8'));

      assert.equal(entities.length, 11);
    });

  });

  describe('circles', function() {

    it('can parsed from a string', function() {
      var parser = dxf.createParser();

      var entities = [];
      parser.on('circle', function(entity) {
        entities.push(entity);
      });

      parser.parseString(fs.readFileSync(
        __dirname + '/../resources/circlesellipsesarcs.dxf', 'utf-8'));
      assert.equal(entities.length, 1);
    });

  });

});
