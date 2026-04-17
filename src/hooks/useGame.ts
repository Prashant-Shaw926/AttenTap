import {AppState} from 'react-native'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {
  FRUIT_HIT_SLOP,
  FRUIT_SIZE,
  GAME_DURATION_MS,
  SESSION_FLUSH_BATCH_SIZE,
  SESSION_FLUSH_INTERVAL_MS,
} from '../constants/gameConfig'
import {
  DEFAULT_TARGET_FRUIT_ID,
  getFruitById,
  getRandomFruitId,
  isKnownFruit,
} from '../constants/fruits'
import {buildCaptureRecordInput} from '../services/camera'
import {
  createSessionRecord,
  flushSessionUpdates,
  saveSessionBundle,
} from '../services/session'
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
import {useTimer} from './useTimer'

export interface UseGameOptions {
  userId: string
  boardWidth: number
  boardHeight: number
  fruitSize?: number
  autoStart?: boolean
  initialTargetFruit?: string
  deviceInfo?: DeviceInfo
  onError?: (error: Error) => void
  onSessionStarted?: (sessionId: string) => void | Promise<void>
  onSessionCompleted?: (bundle: SessionBundle) => void | Promise<void>
}

export interface UseGameResult {
  status: ReturnType<typeof selectGameStatus>
  sessionId: string | null
  session: ReturnType<typeof selectGameSession>
  targetFruit: string
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
  startGame: (targetFruitId?: string) => Promise<string | null>
  endGame: () => Promise<SessionBundle | null>
  resetGame: () => void
  spawnFruit: () => FruitEvent | null
  handleTap: (x: number, y: number) => TapEvent | null
  handleCapture: (path: string, timestampMs: number) => void
}

const getTargetFruitId = (requestedTargetFruit?: string): string => {
  if (requestedTargetFruit && isKnownFruit(requestedTargetFruit)) {
    return requestedTargetFruit
  }

  if (requestedTargetFruit) {
    return requestedTargetFruit
  }

  return DEFAULT_TARGET_FRUIT_ID || getRandomFruitId()
}

