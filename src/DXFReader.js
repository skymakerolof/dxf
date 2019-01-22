import logger from './util/logger'
import parseString from './parseString'
import denormalise from './denormalise'
import toSVG2 from './toSVG2'

export default class DXFReader {
  constructor (contents) {
    this.contents = contents
    this.parsed = null
    this.denormalised = null
    this.svg = null
  }

  parse () {
    this.parsed = parseString(this.contents)
    logger.info('parsed:', this.parsed)
    return this.parsed
  }

  denormalise () {
    if (!this.parsed) {
      this.parse()
    }
    this.denormalised = denormalise(this.parsed)
    logger.info('denormalised:', this.denormalised)
    return this.denormalised
  }

  toSVG () {
    if (!this.denormalised) {
      this.denormalise()
    }
    const elements = toSVG2(this.denormalised)
    console.log('@@', elements)
    return `<svg>${elements}</svg>`
  }
}
