import {Platform} from 'react-native'
import {create} from 'zustand'

import {Timestamp} from '../config/firebase'
import type {
  CaptureEvent,
  DeviceInfo,
  EndSessionInput,
  FruitEvent,
  FruitInstance,
  GameStatus,
  RecordCaptureInput,
  RecordFruitAppearanceInput,
  RecordFruitDisappearanceInput,
  SessionBundle,
  SessionDocument,
  StartSessionInput,
} from '../types/game.types'
import type {RecordTapInput, TapEvent, TapType} from '../types/tap.types'

type ActiveFruitMap = Record<string, FruitInstance>

export interface GameStoreState {
  status: GameStatus
  sessionId: string | null
  session: SessionDocument | null
  taps: TapEvent[]
  fruitEvents: FruitEvent[]
  captureEvents: CaptureEvent[]
  activeFruits: ActiveFruitMap
  startSession: (input: StartSessionInput) => string
  endSession: (input?: EndSessionInput) => SessionBundle | null
  recordTap: (input: RecordTapInput) => TapEvent | null
  recordFruitAppearance: (
    input: RecordFruitAppearanceInput,
  ) => FruitEvent | null
  recordFruitDisappearance: (
    input: RecordFruitDisappearanceInput,
  ) => FruitEvent | null
  recordCapture: (input: RecordCaptureInput) => CaptureEvent | null
  resetGame: () => void
}

type GameStoreSlice = Pick<
  GameStoreState,
  | 'status'
  | 'sessionId'
  | 'session'
  | 'taps'
  | 'fruitEvents'
  | 'captureEvents'
  | 'activeFruits'
>

const createId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

const createTimestamp = () => Timestamp.now()

const getDefaultDeviceInfo = (): DeviceInfo => ({
  os: Platform.OS,
  version: String(Platform.Version),
})

const getInitialState = (): GameStoreSlice => ({
  status: 'idle',
  sessionId: null,
  session: null,
  taps: [],
  fruitEvents: [],
  captureEvents: [],
  activeFruits: {},
})

const calculateAccuracy = (correctTaps: number, totalTaps: number): number => {
  if (totalTaps === 0) {
    return 0
  }

  return correctTaps / totalTaps
}

const updateSessionStats = (
  session: SessionDocument,
  tapType: TapType,
): SessionDocument => {
  const totalTaps = session.totalTaps + 1
  const correctTaps = session.correctTaps + (tapType === 'correct' ? 1 : 0)
  const incorrectTaps = session.incorrectTaps + (tapType === 'correct' ? 0 : 1)

  return {
    ...session,
    totalTaps,
    correctTaps,
    incorrectTaps,
    accuracy: calculateAccuracy(correctTaps, totalTaps),
  }
}

const finalizeFruitEvents = (
  fruitEvents: FruitEvent[],
  endedAt: SessionDocument['startedAt'],
): FruitEvent[] =>
  fruitEvents.map(event => {
    if (event.disappearedAt) {
      return event
    }

    return {
      ...event,
      disappearedAt: endedAt,
    }
  })

const updateFruitEventList = (
  fruitEvents: FruitEvent[],
  fruitId: string,
  updater: (fruitEvent: FruitEvent) => FruitEvent,
): FruitEvent[] =>
  fruitEvents.map(fruitEvent => {
    if (fruitEvent.id !== fruitId) {
      return fruitEvent
    }

    return updater(fruitEvent)
  })

