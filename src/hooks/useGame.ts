import {useCallback, useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'

import {FRUIT_HIT_SLOP, FRUIT_SIZE, GAME_DURATION_MS} from '../constants/gameConfig'
import {getFruitById} from '../constants/fruits'
import {buildCaptureRecordInput} from '../services/camera'
import {
  selectActiveFruits,
  selectCaptureEvents,
  selectFruitEvents,
  selectGameSession,
  selectGameStatus,
  selectTapEvents,
  useGameStore,
} from '../store/gameStore'
import type {
  DeviceInfo,
  FruitEvent,
  FruitInstance,
  SessionBundle,
} from '../types/game.types'
import type {TapEvent} from '../types/tap.types'
import {getNearestFruitAtPoint} from '../utils/geometry'
import {useFruitSpawner} from './useFruitSpawner'
import {useSessionPersistence} from './game/useSessionPersistence'
import {useTimer} from './useTimer'

export interface UseGameOptions {
  userId: string
  boardWidth: number
  boardHeight: number
  fruitSize?: number
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
  targetFruit: string | null
  targetFruitDefinition: ReturnType<typeof getFruitById>
  visibleFruits: FruitInstance[]
  taps: TapEvent[]
  fruitEvents: FruitEvent[]
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
  fruitSize = FRUIT_SIZE,
  autoStart = false,
  deviceInfo,
  onError,
  onSessionStarted,
  onSessionCompleted,
}: UseGameOptions): UseGameResult => {
  const {
    activeFruits,
    captureEvents,
    fruitEvents,
    session,
    sessionId,
    status,
    taps,
  } = useGameStore(
    useShallow(state => ({
      activeFruits: selectActiveFruits(state),
      captureEvents: selectCaptureEvents(state),
      fruitEvents: selectFruitEvents(state),
      session: selectGameSession(state),
      sessionId: state.sessionId,
      status: selectGameStatus(state),
      taps: selectTapEvents(state),
    })),
  )

  const {
    recordCapture,
    recordFruitAppearance,
    recordFruitDisappearance,
    recordTap,
  } = useGameStore(
    useShallow(state => ({
      recordCapture: state.recordCapture,
      recordFruitAppearance: state.recordFruitAppearance,
      recordFruitDisappearance: state.recordFruitDisappearance,
      recordTap: state.recordTap,
    })),
  )

  const targetFruit = session?.targetFruit ?? null
  const visibleFruits = useMemo(() => Object.values(activeFruits), [activeFruits])

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
    fruitEventsCount: fruitEvents.length,
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

  useFruitSpawner({
    status,
    targetFruit,
    boardWidth,
    boardHeight,
    fruitSize,
    activeFruits: visibleFruits,
    onSpawn: recordFruitAppearance,
    onExpire: fruitId => {
      recordFruitDisappearance({fruitId})
    },
  })

  const handleTap = useCallback(
    (x: number, y: number): TapEvent | null => {
      const currentState = useGameStore.getState()

      if (currentState.status !== 'playing' || !currentState.session) {
        return null
      }

      const activeFruitList = Object.values(currentState.activeFruits)
      const hitFruit = getNearestFruitAtPoint(
        {x, y},
        activeFruitList,
        fruitSize,
        FRUIT_HIT_SLOP,
      )

      if (!hitFruit) {
        // Ghost hit detection: Check if we hit a fruit that just disappeared (fading out)
        const nowMs = Date.now()
        const recentDisappeared = currentState.fruitEvents.filter(
          f => f.disappearedAt && nowMs - f.disappearedAt.toMillis() < 250,
        )

        const ghostHit = getNearestFruitAtPoint(
          {x, y},
          recentDisappeared,
          fruitSize,
          FRUIT_HIT_SLOP,
        )

        if (ghostHit) {
          // If it was a target that expired (wasn't tapped yet), count it as a late hit
          if (ghostHit.isTarget && !ghostHit.wasCorrectlyTapped) {
            return recordTap({
              x,
              y,
              type: 'correct',
              fruitId: ghostHit.id,
            })
          }

          // Otherwise, it was already tapped or it's a non-target; ignore to avoid false misses
          return null
        }

        return recordTap({
          x,
          y,
          type: 'background',
        })
      }

      // If we hit a fruit, we record the tap and immediately mark the fruit as disappeared
      const tapType = hitFruit.isTarget ? 'correct' : 'incorrect'
      const tap = recordTap({
        x,
        y,
        type: tapType,
        fruitId: hitFruit.id,
      })

      recordFruitDisappearance({
        fruitId: hitFruit.id,
        wasCorrectlyTapped: hitFruit.isTarget,
      })

      return tap
    },
    [fruitSize, recordFruitDisappearance, recordTap],
  )

  const handleCapture = useCallback(
    (path: string, timestampMs: number) => {
      const {status, sessionId, session, activeFruits} = useGameStore.getState()

      if (status !== 'playing' || !sessionId || !session) {
        return
      }

      const activeFruitList = Object.values(activeFruits)
      if (activeFruitList.length === 0) {
        return
      }

      const targetFruitIds = activeFruitList
        .filter(fruit => fruit.isTarget)
        .map(fruit => fruit.id)

      // Only record if there are targets visible to keep metrics relevant
      if (targetFruitIds.length === 0) {
        return
      }

      recordCapture(
        buildCaptureRecordInput({
          sessionId,
          path,
          timestampMs,
          visibleFruitIds: activeFruitList.map(f => f.id),
          targetFruitIds,
        }),
      )
    },
    [recordCapture],
  )

  return {
    status,
    sessionId,
    session,
    targetFruit,
    targetFruitDefinition: targetFruit ? getFruitById(targetFruit) : undefined,
    visibleFruits,
    taps,
    fruitEvents,
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
