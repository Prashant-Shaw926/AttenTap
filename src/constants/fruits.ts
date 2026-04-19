import type {ComponentType} from 'react'
import type {SvgProps} from 'react-native-svg'

import {
  AppleIcon,
  BananaIcon,
  CarrotIcon,
  GrapeIcon,
} from '../assets/icons'

export type FruitId = 'apple' | 'banana' | 'carrot' | 'grapes'

export interface FruitDefinition {
  id: FruitId
  label: string
  Icon: ComponentType<SvgProps>
}

export const FRUITS: FruitDefinition[] = [
  {id: 'apple', label: 'Apple', Icon: AppleIcon},
  {id: 'banana', label: 'Banana', Icon: BananaIcon},
  {id: 'carrot', label: 'Carrot', Icon: CarrotIcon},
  {id: 'grapes', label: 'Grapes', Icon: GrapeIcon},
]

export const DEFAULT_TARGET_FRUIT_ID: FruitId = 'carrot'

export const getFruitById = (fruitId: string): FruitDefinition | undefined =>
  FRUITS.find(fruit => fruit.id === fruitId)

export const isKnownFruit = (fruitId: string): fruitId is FruitId =>
  FRUITS.some(fruit => fruit.id === fruitId)

export const resolveFruitId = (
  fruitId?: string,
  fallback: FruitId = DEFAULT_TARGET_FRUIT_ID,
): FruitId => {
  if (fruitId && isKnownFruit(fruitId)) {
    return fruitId
  }

  return fallback
}

export const getRandomFruit = (): FruitDefinition =>
  FRUITS[Math.floor(Math.random() * FRUITS.length)]

export const getRandomFruitId = (): FruitId => getRandomFruit().id

export const getRandomNonTargetFruitId = (
  excludedIds: string | string[],
): FruitId => {
  const idsToExclude = Array.isArray(excludedIds) ? excludedIds : [excludedIds]
  const availableFruits = FRUITS.filter(
    fruit => !idsToExclude.includes(fruit.id),
  )

  if (availableFruits.length === 0) {
    // If we somehow excluded everything, just return a default
    return DEFAULT_TARGET_FRUIT_ID
  }

  return availableFruits[Math.floor(Math.random() * availableFruits.length)].id
}
