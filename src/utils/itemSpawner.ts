import {
  ITEM_SPAWN_PADDING,
  ITEM_SIZE,
  TARGET_ITEM_SPAWN_CHANCE,
} from '../constants/gameConfig'
import {getRandomNonTargetItemId} from '../constants/items'
import type {ItemInstance} from '../types/game.types'

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
  itemSize: number,
  padding: number,
) => {
  const radius = itemSize / 2
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

const isTooCloseToItem = (
  slot: PositionedSpawnSlot,
  item: Pick<ItemInstance, 'x' | 'y'>,
  minDistance: number,
): boolean => {
  const dx = slot.x - item.x
  const dy = slot.y - item.y
  return Math.hypot(dx, dy) < minDistance
}

export const chooseItemType = (
  targetItemId: string,
  targetChance = TARGET_ITEM_SPAWN_CHANCE,
  avoidItemId?: string | null,
): {itemType: string; isTarget: boolean} => {
  const canSpawnTarget = avoidItemId !== targetItemId
  const isTarget = canSpawnTarget && Math.random() <= targetChance

  if (isTarget) {
    return {
      itemType: targetItemId,
      isTarget: true,
    }
  }

  const excluded = [targetItemId]
  if (avoidItemId && avoidItemId !== targetItemId) {
    excluded.push(avoidItemId)
  }

  return {
    itemType: getRandomNonTargetItemId(excluded),
    isTarget: false,
  }
}

export const createSpawnLayout = (
  bounds: SpawnBounds,
  itemSize = ITEM_SIZE,
  padding = ITEM_SPAWN_PADDING,
): PositionedSpawnSlot[] => {
  const limits = getSpawnLimits(bounds, itemSize, padding)

  if (limits.maxX < limits.minX || limits.maxY < limits.minY) {
    return []
  }

  const minDistance = itemSize + padding / 2
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
  activeItems: Pick<ItemInstance, 'x' | 'y'>[],
  lastSlotId: string | null,
  itemSize = ITEM_SIZE,
): PositionedSpawnSlot | null => {
  if (layout.length === 0) {
    return null
  }

  const minDistance = itemSize + ITEM_SPAWN_PADDING / 2
  const candidateSlots = layout.filter(
    slot => !activeItems.some(item => isTooCloseToItem(slot, item, minDistance)),
  )

  if (candidateSlots.length === 0) {
    return null
  }

  const nonRepeatingSlots = candidateSlots.filter(slot => slot.id !== lastSlotId)
  const slotsToTry = nonRepeatingSlots.length > 0 ? nonRepeatingSlots : candidateSlots

  return getRandomItem(slotsToTry)
}
