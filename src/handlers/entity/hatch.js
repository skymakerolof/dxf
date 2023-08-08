import common from './common'

export const TYPE = 'HATCH'

let status = 'IDLE'
let drawEntity = {}
let drawType = 0
let isPolyline = false
let seed = null
let loop = { references: [], entities: [] }
let polyPoint = null

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      switch (type) {
        case 100:
          status = 'IDLE'
          break
        case 2:
          entity.patternName = value
          break
        case 10:
          {
            if (status === 'IDLE') entity.elevation.x = parseFloat(value)
            else if (status === 'POLYLINE') {
              polyPoint = {
                x: parseFloat(value),
                y: 0,
                bulge: 0,
              }
              loop.entities[0].points.push(polyPoint)
            } else if (status === 'SEED') {
              if (!seed) {
                seed = { x: 0, y: 0 }
                entity.seeds.seeds.push(seed)
              }
              seed.x = parseFloat(value)
            } else fillDrawEntity(type, drawType, parseFloat(value))
          }
          break
        case 20:
          {
            if (status === 'IDLE') entity.elevation.y = parseFloat(value)
            else if (status === 'POLYLINE') polyPoint.y = parseFloat(value)
            else if (status === 'SEED') {
              seed.y = parseFloat(value)
              seed = null
            } else fillDrawEntity(type, drawType, parseFloat(value))
          }
          break
        case 30:
          entity.elevation.z = parseFloat(value)
          break
        case 63:
          entity.fillColor = value
          break
        case 70:
          entity.fillType = parseFloat(value) === 1 ? 'SOLID' : 'PATTERN'
          break
        case 210:
          entity.extrusionDir.x = parseFloat(value)
          break
        case 220:
          entity.extrusionDir.y = parseFloat(value)
          break
        case 230:
          entity.extrusionDir.z = parseFloat(value)
          break
        case 91:
          {
            // LOOP COUNT
            entity.boundary.count = parseFloat(value)
          }
          break
        case 92:
          {
            // 0 = Default; 1 = External; 2 = Polyline; 4 = Derived; 8 = Textbox; 16 = Outermost
            loop = { references: [], entities: [] }
            entity.boundary.loops.push(loop)
            loop.type = parseFloat(value)
            isPolyline = (loop.type & 2) === 2
            if (isPolyline) {
              const ent = {
                type: 'POLYLINE',
                points: [],
              }
              loop.entities.push(ent)
              status = 'POLYLINE'
            }
          }
          break
        case 93:
          {
            if (status === 'IDLE') status = 'ENT'
            loop.count = parseFloat(value)
          }
          break
        case 11:
        case 21:
        case 40:
        case 50:
        case 51:
        case 74:
        case 94:
        case 95:
        case 96:
          if (drawType === 4) status = 'SPLINE'
          fillDrawEntity(type, drawType, parseFloat(value))
          break
        case 42:
          {
            if (isPolyline) polyPoint.bulge = parseFloat(value)
            else fillDrawEntity(type, drawType, parseFloat(value))
          }
          break
        case 72:
          {
            // !Polyline --> 1 = Line; 2 = Circular arc; 3 = Elliptic arc; 4 = Spline
            // Polyline -->  hasBulge
            drawType = parseFloat(value)
            loop[isPolyline ? 'hasBulge' : 'edgeType'] = drawType
            if (!isPolyline) {
              drawEntity = createDrawEntity(drawType)
              loop.entities.push(drawEntity)
            }
          }
          break
        case 73:
          {
            if (status === 'IDLE' || isPolyline) loop.entities[0].closed = value
            else fillDrawEntity(type, drawType, parseFloat(value))
          }
          break
        case 75:
          {
            // END OF BOUNDARY PATH DATA
            status = 'IDLE'

            // 0 = Hatch “odd parity” area (Normal style)
            // 1 = Hatch outermost area only (Outer style)
            // 2 = Hatch through entire area (Ignore style)
            entity.style = parseFloat(value)
          }
          break
        case 76:
          // 0 = User-defined; 1 = Predefined; 2 = Custom
          entity.hatchType = parseFloat(value)
          break
        case 97:
          {
            status = 'IDLE'
            isPolyline = false
            loop.sourceObjects = parseFloat(value)
          }
          break
        case 98:
          {
            status = 'SEED'
            entity.seeds.count = parseFloat(value)
          }
          break
        case 52:
          entity.shadowPatternAngle = parseFloat(value)
          break
        case 41:
          entity.spacing = parseFloat(value)
          break
        case 77:
          entity.double = parseFloat(value) === 1
          break
        case 78:
          entity.pattern.lineCount = parseFloat(value)
          break
        case 53:
          entity.pattern.angle = parseFloat(value)
          break
        case 43:
          entity.pattern.x = parseFloat(value)
          break
        case 44:
          entity.pattern.y = parseFloat(value)
          break
        case 45:
          entity.pattern.offsetX = parseFloat(value)
          break
        case 46:
          entity.pattern.offsetY = parseFloat(value)
          break
        case 79:
          entity.pattern.dashCount = parseFloat(value)
          break
        case 49:
          entity.pattern.length.push(value)
          break
        case 330:
          loop.references.push(value)
          break
        case 450:
          entity.solidOrGradient =
            parseFloat(value) === 0 ? 'SOLID' : 'GRADIENT'
          break
        case 453:
          // 0 = Solid; 2 = Gradient
          entity.color.count = parseFloat(value)
          break
        case 460:
          entity.color.rotation = value
          break
        case 461:
          entity.color.gradient = value
          break
        case 462:
          entity.color.tint = value
          break
        default:
          Object.assign(entity, common(type, value))
          break
      }
      return entity
    },
    {
      type: TYPE,
      elevation: {},
      extrusionDir: { x: 0, y: 0, z: 1 },
      pattern: { length: [] },
      boundary: { loops: [] },
      seeds: { count: 0, seeds: [] },
      color: {},
    },
  )
}

