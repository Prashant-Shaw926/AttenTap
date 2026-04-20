import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

type StatusTone = 'error' | 'warning' | 'info' | 'success'

interface StatusBannerProps {
  message: string
  tone?: StatusTone
}

export function StatusBanner({message, tone = 'info'}: StatusBannerProps) {
  return (
    <View style={[styles.root, toneStyles[tone].container]}>
      <Text style={[styles.text, toneStyles[tone].text]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    textAlign: 'center',
  },
})

const toneStyles = {
  error: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.errorSoft,
      borderColor: 'rgba(244, 100, 92, 0.22)',
    },
    text: {
      color: theme.colors.error,
    },
  }),
  warning: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.warningSoft,
      borderColor: 'rgba(245, 166, 35, 0.24)',
    },
    text: {
      color: theme.colors.warning,
    },
  }),
  info: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.infoSoft,
      borderColor: 'rgba(91, 155, 245, 0.22)',
    },
    text: {
      color: theme.colors.info,
    },
  }),
  success: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.successSoft,
      borderColor: 'rgba(82, 201, 122, 0.22)',
    },
    text: {
      color: theme.colors.success,
    },
  }),
}
