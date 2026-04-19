import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../components/common'
import {theme} from '../../../theme'

interface GameIdleOverlayProps {
  targetLabel?: string
  title?: string
  description?: string
  onStart: () => void
}

export function GameIdleOverlay({
  targetLabel,
  title,
  description,
  onStart,
}: GameIdleOverlayProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>Ready</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={styles.title}>
        {title ?? `Tap only\nthe ${targetLabel ?? 'target'}`}
      </Text>
      <Text style={styles.description}>
        {description ?? '2:00 duration, fast scanning, and accurate taps.'}
      </Text>
      <View style={styles.action}>
        <Button label="Start Session" onPress={onStart} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.boardBackground,
    zIndex: 10,
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.caps,
    textTransform: 'uppercase',
    color: theme.colors.textOnLightMuted,
    textAlign: 'center',
  },
  title: {
    fontSize: theme.typography.size.xxl,
    lineHeight: Math.round(
      theme.typography.size.xxl * theme.typography.lineHeight.tight,
    ),
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textOnLight,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textOnLightMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: theme.spacing.sm,
  },
})
