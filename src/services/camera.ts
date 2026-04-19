import {Timestamp} from '../config/firebase'
import type {RecordCaptureInput} from '../types/game.types'

const uniqueIds = (ids: string[]): string[] => Array.from(new Set(ids)).sort()

interface BuildCaptureRecordInputParams {
  sessionId: string
  path: string
  timestampMs: number
  visibleItemIds: string[]
  targetItemIds: string[]
}

export const buildCaptureRecordInput = ({
  sessionId,
  path,
  timestampMs,
  visibleItemIds,
  targetItemIds,
}: BuildCaptureRecordInputParams): RecordCaptureInput => ({
  sessionId,
  path,
  timestamp: Timestamp.fromMillis(timestampMs),
  visibleItemIds: uniqueIds(visibleItemIds),
  targetItemIds: uniqueIds(targetItemIds),
})