const buildSessionBundle = (
  sessionId: string,
  session: SessionDocument,
  taps: TapEvent[],
  fruitEvents: FruitEvent[],
  captures: CaptureEvent[],
): SessionBundle => ({
  sessionId,
  session,
  taps,
  fruitEvents,
  captures,
})

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...getInitialState(),

  startSession: input => {
    const sessionId = input.sessionId ?? createId('session')
    const startedAt = input.startedAt ?? createTimestamp()

    set({
      status: 'playing',
      sessionId,
      session: {
        userId: input.userId,
        startedAt,
        endedAt: null,
        targetFruit: input.targetFruit,
        totalTaps: 0,
        correctTaps: 0,
        incorrectTaps: 0,
        accuracy: 0,
        deviceInfo: input.deviceInfo ?? getDefaultDeviceInfo(),
      },
      taps: [],
      fruitEvents: [],
      captureEvents: [],
      activeFruits: {},
    })

    return sessionId
  },

  endSession: input => {
    const state = get()

    if (!state.sessionId || !state.session) {
      return null
    }

    const endedAt = input?.endedAt ?? createTimestamp()
    const finalizedSession: SessionDocument = {
      ...state.session,
      endedAt,
    }
    const finalizedFruitEvents = finalizeFruitEvents(state.fruitEvents, endedAt)
    const sessionBundle = buildSessionBundle(
      state.sessionId,
      finalizedSession,
      state.taps,
      finalizedFruitEvents,
      state.captureEvents,
    )

    set({
      status: 'completed',
      session: finalizedSession,
      fruitEvents: finalizedFruitEvents,
      activeFruits: {},
    })

    return sessionBundle
  },
  recordTap: input => {
    const state = get()

    if (!state.session) {
      return null
    }

    const tap: TapEvent = {
      id: input.tapId ?? createId('tap'),
      x: input.x,
      y: input.y,
      type: input.type,
      timestamp: input.timestamp ?? createTimestamp(),
      fruitId: input.fruitId ?? null,
    }

    set(currentState => {
      if (!currentState.session) {
        return currentState
      }

      const fruitEvents =
        tap.type === 'correct' && tap.fruitId
          ? updateFruitEventList(
              currentState.fruitEvents,
              tap.fruitId,
              fruitEvent => ({
                ...fruitEvent,
                wasCorrectlyTapped: true,
              }),
            )
          : currentState.fruitEvents

      const activeFruit = tap.fruitId
        ? currentState.activeFruits[tap.fruitId]
        : undefined
      const activeFruits =
        tap.type === 'correct' && tap.fruitId && activeFruit
          ? {
              ...currentState.activeFruits,
              [tap.fruitId]: {
                ...activeFruit,
                wasCorrectlyTapped: true,
              },
            }
          : currentState.activeFruits

      return {
        taps: [...currentState.taps, tap],
        session: updateSessionStats(currentState.session, tap.type),
        fruitEvents,
        activeFruits,
      }
    })

    return tap
  },

  recordFruitAppearance: input => {
    const state = get()

    if (!state.session) {
      return null
    }

    const fruitId = input.fruitId ?? createId('fruit')
    const appearedAt = input.appearedAt ?? createTimestamp()
    const fruitEvent: FruitEvent = {
      id: fruitId,
      fruitType: input.fruitType,
      isTarget: input.isTarget,
      slotId: input.slotId,
      x: input.x,
      y: input.y,
      appearedAt,
      disappearedAt: null,
      wasCorrectlyTapped: false,
    }

    set(currentState => ({
      fruitEvents: [...currentState.fruitEvents, fruitEvent],
      activeFruits: {
        ...currentState.activeFruits,
        [fruitId]: fruitEvent,
      },
    }))

    return fruitEvent
  },

  recordFruitDisappearance: input => {
    const state = get()
    const existingFruit = state.activeFruits[input.fruitId]

    if (!state.session || !existingFruit) {
      return null
    }

    const disappearedAt = input.disappearedAt ?? createTimestamp()
    const fruitEvent: FruitEvent = {
      ...existingFruit,
      disappearedAt,
      wasCorrectlyTapped:
        input.wasCorrectlyTapped ?? existingFruit.wasCorrectlyTapped,
    }

    set(currentState => {
      const nextActiveFruits = {...currentState.activeFruits}
      delete nextActiveFruits[input.fruitId]

      return {
        fruitEvents: updateFruitEventList(
          currentState.fruitEvents,
          input.fruitId,
          () => fruitEvent,
        ),
        activeFruits: nextActiveFruits,
      }
    })

    return fruitEvent
  },

  recordCapture: input => {
    const state = get()

    if (!state.session || !state.sessionId) {
      return null
    }

    const captureEvent: CaptureEvent = {
      id: input.captureId ?? createId('capture'),
      sessionId: input.sessionId,
      path: input.path,
      timestamp: input.timestamp ?? createTimestamp(),
      visibleFruitIds: input.visibleFruitIds,
      targetFruitIds: input.targetFruitIds,
    }

    set(currentState => ({
      captureEvents: [...currentState.captureEvents, captureEvent],
    }))

    return captureEvent
  },
  resetGame: () => {
    set(getInitialState())
  },
}))

export const selectGameStatus = (state: GameStoreState) => state.status
export const selectGameSession = (state: GameStoreState) => state.session
export const selectActiveFruits = (state: GameStoreState) => state.activeFruits
export const selectTapEvents = (state: GameStoreState) => state.taps
export const selectFruitEvents = (state: GameStoreState) => state.fruitEvents
export const selectCaptureEvents = (state: GameStoreState) => state.captureEvents
