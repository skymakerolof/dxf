// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/ltype_al_u05_c.htm
module.exports = function(emitter) {

    var ltype;
    var element;

    emitter.on('tableValue', function(type, value) {
        if (type === 0 && value === 'LTYPE') {
            ltype = {
                elements: []
            };
            return;
        }
        if (ltype) {
            switch (type) {
                case 0: // Type/class definition
                    if (value === 'END') {
                        // Done loading text there has been a definition for another type.
                        emitter.emit('ltype', ltype);
                        element = undefined;
                        ltype = undefined;
                    }
                    break;
                    // ltype name
                case 2:
                    ltype.name = value;
                    break;
                    // Descriptive text for linetype.
                case 3:
                    ltype.description = value;
                    break;
                    // Text string (one per element if code 74 = 2)
                case 9:
                    if (ltype.embededElementType === 'text') {
                        ltype.text = value;
                    }
                    break;
                    // Standard flag values (bit-coded values) (See "Common Group Codes for Symbol Table Entries.")
                    // 1=if set, this entry describes a shape
                    // 4=Vertical text
                    // Total pattern length.
                case 40:
                    ltype.length = value;
                    break;
                    // X = x offset value (optional). Multiple entries can exist.
                case 44:
                    element.xOffset = value;
                    break;
                    // Y = y offset value (optional). Multiple entries can exist.
                case 45:
                    element.yOffset = value;
                    break;
                    // S= scale value (optional). Multiple entries can exist.
                case 46:
                    element.scale = value;
                    break;
                    // Dash, dot or space length (one entry per element).
                case 49:
                    element = {};
                    ltype.elements.push(element);
                    element.space = value;
                    break;
                    // R= (relative) or A= (absolute) rotation value in radians of embedded shape or text.
                    // One per element if code 74 specifies an embeded shape or text string.
                case 50:
                    if (element && (element.embededElementType)) {
                        element.rotation = value;
                    } else {
                        ltype.rotation = value;
                    }
                    break;
                    // Standard Flags
                case 70:
                    //ltype.describesShape = value & 1 === 1;
                    //ltype.verticalText = value & 4 === 4;
                    break;
                    // Alignment code; value is always 65, the ASCII code for A.
                case 72:
                    ltype.alignmentCode = value;
                    break;
                    // The number of linetype elements.
                case 73:
                    ltype.linetypeCount = value;
                    break;

                    // Complex linetype element type (one per element). Default is 0 (no embedded shape/text).
                    // The following codes are bit values:
                    // 1 = if set, code 50 specifies an absolute rotation, if not set, code 50 specifies a relative rotation;
                    // 2 = embedded element is a text string;
                    // 4 = embedded element is a shape
                case 74:
                    element.rotationType = (value & 1 === 1) ? 'A' : 'R';
                    element.shapeNumber = 0;
                    if (value & 2 === 2) {
                        element.embededElementType = 'text';
                    } else if (value & 4 === 4) {
                        element.embededElementType = 'shape';
                    }
                    break;
                    // Shape number (one per element) if code 74 specifies an embeded shape.
                    // If code 74 specifies an embeded text string, this value is set to 0.
                    // If code 74 is set to 0, code 75 is omitted.
                case 75:
                    if (element.embededElementType === 'shape') {
                        element.shapeNumber = value;
                    }
                    break;

                    // Pointer to STYLE object (one per element if code 74 > 0)
                case 340:
                    if (element._74 > 0) {
                        element.stylePointer = value;
                    }
                    break;

                default:
                    if (emitter.verbose) {
                        console.log('Unhandled tableValue for ltype Type: ' + type + ' Value: "' + value + '"');
                    }
                    break;
            }
        }
    });

};