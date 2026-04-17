import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import HomeScreen from '../screens/HomeScreen'
import GameScreen from '../screens/GameScreen'
import ResultsScreen from '../screens/ResultsScreen'
import type { SessionBundle } from '../types/game.types'

export type RootStackParamList = {
  Home: undefined
  Game: { targetFruitId?: string }
  Results: { bundle: SessionBundle }
}

const Stack = createStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
