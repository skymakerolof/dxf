import common from './common'

export const TYPE = 'DIMENSION'

/**
 * https://www.autodesk.com/techpubs/autocad/acad2000/dxf/common_dimension_group_codes_dxf_06.htm
 */
export const process = (tuples) => {
  return tuples.reduce((entity, tuple) => {
    const type = tuple[0]
    const value = tuple[1]
    switch (type) {
      case 10:
        entity.x = value
        break
      case 11:
        entity.textCenter.x = value
        break
      case 13:
        entity.from.x = value
        break
      case 14:
        entity.to.x = value
        break
      case 20:
        entity.y = value
        break
      case 21:
        entity.textCenter.y = value
        break
      case 23:
        entity.from.y = value
        break
      case 24:
        entity.to.y = value
        break
      case 30:
        entity.z = value
        break
      case 33:
        entity.from.z = value
        break
      case 34:
        entity.to.z = value
        break
      case 31:
        entity.textCenter.z = value
        break
      case 70:
        // Dimension type.
        // Values 0-6 are integer values that represent the dimension type. Values 32, 64, and 128 are bit values, which are added to the integer values (value 32 is always set in R13 and later releases).
        // 0 = Rotated, horizontal, or vertical; 1 = Aligned;
        // 2 = Angular; 3 = Diameter; 4 = Radius;
        // 5 = Angular 3 point; 6 = Ordinate;
        // 32 = Indicates that the block reference (group code 2) is referenced by this dimension only.
        // 64 = Ordinate type. This is a bit value (bit 7) used only with integer value 6. If set, ordinate is X-type; if not set, ordinate is Y-type.
        // 128 = This is a bit value (bit 8) added to the other group 70 values if the dimension text has been positioned at a user-defined location rather than at the default location.
        entity.dimensionType = value
        break
      case 71:
        // Attachment point:
        // 1 = Top left; 2 = Top center; 3 = Top right;
        // 4 = Middle left; 5 = Middle center; 6 = Middle right;
        // 7 = Bottom left; 8 = Bottom center; 9 = Bottom right
        entity.attachmentPoint = value
        break
      case 42:
        entity.measurement = value
        break
      default:
        Object.assign(entity, common(type, value))
        break
    }
    return entity
  }, {
    type: TYPE,
    from: {},
    to: {},
    textCenter: {}
  })
}

export default { TYPE, process }
