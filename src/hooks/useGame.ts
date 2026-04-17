import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  FRUIT_HIT_SLOP,
  FRUIT_SIZE,
  FRUIT_SPAWN_INTERVAL_MS,
  FRUIT_VISIBLE_MS,
  GAME_DURATION_MS,
  GAME_TICK_MS,
  MAX_ACTIVE_FRUITS,
} from '../constants/gameConfig'
import {
  DEFAULT_TARGET_FRUIT_ID,
  getFruitById,
  getRandomFruitId,
  isKnownFruit,
} from '../constants/fruits'
import {saveSessionBundle, createSessionRecord} from '../services/session'
import {
  selectActiveFruits,
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
import {createFruitSpawnPosition, chooseFruitType} from '../utils/fruitSpawner'
import {getNearestFruitAtPoint} from '../utils/geometry'

export interface UseGameOptions {
  userId: string
  boardWidth: number
  boardHeight: number
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
  const sessionId = useGameStore(state => state.sessionId)

  const startSession = useGameStore(state => state.startSession)
  const recordTap = useGameStore(state => state.recordTap)
  const recordFruitDisappearance = useGameStore(
    state => state.recordFruitDisappearance,
  )
  const resetGameStore = useGameStore(state => state.resetGame)

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  )
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fruitTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const endingSessionRef = useRef(false)

  const [remainingTimeMs, setRemainingTimeMs] = useState(GAME_DURATION_MS)
  const [isPersisting, setIsPersisting] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const targetFruit = session?.targetFruit ?? getTargetFruitId(initialTargetFruit)
  const visibleFruits = Object.values(activeFruits)

  const clearFruitTimeout = useCallback((fruitId: string) => {
    const timeout = fruitTimeoutsRef.current[fruitId]

    if (!timeout) {
      return
    }

    clearTimeout(timeout)
    delete fruitTimeoutsRef.current[fruitId]
  }, [])

  const clearAllTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
      spawnIntervalRef.current = null
    }

    Object.keys(fruitTimeoutsRef.current).forEach(clearFruitTimeout)
  }, [clearFruitTimeout])

  const reportError = useCallback(
    (error: unknown) => {
      const normalizedError =
        error instanceof Error ? error : new Error('Unexpected game error.')

      setLastError(normalizedError)
      setIsPersisting(false)

      onError?.(normalizedError)
    },
    [onError],
  )

  const persistSessionStart = useCallback(
    async (nextSessionId: string) => {
      const currentSession = useGameStore.getState().session

      if (!currentSession) {
        return
      }

      try {
        await createSessionRecord(nextSessionId, currentSession)
        await onSessionStarted?.(nextSessionId)
      } catch (error) {
        reportError(error)
      }
    },
    [onSessionStarted, reportError],
  )

  const persistSessionBundle = useCallback(
    async (bundle: SessionBundle) => {
      setIsPersisting(true)
      setLastError(null)

      try {
        await saveSessionBundle(bundle)
        await onSessionCompleted?.(bundle)
      } catch (error) {
        reportError(error)
      } finally {
        setIsPersisting(false)
      }
    },
    [onSessionCompleted, reportError],
  )

  const spawnFruit = useCallback((): FruitEvent | null => {
    const currentState = useGameStore.getState()

    if (
      currentState.status !== 'playing' ||
      !currentState.session ||
      boardWidth <= 0 ||
      boardHeight <= 0
    ) {
      return null
    }

    if (Object.keys(currentState.activeFruits).length >= MAX_ACTIVE_FRUITS) {
      return null
    }

    const {fruitType, isTarget} = chooseFruitType(
      currentState.session.targetFruit,
    )
    const position = createFruitSpawnPosition(
      {width: boardWidth, height: boardHeight},
      Object.values(currentState.activeFruits),
      FRUIT_SIZE,
    )
    const fruitEvent = currentState.recordFruitAppearance({
      fruitType,
      isTarget,
      x: position.x,
      y: position.y,
    })

    if (!fruitEvent) {
      return null
    }

    fruitTimeoutsRef.current[fruitEvent.id] = setTimeout(() => {
      useGameStore.getState().recordFruitDisappearance({
        fruitId: fruitEvent.id,
      })
      clearFruitTimeout(fruitEvent.id)
    }, FRUIT_VISIBLE_MS)

    return fruitEvent
  }, [boardHeight, boardWidth, clearFruitTimeout])

  const endGame = useCallback(async (): Promise<SessionBundle | null> => {
    if (endingSessionRef.current) {
      return null
    }

    const currentState = useGameStore.getState()

    if (!currentState.sessionId || !currentState.session) {
      return null
    }

    endingSessionRef.current = true
    clearAllTimers()

    try {
      const bundle = currentState.endSession()

      if (!bundle) {
        return null
      }

      await persistSessionBundle(bundle)
      return bundle
    } finally {
      endingSessionRef.current = false
    }
  }, [clearAllTimers, persistSessionBundle])

  const startGame = useCallback(
    async (targetFruitId?: string): Promise<string | null> => {
      if (!userId) {
        reportError(new Error('A userId is required to start a game session.'))
        return null
      }

      try {
        clearAllTimers()
        setRemainingTimeMs(GAME_DURATION_MS)
        setLastError(null)
        setIsPersisting(false)

        const resolvedTargetFruit = getTargetFruitId(
          targetFruitId ?? initialTargetFruit,
        )
        const nextSessionId = startSession({
          userId,
          targetFruit: resolvedTargetFruit,
          deviceInfo,
        })

        await persistSessionStart(nextSessionId)
        return nextSessionId
      } catch (error) {
        reportError(error)
        return null
      }
    },
    [
      clearAllTimers,
      deviceInfo,
      initialTargetFruit,
      persistSessionStart,
      reportError,
      startSession,
      userId,
    ],
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
        FRUIT_SIZE,
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
        clearFruitTimeout(hitFruit.id)
        recordFruitDisappearance({
          fruitId: hitFruit.id,
          wasCorrectlyTapped: true,
        })
      }

      return tap
    },
    [clearFruitTimeout, recordFruitDisappearance, recordTap],
  )

  const resetGame = useCallback(() => {
    clearAllTimers()
    endingSessionRef.current = false
    resetGameStore()

    setRemainingTimeMs(GAME_DURATION_MS)
    setLastError(null)
    setIsPersisting(false)
  }, [clearAllTimers, resetGameStore])

  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  useEffect(() => {
    if (status !== 'playing' || !session) {
      return
    }

    const tick = () => {
      const elapsedMs = Date.now() - session.startedAt.toMillis()
      const nextRemainingTimeMs = Math.max(0, GAME_DURATION_MS - elapsedMs)

      setRemainingTimeMs(nextRemainingTimeMs)

      if (nextRemainingTimeMs === 0) {
        clearAllTimers()
        endGame().catch(reportError)
      }
    }

    tick()
    countdownIntervalRef.current = setInterval(tick, GAME_TICK_MS)

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [clearAllTimers, endGame, reportError, session, status])

  useEffect(() => {
    if (status !== 'playing' || boardWidth <= 0 || boardHeight <= 0) {
      return
    }

    spawnFruit()
    spawnIntervalRef.current = setInterval(spawnFruit, FRUIT_SPAWN_INTERVAL_MS)

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
        spawnIntervalRef.current = null
      }
    }
  }, [boardHeight, boardWidth, spawnFruit, status])

  useEffect(() => {
    if (!autoStart || status !== 'idle' || !userId) {
      return
    }

    const autoStartGame = async () => {
      const requestedTargetFruit = initialTargetFruit ?? getRandomFruitId()
      await startGame(requestedTargetFruit)
    }

    autoStartGame().catch(reportError)
  }, [autoStart, initialTargetFruit, reportError, startGame, status, userId])

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
  }
}
