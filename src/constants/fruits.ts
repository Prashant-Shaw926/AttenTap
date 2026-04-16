export interface FruitDefinition {
  id: string
  label: string
  emoji: string
}

export const FRUITS: FruitDefinition[] = [
  {id: 'apple', label: 'Apple', emoji: '🍎'},
  {id: 'banana', label: 'Banana', emoji: '🍌'},
  {id: 'carrot', label: 'Carrot', emoji: '🥕'},
  {id: 'grapes', label: 'Grapes', emoji: '🍇'},
  {id: 'orange', label: 'Orange', emoji: '🍊'},
  {id: 'pear', label: 'Pear', emoji: '🍐'},
  {id: 'pineapple', label: 'Pineapple', emoji: '🍍'},
  {id: 'strawberry', label: 'Strawberry', emoji: '🍓'},
  {id: 'watermelon', label: 'Watermelon', emoji: '🍉'},
]

export const DEFAULT_TARGET_FRUIT_ID = 'carrot'

export const getFruitById = (fruitId: string): FruitDefinition | undefined =>
  FRUITS.find(fruit => fruit.id === fruitId)

export const isKnownFruit = (fruitId: string): boolean =>
  FRUITS.some(fruit => fruit.id === fruitId)

export const getRandomFruit = (): FruitDefinition =>
  FRUITS[Math.floor(Math.random() * FRUITS.length)]

export const getRandomFruitId = (): string => getRandomFruit().id

export const getRandomNonTargetFruitId = (targetFruitId: string): string => {
  const nonTargetFruits = FRUITS.filter(fruit => fruit.id !== targetFruitId)

  if (nonTargetFruits.length === 0) {
    return targetFruitId
  }

  return nonTargetFruits[Math.floor(Math.random() * nonTargetFruits.length)].id
}
