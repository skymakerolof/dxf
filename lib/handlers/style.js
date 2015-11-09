// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/style_al_u05_c.htm
module.exports = function(emitter) {

  var style;

  emitter.on('tableValue', function(type, value) {
    if (type === 0 && value === 'STYLE') {
      style = {};
      return;
    }
    if (style) {
      switch (type) {
        case 0: // Type/class definition
          if (value === 'END') {
            // Done loading text there has been a definition for another type.
            emitter.emit('style', style);
            style = undefined;
          }
          break;
          // Style name
        case 2:
          style.name = value;
          break;
          // Standard flag values (bit-coded values)
          // (See "Common Group Codes for Symbol Table Entries.")
          // 1=if set, this entry describes a shape
          // 4=Vertical text
        case 70:
          style.describesShape = value & 1 === 1;
          style.verticalText = value & 4 === 4;
          break;
          // Fixed text height; 0 if not fixed
        case 40:
          style.fixedHeight = value;
          break;
          // Width factor
        case 41:
          style.width = value;
          break;
          // Oblique angle
        case 50:
          style.obliqueAngle = value;
          break;
          // Text generation flags
          // 2=Text is backward (mirrored in X)
          // 4=Text is upside down (mirrored in Y)
        case 71:
          style.mirrorX = value & 2 === 2;
          style.mirrorY = value & 4 === 4;
          break;
          // Last height used
        case 42:
          style.lastHeight = value;
          break;
          // Primary font file name
        case 3:
          style.font = value || 'technical1';
          break;
          // Bigfont file name; blank if none
        case 4:
          style.bigFont = value || undefined;
          break;
        default:
          if (emitter.verbose) {
            console.log('Unhandled tableValue for Style Type: %s Value: %s', type, value);
          }
      }
    }
  });

};
