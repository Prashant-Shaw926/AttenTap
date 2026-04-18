import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

import GameScreen from '../src/screens/GameScreen'
import {useGame} from '../src/hooks/useGame'
import {GameCameraCapture} from '../src/screens/GameScreen/components/GameCameraCapture'

jest.mock('../src/hooks/useGame')
jest.mock('../src/screens/GameScreen/components/GameCameraCapture', () => ({
  GameCameraCapture: jest.fn(() => null),
}))

const mockedUseGame = jest.mocked(useGame)
const mockedGameCameraCapture = jest.mocked(GameCameraCapture)

const createUseGameResult = (overrides: Partial<ReturnType<typeof useGame>> = {}) => ({
  status: 'idle',
  sessionId: null,
  session: null,
  targetFruit: 'carrot',
  targetFruitDefinition: {
    id: 'carrot',
    label: 'Carrot',
    Icon: () => null,
  },
  visibleFruits: [],
  taps: [],
  fruitEvents: [],
  remainingTimeMs: 120_000,
  accuracy: 0,
  totalTaps: 0,
  correctTaps: 0,
  incorrectTaps: 0,
  isPersisting: false,
  lastError: null,
  startGame: jest.fn().mockResolvedValue('session-1'),
  endGame: jest.fn().mockResolvedValue(null),
  resetGame: jest.fn(),
  handleTap: jest.fn(),
  handleCapture: jest.fn(),
  ...overrides,
})

describe('GameScreen', () => {
  beforeEach(() => {
    mockedGameCameraCapture.mockClear()
  })

  test('starts the session from the idle overlay', async () => {
    const mockedStartGame = jest.fn().mockResolvedValue('session-1')

    mockedUseGame.mockReturnValue(
      createUseGameResult({
        startGame: mockedStartGame,
      }) as ReturnType<typeof useGame>,
    )

    const navigation = {
      replace: jest.fn(),
    }

    let renderer: ReactTestRenderer.ReactTestRenderer

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <GameScreen
          navigation={navigation as any}
          route={{key: 'Game', name: 'Game', params: {targetFruitId: 'banana'}} as any}
        />,
      )
    })

    const startButton = renderer!.root.findByProps({
      accessibilityLabel: 'Start Session',
    })

    await ReactTestRenderer.act(() => {
      startButton.props.onPress()
    })

    expect(mockedStartGame).toHaveBeenCalledWith('banana')
  })

  test('enables capture only when a target fruit is visible', async () => {
    mockedUseGame.mockReturnValue(
      createUseGameResult({
        status: 'playing',
        visibleFruits: [
          {
            id: 'fruit-1',
            fruitType: 'carrot',
            isTarget: true,
            slotId: 'slot-1',
            x: 40,
            y: 40,
            appearedAt: {toMillis: () => 1_000} as any,
            disappearedAt: null,
            wasCorrectlyTapped: false,
          },
        ],
      }) as ReturnType<typeof useGame>,
    )

    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <GameScreen
          navigation={{replace: jest.fn()} as any}
          route={{key: 'Game', name: 'Game', params: {targetFruitId: 'carrot'}} as any}
        />,
      )
    })

    expect(mockedGameCameraCapture).toHaveBeenCalledWith(
      expect.objectContaining({enabled: true}),
      undefined,
    )
  })
})
