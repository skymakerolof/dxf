module.exports = function(emitter) {

    var inSection;
    emitter.on('value', function(type, value) {
        switch (value) {
            case 'SECTION':
                inSection = true;
                return;
            case 'ENDSEC':
                emitter.emit('tableValue', 0, 'END');
                emitter.emit('endSection');
                inSection = false;
                return;
            case 'ENDTAB':
                emitter.emit('tableValue', 0, 'END');
                emitter.emit('endTable');
                return;
            default:
                if (inSection) {
                    emitter.emit('sectionValue', type, value);
                }
        }
    });

};