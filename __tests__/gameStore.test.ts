import {useGameStore} from '../src/store/gameStore'

const makeTimestamp = (value: number) =>
  ({
    toMillis: () => value,
  }) as any

describe('game store', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  test('tracks taps, accuracy, and fruit disappearance', () => {
    const store = useGameStore.getState()

    store.startSession({
      userId: 'user-1',
      targetFruit: 'carrot',
      startedAt: makeTimestamp(1_000),
    })

    store.recordFruitAppearance({
      fruitId: 'fruit-1',
      fruitType: 'carrot',
      isTarget: true,
      slotId: 'slot-1',
      x: 80,
      y: 60,
      appearedAt: makeTimestamp(1_100),
    })

    store.recordTap({
      x: 80,
      y: 60,
      type: 'correct',
      fruitId: 'fruit-1',
      timestamp: makeTimestamp(1_200),
    })

    store.recordFruitDisappearance({
      fruitId: 'fruit-1',
      disappearedAt: makeTimestamp(1_250),
      wasCorrectlyTapped: true,
    })

    const nextState = useGameStore.getState()

    expect(nextState.session?.correctTaps).toBe(1)
    expect(nextState.session?.incorrectTaps).toBe(0)
    expect(nextState.session?.accuracy).toBe(1)
    expect(nextState.activeFruits).toEqual({})
    expect(nextState.fruitEvents[0]?.wasCorrectlyTapped).toBe(true)
    expect(nextState.fruitEvents[0]?.disappearedAt?.toMillis()).toBe(1_250)
  })

  test('finalizes the session bundle and resets cleanly', () => {
    const store = useGameStore.getState()

    store.startSession({
      userId: 'user-2',
      targetFruit: 'banana',
      startedAt: makeTimestamp(2_000),
    })

    const bundle = store.endSession({
      endedAt: makeTimestamp(8_000),
    })

    expect(bundle?.session.targetFruit).toBe('banana')
    expect(bundle?.session.endedAt?.toMillis()).toBe(8_000)
    expect(useGameStore.getState().status).toBe('completed')

    useGameStore.getState().resetGame()

    expect(useGameStore.getState().status).toBe('idle')
    expect(useGameStore.getState().session).toBeNull()
    expect(useGameStore.getState().taps).toEqual([])
  })
})
