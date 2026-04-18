import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import type {FruitDefinition} from '../../constants/fruits'
import {theme} from '../../theme'

interface TargetBadgeProps {
  fruit: FruitDefinition | undefined
  label?: string
  compact?: boolean
  tone?: 'light' | 'dark'
}

export function TargetBadge({
  fruit,
  label = 'TARGET',
  compact = false,
  tone = 'light',
}: TargetBadgeProps) {
  if (!fruit) {
    return null
  }

  const Icon = fruit.Icon
  const isLight = tone === 'light'
  const iconSize = compact
    ? theme.layout.landscape.compactTargetIcon
    : theme.layout.landscape.regularTargetIcon

  return (
    <View
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        isLight ? styles.light : styles.dark,
      ]}
    >
      <Text style={[styles.label, isLight ? styles.labelLight : null]}>{label}</Text>
      <View style={[styles.row, compact ? styles.rowCompact : null]}>
        <Icon width={iconSize} height={iconSize} />
        {!compact ? (
          <Text style={[styles.name, isLight ? styles.nameLight : null]}>{fruit.label}</Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  regular: {
    minWidth: 152,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  compact: {
    width: theme.touch.iconButton,
    height: theme.touch.iconButton,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  light: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.borderOnLight,
  },
  dark: {
    backgroundColor: theme.colors.surfaceMid,
    borderColor: theme.colors.borderLight,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textSecondary,
  },
  labelLight: {
    color: theme.colors.textOnLightMuted,
  },
  row: {
    marginTop: theme.spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rowCompact: {
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  nameLight: {
    color: theme.colors.textOnLight,
  },
})
