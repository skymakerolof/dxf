// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/dimension_al_u05_c.htm
module.exports = function(emitter, commonValueHandler) {

  var entity;

  emitter.on('entityValue', function(type, value) {
    if (type === 0 && (value === 'DIMENSION')) {
      entity = {};
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
            emitter.emit('dimension', entity);
            entity = undefined;
          }
          break;


          // Dimension text explicitly entered by the user.
          // Optional; default is the measurement.
          // If null or "<>", the dimension measurement is drawn as
          // the text, if " " (one blank space), the text is suppressed.
          // Anything else is drawn as the text.
        case 1:
          entity.text = value;
          break;

          // Name of the block that contains the entities that make up the dimension picture
        case 2:
          entity.block_name = value;
          break;

          // Dimension style name
        case 3:
          entity.style_name = value;
          break;

          // Definition point (in WCS).
        case 10:
          entity.x = value;
          break; // DXF: X value; APP: 3D point.
        case 20:
          entity.y = value;
          break; // DXF: Y value; APP: 3D point.
        case 30:
          entity.z = value;
          break; // DXF: Z value; APP: 3D point.

          // Middle point of dimension text. (in OCS).
        case 11:
          entity.mx = value;
          break; // DXF: X value; APP: 3D point.
        case 21:
          entity.my = value;
          break; // DXF: Y value; APP: 3D point.
        case 31:
          entity.mz = value;
          break; // DXF: Z value; APP: 3D point.


          // Dimension type.
          // Values 0 - 6 are integer values which represent the dimension type.
          // Values 32, 64, and 128 are bit values, which are added to the integer
          // values (value 32 is always set in R13 and later releases).
          // 0   = Rotated, horizontal, or vertical; 1 = Aligned
          // 2   = Angular; 3 = Diameter; 4 = Radius;
          // 5   = Angular 3 point; 6 = Ordinate
          // 32  = Indicates that the block reference (group code 2) is referenced
          //       by this dimension only.
          // 64  = Ordinate type. This is a bit value (bit 7) used only with
          //       integer value 6. If set, ordinate is X-type; if not set, ordinate is Y-type.
          // 128 = This is a bit value (bit 8) added to the other group 70 values if the
          //       dimension text has been positioned at a user-defined location rather
          //       than at the default location.
        case 70:
          entity.type = value & 7; // 00000111
          entity.block_unique_reference = (value & 32) === 32; // 00100000
          if (entity.type === 6) {
            entity.ordinate_type = (value & 64) === 64; // 01000000
          }
          entity.user_defined_position = (value & 128) === 128; // 10000000
          break;


          // All dimension types have an optional 51 group code, which indicates
          // the horizontal direction for the dimension entity.
          // It determines the orientation of dimension text and lines for horizontal,
          // vertical, and rotated linear dimensions.
          // This group value is the negative of the angle between the OCS X axis
          // and the UCS X axis. It is always in the XY plane of the OCS.
        case 51:
          entity.horizontal_direction = value;
          break;

          // The optional group code 53 is the rotation angle of the dimension text
          // away from its default orientation (the direction of the dimension line).
        case 53:
          entity.rotation = value;
          break;

          // Extrusion direction. (optional; default = 0, 0, 1).
        case 210:
          entity.extrusion_direction_x = value;
          break; // DXF: X value; APP: 3D vector
        case 220:
          entity.extrusion_direction_y = value;
          break; // DXF: Y value of extrusion direction
        case 230:
          entity.extrusion_direction_z = value;
          break; // DXF: Z value of extrusion direction

          /***********************************************************\
          * -- Aligned, Linear, and Rotated Dimension Group Codes  --|
          ***********************************************************/

          // The point (13,23,33) specifies the start point of the first extension line.
          // Point (14,24,34) specifies the start point of the second extension line.
          // Point (10,20,30) specifies the dimension line location.
          // The point (11,21,31) specifies the midpoint of the dimension text.

          // Insertion point for clones of a dimension--Baseline and Continue
          // (in OCS). APP: 3D point
        case 12:
          entity.ix = value;
          break;
        case 22:
          entity.iy = value;
          break;
        case 32:
          entity.iz = value;
          break;

          // Definition point for linear and angular dimensions (in WCS). APP: 3D point
        case 13:
          entity.fx = value;
          break;
        case 23:
          entity.fy = value;
          break;
        case 33:
          entity.fz = value;
          break;

          // Definition point for linear and angular dimensions (in WCS). APP: 3D point
        case 14:
          entity.sx = value;
          break;
        case 24:
          entity.sy = value;
          break;
        case 34:
          entity.sz = value;
          break;

          /*************************************************\
          * -- Linear and Rotated Dimension Group Codes  --|
          *************************************************/

          // Definition point for diameter, radius, and angular dimensions (in WCS). APP: 3D point
        case 15:
          entity.px = value;
          break;
        case 25:
          entity.py = value;
          break;
        case 35:
          entity.pz = value;
          break;

          // Leader length for radius and diameter dimensions.
        case 40:
          entity.leader_length = value;
          break;

          /**************************************\
          * -- Angular Dimension Group Codes  --|
          **************************************/
          // Point defining dimension arc for angular dimensions. (in OCS). APP: 3D point
        case 16:
          entity.ax = value;
          break;
        case 26:
          entity.ay = value;
          break;
        case 36:
          entity.az = value;
          break;

        default:
          if (emitter.verbose) {
            console.log('Unhandled entityValue for dimension: %s Type: %s Value: %s',
              this.type,
              type,
              value);
          }
          break;
      }
    }
  });

};
