import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Card, SectionHeader, TargetBadge} from '../../../components/common'
import type {ItemDefinition} from '../../../constants/items'
import {theme} from '../../../theme'

interface HomeTargetPanelProps {
  item: ItemDefinition | undefined
}

export function HomeTargetPanel({item}: HomeTargetPanelProps) {
  return (
    <Card tone="mid" style={styles.card}>
      <SectionHeader
        eyebrow="Today"
        title="Target Item"
        subtitle="Tap only the highlighted item during the two minute round."
      />

      <View style={styles.badgeWrap}>
        <TargetBadge item={item} label="Today's Target" />
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
