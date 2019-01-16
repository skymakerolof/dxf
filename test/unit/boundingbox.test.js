import expect from 'expect'

import { BoundingBox as BB } from '../../src'

describe('BoundingBox', function () {
  it('is initialized', function () {
    const bb = new BB()

    expect(bb.minX).toEqual(Infinity)
    expect(bb.maxX).toEqual(-Infinity)
    expect(bb.maxY).toEqual(-Infinity)
    expect(bb.minY).toEqual(Infinity)
  })

  it('can expand by a point', function () {
    const bb = new BB()

    bb.expandByPoint(10, 30)

    expect(bb.minX).toEqual(10)
    expect(bb.maxX).toEqual(10)
    expect(bb.maxY).toEqual(30)
    expect(bb.minY).toEqual(30)

    bb.expandByPoint(-5, 2)

    expect(bb.minX).toEqual(-5)
    expect(bb.maxX).toEqual(10)
    expect(bb.maxY).toEqual(30)
    expect(bb.minY).toEqual(2)

    bb.expandByPoint(17, 7)

    expect(bb.minX).toEqual(-5)
    expect(bb.maxX).toEqual(17)
    expect(bb.maxY).toEqual(30)
    expect(bb.minY).toEqual(2)

    bb.expandByPoint(3, -9)

    expect(bb.minX).toEqual(-5)
    expect(bb.maxX).toEqual(17)
    expect(bb.maxY).toEqual(30)
    expect(bb.minY).toEqual(-9)

    expect(bb.width).toEqual(22)
    expect(bb.height).toEqual(39)
  })

  it('can expand by a box', function () {
    const bb1 = new BB()
    bb1.expandByPoint(10, 20)
    bb1.expandByPoint(15, 27)

    const bb2 = new BB()
    bb2.expandByPoint(19, -7)

    bb1.expandByBox(bb2)

    expect(bb1.minX).toEqual(10)
    expect(bb1.maxX).toEqual(19)
    expect(bb1.maxY).toEqual(27)
    expect(bb1.minY).toEqual(-7)
  })

  it('can expand by a translated box', function () {
    const bb1 = new BB()
    bb1.expandByPoint(0, 0)
    bb1.expandByPoint(20, 10)

    const bb2 = new BB()
    bb2.expandByTranslatedBox(bb1, -7, 23)

    expect(bb2.minX).toEqual(-7)
    expect(bb2.maxX).toEqual(13)
    expect(bb2.maxY).toEqual(33)
    expect(bb2.minY).toEqual(23)
  })
})
