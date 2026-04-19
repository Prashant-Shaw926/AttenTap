import {useCallback, useEffect, useRef} from 'react'

import {
  FRUIT_SPAWN_INTERVAL_MS,
  FRUIT_VISIBLE_MS,
  MAX_ACTIVE_FRUITS,
} from '../constants/gameConfig'
import {
  chooseFruitType,
  chooseSpawnSlot,
  createSpawnLayout,
} from '../utils/fruitSpawner'
import type {
  FruitEvent,
  FruitInstance,
  GameStatus,
  RecordFruitAppearanceInput,
} from '../types/game.types'

interface UseFruitSpawnerOptions {
  status: GameStatus
  targetFruit: string | null
  boardWidth: number
  boardHeight: number
  fruitSize: number
  activeFruits: FruitInstance[]
  onSpawn: (input: RecordFruitAppearanceInput) => FruitEvent | null
  onExpire: (fruitId: string) => void
  spawnIntervalMs?: number
  visibleMs?: number
  maxActiveFruits?: number
}

interface UseFruitSpawnerResult {
  spawnFruit: () => FruitEvent | null
}

export const useFruitSpawner = ({
  status,
  targetFruit,
  boardWidth,
  boardHeight,
  fruitSize,
  activeFruits,
  onSpawn,
  onExpire,
  spawnIntervalMs = FRUIT_SPAWN_INTERVAL_MS,
  visibleMs = FRUIT_VISIBLE_MS,
  maxActiveFruits = MAX_ACTIVE_FRUITS,
}: UseFruitSpawnerOptions): UseFruitSpawnerResult => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fruitTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const statusRef = useRef(status)
  const targetFruitRef = useRef(targetFruit)
  const boardWidthRef = useRef(boardWidth)
  const boardHeightRef = useRef(boardHeight)
  const fruitSizeRef = useRef(fruitSize)
  const activeFruitsRef = useRef(activeFruits)
  const onSpawnRef = useRef(onSpawn)
  const onExpireRef = useRef(onExpire)
  const lastSlotIdRef = useRef<string | null>(null)
  const lastSpawnedFruitsRef = useRef<string[]>([])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    targetFruitRef.current = targetFruit
  }, [targetFruit])

  useEffect(() => {
    boardWidthRef.current = boardWidth
    boardHeightRef.current = boardHeight
  }, [boardHeight, boardWidth])

  useEffect(() => {
    fruitSizeRef.current = fruitSize
  }, [fruitSize])

  useEffect(() => {
    activeFruitsRef.current = activeFruits
  }, [activeFruits])

  useEffect(() => {
    onSpawnRef.current = onSpawn
  }, [onSpawn])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const clearFruitTimeout = useCallback((fruitId: string) => {
    const timeout = fruitTimeoutsRef.current[fruitId]

    if (!timeout) {
      return
    }

    clearTimeout(timeout)
    delete fruitTimeoutsRef.current[fruitId]
  }, [])

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    Object.keys(fruitTimeoutsRef.current).forEach(clearFruitTimeout)
  }, [clearFruitTimeout])

  const spawnFruit = useCallback((): FruitEvent | null => {
    if (
      statusRef.current !== 'playing' ||
      !targetFruitRef.current ||
      boardWidthRef.current <= 0 ||
      boardHeightRef.current <= 0
    ) {
      return null
    }

    if (activeFruitsRef.current.length >= maxActiveFruits) {
      return null
    }

    const layout = createSpawnLayout({
      width: boardWidthRef.current,
      height: boardHeightRef.current,
    }, fruitSizeRef.current)
    const nextSlot = chooseSpawnSlot(
      layout,
      activeFruitsRef.current,
      lastSlotIdRef.current,
      fruitSizeRef.current,
    )

    if (!nextSlot) {
      return null
    }

    // Determine if we need to avoid a fruit type (if it appeared twice in a row)
    const [last1, last2] = lastSpawnedFruitsRef.current
    const avoidFruitId = last1 && last1 === last2 ? last1 : null

    const {fruitType, isTarget} = chooseFruitType(
      targetFruitRef.current,
      undefined,
      avoidFruitId,
    )
    const fruitEvent = onSpawnRef.current({
      fruitType,
      isTarget,
      slotId: nextSlot.id,
      x: nextSlot.x,
      y: nextSlot.y,
    })

    if (!fruitEvent) {
      return null
    }

    // Update history
    lastSpawnedFruitsRef.current = [fruitType, last1].slice(0, 2)
    lastSlotIdRef.current = nextSlot.id
    fruitTimeoutsRef.current[fruitEvent.id] = setTimeout(() => {
      onExpireRef.current(fruitEvent.id)
      clearFruitTimeout(fruitEvent.id)
    }, visibleMs)

    return fruitEvent
  }, [clearFruitTimeout, maxActiveFruits, visibleMs])

  useEffect(() => {
    if (status !== 'playing' || boardWidth <= 0 || boardHeight <= 0) {
      clearAllTimers()
      return
    }

    spawnFruit()
    intervalRef.current = setInterval(spawnFruit, spawnIntervalMs)

    return () => {
      clearAllTimers()
    }
  }, [
    boardHeight,
    boardWidth,
    clearAllTimers,
    spawnFruit,
    spawnIntervalMs,
    status,
  ])

  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  return {
    spawnFruit,
  }
}
