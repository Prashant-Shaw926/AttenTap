import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Card, SectionHeader} from '../../../components/common'
import {theme} from '../../../theme'

interface StatItem {
  label: string
  value: string | number
}

interface ResultStatsPanelProps {
  stats: StatItem[]
  onPlayAgain: () => void
  onHome: () => void
}

export function ResultStatsPanel({
  stats,
  onPlayAgain,
  onHome,
}: ResultStatsPanelProps) {
  return (
    <View style={styles.root}>
      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Breakdown"
          title="Session Stats"
          tone="light"
        />

        <View style={styles.rows}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.row, index === stats.length - 1 ? styles.rowLast : null]}
            >
              <Text style={styles.label}>{stat.label}</Text>
              <Text style={styles.value}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="Play Again" onPress={onPlayAgain} style={styles.actionButton} />
        <Button
          label="Home"
          onPress={onHome}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: theme.layout.landscape.resultStatsWidth,
    gap: theme.spacing.xs,
  },
  card: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.card,
  },
  rows: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderOnLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textOnLightMuted,
  },
  value: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textOnLight,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
})
