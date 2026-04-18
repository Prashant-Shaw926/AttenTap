import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  tone = 'dark',
}: SectionHeaderProps) {
  const isLight = tone === 'light'
  const textAlign = align === 'center' ? 'center' : 'left'

  return (
    <View style={styles.root}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, isLight ? styles.eyebrowLight : null, {textAlign}]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.title, isLight ? styles.titleLight : null, {textAlign}]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isLight ? styles.subtitleLight : null, {textAlign}]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.xxs,
  },
  eyebrow: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.caps,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  eyebrowLight: {
    color: theme.colors.textOnLightMuted,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  subtitle: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textSecondary,
  },
  subtitleLight: {
    color: theme.colors.textOnLightMuted,
  },
})
