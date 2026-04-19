import {AppState} from 'react-native'
import {useCallback, useEffect, useRef, useState} from 'react'

import {
  SESSION_FLUSH_BATCH_SIZE,
  SESSION_FLUSH_INTERVAL_MS,
} from '../../constants/gameConfig'
import {
  getRandomFruitId,
} from '../../constants/fruits'
import type {
  DeviceInfo,
  GameStatus,
  SessionBundle,
  SessionDocument,
} from '../../types/game.types'
import {
  createSessionRecord,
  flushSessionUpdates,
  saveSessionBundle,
} from '../../services/session'
import {useGameStore} from '../../store/gameStore'

interface UseSessionPersistenceOptions {
  autoStart?: boolean
  captureEventsCount: number
  deviceInfo?: DeviceInfo
  fruitEventsCount: number
  onError?: (error: Error) => void
  onSessionCompleted?: (bundle: SessionBundle) => void | Promise<void>
  onSessionStarted?: (sessionId: string) => void | Promise<void>
  session: SessionDocument | null
  sessionId: string | null
  status: GameStatus
  tapsCount: number
  userId: string
}

export function useSessionPersistence({
  autoStart = false,
  captureEventsCount,
  deviceInfo,
  fruitEventsCount,
  onError,
  onSessionCompleted,
  onSessionStarted,
  session,
  sessionId,
  status,
  tapsCount,
  userId,
}: UseSessionPersistenceOptions) {
  const startSession = useGameStore(state => state.startSession)
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

  const startGame = useCallback(
    async (): Promise<string | null> => {
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
        const resolvedTargetFruit = getRandomFruitId()
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
    [deviceInfo, reportError, startSession, userId],
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
      tapsCount -
      persistedCountsRef.current.taps +
      fruitEventsCount -
      persistedCountsRef.current.fruitEvents +
      captureEventsCount -
      persistedCountsRef.current.captures

    if (pendingWriteCount >= SESSION_FLUSH_BATCH_SIZE) {
      flushPendingSessionData().catch(() => {})
    }
  }, [
    captureEventsCount,
    flushPendingSessionData,
    fruitEventsCount,
    session,
    status,
    tapsCount,
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

    startGame().catch(() => {})
  }, [autoStart, startGame, status, userId])

  return {
    endGame,
    isPersisting,
    lastError,
    resetGame,
    startGame,
  }
}
