import common from './common'

export const TYPE = 'SPLINE'

export const process = (tuples) => {
  let controlPoint
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]
      switch (type) {
        case 10:
          controlPoint = {
            x: value,
            y: 0,
          }
          entity.controlPoints.push(controlPoint)
          break
        case 20:
          controlPoint.y = value
          break
        case 30:
          controlPoint.z = value
          break
        case 40:
          entity.knots.push(value)
          break
        case 41:
          // Only create weights if needed
          if (!entity.weights) entity.weights = []
          entity.weights.push(value)
          break
        case 42:
          entity.knotTolerance = value
          break
        case 43:
          entity.controlPointTolerance = value
          break
        case 44:
          entity.fitTolerance = value
          break
        case 70: // Spline flag (bit coded):
          // 1 = Closed spline
          // 2 = Periodic spline
          // 4 = Rational spline
          // 8 = Planar
          // 16 = Linear (planar bit is also set)
          entity.flag = value
          entity.closed = (value & 1) === 1
          break
        case 71:
          entity.degree = value
          break
        case 72:
          entity.numberOfKnots = value
          break
        case 73:
          entity.numberOfControlPoints = value
          break
        case 74:
          entity.numberOfFitPoints = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      controlPoints: [],
      knots: [],
    },
  )
}

export default { TYPE, process }
