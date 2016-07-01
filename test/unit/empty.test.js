var fs = require('fs');
var assert = require('chai').assert;

var dxf = require('../..');
var dxfContents = fs.readFileSync(__dirname + '/../resources/empty.dxf', 'utf-8');

describe.skip('No included blocks', function() {

  it('can parsed from a string', function() {
    const parser = dxf.createParser();
    const acc = dxf.createAccumulator(parser);

    const blocks = [];
    const inserts = [];
    parser.on('block', function(block) {
      blocks.push(block);
    });
    parser.on('insert', function(block) {
      blocks.push(block);
    });
    parser.parseString(dxfContents);

    assert.equal(blocks.length, 38);
    assert.equal(inserts.length, 0);

    const collection = acc.collection;
    const displayEntities = collection.gatherDisplayEntities();
    console.log(displayEntities);


  });

});
