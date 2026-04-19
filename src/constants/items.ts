import type {ComponentType} from 'react'
import type {SvgProps} from 'react-native-svg'

import {
  AppleIcon,
  BananaIcon,
  CarrotIcon,
  GrapeIcon,
} from '../assets/icons'

export type ItemId = 'apple' | 'banana' | 'carrot' | 'grapes'

export interface ItemDefinition {
  id: ItemId
  label: string
  Icon: ComponentType<SvgProps>
}

export const ITEMS: ItemDefinition[] = [
  {id: 'apple', label: 'Apple', Icon: AppleIcon},
  {id: 'banana', label: 'Banana', Icon: BananaIcon},
  {id: 'carrot', label: 'Carrot', Icon: CarrotIcon},
  {id: 'grapes', label: 'Grapes', Icon: GrapeIcon},
]

export const DEFAULT_TARGET_ITEM_ID: ItemId = 'carrot'

export const getItemById = (itemId: string): ItemDefinition | undefined =>
  ITEMS.find(item => item.id === itemId)

export const isKnownItem = (itemId: string): itemId is ItemId =>
  ITEMS.some(item => item.id === itemId)

export const resolveItemId = (
  itemId?: string,
  fallback: ItemId = DEFAULT_TARGET_ITEM_ID,
): ItemId => {
  if (itemId && isKnownItem(itemId)) {
    return itemId
  }

  return fallback
}

export const getRandomItem = (): ItemDefinition =>
  ITEMS[Math.floor(Math.random() * ITEMS.length)]

export const getRandomItemId = (): ItemId => getRandomItem().id

export const getRandomNonTargetItemId = (
  excludedIds: string | string[],
): ItemId => {
  const idsToExclude = Array.isArray(excludedIds) ? excludedIds : [excludedIds]
  const availableItems = ITEMS.filter(
    item => !idsToExclude.includes(item.id),
  )

  if (availableItems.length === 0) {
    // If we somehow excluded everything, just return a default
    return DEFAULT_TARGET_ITEM_ID
  }

  return availableItems[Math.floor(Math.random() * availableItems.length)].id
}
