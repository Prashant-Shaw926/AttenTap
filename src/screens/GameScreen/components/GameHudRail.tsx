import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {MetricTile} from '../../../components/common'
import {theme} from '../../../theme'
import {formatClock, formatPercent} from '../../../utils/game/formatters'

interface GameHudRailProps {
  remainingTimeMs: number
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  totalTaps: number
  isPersisting: boolean
}

export function GameHudRail({
  remainingTimeMs,
  correctTaps,
  incorrectTaps,
  accuracy,
  totalTaps,
  isPersisting,
}: GameHudRailProps) {
  const isLowTime = remainingTimeMs > 0 && remainingTimeMs <= 30_000

  return (
    <View style={styles.root}>
      <MetricTile
        label="TIME"
        value={formatClock(remainingTimeMs)}
        valueColor={isLowTime ? theme.colors.timerLow : undefined}
      />
      <MetricTile label="HITS" value={String(correctTaps)} valueColor={theme.colors.success} />
      <MetricTile label="MISSES" value={String(incorrectTaps)} valueColor={theme.colors.error} />
      <MetricTile label="ACCURACY" value={formatPercent(accuracy)} />
      {/* <MetricTile label="TAPS" value={String(totalTaps)} /> */}
      {/* {isPersisting ? <Text style={styles.sync}>SYNC</Text> : <View style={styles.syncSpacer} />} */}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: theme.layout.landscape.hudWidth,   // 92
    flexShrink: 0,
    alignItems: 'center',                     // center circles horizontally
    justifyContent: 'space-evenly',           // distribute tiles evenly top-to-bottom
    paddingHorizontal: theme.spacing.xxs,     // 4
    paddingVertical: theme.spacing.sm,        // 12 — gives breathing room at top/bottom
    backgroundColor: theme.colors.railBackground,
    borderRadius: theme.radius.pill,
    // gap: theme.spacing.xxs,
  },
  sync: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceMid,
  },
  syncSpacer: {
    height: theme.spacing.sm,                // 12 — matches sync badge visual weight
  },
})
