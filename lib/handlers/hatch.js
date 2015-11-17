var isEntityStart = require('./isEntityStart');

// Hatch is more complicated. It can be made up of many lines, circles, etc.
// http://www.autodesk.com/techpubs/autocad/acad2000/dxf/hatch_dxf_06.htm
// http://www.autodesk.com/techpubs/autocad/acad2000/dxf/boundary_path_data_dxf_06.htm
module.exports = function(emitter, commonValueHandler) {
  // hatch.r[circles_count];
  // hatch.angle1[circles_count];
  // hatch.angle2[circles_count];
  // hatch.ccws[circles_count];
  var entity;
  var point;
  var point2;

  emitter.on('entityValue', function(type, value) {
    if ((type === 0) && entity && isEntityStart(value)) {
      emitter.emit('hatch', entity);
      entity = undefined;
    }
    if (type === 0 && value === 'HATCH') {
      entity = {
        points: [],
        x: 0,
        y: 0,
        z: 0,
        extrusion_x: 0,
        extrusion_y: 0,
        extrusion_z: 0,
        pattern_name: '',
        solid: 1,
        associativity: 1,
        path_count: 0,
        style: 0,
        type: 0,
        angle: 0,
        angle1: [],
        angle2: [],
        scale: 0,
        double: 0,
        line_points: [],
        pixel_size: 1,
        seed_point_count: 0,
        seed_points: [],
        edge_types: [],
        edge_counts: [],
        fills: [],
        r: [],
        ccws: [],
        path_types: []
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
            emitter.emit('hatch', entity);
            entity = undefined;
            point = undefined;
            point2 = undefined;
          }
          break;
        case 10:
          // Elevation point (in OCS)
          // DXF: X value = 0; APP: 3D point
          // (X and Y always equal 0, Z represents the elevation)
          point = {
            x: value,
            y: 0,
            z: 0
          };
          entity.points.push(point);
          break;
        case 20: // DXF: Y value
          point.y = value;
          break;
        case 11: // X Value
          point2 = {
            x: value,
            y: 0,
            z: 0
          };
          entity.line_points.push(point2);
          break;
        case 21: // Y Value
          point2.y = value;
          break;
        case 30: // DXF: Z value
          point.z = value;
          break;
        case 21:
          entity.r.push(value);
          break;
          // // Extrusion direction (optional; default = 0, 0, 1)
        // case 210: // DXF: X value; APP: 3D vector
          //   entity.extrusion_x = value;
          // break;
        // case 220: // DXF: Y value of extrusion direction
          //   entity.extrusion_y = value;
          // break;
        // case 230: // DXF: Z value of extrusion direction
          //   entity.extrusion_z = value;
          // break;
        case 2: // Hatch pattern name
          entity.pattern_name = value;
          break;
        case 70: // Solid fill flag (solid fill = 1; pattern fill = 0)
          entity.fills.push(value);
          break;
        case 71: // Associativity flag (associative = 1; non-associative = 0)
          entity.associativity = value;
          break;
        case 72:
          entity.edge_types.push(value);
          break;
        case 91: // Number of boundary paths (loops)
          entity.path_count = value;
          break;
        case 92: // Path Type
          entity.path_types.push(value);
          break;
        case 93: // Number of edges
          entity.edge_counts.push(value);
          break;
          // Boundary path data. Repeats number of times specified by code 91.
          // See "Boundary Path Data"
        case 75:
          // Hatch style:
          // 0 = Hatch "odd parity" area (Normal style)
          // 1 = Hatch outermost area only (Outer style)
          // 2 = Hatch through entire area (Ignore style)
          entity.style = value;
          break;

        case 76: // Hatch pattern type:
          // 0 = User-defined; 1 = Predefined; 2 = Custom
          entity.type = value;
          break;
        case 50:
          entity.angle1.push(value);
          break;
        case 51:
          entity.angle2.push(value);
          break;
        case 52:
          // Hatch pattern angle (pattern fill only)
          entity.pattern_angle = value;
          break;
        case 41: // Hatch pattern scale or spacing (pattern fill only)
          entity.pattern_scale = value;
          break;
        case 73:
          entity.ccws.push(value);
          break;
        case 77: // Hatch pattern double flag (pattern fill only):
          // 0 = not double; 1 = double
          entity.double = value;
          break;
        case 78: // Number of pattern definition line
          entity.line_count = value;
          break;
          //  Pattern line data. Repeats number of times specified by code 78. See "Pattern Data"
        case 47:
          entity.pixel_size = value;
          break;
        case 98: // Number of seed points
          entity.seed_point_count = value;
          break;
        default:
          if (emitter.verbose) {}
          break;
      }
    }
  });
};
