import fs from 'fs'
import { join } from 'path'
import expect from 'expect'

import { parseString, toSVG } from '../../src'

const dxfsFilenames = ['elliptical-arc1.dxf',
  'elliptical-arc2.dxf',
  'elliptical-arc3.dxf',
  'elliptical-arc4.dxf',
  'elliptical-arc5.dxf',
  'elliptical-arc6.dxf',
  'elliptical-arc7.dxf',
  'elliptical-arc8.dxf',
  'elliptical-arc9.dxf',
  'elliptical-arc10.dxf',
  'elliptical-arc11.dxf',
  'elliptical-arc12.dxf',
  'elliptical-arc13.dxf',
  'elliptical-arc14.dxf'
]

// Load and parse DXFs
const dxfs = dxfsFilenames.reduce((dxfObj, dxfFilename) => {
  dxfObj[dxfFilename] = parseString(fs.readFileSync(join(__dirname, '/../resources/' + dxfFilename), 'utf-8'))
  return dxfObj
}, {})

// Helper functions for testing SVGs
const approx = (a, b) => Math.abs(a - b) < 1e-12

expect.extend({
  toMatchViewbox (received, a, b, c, d) {
    // Use naive regex to match numbers
    let re = /viewBox="([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)"/
    let result = re.exec(received)
    if (result &&
      approx(parseFloat(result[1]), a) &&
      approx(parseFloat(result[2]), b) &&
      approx(parseFloat(result[3]), c) &&
      approx(parseFloat(result[4]), d)) {
      return {
        pass: true,
        message: () => `expected ${received} not to contain 'viewBox="${a} ${b} ${c} ${d}"'`
      }
    } else {
      return {
        pass: false,
        message: () => `expected ${received} to contain 'viewBox="${a} ${b} ${c} ${d}"'`
      }
    }
  },
  toMatchArc (received, a, b, c, d, e, f, g, h, i) {
    let re = /path d="M ([-0-9.e]+) ([-0-9.e]+) A ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)"/
    let result = re.exec(received)
    if (result &&
      approx(parseFloat(result[1]), a) &&
      approx(parseFloat(result[2]), b) &&
      approx(parseFloat(result[3]), c) &&
      approx(parseFloat(result[4]), d) &&
      approx(parseFloat(result[5]), e) &&
      approx(parseFloat(result[6]), f) &&
      approx(parseFloat(result[7]), g) &&
      approx(parseFloat(result[8]), h) &&
      approx(parseFloat(result[9]), i)) {
      return {
        pass: true,
        message: () => `expected ${received} not to contain 'path d="M ${a} ${b} A ${c} ${d} ${e} ${f} ${g} ${h} ${i}"'`
      }
    } else {
      return {
        pass: false,
        message: () => `expected ${received} to contain 'path d="M ${a} ${b} A ${c} ${d} ${e} ${f} ${g} ${h} ${i}"'`
      }
    }
  }
})

