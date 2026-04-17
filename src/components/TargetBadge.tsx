/**
 * TargetBadge
 * Displays the current target fruit with its icon and label.
 * Replaces the old TargetIndicator – fully themed.
 *
 * compact mode → used inside GameSidebar (icon only + mini label)
 * default mode → used on HomeScreen and ResultsScreen (larger layout)
 */
import React, {memo} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import type {FruitDefinition} from '../constants/fruits'
import {Colors, Typography, Spacing, Radius} from '../theme'

interface TargetBadgeProps {
  fruit: FruitDefinition | undefined
  label?: string   // optional override e.g. "Today's target"
  compact?: boolean
}

const TargetBadgeComponent: React.FC<TargetBadgeProps> = ({
  fruit,
  label,
  compact = false,
}) => {
  if (!fruit) {return null}

  const Icon = fruit.Icon
  const iconSize = compact ? 40 : 52

  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <Text style={styles.eyebrow}>{label ?? 'TARGET'}</Text>
      <View style={styles.row}>
        <Icon width={iconSize} height={iconSize} />
        {!compact && (
          <Text style={styles.fruitName}>{fruit.label}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderOnLight,
    alignItems: 'flex-start',
    minWidth: 138,
  },
  rootCompact: {
    minWidth: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.capsTight,
    color: Colors.textOnLightMuted,
  },
  row: {
    marginTop: Spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fruitName: {
    fontSize: Typography.lg,
    fontWeight: Typography.weightBold,
    color: Colors.textOnLight,
  },
})

export const TargetBadge = memo(TargetBadgeComponent)