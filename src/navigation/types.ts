import type {StackScreenProps} from '@react-navigation/stack'

import type {FruitId} from '../constants/fruits'
import type {SessionBundle} from '../types/game.types'

export type RootStackParamList = {
  Home: undefined
  Game: undefined
  Result: {
    bundle: SessionBundle
  }
}

export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>
export type GameScreenProps = StackScreenProps<RootStackParamList, 'Game'>
export type ResultScreenProps = StackScreenProps<RootStackParamList, 'Result'>
