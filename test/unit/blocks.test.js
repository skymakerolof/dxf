var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var dxfContents = fs.readFileSync(__dirname + '/../resources/blocks.dxf', 'utf-8');

describe('blocks', function() {

  it('can parsed from a string', function() {
    var parser = dxf.createParser();

    var blocks = [];
    parser.on('block', function(block) {
      blocks.push(block);
    });
    parser.parseString(dxfContents);

    assert.equal(blocks.length, 3);
  });

});
