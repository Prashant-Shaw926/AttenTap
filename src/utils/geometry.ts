import type {FruitInstance} from '../types/game.types'

export interface Point {
  x: number
  y: number
}

export const distanceBetweenPoints = (first: Point, second: Point): number => {
  const deltaX = first.x - second.x
  const deltaY = first.y - second.y

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

export const isPointInsideCircle = (
  point: Point,
  center: Point,
  radius: number,
): boolean => distanceBetweenPoints(point, center) <= radius

export const isPointInsideFruit = (
  point: Point,
  fruit: Pick<FruitInstance, 'x' | 'y'>,
  fruitSize: number,
  hitSlop = 0,
): boolean => isPointInsideCircle(point, fruit, fruitSize / 2 + hitSlop)

export const getNearestFruitAtPoint = (
  point: Point,
  fruits: FruitInstance[],
  fruitSize: number,
  hitSlop = 0,
): FruitInstance | null => {
  const hits = fruits
    .filter(fruit => isPointInsideFruit(point, fruit, fruitSize, hitSlop))
    .sort(
      (first, second) =>
        distanceBetweenPoints(point, first) -
        distanceBetweenPoints(point, second),
    )

  return hits[0] ?? null
}
