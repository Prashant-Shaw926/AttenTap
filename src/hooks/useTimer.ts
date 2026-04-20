import {useEffect, useRef, useState} from 'react'

import {
  GAME_DURATION_MS,
  GAME_TICK_MS,
} from '../constants/gameConfig'
import type {GameStatus} from '../types/game.types'

interface UseTimerOptions {
  status: GameStatus
  startedAtMillis?: number | null
  durationMs?: number
  tickMs?: number
  onCompleted: () => void | Promise<void>
}

export const useTimer = ({
  status,
  startedAtMillis,
  durationMs = GAME_DURATION_MS,
  tickMs = GAME_TICK_MS,
  onCompleted,
}: UseTimerOptions) => {
  const [remainingTimeMs, setRemainingTimeMs] = useState(durationMs)
  const onCompletedRef = useRef(onCompleted)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  useEffect(() => {
    if (status !== 'playing' || !startedAtMillis) {
      hasCompletedRef.current = false
      setRemainingTimeMs(durationMs)
      return
    }

    hasCompletedRef.current = false

    const tick = () => {
      const elapsedMs = Date.now() - startedAtMillis
      const nextRemainingTimeMs = Math.max(0, durationMs - elapsedMs)

      setRemainingTimeMs(nextRemainingTimeMs)

      if (nextRemainingTimeMs === 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        Promise.resolve(onCompletedRef.current()).catch(() => {})
      }
    }

    tick()
    const intervalId = setInterval(tick, tickMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [durationMs, startedAtMillis, status, tickMs])

  return remainingTimeMs
}
