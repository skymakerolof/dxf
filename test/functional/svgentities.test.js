import fs from 'fs'
import { join } from 'path'

import { parseString, toSVG } from '../../src'

function createTest (type) {
  it(type, function () {
    const parsed = parseString(
      fs.readFileSync(join(__dirname, '/../resources/', type + '.dxf'), 'utf-8'))
    const svg = toSVG(parsed)
    fs.writeFileSync(join(__dirname, '/output/', type + '.output.svg'), svg, 'utf-8')
  })
}

describe('svg entities', function () {
  createTest('lines')
  createTest('lwpolylines')
  createTest('polylines')
  createTest('circlesellipsesarcs')
  createTest('splines')
  createTest('blocks1')
  createTest('blocks2')
  createTest('layers')
  createTest('supported_entities')
  createTest('empty')
  createTest('floorplan')
  createTest('Ceco.NET-Architecture-Tm-53')
  createTest('issue21')
  createTest('issue27a')
  createTest('issue27b')
  createTest('issue27c')
  createTest('issue28')
})
