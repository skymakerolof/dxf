import common from './common'

export const TYPE = 'DIMENSION'

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 2:
          entity.block = value
          break
        case 10:
          entity.start.x = value
          break
        case 20:
          entity.start.y = value
          break
        case 30:
          entity.start.z = value
          break
        case 11:
          entity.textMidpoint.x = value
          break
        case 21:
          entity.textMidpoint.y = value
          break
        case 31:
          entity.textMidpoint.z = value
          break
        case 13:
          entity.measureStart.x = value
          break
        case 23:
          entity.measureStart.y = value
          break
        case 33:
          entity.measureStart.z = value
          break
        case 14:
          entity.measureEnd.x = value
          break
        case 24:
          entity.measureEnd.y = value
          break
        case 34:
          entity.measureEnd.z = value
          break
        case 50:
          entity.rotation = value
          break
        case 51:
          entity.horizonRotation = value
          break
        case 52:
          entity.extensionRotation = value
          break
        case 53:
          entity.textRotation = value
          break
        case 70: {
          const dimType = parseBitCombinationsFromValue(value)
          if (dimType.ordinateType) {
            entity.ordinateType = true
          }
          if (dimType.uniqueBlockReference) {
            entity.uniqueBlockReference = true
          }
          if (dimType.userDefinedLocation) {
            entity.userDefinedLocation = true
          }
          entity.dimensionType = dimType.dimensionType
          break
        }
        case 71:
          entity.attachementPoint = value
          break
        case 210:
          entity.extrudeDirection = entity.extrudeDirection || {}
          entity.extrudeDirection.x = value
          break
        case 220:
          entity.extrudeDirection = entity.extrudeDirection || {}
          entity.extrudeDirection.y = value
          break
        case 230:
          entity.extrudeDirection = entity.extrudeDirection || {}
          entity.extrudeDirection.z = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      start: { x: 0, y: 0, z: 0 },
      measureStart: { x: 0, y: 0, z: 0 },
      measureEnd: { x: 0, y: 0, z: 0 },
      textMidpoint: { x: 0, y: 0, z: 0 },
      attachementPoint: 1,
      dimensionType: 0,
    },
  )
}

/**
 * From DXF Reference for DIMENSION
 * Values 0-6 are integer values that represent the dimension type. Values 32, 64, and 128
 * are bit values, which are added to the integer values (value 32 is always set in R13 and
 * later releases)
 * 0 = Rotated, horizontal, or vertical; 1 = Aligned
 * 2 = Angular; 3 = Diameter; 4 = Radius
 * 5 = Angular 3 point; 6 = Ordinate
 * 32 = Indicates that the block reference (group code 2) is referenced by this dimension only
 * 64 = Ordinate type. This is a bit value (bit 7) used only with integer value 6. If set, ordinate is X-type; if not set, ordinate is Y-type
 * 128 = This is a bit value (bit 8) added to the other group 70 values if the dimension text has been positioned at a user-defined location rather than at the default location
 */
function parseBitCombinationsFromValue(value) {
  let uniqueBlockReference = false
  let ordinateType = false
  let userDefinedLocation = false

  // ToDo: Solve in some more clever way??
  if (value > 6) {
    const alt1 = value - 32
    const alt2 = value - 64
    const alt3 = value - 32 - 64
    const alt4 = value - 32 - 128
    const alt5 = value - 32 - 64 - 128

    if (alt1 >= 0 && alt1 <= 6) {
      uniqueBlockReference = true
      value = alt1
    } else if (alt2 >= 0 && alt2 <= 6) {
      ordinateType = true
      value = alt2
    } else if (alt3 >= 0 && alt3 <= 6) {
      uniqueBlockReference = true
      ordinateType = true
      value = alt3
    } else if (alt4 >= 0 && alt4 <= 6) {
      uniqueBlockReference = true
      userDefinedLocation = true
      value = alt4
    } else if (alt5 >= 0 && alt5 <= 6) {
      uniqueBlockReference = true
      ordinateType = true
      userDefinedLocation = true
      value = alt5
    }
  }
  return {
    dimensionType: value,
    uniqueBlockReference,
    ordinateType,
    userDefinedLocation,
  }
}

export default { TYPE, process }
