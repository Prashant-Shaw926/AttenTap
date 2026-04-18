import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

import HomeScreen from '../src/screens/HomeScreen'

describe('HomeScreen', () => {
  test('navigates to the game with the target fruit', async () => {
    const navigation = {
      navigate: jest.fn(),
    }

    let renderer: ReactTestRenderer.ReactTestRenderer

    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <HomeScreen navigation={navigation as any} route={{key: 'Home', name: 'Home'} as any} />,
      )
    })

    const button = renderer!.root.findByProps({accessibilityLabel: 'Play Now'})

    await ReactTestRenderer.act(() => {
      button.props.onPress()
    })

    expect(navigation.navigate).toHaveBeenCalledWith('Game', {
      targetFruitId: 'carrot',
    })
  })
})
