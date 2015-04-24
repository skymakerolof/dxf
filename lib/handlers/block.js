// Circular dependencies are currently broken in Browserify see: https://github.com/substack/node-browserify/issues/1068
//var dxf = require('../index');

module.exports = function(emitter, dxf) {

    var block;
    var childBlock;
    var parser;
    var handleChildEntity = false;

    emitter.on('blockValue', function(type, value) {
        if (type === 0 && value === 'BLOCK') {
            if (block === undefined) {
                // Handling a root block.
                parser = dxf.createParser();
                block = dxf.createCollector(parser);
                handleChildEntity = false;
            } else {
                // Handling a child block.
                //childBlock =
                console.error('Child Blocks not yet handled.');
            }
            return;
        }

        if (block) {
            if (type === 0) {
                if (value === 'ENDBLK') {
                    parser = undefined;
                    emitter.emit('block', block);
                    block = undefined;
                    handleChildEntity = false;
                    return;
                }

                if (handleChildEntity) {
                    parser.emit('entityValue', type, value);
                    if (value === 'END') {
                        handleChildEntity = false;
                    }
                    return;
                } else {
                    handleChildEntity = true;
                }
            }

            if (handleChildEntity) {
                parser.emit('entityValue', type, value);
                return;
            }

            // Handle Block Values
            switch (type) {
                case 1: // Xref path name
                    block.xref = value;
                    break;
                case 2: // Block name
                case 3: // Block name
                    block.name = value;
                    break;
                case 10:
                    block.x = value;
                    break;
                case 20:
                    block.y = value;
                    break;
                case 30:
                    block.z = value;
                    break;
                case 60: // Object visibility (optional): 0 = visible, 1 = invisible.
                    entity.visibility = value === '0';
                    break;
                default:
                    if (emitter.verbose) {
                        console.log('Unhandled blockValue for Block, Type: ' + type + ' Value: "' + value + '"');
                    }
                    break;
            }
        }
    });

};