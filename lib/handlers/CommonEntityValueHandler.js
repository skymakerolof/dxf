function commonEntityValueHandler(o, type, value) {
  switch (type) {
    case 2:
      o.block = value;
      break;
    case 5:
      o.handle = value;
      break;
    case 6:
      // Linetype name (present if not BYLAYER).
      // The special name BYBLOCK indicates a
      // floating linetype. (optional)
      o.lineTypeName = value;
      break;
    case 8:
      // Layer
      o.layer = value;
      break;
    case 48:
      // Linetype scale (optional)
      o.lineTypeScale = value;
      break;
    case 60:
      // Object visibility (optional): 0 = visible, 1 = invisible.
      o.visible = value === 0;
      break;
    case 62:
      // Color number (present if not BYLAYER).
      // Zero indicates the BYBLOCK (floating) color.
      // 256 indicates BYLAYER.
      // A negative value indicates that the layer is turned off. (optional)
      o.colorNumber = value;
      break;
    case 100:
      // Subclass Marker. (I don't see a use for this currently.)
      break;
    default:
      // Return false if type is not handled by this function.
      return false;
  }
  return true;
}

module.exports = commonEntityValueHandler;
