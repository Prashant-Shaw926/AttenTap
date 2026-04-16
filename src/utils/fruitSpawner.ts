import {
  FRUIT_SIZE,
  FRUIT_SPAWN_PADDING,
  MAX_SPAWN_ATTEMPTS,
  TARGET_FRUIT_SPAWN_CHANCE,
} from '../constants/gameConfig'
import {getRandomNonTargetFruitId} from '../constants/fruits'
import {distanceBetweenPoints} from './geometry'

export interface SpawnBounds {
  width: number
  height: number
}

export interface SpawnedFruit {
  id: string
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const getRandomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min

export const chooseFruitType = (
  targetFruitId: string,
  targetChance = TARGET_FRUIT_SPAWN_CHANCE,
): {fruitType: string; isTarget: boolean} => {
  const isTarget = Math.random() <= targetChance

  if (isTarget) {
    return {
      fruitType: targetFruitId,
      isTarget: true,
    }
  }

  return {
    fruitType: getRandomNonTargetFruitId(targetFruitId),
    isTarget: false,
  }
}

export const createFruitSpawnPosition = (
  bounds: SpawnBounds,
  activeFruits: SpawnedFruit[],
  fruitSize = FRUIT_SIZE,
  padding = FRUIT_SPAWN_PADDING,
): {x: number; y: number} => {
  const minX = padding + fruitSize / 2
  const maxX = Math.max(minX, bounds.width - padding - fruitSize / 2)
  const minY = padding + fruitSize / 2
  const maxY = Math.max(minY, bounds.height - padding - fruitSize / 2)
  const minimumDistance = fruitSize * 0.9

  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
    const candidate = {
      x: getRandomInRange(minX, maxX),
      y: getRandomInRange(minY, maxY),
    }

    const overlaps = activeFruits.some(activeFruit => {
      return distanceBetweenPoints(candidate, activeFruit) < minimumDistance
    })

    if (!overlaps) {
      return candidate
    }
  }

  return {
    x: clamp(bounds.width / 2, minX, maxX),
    y: clamp(bounds.height / 2, minY, maxY),
  }
}
