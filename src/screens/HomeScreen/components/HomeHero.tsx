import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, SectionHeader} from '../../../components/common'
import {theme} from '../../../theme'

interface HomeHeroProps {
  onStart: () => void
}

export function HomeHero({onStart}: HomeHeroProps) {
  return (
    <View style={styles.root}>
      <SectionHeader
        eyebrow="Landscape Focus Training"
        title="Focus Fruit"
        subtitle="Spot the target fruit fast, ignore the noise, and keep your accuracy high."
      />

      <Text style={styles.display}>Focus{'\n'}Fruit</Text>

      <Button label="Play Now" onPress={onStart} style={styles.button} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    maxWidth: theme.layout.landscape.heroMaxWidth,
  },
  display: {
    fontSize: theme.typography.size.display,
    lineHeight: theme.typography.size.display,
    letterSpacing: theme.typography.letterSpacing.title,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  button: {
    alignSelf: 'flex-start',
  },
})
