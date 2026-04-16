import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore'

import type {TapEvent} from './tap.types'

export type GameStatus = 'idle' | 'playing' | 'completed'

export interface DeviceInfo {
  os: string
  version: string
}

export interface SessionDocument {
  userId: string
  startedAt: FirebaseFirestoreTypes.Timestamp
  endedAt: FirebaseFirestoreTypes.Timestamp | null
  targetFruit: string
  totalTaps: number
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  deviceInfo: DeviceInfo
}

export interface FruitEvent {
  id: string
  fruitType: string
  isTarget: boolean
  x: number
  y: number
  appearedAt: FirebaseFirestoreTypes.Timestamp
  disappearedAt: FirebaseFirestoreTypes.Timestamp | null
  wasCorrectlyTapped: boolean
}

export interface FruitInstance extends FruitEvent {}

export interface SessionBundle {
  sessionId: string
  session: SessionDocument
  taps: TapEvent[]
  fruitEvents: FruitEvent[]
}

export interface StartSessionInput {
  sessionId?: string
  userId: string
  targetFruit: string
  deviceInfo?: DeviceInfo
  startedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface EndSessionInput {
  endedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface RecordFruitAppearanceInput {
  fruitId?: string
  fruitType: string
  isTarget: boolean
  x: number
  y: number
  appearedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface RecordFruitDisappearanceInput {
  fruitId: string
  disappearedAt?: FirebaseFirestoreTypes.Timestamp
  wasCorrectlyTapped?: boolean
}
