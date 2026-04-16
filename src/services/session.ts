import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore'

import {FIRESTORE_BATCH_WRITE_LIMIT} from '../constants/gameConfig'
import type {
  FruitEvent,
  SessionBundle,
  SessionDocument,
} from '../types/game.types'
import type {TapEvent} from '../types/tap.types'
import {ensureFirestoreReady, setDocument} from './firestore'

const SESSIONS_COLLECTION = 'sessions'

interface FirestoreWrite {
  path: string
  data: FirebaseFirestoreTypes.DocumentData
}

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

const serializeTap = (tap: TapEvent): FirebaseFirestoreTypes.DocumentData => ({
  x: tap.x,
  y: tap.y,
  type: tap.type,
  timestamp: tap.timestamp,
  fruitId: tap.fruitId,
})

const serializeFruitEvent = (
  fruitEvent: FruitEvent,
): FirebaseFirestoreTypes.DocumentData => ({
  fruitType: fruitEvent.fruitType,
  isTarget: fruitEvent.isTarget,
  x: fruitEvent.x,
  y: fruitEvent.y,
  appearedAt: fruitEvent.appearedAt,
  disappearedAt: fruitEvent.disappearedAt,
  wasCorrectlyTapped: fruitEvent.wasCorrectlyTapped,
})

export const getSessionPath = (sessionId: string): string =>
  `${SESSIONS_COLLECTION}/${sessionId}`

export const getSessionTapsPath = (sessionId: string): string =>
  `${getSessionPath(sessionId)}/taps`

export const getSessionFruitEventsPath = (sessionId: string): string =>
  `${getSessionPath(sessionId)}/fruitEvents`

export const createSessionRecord = async (
  sessionId: string,
  session: SessionDocument,
): Promise<void> => {
  await setDocument(getSessionPath(sessionId), session)
}

export const updateSessionRecord = async (
  sessionId: string,
  session: SessionDocument,
): Promise<void> => {
  await setDocument(getSessionPath(sessionId), session, {merge: true})
}

const createSessionWrites = (bundle: SessionBundle): FirestoreWrite[] => [
  {
    path: getSessionPath(bundle.sessionId),
    data: bundle.session,
  },
  ...bundle.taps.map(tap => ({
    path: `${getSessionTapsPath(bundle.sessionId)}/${tap.id}`,
    data: serializeTap(tap),
  })),
  ...bundle.fruitEvents.map(fruitEvent => ({
    path: `${getSessionFruitEventsPath(bundle.sessionId)}/${fruitEvent.id}`,
    data: serializeFruitEvent(fruitEvent),
  })),
]

const commitWrites = async (writes: FirestoreWrite[]): Promise<void> => {
  const firestoreDb = await ensureFirestoreReady()
  const writeChunks = chunkArray(writes, FIRESTORE_BATCH_WRITE_LIMIT)

  for (const chunk of writeChunks) {
    const batch = firestoreDb.batch()

    chunk.forEach(write => {
      batch.set(firestoreDb.doc(write.path), write.data)
    })

    await batch.commit()
  }
}

export const saveSessionBundle = async (
  bundle: SessionBundle,
): Promise<void> => {
  await commitWrites(createSessionWrites(bundle))
}
