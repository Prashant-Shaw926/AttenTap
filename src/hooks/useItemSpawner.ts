/**
 * Hook: useItemSpawner
 * 
 * Manages the generation and lifecycle of game items on the board.
 * Responsible for selecting spawn slots, avoiding consecutive duplicates, 
 * and handling automatic item expiration/cleanup while the game is active.
 */
import {useCallback, useEffect, useRef} from 'react'

import {
  ITEM_SPAWN_INTERVAL_MS,
  ITEM_VISIBLE_MS,
  MAX_ACTIVE_ITEMS,
} from '../constants/gameConfig'
import {
  chooseItemType,
  chooseSpawnSlot,
  createSpawnLayout,
} from '../utils/itemSpawner'
import type {
  ItemEvent,
  ItemInstance,
  GameStatus,
  RecordItemAppearanceInput,
} from '../types/game.types'

interface UseItemSpawnerOptions {
  status: GameStatus
  targetItem: string | null
  boardWidth: number
  boardHeight: number
  itemSize: number
  activeItems: ItemInstance[]
  onSpawn: (input: RecordItemAppearanceInput) => ItemEvent | null
  onExpire: (itemId: string) => void
  spawnIntervalMs?: number
  visibleMs?: number
  maxActiveItems?: number
}

interface UseItemSpawnerResult {
  spawnItem: () => ItemEvent | null
}

export const useItemSpawner = ({
  status,
  targetItem,
  boardWidth,
  boardHeight,
  itemSize,
  activeItems,
  onSpawn,
  onExpire,
  spawnIntervalMs = ITEM_SPAWN_INTERVAL_MS,
  visibleMs = ITEM_VISIBLE_MS,
  maxActiveItems = MAX_ACTIVE_ITEMS,
}: UseItemSpawnerOptions): UseItemSpawnerResult => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const itemTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const statusRef = useRef(status)
  const targetItemRef = useRef(targetItem)
  const boardWidthRef = useRef(boardWidth)
  const boardHeightRef = useRef(boardHeight)
  const itemSizeRef = useRef(itemSize)
  const activeItemsRef = useRef(activeItems)
  const onSpawnRef = useRef(onSpawn)
  const onExpireRef = useRef(onExpire)
  const lastSlotIdRef = useRef<string | null>(null)
  const lastSpawnedItemsRef = useRef<string[]>([])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    targetItemRef.current = targetItem
  }, [targetItem])

  useEffect(() => {
    boardWidthRef.current = boardWidth
    boardHeightRef.current = boardHeight
  }, [boardHeight, boardWidth])

  useEffect(() => {
    itemSizeRef.current = itemSize
  }, [itemSize])

  useEffect(() => {
    activeItemsRef.current = activeItems
  }, [activeItems])

  useEffect(() => {
    onSpawnRef.current = onSpawn
  }, [onSpawn])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const clearItemTimeout = useCallback((itemId: string) => {
    const timeout = itemTimeoutsRef.current[itemId]

    if (!timeout) {
      return
    }

    clearTimeout(timeout)
    delete itemTimeoutsRef.current[itemId]
  }, [])

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    Object.keys(itemTimeoutsRef.current).forEach(clearItemTimeout)
  }, [clearItemTimeout])

  const spawnItem = useCallback((): ItemEvent | null => {
    if (
      statusRef.current !== 'playing' ||
      !targetItemRef.current ||
      boardWidthRef.current <= 0 ||
      boardHeightRef.current <= 0
    ) {
      return null
    }

    if (activeItemsRef.current.length >= maxActiveItems) {
      return null
    }

    const layout = createSpawnLayout({
      width: boardWidthRef.current,
      height: boardHeightRef.current,
    }, itemSizeRef.current)
    const nextSlot = chooseSpawnSlot(
      layout,
      activeItemsRef.current,
      lastSlotIdRef.current,
      itemSizeRef.current,
    )

    if (!nextSlot) {
      return null
    }

    const [last1, last2] = lastSpawnedItemsRef.current
    const avoidItemId = last1 && last1 === last2 ? last1 : null

    const {itemType, isTarget} = chooseItemType(
      targetItemRef.current,
      undefined,
      avoidItemId,
    )
    const itemEvent = onSpawnRef.current({
      itemType,
      isTarget,
      slotId: nextSlot.id,
      x: nextSlot.x,
      y: nextSlot.y,
    })

    if (!itemEvent) {
      return null
    }

    lastSpawnedItemsRef.current = [itemType, last1].slice(0, 2)
    lastSlotIdRef.current = nextSlot.id
    itemTimeoutsRef.current[itemEvent.id] = setTimeout(() => {
      if (statusRef.current === 'playing') {
        onExpireRef.current(itemEvent.id)
      }
      clearItemTimeout(itemEvent.id)
    }, visibleMs)

    return itemEvent
  }, [clearItemTimeout, maxActiveItems, visibleMs])

  useEffect(() => {
    if (status !== 'playing' || boardWidth <= 0 || boardHeight <= 0) {
      clearAllTimers()
      return
    }

    spawnItem()
    intervalRef.current = setInterval(spawnItem, spawnIntervalMs)

    return () => {
      clearAllTimers()
    }
  }, [
    boardHeight,
    boardWidth,
    clearAllTimers,
    spawnItem,
    spawnIntervalMs,
    status,
  ])

  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  return {
    spawnItem,
  }
}