export const useGame = ({
  userId,
  boardWidth,
  boardHeight,
  fruitSize = FRUIT_SIZE,
  autoStart = false,
  initialTargetFruit,
  deviceInfo,
  onError,
  onSessionStarted,
  onSessionCompleted,
}: UseGameOptions): UseGameResult => {
  const status = useGameStore(selectGameStatus)
  const session = useGameStore(selectGameSession)
  const activeFruits = useGameStore(selectActiveFruits)
  const taps = useGameStore(selectTapEvents)
  const fruitEvents = useGameStore(selectFruitEvents)
  const captureEvents = useGameStore(selectCaptureEvents)
  const sessionId = useGameStore(state => state.sessionId)

  const startSession = useGameStore(state => state.startSession)
  const recordTap = useGameStore(state => state.recordTap)
  const recordFruitAppearance = useGameStore(state => state.recordFruitAppearance)
  const recordFruitDisappearance = useGameStore(
    state => state.recordFruitDisappearance,
  )
  const recordCapture = useGameStore(state => state.recordCapture)
  const resetGameStore = useGameStore(state => state.resetGame)

  const [isPersisting, setIsPersisting] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const endingSessionRef = useRef(false)
  const flushInFlightRef = useRef(false)
  const pendingFlushRef = useRef(false)
  const persistedCountsRef = useRef({
    taps: 0,
    fruitEvents: 0,
    captures: 0,
  })
  const onSessionStartedRef = useRef(onSessionStarted)
  const onSessionCompletedRef = useRef(onSessionCompleted)

  useEffect(() => {
    onSessionStartedRef.current = onSessionStarted
  }, [onSessionStarted])

  useEffect(() => {
    onSessionCompletedRef.current = onSessionCompleted
  }, [onSessionCompleted])

  const targetFruit = session?.targetFruit ?? getTargetFruitId(initialTargetFruit)
  const visibleFruits = useMemo(() => Object.values(activeFruits), [activeFruits])

  const reportError = useCallback(
    (error: unknown) => {
      const normalizedError =
        error instanceof Error ? error : new Error('Unexpected game error.')

      setLastError(normalizedError)
      onError?.(normalizedError)
    },
    [onError],
  )

  const flushPendingSessionData = useCallback(async () => {
    const currentState = useGameStore.getState()

    if (!currentState.sessionId || !currentState.session) {
      return
    }

    if (flushInFlightRef.current) {
      pendingFlushRef.current = true
      return
    }

    const pendingTaps = currentState.taps.slice(persistedCountsRef.current.taps)
    const pendingFruitEvents = currentState.fruitEvents.slice(
      persistedCountsRef.current.fruitEvents,
    )
    const pendingCaptures = currentState.captureEvents.slice(
      persistedCountsRef.current.captures,
    )

    flushInFlightRef.current = true
    setIsPersisting(true)

    try {
      await flushSessionUpdates({
        sessionId: currentState.sessionId,
        session: currentState.session,
        taps: pendingTaps,
        fruitEvents: pendingFruitEvents,
        captures: pendingCaptures,
        mergeSession: true,
      })

      persistedCountsRef.current = {
        taps: currentState.taps.length,
        fruitEvents: currentState.fruitEvents.length,
        captures: currentState.captureEvents.length,
      }
      setLastError(null)
    } catch (error) {
      reportError(error)
    } finally {
      flushInFlightRef.current = false
      setIsPersisting(false)

      if (pendingFlushRef.current) {
        pendingFlushRef.current = false
        flushPendingSessionData().catch(() => {})
      }
    }
  }, [reportError])

  const endGame = useCallback(async (): Promise<SessionBundle | null> => {
    if (endingSessionRef.current) {
      return null
    }

    const currentState = useGameStore.getState()

    if (!currentState.sessionId || !currentState.session) {
      return null
    }

    endingSessionRef.current = true

    try {
      const bundle = currentState.endSession()

      if (!bundle) {
        return null
      }

      setIsPersisting(true)

      try {
        await saveSessionBundle(bundle)
        persistedCountsRef.current = {
          taps: bundle.taps.length,
          fruitEvents: bundle.fruitEvents.length,
          captures: bundle.captures.length,
        }
        setLastError(null)
      } catch (error) {
        reportError(error)
      } finally {
        setIsPersisting(false)
      }

      await onSessionCompletedRef.current?.(bundle)
      return bundle
    } finally {
      endingSessionRef.current = false
    }
  }, [reportError])

  const remainingTimeMs = useTimer({
    status,
    startedAtMillis: session?.startedAt.toMillis() ?? null,
    durationMs: GAME_DURATION_MS,
    onCompleted: async () => {
      await endGame()
    },
  })

  const {spawnFruit} = useFruitSpawner({
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

  const startGame = useCallback(
    async (targetFruitId?: string): Promise<string | null> => {
      if (!userId) {
        reportError(new Error('A userId is required to start a game session.'))
        return null
      }

      persistedCountsRef.current = {
        taps: 0,
        fruitEvents: 0,
        captures: 0,
      }
      pendingFlushRef.current = false
      flushInFlightRef.current = false
      setLastError(null)
      setIsPersisting(false)

      try {
        const resolvedTargetFruit = getTargetFruitId(
          targetFruitId ?? initialTargetFruit,
        )
        const nextSessionId = startSession({
          userId,
          targetFruit: resolvedTargetFruit,
          deviceInfo,
        })

        const currentSession = useGameStore.getState().session

        if (currentSession) {
          setIsPersisting(true)
          try {
            await createSessionRecord(nextSessionId, currentSession)
            setLastError(null)
          } finally {
            setIsPersisting(false)
          }
        }

        await onSessionStartedRef.current?.(nextSessionId)
        return nextSessionId
      } catch (error) {
        reportError(error)
        return null
      }
    },
    [deviceInfo, initialTargetFruit, reportError, startSession, userId],
  )

  const handleTap = useCallback(
    (x: number, y: number): TapEvent | null => {
      const currentState = useGameStore.getState()

      if (currentState.status !== 'playing' || !currentState.session) {
        return null
      }

      const hitFruit = getNearestFruitAtPoint(
        {x, y},
        Object.values(currentState.activeFruits),
        fruitSize,
        FRUIT_HIT_SLOP,
      )

      if (!hitFruit) {
        return recordTap({
          x,
          y,
          type: 'background',
        })
      }

      const tapType = hitFruit.isTarget ? 'correct' : 'incorrect'
      const tap = recordTap({
        x,
        y,
        type: tapType,
        fruitId: hitFruit.id,
      })

      if (hitFruit.isTarget) {
        recordFruitDisappearance({
          fruitId: hitFruit.id,
          wasCorrectlyTapped: true,
        })
      }

      return tap
    },
    [fruitSize, recordFruitDisappearance, recordTap],
  )

  const handleCapture = useCallback(
    (path: string, timestampMs: number) => {
      const currentState = useGameStore.getState()

      if (
        currentState.status !== 'playing' ||
        !currentState.sessionId ||
        !currentState.session
      ) {
        return
      }

      const activeFruitList = Object.values(currentState.activeFruits)
      const targetFruitIds = activeFruitList
        .filter(fruit => fruit.isTarget)
        .map(fruit => fruit.id)

      if (targetFruitIds.length === 0) {
        return
      }

      recordCapture(
        buildCaptureRecordInput({
          sessionId: currentState.sessionId,
          path,
          timestampMs,
          visibleFruitIds: activeFruitList.map(fruit => fruit.id),
          targetFruitIds,
        }),
      )
    },
    [recordCapture],
  )

  const resetGame = useCallback(() => {
    endingSessionRef.current = false
    pendingFlushRef.current = false
    flushInFlightRef.current = false
    persistedCountsRef.current = {
      taps: 0,
      fruitEvents: 0,
      captures: 0,
    }
    resetGameStore()

    setLastError(null)
    setIsPersisting(false)
  }, [resetGameStore])

  useEffect(() => {
    if (status !== 'playing' || !sessionId) {
      return
    }

    const intervalId = setInterval(() => {
      flushPendingSessionData().catch(() => {})
    }, SESSION_FLUSH_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [flushPendingSessionData, sessionId, status])

  useEffect(() => {
    if (status !== 'playing' || !session) {
      return
    }

    const pendingWriteCount =
      taps.length -
      persistedCountsRef.current.taps +
      fruitEvents.length -
      persistedCountsRef.current.fruitEvents +
      captureEvents.length -
      persistedCountsRef.current.captures

    if (pendingWriteCount >= SESSION_FLUSH_BATCH_SIZE) {
      flushPendingSessionData().catch(() => {})
    }
  }, [
    captureEvents.length,
    flushPendingSessionData,
    fruitEvents.length,
    session,
    status,
    taps.length,
  ])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') {
        flushPendingSessionData().catch(() => {})
      }
    })

    return () => {
      subscription.remove()
    }
  }, [flushPendingSessionData])

  useEffect(() => {
    if (!autoStart || status !== 'idle' || !userId) {
      return
    }

    startGame(initialTargetFruit ?? getRandomFruitId()).catch(() => {})
  }, [autoStart, initialTargetFruit, startGame, status, userId])

  return {
    status,
    sessionId,
    session,
    targetFruit,
    targetFruitDefinition: getFruitById(targetFruit),
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
    spawnFruit,
    handleTap,
    handleCapture,
  }
}
