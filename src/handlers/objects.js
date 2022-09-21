export default (tuples) => {
  let state
  const objects = {
    layouts: [],
  }
  let layout = {}

  tuples.forEach((tuple, i) => {
    const type = tuple[0]
    const value = tuple[1]
    if (type === 0) {
      state = 'IDLE'
    }
    if (value === 'LAYOUT') {
      state = 'layout'
      layout = {}
      objects.layouts.push(layout)
    }
    if (state === 'layout' && type !== 0) {
      // wait until AcDbLayout shows up
      switch (type) {
        case 100:
          {
            if (value === 'AcDbLayout') state = 'AcDbLayout'
          }
          break
      }
    }
    if (state === 'AcDbLayout' && type !== 0) {
      // save layout attributes
      switch (type) {
        case 1:
          {
            layout.name = value
          }
          break
        case 5:
          {
            layout.handle = value
          }
          break
        case 10:
          {
            layout.minLimitX = parseFloat(value)
          }
          break
        case 20:
          {
            layout.minLimitY = parseFloat(value)
          }
          break
        case 11:
          {
            layout.maxLimitX = parseFloat(value)
          }
          break
        case 21:
          {
            layout.maxLimitY = parseFloat(value)
          }
          break
        case 12:
          {
            layout.x = parseFloat(value)
          }
          break
        case 22:
          {
            layout.y = parseFloat(value)
          }
          break
        case 32:
          {
            layout.z = parseFloat(value)
          }
          break
        case 14:
          {
            layout.minX = parseFloat(value)
          }
          break
        case 24:
          {
            layout.minY = parseFloat(value)
          }
          break
        case 34:
          {
            layout.minZ = parseFloat(value)
          }
          break
        case 15:
          {
            layout.maxX = parseFloat(value)
          }
          break
        case 25:
          {
            layout.maxY = parseFloat(value)
          }
          break
        case 35:
          {
            layout.maxZ = parseFloat(value)
          }
          break
        case 70:
          {
            layout.flag = value === 1 ? 'PSLTSCALE' : 'LIMCHECK'
          }
          break
        case 71:
          {
            layout.tabOrder = value
          }
          break
        case 146:
          {
            layout.elevation = parseFloat(value)
          }
          break
        case 13:
          {
            layout.ucsX = parseFloat(value)
          }
          break
        case 23:
          {
            layout.ucsY = parseFloat(value)
          }
          break
        case 33:
          {
            layout.ucsZ = parseFloat(value)
          }
          break
        case 16:
          {
            layout.ucsXaxisX = parseFloat(value)
          }
          break
        case 26:
          {
            layout.ucsXaxisY = parseFloat(value)
          }
          break
        case 36:
          {
            layout.ucsXaxisZ = parseFloat(value)
          }
          break
        case 17:
          {
            layout.ucsYaxisX = parseFloat(value)
          }
          break
        case 27:
          {
            layout.ucsYaxisY = parseFloat(value)
          }
          break
        case 37:
          {
            layout.ucsYaxisZ = parseFloat(value)
          }
          break
        case 76:
          {
            switch (value) {
              case 0:
                {
                  layout.ucsType = 'NOT ORTHOGRAPHIC'
                }
                break
              case 1:
                {
                  layout.ucsType = 'TOP'
                }
                break
              case 2:
                {
                  layout.ucsType = 'BOTTOM'
                }
                break
              case 3:
                {
                  layout.ucsType = 'FRONT'
                }
                break
              case 4:
                {
                  layout.ucsType = 'BACK'
                }
                break
              case 5:
                {
                  layout.ucsType = 'LEFT'
                }
                break
              case 6:
                {
                  layout.ucsType = 'RIGHT'
                }
                break
            }
          }
          break
        case 330:
          {
            layout.tableRecord = value
          }
          break
        case 331:
          {
            layout.lastActiveViewport = value
          }
          break
        case 333:
          {
            layout.shadePlot = value
          }
          break
      }
    }
  })

  return objects
}
