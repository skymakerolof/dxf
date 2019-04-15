/**
 * Convert an RGB array to a CSS string definition.
 * Converts white lines to black as the default.
 */
export default (rgb) => {
  if (rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255) {
    return 'rgb(0, 0, 0)'
  } else {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }
}
