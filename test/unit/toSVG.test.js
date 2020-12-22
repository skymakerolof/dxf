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
  'elliptical-arc14.dxf',
  'arc15.dxf',
  'arc16.dxf',
  'arc17.dxf',
  'squircle2.dxf'
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
    const re = /viewBox="([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)"/
    const result = re.exec(received)
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
    const re = /path d="M ([-0-9.e]+) ([-0-9.e]+) A ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)"/
    const result = re.exec(received)
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
  },
  toBePolyline (received) {
    const re = /path d="([ML][-0-9.e]+,[-0-9.e]+)+"/
    const result = re.exec(received)
    if (result) {
      return {
        pass: true,
        message: () => `expected ${received} to not be a path containing only M and L commands`
      }
    } else {
      return {
        pass: false,
        message: () => `expected ${received} to be a path containing only M and L commands`
      }
    }
  }
})

describe('toSVG', () => {
  it('elliptical arcs', () => {
    const svg1 = toSVG(dxfs['elliptical-arc1.dxf'])
    expect(svg1).toMatchViewbox(0, -5, 10, 5)
    expect(svg1).toMatchArc(10, 0, 10, 5, 0, 0, 1, 0, 5)

    const svg2 = toSVG(dxfs['elliptical-arc2.dxf'])
    expect(svg2).toMatchViewbox(5, -4.3301270189221945, 3.66025403784439, 1.830127018922195)
    expect(svg2).toMatchArc(8.660254037844387, 2.5, 10, 5, 0, 0, 1, 5, 4.3301270189221945)

    const svg3 = toSVG(dxfs['elliptical-arc3.dxf'])
    expect(svg3).toMatchViewbox(-10, -5, 17.071067811865476, 7.867882181755233)
    expect(svg3).toMatchArc(7.0710678118654755, 3.5355339059327373, 10, 5, 0, 0, 1, -8.191520442889914, -2.8678821817552325)

    const svg4 = toSVG(dxfs['elliptical-arc4.dxf'])
    expect(svg4).toMatchViewbox(0, -5, 10, 5)
    expect(svg4).toMatchArc(10, 0, 10, 5, 180, 0, 1, 0, 5)

    const svg5 = toSVG(dxfs['elliptical-arc5.dxf'])
    expect(svg5).toMatchViewbox(-3.5355339059327404, -7.842193570679061, 10.535533905932741, 4.306659664746326)
    expect(svg5).toMatchArc(7, 7, 9.899494936611665, 5, 45, 0, 1, -3.53553390593274, 3.535533905932735)

    const svg6 = toSVG(dxfs['elliptical-arc6.dxf'])
    expect(svg6).toMatchViewbox(-6.154864169189802, -6.6858457603474335, 12.309728338379603, 14.817121617113303)
    expect(svg6).toMatchArc(-2.7017524810471167, 6.6858457603474335, 8.246211251235321, 6, 75.96375653207353, 1, 1, 5.530179605793307, 4.627862738637326)

    const svg7 = toSVG(dxfs['elliptical-arc7.dxf'])
    expect(svg7).toMatchViewbox(-167.88778995326126, -129.36546401373693, 319.9335798426189, 189.91283752909544)
    expect(svg7).toMatchArc(152.04578988935765, -18.03933100382215, 188.7669481278684, 96.37827861800855, -32.118022210114795, 1, 1, -81.36053316126296, -60.54737351535849)

    const svg8 = toSVG(dxfs['elliptical-arc8.dxf'])
    expect(svg8).toMatchViewbox(3.4781225959317084, -49.009105281414, 55.15869905572283, 15.029496981434129)
    expect(svg8).toMatchArc(58.63682165165453, 48.26215307468564, 80.93400088961376, 14.444639918326656, 172.54570118725155, 0, 1, 11.64284740886555, 33.97960829997985)

    const svg9 = toSVG(dxfs['elliptical-arc9.dxf'])
    expect(svg9).toMatchViewbox(-118.07395417897287, -17.676045821027287, 216.90220929420212, 13.244102801798334)
    expect(svg9).toMatchArc(-118.07395417897287, 17.6760458210273, 289.26080360117925, 134.5498578288584, -0.4951975183272285, 0, 1, 98.82825511522925, 11.356781878370896)

    const svg10 = toSVG(dxfs['elliptical-arc10.dxf'])
    expect(svg10).toMatchViewbox(-120.64872816971088, 16.151626150687072, 71.29745633942176, 98.19674769862587)
    expect(svg10).toMatchArc(-81.02670163715118, -27.945143148808462, 56.930330229149384, 20.98617723085445, 57.00777591273486, 1, 1, -72.10048373873673, -21.023087104240282)

    const svg11 = toSVG(dxfs['elliptical-arc11.dxf'])
    expect(svg11).toMatchViewbox(-10, -10, 10, 20)
    expect(svg11).toMatchArc(0, 10, 10, 10, 90, 1, 1, 0, -10)

    const svg12 = toSVG(dxfs['elliptical-arc12.dxf'])
    expect(svg12).toMatchViewbox(-10, -10, 20, 10)
    expect(svg12).toMatchArc(10, 0, 10, 10, -90, 0, 1, -10, 0)

    const svg13 = toSVG(dxfs['elliptical-arc13.dxf'])
    expect(svg13).toMatchViewbox(-1.7632895890672167, 1.5992030653460318, 6.174337259217236, 7.312158352051181)
    expect(svg13).toMatchArc(4.411047670150015, -2.459236818521333, 37.191963391294095, 6.5832748294449015, 144.46232220802563, 0, 1, 1.4844885427615573, -8.91136141739722)

    const svg14 = toSVG(dxfs['elliptical-arc14.dxf'])
    expect(svg14).toMatchViewbox(-12.414567247795588, -183.83824901758035, 305.3491133082473, 293.612508149379)
    expect(svg14).toMatchArc(80.13575797098328, 183.83824901758032, 160.3652081967906, 151.7760801446391, 160.3221424787954, 1, 1, 292.9345460604517, -23.32855250669232)

    const svg15 = toSVG(dxfs['arc15.dxf'])
    expect(svg15).toMatchViewbox(-10.401676865889314, -54.94802533287292, 54.844949682905835, 20.520461073710003)
    expect(svg15).toMatchArc(44.44327281701652, 46.73192738041983, 35.44802533287292, 35.44802533287292, 0, 0, 1, -10.401676865889314, 34.42756425916292)

    const svg16 = toSVG(dxfs['arc16.dxf'])
    expect(svg16).toMatchViewbox(-14.41854547874551, -16.16854547874551, 62.83709095749103, 62.83709095749103)
    expect(svg16).toMatchArc(4.131265300907282, -43.912181829797376, 31.41854547874551, 31.41854547874551, 0, 1, 1, -14.09320807604486, -19.759701934693545)

    const svg17 = toSVG(dxfs['arc17.dxf'])
    expect(svg17).toMatchViewbox(-48.5, -23.649355077918734, 94.75, 54.899355077918806)
    expect(svg17).toMatchArc(46.25, 21.75, 81.76917590658614, 81.76917590658614, 0, 0, 1, -48.5, -31.25)
  })

  it('splines with weights should use polyline, not bezier', () => {
    const squircle2 = toSVG(dxfs['squircle2.dxf'])
    expect(squircle2).toBePolyline()
  })
})
