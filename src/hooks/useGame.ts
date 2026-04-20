/**
 * Hook: useGame
 * 
 * The primary interface for controlling the AttenTap gameplay logic.
 * Orchestrates timers, item spawning, tap handling, and camera capture coordination.
 * Connects the UI layer to the core game store and persistence services.
 */
import {useCallback, useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'

import {ITEM_HIT_SLOP, ITEM_SIZE, GAME_DURATION_MS} from '../constants/gameConfig'
import {getItemById} from '../constants/items'
import {buildCaptureRecordInput} from '../services/camera'
import {
  selectActiveItems,
  selectCaptureEvents,
  selectItemEvents,
  selectGameSession,
  selectGameStatus,
  selectTapEvents,
  useGameStore,
} from '../store/gameStore'
import type {
  DeviceInfo,
  ItemEvent,
  ItemInstance,
  SessionBundle,
} from '../types/game.types'
import type {TapEvent} from '../types/tap.types'
import {getNearestItemAtPoint} from '../utils/geometry'
import {useItemSpawner} from './useItemSpawner'
import {useSessionPersistence} from './game/useSessionPersistence'
import {useTimer} from './useTimer'

export interface UseGameOptions {
  userId: string
  boardWidth: number
  boardHeight: number
  itemSize?: number
  autoStart?: boolean
  deviceInfo?: DeviceInfo
  onError?: (error: Error) => void
  onSessionStarted?: (sessionId: string) => void | Promise<void>
  onSessionCompleted?: (bundle: SessionBundle) => void | Promise<void>
}

export interface UseGameResult {
  status: ReturnType<typeof selectGameStatus>
  sessionId: string | null
  session: ReturnType<typeof selectGameSession>
  targetItem: string | null
  targetItemDefinition: ReturnType<typeof getItemById>
  visibleItems: ItemInstance[]
  taps: TapEvent[]
  itemEvents: ItemEvent[]
  remainingTimeMs: number
  accuracy: number
  totalTaps: number
  correctTaps: number
  incorrectTaps: number
  isPersisting: boolean
  lastError: Error | null
  startGame: () => Promise<string | null>
  endGame: () => Promise<SessionBundle | null>
  resetGame: () => void
  handleTap: (x: number, y: number) => TapEvent | null
  handleCapture: (path: string, timestampMs: number) => void
}

export const useGame = ({
  userId,
  boardWidth,
  boardHeight,
  itemSize = ITEM_SIZE,
  autoStart = false,
  deviceInfo,
  onError,
  onSessionStarted,
  onSessionCompleted,
}: UseGameOptions): UseGameResult => {
  const {
    activeItems,
    captureEvents,
    itemEvents,
    session,
    sessionId,
    status,
    taps,
  } = useGameStore(
    useShallow(state => ({
      activeItems: selectActiveItems(state),
      captureEvents: selectCaptureEvents(state),
      itemEvents: selectItemEvents(state),
      session: selectGameSession(state),
      sessionId: state.sessionId,
      status: selectGameStatus(state),
      taps: selectTapEvents(state),
    })),
  )

  const {
    recordCapture,
    recordItemAppearance,
    recordItemDisappearance,
    recordTap,
  } = useGameStore(
    useShallow(state => ({
      recordCapture: state.recordCapture,
      recordItemAppearance: state.recordItemAppearance,
      recordItemDisappearance: state.recordItemDisappearance,
      recordTap: state.recordTap,
    })),
  )

  const targetItem = session?.targetItem ?? null
  const visibleItems = useMemo(() => Object.values(activeItems), [activeItems])

  const {
    endGame,
    isPersisting,
    lastError,
    resetGame,
    startGame,
  } = useSessionPersistence({
    autoStart,
    captureEventsCount: captureEvents.length,
    deviceInfo,
    itemEventsCount: itemEvents.length,
    onError,
    onSessionCompleted,
    onSessionStarted,
    session,
    sessionId,
    status,
    tapsCount: taps.length,
    userId,
  })

  const remainingTimeMs = useTimer({
    status,
    startedAtMillis: session?.startedAt.toMillis() ?? null,
    durationMs: GAME_DURATION_MS,
    onCompleted: async () => {
      await endGame()
    },
  })

  useItemSpawner({
    status,
    targetItem,
    boardWidth,
    boardHeight,
    itemSize,
    activeItems: visibleItems,
    onSpawn: recordItemAppearance,
    onExpire: itemId => {
      recordItemDisappearance({itemId})
    },
  })

  const handleTap = useCallback(
    (x: number, y: number): TapEvent | null => {
      const currentState = useGameStore.getState()

      if (currentState.status !== 'playing' || !currentState.session) {
        return null
      }

      const activeItemList = Object.values(currentState.activeItems)
      const hitItem = getNearestItemAtPoint(
        {x, y},
        activeItemList,
        itemSize,
        ITEM_HIT_SLOP,
      )

      if (!hitItem) {

        const nowMs = Date.now()
        const recentDisappeared = currentState.itemEvents.filter(
          f => f.disappearedAt && nowMs - f.disappearedAt.toMillis() < 250,
        )

        const ghostHit = getNearestItemAtPoint(
          {x, y},
          recentDisappeared,
          itemSize,
          ITEM_HIT_SLOP,
        )

        if (ghostHit) {
          if (ghostHit.isTarget && !ghostHit.wasCorrectlyTapped) {
            return recordTap({
              x,
              y,
              type: 'correct',
              itemId: ghostHit.id,
            })
          }

          return null
        }

        return recordTap({
          x,
          y,
          type: 'background',
        })
      }

      const tapType = hitItem.isTarget ? 'correct' : 'incorrect'
      const tap = recordTap({
        x,
        y,
        type: tapType,
        itemId: hitItem.id,
      })

      recordItemDisappearance({
        itemId: hitItem.id,
        wasCorrectlyTapped: hitItem.isTarget,
      })

      return tap
    },
    [itemSize, recordItemDisappearance, recordTap],
  )

  const handleCapture = useCallback(
    (path: string, timestampMs: number) => {
      const {
        status: currentStatus,
        sessionId: currentSessionId,
        session: currentSession,
        activeItems: currentActiveItems,
      } = useGameStore.getState()

      if (currentStatus !== 'playing' || !currentSessionId || !currentSession) {
        return
      }

      const activeItemList = Object.values(currentActiveItems)
      if (activeItemList.length === 0) {
        return
      }

      const targetItemIds = activeItemList
        .filter(item => item.isTarget)
        .map(item => item.id)

      if (targetItemIds.length === 0) {
        return
      }

      recordCapture(
        buildCaptureRecordInput({
          sessionId: currentSessionId,
          path,
          timestampMs,
          visibleItemIds: activeItemList.map(item => item.id),
          targetItemIds,
        }),
      )
    },
    [recordCapture],
  )

  return {
    status,
    sessionId,
    session,
    targetItem,
    targetItemDefinition: targetItem ? getItemById(targetItem) : undefined,
    visibleItems,
    taps,
    itemEvents,
    remainingTimeMs,
    accuracy: session?.accuracy ?? 0,
    totalTaps: session?.totalTaps ?? 0,
    correctTaps: session?.correctTaps ?? 0,
    incorrectTaps: session?.incorrectTaps ?? 0,
    isPersisting,
    lastError,
    startGame,
    endGame,
    resetGame,
    handleTap,
    handleCapture,
  }
}
