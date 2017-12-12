export default (type, value) => {
  switch (type) {
    case 6:
      // Linetype name (present if not BYLAYER).
      // The special name BYBLOCK indicates a
      // floating linetype. (optional)
      return {
        lineTypeName: value
      }
    case 8:
      return {
        layer: value
      }
    case 48:
      // Linetype scale (optional)
      return {
        lineTypeScale: value
      }
    case 60:
      // Object visibility (optional): 0 = visible, 1 = invisible.
      return {
        visible: value === 0
      }
    case 62:
      // Color number (present if not BYLAYER).
      // Zero indicates the BYBLOCK (floating) color.
      // 256 indicates BYLAYER.
      // A negative value indicates that the layer is turned off. (optional)
      return {
        colorNumber: value
      }
    case 210:
      return {
        extrusionX: value
      }
    case 220:
      return {
        extrusionY: value
      }
    case 230:
      return {
        extrusionZ: value
      }
    default:
      return {}
  }
}
