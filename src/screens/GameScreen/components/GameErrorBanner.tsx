import React from 'react'
import {StyleSheet, View} from 'react-native'

import {StatusBanner} from '../../../components/common'
import {theme} from '../../../theme'

interface GameErrorBannerProps {
  message: string
}

export function GameErrorBanner({message}: GameErrorBannerProps) {
  return (
    <View style={styles.root}>
      <StatusBanner message={message} tone="error" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    zIndex: 20,
  },
})
