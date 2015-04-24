// http://www.autodesk.com/techpubs/autocad/acadr14/dxf/spline_al_u05_c.htm
// http://www.saccade.com/writing/graphics/KnotVectors.pdf
// http://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/B-spline/bspline-curve.html
// http://www.sitepoint.com/html5-svg-cubic-curves/
// https://www.jasondavies.com/animated-bezier/
module.exports = function(emitter, commonValueHandler) {

    var entity;
    var point;
    //var knot;

    emitter.on('entityValue', function(type, value) {
        if (type === 0 && value === 'SPLINE') {
            entity = {
                points: [],
                knots: [],
                knotTolerance: 0.0000001,
                controlPointTolerance: 0.0000001,
                fitTolerance: 0.0000001,
                closed: false
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
                        emitter.emit('spline', entity);
                        entity = undefined;
                        point = undefined;
                        //knot = undefined;
                    }
                    break;

                case 330:
                    entity.block = value;
                    break;
                case 90:
                    entity.size = value;
                    break;
                case 10: // One per point.
                    point = {
                        x: value
                    };
                    break;
                case 20: // One per point.
                    point.y = value;
                    entity.points.push(point);
                    break;
                case 70: // Spline flag (bit coded):
                    // 1 = Closed spline
                    // 2 = Periodic spline
                    // 4 = Rational spline
                    // 8 = Planar
                    // 16 = Linear (planar bit is also set)
                    entity.flag = value;

                    // http://stackoverflow.com/questions/1436438/how-do-you-set-clear-and-toggle-a-single-bit-in-javascript
                    if ((value & 1) !== 0) {
                        entity.closed = true;
                    }

                    break;
                case 71: //Degree of the spline curve
                    entity.degree = value;
                    break;
                case 72: //Number of knots
                    entity.numberOfKnots = value;
                    //entity.knots.length = value;
                    break;
                case 73: //Number of control points
                    entity.numberOfControlpoints = value;
                    break;
                case 74: //Number of fit points (if any)
                    entity.numberOfFitPoints = value;
                    break;
                case 42: //Knot tolerance (default = 0.0000001)
                    entity.knotTolerance = value;
                    break;
                case 43: //Control-point tolerance (default = 0.0000001)
                    entity.controlPointTolerance = value;
                    break;
                case 44: //Fit tolerance (default = 0.0000000001)
                    entity.fitTolerance = value;
                    break;
                case 210: // DXF: X value; APP: 3D vector Normal vector (omitted if the spline is nonplanar)
                    // entity.normal.x
                    break;
                case 220: // DXF: Y value of normal vector
                    // entity.normal.y
                    break;
                case 230: // DXF: Z value of normal vector
                    // entity.normal.z
                    break;
                case 12: // DXF: X value; APP: 3D point. Start tangent--may be omitted (in WCS).
                    break;
                case 22: // DXF: Y value of start tangent--may be omitted (in WCS).
                    break;
                case 32: // DXF: Z value of start tangent--may be omitted (in WCS).
                    break;
                case 13: // DXF: X value; APP: 3D point. End tangent--may be omitted (in WCS).
                    break;
                case 23: // DXF: Y value of end tangent--may be omitted (in WCS)
                    break;
                case 33: // DXF: Z value of end tangent--may be omitted (in WCS)
                    break;
                case 40: // Knot value (one entry per knot)
                    //knot = { value: value };
                    //entity.knots.push(knot);
                    entity.knots.push(value);
                    break;
                case 41: // Weight (if not 1); with multiple group pairs, are present if all are not 1
                    break;
                case 10: // DXF: X value; APP: 3D point Control points (in WCS) one entry per control point.
                    break;
                case 20: // DXF: Y value of control points (in WCS) (one entry per control point)
                    break;
                case 30: // DXF: Z value of control points (in WCS) (one entry per control point)
                    break;
                case 11: // DXF: X value; APP: 3D point Fit points (in WCS) one entry per fit point.
                    break;
                case 21: // DXF: Y value of fit points (in WCS) (one entry per fit point)
                    break;
                case 31: // DXF: Z value of fit points (in WCS) (one entry per fit point)
                    break;

                default:
                    if (emitter.verbose) {
                        console.log('Unhandled entityValue for Spline, Type: ' + type + ' Value: "' + value + '"');
                    }
                    break;
            }
        }
    });
};