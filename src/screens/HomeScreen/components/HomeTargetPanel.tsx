import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Card, SectionHeader, TargetBadge} from '../../../components/common'
import type {FruitDefinition} from '../../../constants/fruits'
import {theme} from '../../../theme'

interface HomeTargetPanelProps {
  fruit: FruitDefinition | undefined
}

export function HomeTargetPanel({fruit}: HomeTargetPanelProps) {
  return (
    <Card tone="mid" style={styles.card}>
      <SectionHeader
        eyebrow="Today"
        title="Target Fruit"
        subtitle="Tap only the highlighted fruit during the two minute round."
      />

      <View style={styles.badgeWrap}>
        <TargetBadge fruit={fruit} label="Today's Target" />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: theme.layout.landscape.homeTargetPanelWidth,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  badgeWrap: {
    alignItems: 'flex-start',
  },
})