export default { TYPE, process }

function createDrawEntity(type) {
  if (isPolyline) return {}

  // 1 = Line; 2 = Circular arc; 3 = Elliptic arc; 4 = Spline
  switch (type) {
    case 1:
      return {
        type: 'LINE',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
      }
    case 2:
      return {
        type: 'ARC',
        center: { x: 0, y: 0 },
        radius: 0,
        startAngle: 0,
        endAngle: 0,
        counterClockWise: false,
      }
    case 3:
      return {
        type: 'ELLIPSE',
        center: { x: 0, y: 0 },
        startAngle: 0,
        endAngle: 0,
        counterClockWise: false,
        major: { x: 0, y: 0 },
        minor: 0,
      }
    case 4:
      return {
        type: 'SPLINE',
        degree: 0,
        rational: 0,
        periodic: 0,
        knots: { count: 0, knots: [] },
        controlPoints: { count: 0, points: [] },
        weights: 1,
      }
  }

  return {}
}

function fillDrawEntity(type, drawType, value) {
  switch (type) {
    case 10:
      {
        switch (drawType) {
          case 1:
            {
              drawEntity.start.x = value
            }
            break
          case 2:
            {
              drawEntity.center.x = value
            }
            break
          case 3:
            {
              drawEntity.center.x = value
            }
            break
          case 4:
            {
              drawEntity.controlPoints.points.push({ x: value, y: 0 })
            }
            break
        }
      }
      break
    case 20: {
      switch (drawType) {
        case 1:
          {
            drawEntity.start.y = value
          }
          break
        case 2:
          {
            drawEntity.center.y = value
          }
          break
        case 3:
          {
            drawEntity.center.y = value
          }
          break
        case 4:
          {
            drawEntity.controlPoints.points[
              drawEntity.controlPoints.points.length - 1
            ].y = value
          }
          break
      }
      break
    }
    case 11:
      {
        switch (drawType) {
          case 1:
            {
              drawEntity.end.x = value
            }
            break
          case 3:
            {
              drawEntity.major.x = value
            }
            break
        }
      }
      break
    case 21: {
      switch (drawType) {
        case 1:
          {
            drawEntity.end.y = value
          }
          break
        case 3:
          {
            drawEntity.major.y = value
          }
          break
      }
      break
    }
    case 40:
      {
        switch (drawType) {
          case 2:
            {
              drawEntity.radius = value
            }
            break
          case 3:
            {
              drawEntity.minor = value
            }
            break
          case 4:
            {
              drawEntity.knots.knots.push(value)
            }
            break
        }
      }
      break
    case 42:
      {
        switch (drawType) {
          case 4:
            {
              drawEntity.weights = value
            }
            break
        }
      }
      break
    case 50:
      {
        switch (drawType) {
          case 2:
            {
              drawEntity.startAngle = value
            }
            break
          case 3:
            {
              drawEntity.startAngle = value
            }
            break
        }
      }
      break
    case 51:
      {
        switch (drawType) {
          case 2:
            {
              drawEntity.endAngle = value
            }
            break
          case 3:
            {
              drawEntity.endAngle = value
            }
            break
        }
      }
      break
    case 73:
      {
        switch (drawType) {
          case 2:
            {
              drawEntity.counterClockWise = parseFloat(value) === 1
            }
            break
          case 3:
            {
              drawEntity.counterClockWise = parseFloat(value) === 1
            }
            break
          case 4:
            {
              drawEntity.rational = value
            }
            break
        }
      }
      break
    case 74:
      {
        switch (drawType) {
          case 4:
            {
              drawEntity.periodic = value
            }
            break
        }
      }
      break
    case 94:
      {
        switch (drawType) {
          case 4:
            {
              drawEntity.degree = value
            }
            break
        }
      }
      break
    case 95:
      {
        switch (drawType) {
          case 4:
            {
              drawEntity.knots.count = value
            }
            break
        }
      }
      break
    case 96:
      {
        switch (drawType) {
          case 4:
            {
              drawEntity.controlPoints.count = value
            }
            break
        }
      }
      break
  }
}
