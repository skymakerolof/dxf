import expect from 'expect'

import getRGBForEntity from '../../src/getRGBForEntity'

describe('colors', () => {
  it('Color defined in the entity but with value 256 means that we have to use the color defined in the layer.', () => {
    const fakeEntity = {
      layer: '0',
      colorNumber: 256,
    }
    const fakeLayers = {
      0: {
        colorNumber: 1,
      },
    }
    expect(getRGBForEntity(fakeLayers, fakeEntity)).toEqual([255, 0, 0])
  })
})
