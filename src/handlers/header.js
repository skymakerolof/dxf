export default (tuples) => {
  let state
  const header = {}

  tuples.forEach((tuple) => {
    const type = tuple[0]
    const value = tuple[1]

    switch (value) {
      case '$MEASUREMENT': {
        state = 'measurement'
        break
      }
      case '$INSUNITS': {
        state = 'insUnits'
        break
      }
      case '$EXTMIN':
        header.extMin = {}
        state = 'extMin'
        break
      case '$EXTMAX':
        header.extMax = {}
        state = 'extMax'
        break
      case '$DIMASZ':
        header.dimArrowSize = {}
        state = 'dimArrowSize'
        break
      default:
        switch (state) {
          case 'extMin':
          case 'extMax': {
            switch (type) {
              case 10:
                header[state].x = value
                break
              case 20:
                header[state].y = value
                break
              case 30:
                header[state].z = value
                state = undefined
                break
            }
            break
          }
          case 'measurement':
          case 'insUnits': {
            switch (type) {
              case 70: {
                header[state] = value
                state = undefined
                break
              }
            }
            break
          }
          case 'dimArrowSize': {
            switch (type) {
              case 40: {
                header[state] = value
                state = undefined
                break
              }
            }
            break
          }
        }
    }
  })

  return header
}
