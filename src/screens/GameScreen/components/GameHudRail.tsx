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
}

export function GameHudRail({
  remainingTimeMs,
  correctTaps,
  incorrectTaps,
  accuracy,
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
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: theme.layout.landscape.hudWidth,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: theme.spacing.xxs,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.railBackground,
    borderRadius: theme.radius.pill,
  },
})
