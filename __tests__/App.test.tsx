import React from 'react'
import ReactTestRenderer from 'react-test-renderer'

import App from '../App'

jest.mock('../src/navigation/AppNavigator', () => () => null)

test('renders the app shell', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />)
  })
})
