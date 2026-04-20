import type {StackScreenProps} from '@react-navigation/stack'

import type {SessionBundle} from '../types/game.types'

export type RootStackParamList = {
  Splash: undefined
  Home: undefined
  Game: undefined
  Result: {
    bundle: SessionBundle
  }
}

export type SplashScreenProps = StackScreenProps<RootStackParamList, 'Splash'>
export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>
export type GameScreenProps = StackScreenProps<RootStackParamList, 'Game'>
export type ResultScreenProps = StackScreenProps<RootStackParamList, 'Result'>
