/**
 * HUD - heads-up display shown during gameplay.
 * Supports both the original floating overlay and a right-side rail layout.
 */
import React, {memo} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {Colors, Typography, Spacing, Radius} from '../theme'

export const HUD_RAIL_WIDTH = 128

interface HUDProps {
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  totalTaps: number
  remainingTimeMs: number
  isPersisting?: boolean
  variant?: 'floating' | 'rail'
}

const Metric: React.FC<{
  label: string
  value: string | number
  rail?: boolean
}> = ({label, value, rail = false}) => (
  <View style={[metric.wrap, rail && metric.wrapRail]}>
    <Text style={metric.label}>{label}</Text>
    <Text style={[metric.value, rail && metric.valueRail]}>{value}</Text>
  </View>
)

const metric = StyleSheet.create({
  wrap: {
    minWidth: 58,
  },
  wrapRail: {
    minWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderOnLight,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.capsTight,
    color: Colors.textSecondary,
  },
  value: {
    marginTop: 1,
    fontSize: 20,
    fontWeight: Typography.weightBlack,
    color: Colors.textOnLight,
  },
  valueRail: {
    fontSize: Typography.lg,
  },
})

const Timer: React.FC<{remainingTimeMs: number; rail?: boolean}> = ({
  remainingTimeMs,
  rail = false,
}) => {
  const totalSec = Math.ceil(remainingTimeMs / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const label = `${min}:${String(sec).padStart(2, '0')}`
  const isLow = remainingTimeMs < 30_000

  return (
    <View style={[timer.wrap, isLow && timer.wrapLow, rail && timer.wrapRail]}>
      <Text style={[timer.label, isLow && timer.labelLow]}>TIME</Text>
      <Text style={[timer.value, isLow && timer.valueLow, rail && timer.valueRail]}>
        {label}
      </Text>
    </View>
  )
}

const timer = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderOnLight,
    minWidth: 90,
  },
  wrapRail: {
    minWidth: 0,
    width: '100%',
  },
  wrapLow: {
    borderColor: 'rgba(244, 100, 92, 0.28)',
    backgroundColor: Colors.timerLowBg,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.capsTight,
    color: Colors.textSecondary,
  },
  labelLow: {
    color: Colors.timerLow,
  },
  value: {
    marginTop: 1,
    fontSize: 22,
    fontWeight: Typography.weightBlack,
    color: Colors.textOnLight,
  },
  valueRail: {
    fontSize: 24,
  },
  valueLow: {
    color: Colors.timerLow,
  },
})

const HUDComponent: React.FC<HUDProps> = ({
  correctTaps,
  incorrectTaps,
  accuracy,
  totalTaps,
  remainingTimeMs,
  isPersisting = false,
  variant = 'floating',
}) => {
  if (variant === 'rail') {
    return (
      <View pointerEvents="none" style={styles.rootRail}>
        <Timer remainingTimeMs={remainingTimeMs} rail />

        <View style={styles.scoreRail}>
          <Metric label="HITS" value={correctTaps} rail />
          <Metric label="MISS" value={incorrectTaps} rail />
          <Metric label="ACC" value={`${Math.round(accuracy * 100)}%`} rail />
          <Metric label="TAPS" value={totalTaps} rail />
          {isPersisting && <Text style={styles.syncingRail}>SYNC</Text>}
        </View>
      </View>
    )
  }

  return (
    <View pointerEvents="none" style={styles.rootFloating}>
      <View style={styles.scoreStrip}>
        <Metric label="HITS" value={correctTaps} />
        <Metric label="MISS" value={incorrectTaps} />
        <Metric label="ACC" value={`${Math.round(accuracy * 100)}%`} />
        <Metric label="TAPS" value={totalTaps} />
        {isPersisting && <Text style={styles.syncing}>SYNC</Text>}
      </View>

      <Timer remainingTimeMs={remainingTimeMs} />
    </View>
  )
}

const styles = StyleSheet.create({
  rootFloating: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    zIndex: 20,
  },
  rootRail: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: HUD_RAIL_WIDTH,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: Colors.bgRail,
    zIndex: 20,
  },
  scoreStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderOnLight,
  },
  scoreRail: {
    gap: Spacing.sm,
  },
  syncing: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.capsTight,
    color: Colors.info,
  },
  syncingRail: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.capsTight,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceMid,
  },
})

export const HUD = memo(HUDComponent)
