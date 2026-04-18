import React from 'react'
import type {StyleProp, ViewStyle} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView, type Edge} from 'react-native-safe-area-context'

import {theme} from '../../theme'

interface AppScreenProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  edges?: Edge[]
}

export function AppScreen({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
}: AppScreenProps) {
  return <SafeAreaView style={[styles.root, style]} edges={edges}>{children}</SafeAreaView>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
})
