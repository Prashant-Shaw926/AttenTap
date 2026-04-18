import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

import {useGame} from '../src/hooks/useGame'
import {useSessionPersistence} from '../src/hooks/game/useSessionPersistence'
import {useFruitSpawner} from '../src/hooks/useFruitSpawner'
import {useGameStore} from '../src/store/gameStore'
import {useTimer} from '../src/hooks/useTimer'

jest.mock('../src/hooks/game/useSessionPersistence')
jest.mock('../src/hooks/useFruitSpawner')
jest.mock('../src/hooks/useTimer')

const mockedUseSessionPersistence = jest.mocked(useSessionPersistence)
const mockedUseFruitSpawner = jest.mocked(useFruitSpawner)
const mockedUseTimer = jest.mocked(useTimer)

let latestGame: ReturnType<typeof useGame> | null = null

function HookHarness() {
  latestGame = useGame({
    userId: 'demo-user',
    boardWidth: 320,
    boardHeight: 180,
    fruitSize: 60,
    initialTargetFruit: 'carrot',
  })

  return null
}

const makeTimestamp = (value: number) =>
  ({
    toMillis: () => value,
  }) as any

describe('useGame', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    latestGame = null

    mockedUseSessionPersistence.mockReturnValue({
      endGame: jest.fn().mockResolvedValue(null),
      isPersisting: false,
      lastError: null,
      resetGame: jest.fn(),
      startGame: jest.fn().mockResolvedValue('session-1'),
    })
    mockedUseFruitSpawner.mockReturnValue({spawnFruit: jest.fn()})
    mockedUseTimer.mockReturnValue(42_000)
  })

  test('records captures only while playing with a visible target fruit', async () => {
    await ReactTestRenderer.act(() => {
      const store = useGameStore.getState()

      store.startSession({
        userId: 'demo-user',
        targetFruit: 'carrot',
        startedAt: makeTimestamp(1_000),
      })

      store.recordFruitAppearance({
        fruitId: 'fruit-target',
        fruitType: 'carrot',
        isTarget: true,
        slotId: 'slot-1',
        x: 80,
        y: 50,
        appearedAt: makeTimestamp(1_100),
      })
    })

    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<HookHarness />)
    })

    ReactTestRenderer.act(() => {
      latestGame?.handleCapture('capture-a.jpg', 2_000)
    })

    expect(useGameStore.getState().captureEvents).toHaveLength(1)

    await ReactTestRenderer.act(() => {
      const store = useGameStore.getState()

      store.resetGame()
      store.startSession({
        userId: 'demo-user',
        targetFruit: 'carrot',
        startedAt: makeTimestamp(3_000),
      })
      store.recordFruitAppearance({
        fruitId: 'fruit-other',
        fruitType: 'banana',
        isTarget: false,
        slotId: 'slot-2',
        x: 30,
        y: 30,
        appearedAt: makeTimestamp(3_100),
      })
    })

    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<HookHarness />)
    })

    ReactTestRenderer.act(() => {
      latestGame?.handleCapture('capture-b.jpg', 4_000)
    })

    expect(useGameStore.getState().captureEvents).toHaveLength(0)
  })
})
