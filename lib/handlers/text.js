// For documentation on the Text element see
// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/text_al_u05_c.htm
module.exports = function(emitter, commonValueHandler) {

  var entity;
  emitter.on('entityValue', function(type, value) {
    if (type === 0 && (value === 'TEXT' || value === 'MTEXT')) {
      entity = {
        type: value.toLowerCase(),
        thickness: 0,
        styleName: 'STANDARD',
        text: '',
        rotation: 0,
        xScale: 1,
        yScale: 1,
        obliqueAngle: 0,
        generationFlags: 0,
        horizontalTextJustification: 0,
        verticalTextJustification: 0,
        extrusionDirection: [0, 0, 1],
        _counter: 0, // When this is set the second time then the text has been fully read.
      };
      return;
    }
    if (entity) {
      // If the type is handled by the common value handler
      if (commonValueHandler(entity, type, value)) {
        return;
      }
      switch (type) {
        case 0: // Type/class definition
          if (value === 'END') {
            // Done loading text there has been a definition for another type.
            emitter.emit('text', entity);
            entity = undefined;
          }
          break;
        case 1: // Text string.
          // MTEXT Only
          if (entity.type === 'mtext') {
            /*
            If the text string is less than 250 characters, all characters appear in group 1.
            If the text string is greater than 250 characters, the string is
            divided into 250 character chunks, which appear in one or more group 3 codes.
            If group 3 codes are used, the last group is a group 1 and has fewer than
            250 characters.
            */

            // TODO: Handle mtext better could pull out font, bold, italic etc.
            if (/^\{.{1,}\}$/.test(value)) {
              value = value.slice(1, -1);
              value = value.trim();
              if (/;$/.test(value)) {
                value = value.slice(0, -1);
              }
              value = value.split('|');
              value = value[value.length - 1].split(';');
              value = value[value.length - 1].trim();
            }
            if (/^\\/.test(value)) {
              value = value.trim();
              value = value.split(';');
              value = value[value.length - 1].trim();
            }
            value = value.replace(/\\[A-Z][0-9]{0,}/g, ' ');
            value = value.replace(/\^[A-Z]/g, ' ');
            value = value.replace(/ {1,}/g, ' ');
            value = value.trim();
          }

          entity.text = value;
          break;
          // Additional text
        case 3:
          entity.text += value;
          break;
        case 330:
          entity.block = value;
          break;
        case 7: // Text style name (optional, default = STANDARD)
          entity.styleName = value;
          break;
        case 10: // First alignment point (in OCS) DXF: X value; APP: 3D point
          entity.x = value;
          break;
        case 20: // DXF: Y value of first alignment point (in OCS)
          entity.y = value;
          break;
        case 30: // DXF: Z value of first alignment point (in OCS)
          entity.z = value;
          break;
        case 39: // Thickness (optional; default = 0)
          entity.thickness = value;
          break;
        case 40: // Text height
          entity.height = value;
          break;
          // Reference rectangle width
        case 41:
          entity.width = value;
          break;
          // Horizontal width of the characters that make up the mtext object.
          // (This value will always be equal to or less than the value of group code 41.)
        case 42:
          entity.character_width = value;
          break;
          // Vertical height of the characters that make up the mtext object.
        case 43:
          entity.character_width = value;
          break;
        case 50: // Text rotation (optional ; default = 0)
          entity.rotation = value;
          break;
          // Attachment point:
        case 71:
          entity.attachmentPoint = value;
          break;
          // 1 = Top left; 2 = Top center; 3 = Top right;
          // 4 = Middle left; 5 = Middle center; 6 = Middle right
          // 7 = Bottom left; 8 = Bottom center; 9 = Bottom right

          // Drawing direction:
        case 72:
          entity.drawingDirection = value;
          break;
          // 1 = Left to right;
          // 3 = Top to bottom;
          // 5 = By style (the flow direction is inherited from the associated text style)
        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for %s Type: %s Value: %s', this.type, type, value);
          }
      }
    }
  });

};
