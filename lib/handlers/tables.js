module.exports = function(emitter) {

    var inTables;
    emitter.on('sectionValue', function(type, value) {
        switch (value) {
            case 'TABLE':
                inTables = true;
                return;
            default:
                if (inTables) {
                    emitter.emit('tableValue', type, value);
                }
        }
    });

    emitter.on('endTable', function() {
        inTables = false;
    });
};