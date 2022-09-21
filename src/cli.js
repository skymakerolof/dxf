#!/usr/bin/env node
import commander from 'commander'
import fs from 'fs'

import { denormalise, groupEntitiesByLayer, parseString, toSVG } from './'

commander
  .version(require('../package.json').version)
  .description('Converts a dxf file to a svg file.')
  .arguments('<dxfFile> [svgFile]')
  .option('-v --verbose', 'Verbose output')
  .action((dxfFile, svgFile, options) => {
    const parsed = parseString(fs.readFileSync(dxfFile, 'utf-8'))

    if (options.verbose) {
      const groups = groupEntitiesByLayer(denormalise(parsed))
      console.log('[layer : number of entities]')
      Object.keys(groups).forEach((layer) => {
        console.log(`${layer} : ${groups[layer].length}`)
      })
    }

    fs.writeFileSync(
      svgFile || `${dxfFile.split('.').slice(0, -1).join('.')}.svg`,
      toSVG(parsed),
      'utf-8',
    )
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  commander.help()
}
