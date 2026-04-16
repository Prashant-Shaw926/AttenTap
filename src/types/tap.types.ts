import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore'

export type TapType = 'correct' | 'incorrect' | 'background'

export interface TapEvent {
  id: string
  x: number
  y: number
  type: TapType
  timestamp: FirebaseFirestoreTypes.Timestamp
  fruitId: string | null
}

export interface RecordTapInput {
  tapId?: string
  x: number
  y: number
  type: TapType
  timestamp?: FirebaseFirestoreTypes.Timestamp
  fruitId?: string | null
}
