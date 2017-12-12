const fs = require('fs')
const join = require('path').join

const dxf = require('..')
const parsed = dxf.parseString(fs.readFileSync(
  './test/resources/Ceco.NET-Architecture-Tm-53.dxf', 'utf-8'))

// Denormalise the entities out of the parsed structure - block transforms
// are added to the entities in this step
const entities = dxf.denormalise(parsed)

// Group entities by layer. Returns an object with layer names as
// keys to arrays of entities
const groups = dxf.groupEntitiesByLayer(entities)

// Ouptut the groups
console.log('[layer : number of entities]')
Object.keys(groups).forEach(layer => {
  console.log(layer, ':', groups[layer].length)
})

// Open this SVG in your browser or other SVG viewer
const svg = dxf.toSVG(parsed)
fs.writeFileSync(join(__dirname, '/example.es5.svg'), svg, 'utf-8')
console.log('\nSVG written')
