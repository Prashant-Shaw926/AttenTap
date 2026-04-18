import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({title, description, action}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    lineHeight: Math.round(
      theme.typography.size.xxl * theme.typography.lineHeight.tight,
    ),
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textOnLight,
  },
  description: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textOnLightMuted,
  },
  action: {
    marginTop: theme.spacing.sm,
  },
})
