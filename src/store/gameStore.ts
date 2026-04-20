/**
 * Game Store
 * 
 * Central Zustand store for game state, session tracking, and event logs.
 * Handles the flat structure of taps, item events, and captures to facilitate 
 * efficient synchronization with Firestore.
 */
import {Platform} from 'react-native'
import {create} from 'zustand'

import {Timestamp} from '../config/firebase'
import type {
  CaptureEvent,
  DeviceInfo,
  EndSessionInput,
  ItemEvent,
  ItemInstance,
  GameStatus,
  RecordCaptureInput,
  RecordItemAppearanceInput,
  RecordItemDisappearanceInput,
  SessionBundle,
  SessionDocument,
  StartSessionInput,
} from '../types/game.types'
import type {RecordTapInput, TapEvent, TapType} from '../types/tap.types'

type ActiveItemMap = Record<string, ItemInstance>

export interface GameStoreState {
  status: GameStatus
  sessionId: string | null
  session: SessionDocument | null
  taps: TapEvent[]
  itemEvents: ItemEvent[]
  captureEvents: CaptureEvent[]
  activeItems: ActiveItemMap
  startSession: (input: StartSessionInput) => string
  endSession: (input?: EndSessionInput) => SessionBundle | null
  recordTap: (input: RecordTapInput) => TapEvent | null
  recordItemAppearance: (
    input: RecordItemAppearanceInput,
  ) => ItemEvent | null
  recordItemDisappearance: (
    input: RecordItemDisappearanceInput,
  ) => ItemEvent | null
  recordCapture: (input: RecordCaptureInput) => CaptureEvent | null
  resetGame: () => void
}

type GameStoreSlice = Pick<
  GameStoreState,
  | 'status'
  | 'sessionId'
  | 'session'
  | 'taps'
  | 'itemEvents'
  | 'captureEvents'
  | 'activeItems'
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
  itemEvents: [],
  captureEvents: [],
  activeItems: {},
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

const finalizeItemEvents = (
  itemEvents: ItemEvent[],
  endedAt: SessionDocument['startedAt'],
): ItemEvent[] =>
  itemEvents.map(event => {
    if (event.disappearedAt) {
      return event
    }

    return {
      ...event,
      disappearedAt: endedAt,
    }
  })

const updateItemEventList = (
  itemEvents: ItemEvent[],
  itemId: string,
  updater: (itemEvent: ItemEvent) => ItemEvent,
): ItemEvent[] =>
  itemEvents.map(itemEvent => {
    if (itemEvent.id !== itemId) {
      return itemEvent
    }

    return updater(itemEvent)
  })

const buildSessionBundle = (
  sessionId: string,
  session: SessionDocument,
  taps: TapEvent[],
  itemEvents: ItemEvent[],
  captures: CaptureEvent[],
): SessionBundle => ({
  sessionId,
  session,
  taps,
  itemEvents,
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
        targetItem: input.targetItem,
        totalTaps: 0,
        correctTaps: 0,
        incorrectTaps: 0,
        accuracy: 0,
        deviceInfo: input.deviceInfo ?? getDefaultDeviceInfo(),
      },
      taps: [],
      itemEvents: [],
      captureEvents: [],
      activeItems: {},
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
    const finalizedItemEvents = finalizeItemEvents(state.itemEvents, endedAt)
    const sessionBundle = buildSessionBundle(
      state.sessionId,
      finalizedSession,
      state.taps,
      finalizedItemEvents,
      state.captureEvents,
    )

    set({
      status: 'completed',
      session: finalizedSession,
      itemEvents: finalizedItemEvents,
      activeItems: {},
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
      itemId: input.itemId ?? null,
    }

    set(currentState => {
      if (!currentState.session) {
        return currentState
      }

      return {
        taps: [...currentState.taps, tap],
        session: updateSessionStats(currentState.session, tap.type),
      }
    })

    return tap
  },

  recordItemAppearance: input => {
    const state = get()

    if (!state.session) {
      return null
    }

    const itemId = input.itemId ?? createId('item')
    const appearedAt = input.appearedAt ?? createTimestamp()
    const itemEvent: ItemEvent = {
      id: itemId,
      itemType: input.itemType,
      isTarget: input.isTarget,
      slotId: input.slotId,
      x: input.x,
      y: input.y,
      appearedAt,
      disappearedAt: null,
      wasCorrectlyTapped: false,
    }

    set(currentState => ({
      itemEvents: [...currentState.itemEvents, itemEvent],
      activeItems: {
        ...currentState.activeItems,
        [itemId]: itemEvent,
      },
    }))

    return itemEvent
  },

  recordItemDisappearance: input => {
    const state = get()
    const existingItem = state.activeItems[input.itemId]

    if (!state.session || !existingItem) {
      return null
    }

    const disappearedAt = input.disappearedAt ?? createTimestamp()
    const itemEvent: ItemEvent = {
      ...existingItem,
      disappearedAt,
      wasCorrectlyTapped:
        input.wasCorrectlyTapped ?? existingItem.wasCorrectlyTapped,
    }

    set(currentState => {
      const nextActiveItems = {...currentState.activeItems}
      delete nextActiveItems[input.itemId]

      return {
        itemEvents: updateItemEventList(
          currentState.itemEvents,
          input.itemId,
          () => itemEvent,
        ),
        activeItems: nextActiveItems,
      }
    })

    return itemEvent
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
      visibleItemIds: input.visibleItemIds,
      targetItemIds: input.targetItemIds,
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
export const selectActiveItems = (state: GameStoreState) => state.activeItems
export const selectTapEvents = (state: GameStoreState) => state.taps
export const selectItemEvents = (state: GameStoreState) => state.itemEvents
export const selectCaptureEvents = (state: GameStoreState) => state.captureEvents
