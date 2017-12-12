const fs = require('fs')
const join = require('path').join

const dxf = require('..')
const parsed = dxf.parseString(fs.readFileSync(
  './test/resources/Ceco.NET-Architecture-Tm-53.dxf', 'utf-8'))

// Open this SVG in your browser or other SVG viewer
const svg = dxf.toSVG(parsed)
fs.writeFileSync(join(__dirname, '/example.svg'), svg, 'utf-8')
