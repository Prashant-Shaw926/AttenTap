import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

import ResultScreen from '../src/screens/ResultScreen'

const makeTimestamp = (value: number) =>
  ({
    toMillis: () => value,
  }) as any

describe('ResultScreen', () => {
  test('renders stats and supports replay', async () => {
    const navigation = {
      replace: jest.fn(),
    }

    const bundle = {
      sessionId: 'session-1',
      session: {
        userId: 'user-1',
        startedAt: makeTimestamp(1_000),
        endedAt: makeTimestamp(9_000),
        targetFruit: 'banana',
        totalTaps: 10,
        correctTaps: 8,
        incorrectTaps: 2,
        accuracy: 0.8,
        deviceInfo: {os: 'ios', version: '17'},
      },
      taps: [],
      fruitEvents: [{id: 'fruit-1'}],
      captures: [{id: 'capture-1'}],
    } as any

    let renderer: ReactTestRenderer.ReactTestRenderer

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ResultScreen
          navigation={navigation as any}
          route={{key: 'Result', name: 'Result', params: {bundle}} as any}
        />,
      )
    })

    expect(
      renderer!.root.findAllByProps({children: 'Session Stats'}).length,
    ).toBeGreaterThan(0)

    const replayButton = renderer!.root.findByProps({
      accessibilityLabel: 'Play Again',
    })

    await ReactTestRenderer.act(() => {
      replayButton.props.onPress()
    })

    expect(navigation.replace).toHaveBeenCalledWith('Game', {
      targetFruitId: 'banana',
    })
  })
})
