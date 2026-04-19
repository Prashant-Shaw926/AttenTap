import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {AppScreen, Button} from '../../components/common'
import type {HomeScreenProps} from '../../navigation/types'
import {theme} from '../../theme'

export default function HomeScreen({navigation}: HomeScreenProps) {
  const handleStart = () => {
    navigation.navigate('Game')
  }

  return (
    <AppScreen>
      <View style={styles.layout}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Landscape Focus Training</Text>
          <Text style={styles.title}>Focus Fruit</Text>
          <Text style={styles.subtitle}>
            Spot the target fruit fast, ignore the noise, and keep your accuracy
            high.
          </Text>
          <Button
            accessibilityLabel="Play Now"
            label="Play Now"
            onPress={handleStart}
            style={styles.playButton}
          />
        </View>
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screen.horizontalPadding,
    paddingVertical: theme.layout.screen.verticalPadding,
  },
  hero: {
    maxWidth: theme.layout.landscape.heroMaxWidth,
    gap: theme.spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.caps,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: theme.typography.size.display,
    lineHeight: theme.typography.size.display,
    letterSpacing: theme.typography.letterSpacing.title,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: theme.layout.screen.subtitleMaxWidth,
    fontSize: theme.typography.size.md,
    lineHeight: Math.round(
      theme.typography.size.md * theme.typography.lineHeight.relaxed,
    ),
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  playButton: {
    minWidth: 200,
  },
})
