import expect from 'expect'

import { colors } from '../../src'

describe('colors', () => {
  it('are exposed in the API', () => {
    expect(colors[3]).toEqual([0, 255, 0])
  })
})
