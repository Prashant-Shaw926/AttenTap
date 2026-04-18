import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore'

import {FIRESTORE_BATCH_WRITE_LIMIT} from '../constants/gameConfig'
import type {
  CaptureEvent,
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
  merge?: boolean
}

export interface SessionFlushPayload {
  sessionId: string
  session?: SessionDocument
  taps?: TapEvent[]
  fruitEvents?: FruitEvent[]
  captures?: CaptureEvent[]
  mergeSession?: boolean
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
  slotId: fruitEvent.slotId,
  x: fruitEvent.x,
  y: fruitEvent.y,
  appearedAt: fruitEvent.appearedAt,
  disappearedAt: fruitEvent.disappearedAt,
  wasCorrectlyTapped: fruitEvent.wasCorrectlyTapped,
})

const serializeCaptureEvent = (
  captureEvent: CaptureEvent,
): FirebaseFirestoreTypes.DocumentData => ({
  sessionId: captureEvent.sessionId,
  path: captureEvent.path,
  timestamp: captureEvent.timestamp,
  visibleFruitIds: captureEvent.visibleFruitIds,
  targetFruitIds: captureEvent.targetFruitIds,
})

const getSessionPath = (sessionId: string): string =>
  `${SESSIONS_COLLECTION}/${sessionId}`

const getSessionTapsPath = (sessionId: string): string =>
  `${getSessionPath(sessionId)}/taps`

const getSessionFruitEventsPath = (sessionId: string): string =>
  `${getSessionPath(sessionId)}/fruitEvents`

const getSessionCapturesPath = (sessionId: string): string =>
  `${getSessionPath(sessionId)}/captures`

export const createSessionRecord = async (
  sessionId: string,
  session: SessionDocument,
): Promise<void> => {
  await setDocument(getSessionPath(sessionId), session)
}

export const buildSessionWrites = ({
  sessionId,
  session,
  taps = [],
  fruitEvents = [],
  captures = [],
  mergeSession = true,
}: SessionFlushPayload): FirestoreWrite[] => [
  ...(session
    ? [
        {
          path: getSessionPath(sessionId),
          data: session,
          merge: mergeSession,
        },
      ]
    : []),
  ...taps.map(tap => ({
    path: `${getSessionTapsPath(sessionId)}/${tap.id}`,
    data: serializeTap(tap),
  })),
  ...fruitEvents.map(fruitEvent => ({
    path: `${getSessionFruitEventsPath(sessionId)}/${fruitEvent.id}`,
    data: serializeFruitEvent(fruitEvent),
  })),
  ...captures.map(capture => ({
    path: `${getSessionCapturesPath(sessionId)}/${capture.id}`,
    data: serializeCaptureEvent(capture),
  })),
]

const commitWrites = async (writes: FirestoreWrite[]): Promise<void> => {
  if (writes.length === 0) {
    return
  }

  const firestoreDb = await ensureFirestoreReady()
  const writeChunks = chunkArray(writes, FIRESTORE_BATCH_WRITE_LIMIT)

  for (const chunk of writeChunks) {
    const batch = firestoreDb.batch()

    chunk.forEach(write => {
      if (write.merge) {
        batch.set(firestoreDb.doc(write.path), write.data, {merge: true})
        return
      }

      batch.set(firestoreDb.doc(write.path), write.data)
    })

    await batch.commit()
  }
}

export const flushSessionUpdates = async (
  payload: SessionFlushPayload,
): Promise<void> => {
  await commitWrites(buildSessionWrites(payload))
}

export const saveSessionBundle = async (
  bundle: SessionBundle,
): Promise<void> => {
  await flushSessionUpdates({
    sessionId: bundle.sessionId,
    session: bundle.session,
    taps: bundle.taps,
    fruitEvents: bundle.fruitEvents,
    captures: bundle.captures,
    mergeSession: false,
  })
}
