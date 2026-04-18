import {
  distanceBetweenPoints,
  getNearestFruitAtPoint,
  isPointInsideFruit,
} from '../src/utils/geometry'

describe('geometry helpers', () => {
  test('measures the distance between two points', () => {
    expect(distanceBetweenPoints({x: 0, y: 0}, {x: 3, y: 4})).toBe(5)
  })

  test('checks whether a tap falls inside a fruit hit area', () => {
    expect(
      isPointInsideFruit({x: 52, y: 48}, {x: 50, y: 50}, 20, 2),
    ).toBe(true)

    expect(
      isPointInsideFruit({x: 80, y: 50}, {x: 50, y: 50}, 20, 0),
    ).toBe(false)
  })

  test('returns the nearest hittable fruit', () => {
    const fruits = [
      {id: 'fruit-1', x: 50, y: 50},
      {id: 'fruit-2', x: 60, y: 60},
    ] as any

    expect(
      getNearestFruitAtPoint({x: 53, y: 53}, fruits, 24, 2)?.id,
    ).toBe('fruit-1')
  })
})
