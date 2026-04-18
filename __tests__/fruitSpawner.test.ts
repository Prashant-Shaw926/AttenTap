import {
  chooseFruitType,
  chooseSpawnSlot,
  createSpawnLayout,
} from '../src/utils/fruitSpawner'

describe('fruit spawner helpers', () => {
  test('creates a spawn grid within bounds', () => {
    const layout = createSpawnLayout({width: 320, height: 180}, 60, 20)

    expect(layout.length).toBeGreaterThan(0)
    expect(layout[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        x: expect.any(Number),
        y: expect.any(Number),
      }),
    )
  })

  test('avoids the previous slot when alternatives exist', () => {
    const layout = [
      {id: 'slot-a', x: 40, y: 40},
      {id: 'slot-b', x: 120, y: 40},
    ]

    const chosen = chooseSpawnSlot(layout, [], 'slot-a', 40)

    expect(chosen?.id).toBe('slot-b')
  })

  test('selects the target fruit when forced', () => {
    expect(chooseFruitType('carrot', 1)).toEqual({
      fruitType: 'carrot',
      isTarget: true,
    })
  })
})
