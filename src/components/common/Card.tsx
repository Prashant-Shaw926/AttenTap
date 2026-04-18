import React from 'react'
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native'

import {theme} from '../../theme'

type CardTone = 'light' | 'dark' | 'mid'

interface CardProps {
  children: React.ReactNode
  tone?: CardTone
  style?: StyleProp<ViewStyle>
}

export function Card({children, tone = 'light', style}: CardProps) {
  return <View style={[styles.base, toneStyles[tone], style]}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
})

const toneStyles = StyleSheet.create({
  light: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderOnLight,
  },
  dark: {
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  mid: {
    backgroundColor: theme.colors.surfaceMid,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
})
