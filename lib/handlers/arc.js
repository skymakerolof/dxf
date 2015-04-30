module.exports = function(emitter, commonValueHandler) {

    var entity;

    emitter.on('entityValue', function(type, value) {
        if (type === 0 && value === 'ARC') {
            entity = {
                thickness: 0
            };
            return;
        }
        if (entity) {
            // If the type is handled by the common value handler
            if (commonValueHandler(entity, type, value)) {
                return;
            }
            switch (type) {
                case 0:
                    if (value === 'END') {
                        emitter.emit('arc', entity);
                        entity = undefined;
                    }
                    break;
                case 330:
                    entity.block = value;
                    break;
                case 10:
                    entity.x = value;
                    break;
                case 20:
                    entity.y = value;
                    break;
                case 30:
                    entity.z = value;
                    break;
                case 39:
                    entity.thickness = value;
                    break;
                case 40:
                    entity.r = value;
                    break;
                case 50:
                    entity.startAngleDeg = value;
                    break;
                case 51:
                    entity.endAngleDeg = value;
                    break;
                default:
                    if (emitter.verbose) {
                        console.log('Unhandled entityValue for Arc, Type: ' + type + ' Value: "' + value + '"');
                    }
                    break;
            }
        }
    });

};