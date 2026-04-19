import {
  FRUIT_SPAWN_PADDING,
  FRUIT_SIZE,
  TARGET_FRUIT_SPAWN_CHANCE,
} from '../constants/gameConfig'
import {getRandomNonTargetFruitId} from '../constants/fruits'
import type {FruitInstance} from '../types/game.types'

export interface SpawnBounds {
  width: number
  height: number
}

export interface PositionedSpawnSlot {
  id: string
  x: number
  y: number
}

const getRandomItem = <T,>(items: T[]): T | null => {
  if (items.length === 0) {
    return null
  }

  return items[Math.floor(Math.random() * items.length)]
}

const getSpawnLimits = (
  bounds: SpawnBounds,
  fruitSize: number,
  padding: number,
) => {
  const radius = fruitSize / 2
  const minX = radius + padding
  const maxX = bounds.width - radius - padding
  const minY = radius + padding
  const maxY = bounds.height - radius - padding

  return {
    minX,
    maxX,
    minY,
    maxY,
  }
}

const isTooCloseToFruit = (
  slot: PositionedSpawnSlot,
  fruit: Pick<FruitInstance, 'x' | 'y'>,
  minDistance: number,
): boolean => {
  const dx = slot.x - fruit.x
  const dy = slot.y - fruit.y
  return Math.hypot(dx, dy) < minDistance
}

export const chooseFruitType = (
  targetFruitId: string,
  targetChance = TARGET_FRUIT_SPAWN_CHANCE,
  avoidFruitId?: string | null,
): {fruitType: string; isTarget: boolean} => {
  // If target fruit is forbidden, we must spawn a non-target
  const canSpawnTarget = avoidFruitId !== targetFruitId
  const isTarget = canSpawnTarget && Math.random() <= targetChance

  if (isTarget) {
    return {
      fruitType: targetFruitId,
      isTarget: true,
    }
  }

  // Exclude both target and the forbidden fruit if applicable
  const excluded = [targetFruitId]
  if (avoidFruitId && avoidFruitId !== targetFruitId) {
    excluded.push(avoidFruitId)
  }

  return {
    fruitType: getRandomNonTargetFruitId(excluded),
    isTarget: false,
  }
}

export const createSpawnLayout = (
  bounds: SpawnBounds,
  fruitSize = FRUIT_SIZE,
  padding = FRUIT_SPAWN_PADDING,
): PositionedSpawnSlot[] => {
  const limits = getSpawnLimits(bounds, fruitSize, padding)

  if (limits.maxX < limits.minX || limits.maxY < limits.minY) {
    return []
  }

  const minDistance = fruitSize + padding / 2
  const availableWidth = limits.maxX - limits.minX
  const availableHeight = limits.maxY - limits.minY
  const columnCount = Math.max(1, Math.floor(availableWidth / minDistance) + 1)
  const rowCount = Math.max(1, Math.floor(availableHeight / minDistance) + 1)
  const xStep = columnCount > 1 ? availableWidth / (columnCount - 1) : 0
  const yStep = rowCount > 1 ? availableHeight / (rowCount - 1) : 0

  return Array.from({length: rowCount * columnCount}, (_, index) => {
    const row = Math.floor(index / columnCount)
    const column = index % columnCount

    return {
      id: `slot-${row}-${column}`,
      x: limits.minX + column * xStep,
      y: limits.minY + row * yStep,
    }
  })
}

export const chooseSpawnSlot = (
  layout: PositionedSpawnSlot[],
  activeFruits: Pick<FruitInstance, 'x' | 'y'>[],
  lastSlotId: string | null,
  fruitSize = FRUIT_SIZE,
): PositionedSpawnSlot | null => {
  if (layout.length === 0) {
    return null
  }

  const minDistance = fruitSize + FRUIT_SPAWN_PADDING / 2
  const candidateSlots = layout.filter(
    slot => !activeFruits.some(fruit => isTooCloseToFruit(slot, fruit, minDistance)),
  )

  if (candidateSlots.length === 0) {
    return null
  }

  const nonRepeatingSlots = candidateSlots.filter(slot => slot.id !== lastSlotId)
  const slotsToTry = nonRepeatingSlots.length > 0 ? nonRepeatingSlots : candidateSlots

  return getRandomItem(slotsToTry)
}
