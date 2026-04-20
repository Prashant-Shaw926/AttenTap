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
  targetItem: string
  totalTaps: number
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  deviceInfo: DeviceInfo
}

export interface ItemEvent {
  id: string
  itemType: string
  isTarget: boolean
  slotId: string
  x: number
  y: number
  appearedAt: FirebaseFirestoreTypes.Timestamp
  disappearedAt: FirebaseFirestoreTypes.Timestamp | null
  wasCorrectlyTapped: boolean
}

export interface ItemInstance extends ItemEvent {}

export interface CaptureEvent {
  id: string
  sessionId: string
  path: string
  timestamp: FirebaseFirestoreTypes.Timestamp
  visibleItemIds: string[]
  targetItemIds: string[]
}

export interface SessionBundle {
  sessionId: string
  session: SessionDocument
  taps: TapEvent[]
  itemEvents: ItemEvent[]
  captures: CaptureEvent[]
}

export interface StartSessionInput {
  sessionId?: string
  userId: string
  targetItem: string
  deviceInfo?: DeviceInfo
  startedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface EndSessionInput {
  endedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface RecordItemAppearanceInput {
  itemId?: string
  itemType: string
  isTarget: boolean
  slotId: string
  x: number
  y: number
  appearedAt?: FirebaseFirestoreTypes.Timestamp
}

export interface RecordItemDisappearanceInput {
  itemId: string
  disappearedAt?: FirebaseFirestoreTypes.Timestamp
  wasCorrectlyTapped?: boolean
}

export interface RecordCaptureInput {
  captureId?: string
  sessionId: string
  path: string
  timestamp?: FirebaseFirestoreTypes.Timestamp
  visibleItemIds: string[]
  targetItemIds: string[]
}
