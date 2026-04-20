export const formatClock = (remainingTimeMs: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(remainingTimeMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const formatPercent = (value: number): string =>
  `${Math.round(value * 100)}%`

export const formatDurationSeconds = (
  startedAtMillis: number | null,
  endedAtMillis: number | null,
): string => {
  if (!startedAtMillis || !endedAtMillis) {
    return '0s'
  }

  return `${Math.round((endedAtMillis - startedAtMillis) / 1000)}s`
}
