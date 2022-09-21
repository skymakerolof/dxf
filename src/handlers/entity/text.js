import common from './common'

export const TYPE = 'TEXT'

const simpleCodes = {
  1: 'string',
  10: 'x',
  20: 'y',
  30: 'z',
  11: 'x2',
  21: 'y2',
  31: 'z2',
  39: 'thickness',
  40: 'textHeight',
  41: 'relScaleX',
  50: 'rotation',
  51: 'obliqueAngle',
  7: 'styleName',
  71: 'mirror',
  72: 'hAlign',
  73: 'vAlign',
}

// const EXCEPTION_STRINGS = ['\\A1;', '%%u']

export const process = (tuples) => {
  return tuples.reduce(
    (entity, tuple) => {
      const type = tuple[0]
      const value = tuple[1]

      assign(entity, type, value)

      return entity
    },
    {
      type: TYPE,
      string: '',
    },
  )
}

export const assign = (entity, type, value) => {
  if (simpleCodes[type] !== undefined) {
    entity[simpleCodes[type]] = value
  } else {
    Object.assign(entity, common(type, value))
  }
}

export default { TYPE, process, assign }
