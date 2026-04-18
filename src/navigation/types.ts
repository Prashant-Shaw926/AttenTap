import type {StackScreenProps} from '@react-navigation/stack'

import type {SessionBundle} from '../types/game.types'

export type RootStackParamList = {
  Home: undefined
  Game: {targetFruitId?: string} | undefined
  Result: {bundle: SessionBundle}
}

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>
export type GameScreenProps = StackScreenProps<RootStackParamList, 'Game'>
export type ResultScreenProps = StackScreenProps<RootStackParamList, 'Result'>