describe('toSVG', () => {
  it('elliptical arcs', () => {
    let svg1 = toSVG(dxfs['elliptical-arc1.dxf'])
    expect(svg1).toMatchViewbox(-10, -5, 20, 10)
    expect(svg1).toMatchArc(10, 0, 10, 5, 0, 0, 1, 0, 5)

    let svg2 = toSVG(dxfs['elliptical-arc2.dxf'])
    expect(svg2).toMatchViewbox(-10, -5, 20, 10)
    expect(svg2).toMatchArc(8.660254037844387, 2.5, 10, 5, 0, 0, 1, 5, 4.3301270189221945)

    let svg3 = toSVG(dxfs['elliptical-arc3.dxf'])
    expect(svg3).toMatchViewbox(-10, -5, 20, 10)
    expect(svg3).toMatchArc(7.0710678118654755, 3.5355339059327373, 10, 5, 0, 0, 1, -8.191520442889914, -2.8678821817552325)

    let svg4 = toSVG(dxfs['elliptical-arc4.dxf'])
    expect(svg4).toMatchViewbox(-10, -5, 20, 10)
    expect(svg4).toMatchArc(10, 0, 10, 5, 180, 0, 1, 0, 5)

    let svg5 = toSVG(dxfs['elliptical-arc5.dxf'])
    expect(svg5).toMatchViewbox(-10.535533905932738, -10.535533905932738, 14, 21.071067811865476)
    expect(svg5).toMatchArc(7, 7, 9.899494936611665, 5, 45, 0, 1, -3.53553390593274, 3.535533905932735)

    let svg6 = toSVG(dxfs['elliptical-arc6.dxf'])
    expect(svg6).toMatchViewbox(-7.82085500087199, -9.455213750217997, 11.641710001743983, 18.910427500435993)
    expect(svg6).toMatchArc(-2.7017524810471167, 6.6858457603474335, 8.246211251235321, 6, 75.96375653207353, 1, 1, 5.530179605793307, 4.627862738637326)

    let svg7 = toSVG(dxfs['elliptical-arc7.dxf'])
    expect(svg7).toMatchViewbox(-211.11801826328391, -181.98882080917878, 422.23603652656783, 200.72156378674504)
    expect(svg7).toMatchArc(152.04578988935765, -18.03933100382215, 188.7669481278684, 96.37827861800855, -32.118022210114795, 1, 1, -81.36053316126296, -60.54737351535849)

    let svg8 = toSVG(dxfs['elliptical-arc8.dxf'])
    expect(svg8).toMatchViewbox(1.6260197509660799, -35.07256333190212, 164.24796049806787, 28.645126663804206)
    expect(svg8).toMatchArc(58.63682165165453, 48.26215307468564, 80.93400088961376, 14.444639918326656, 172.54570118725155, 0, 1, 11.64284740886555, 33.97960829997985)

    let svg9 = toSVG(dxfs['elliptical-arc9.dxf'])
    expect(svg9).toMatchViewbox(-287.16287668562217, -276.04483252648555, 580.8257533712443, 269.0896650529711)
    expect(svg9).toMatchArc(-118.07395417897287, 17.6760458210273, 289.26080360117925, 134.5498578288584, -0.4951975183272285, 0, 1, 98.82825511522925, 11.356781878370896)

    let svg10 = toSVG(dxfs['elliptical-arc10.dxf'])
    expect(svg10).toMatchViewbox(-133.60204022600612, 6.072497444896541, 62, 118.35500511020692)
    expect(svg10).toMatchArc(-81.02670163715118, -27.945143148808462, 56.930330229149384, 20.98617723085445, 57.00777591273486, 1, 1, -72.10048373873673, -21.023087104240282)

    let svg11 = toSVG(dxfs['elliptical-arc11.dxf'])
    expect(svg11).toMatchViewbox(-10, -10, 20, 20)
    expect(svg11).toMatchArc(0, 10, 10, 10, 90, 1, 1, 0, -10)

    let svg12 = toSVG(dxfs['elliptical-arc12.dxf'])
    expect(svg12).toMatchViewbox(-10, -10, 20, 20)
    expect(svg12).toMatchArc(10, 0, 10, 10, -90, 0, 1, -10, 0)

    let svg13 = toSVG(dxfs['elliptical-arc13.dxf'])
    expect(svg13).toMatchViewbox(-5.348802152483696, 7.610111124026027, 68.18159248402901, 43.23477924484508)
    expect(svg13).toMatchArc(4.411047670150015, -2.459236818521333, 37.191963391294095, 6.5832748294449015, 144.46232220802563, 0, 1, 1.4844885427615573, -8.91136141739722)

    let svg14 = toSVG(dxfs['elliptical-arc14.dxf'])
    expect(svg14).toMatchViewbox(-55.10777094338928, -131.912470600959, 404.2155418867785, 285.82494120191797)
    expect(svg14).toMatchArc(80.13575797098328, 183.83824901758032, 160.3652081967906, 151.7760801446391, 160.3221424787954, 1, 1, 292.9345460604517, -23.32855250669232)
  })
})
