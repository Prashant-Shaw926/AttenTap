import type {ItemInstance} from '../types/game.types'

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

export const isPointInsideItem = (
  point: Point,
  item: Pick<ItemInstance, 'x' | 'y'>,
  itemSize: number,
  hitSlop = 0,
): boolean => isPointInsideCircle(point, item, itemSize / 2 + hitSlop)

export const getNearestItemAtPoint = (
  point: Point,
  items: ItemInstance[],
  itemSize: number,
  hitSlop = 0,
): ItemInstance | null => {
  const hits = items
    .filter(item => isPointInsideItem(point, item, itemSize, hitSlop))
    .sort(
      (first, second) =>
        distanceBetweenPoints(point, first) -
        distanceBetweenPoints(point, second),
    )

  return hits[0] ?? null
}
