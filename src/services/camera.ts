import {Timestamp} from '../config/firebase'
import type {RecordCaptureInput} from '../types/game.types'

const uniqueIds = (ids: string[]): string[] => Array.from(new Set(ids)).sort()

interface BuildCaptureRecordInputParams {
  sessionId: string
  path: string
  timestampMs: number
  visibleFruitIds: string[]
  targetFruitIds: string[]
}

export const buildCaptureRecordInput = ({
  sessionId,
  path,
  timestampMs,
  visibleFruitIds,
  targetFruitIds,
}: BuildCaptureRecordInputParams): RecordCaptureInput => ({
  sessionId,
  path,
  timestamp: Timestamp.fromMillis(timestampMs),
  visibleFruitIds: uniqueIds(visibleFruitIds),
  targetFruitIds: uniqueIds(targetFruitIds),
})
