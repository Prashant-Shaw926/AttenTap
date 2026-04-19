import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {SectionHeader} from '../../../components/common'
import type {Grade} from '../utils'
import {theme} from '../../../theme'

interface ResultSummaryPanelProps {
  accuracyLabel: string
  grade: Grade
}

export function ResultSummaryPanel({
  accuracyLabel,
  grade,
}: ResultSummaryPanelProps) {
  return (
    <View style={styles.root}>
      <SectionHeader eyebrow="Session Complete" title="Results" />

      <View style={styles.gradeRow}>
        <Text style={[styles.gradeLetter, {color: grade.color}]}>{grade.letter}</Text>
        <View style={styles.accuracyBlock}>
          <Text style={styles.accuracyValue}>{accuracyLabel}</Text>
          <Text style={styles.accuracyLabel}>accuracy</Text>
        </View>
      </View>

      <Text style={styles.message}>{grade.message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xxs,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  gradeLetter: {
    fontSize: theme.typography.size.xxl,
    lineHeight: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.black,
  },
  accuracyBlock: {
    justifyContent: 'center',
    gap: 0,
  },
  accuracyValue: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  accuracyLabel: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.microLabel,
  },
  message: {
    maxWidth: theme.layout.landscape.resultMessageWidth,
    fontSize: theme.typography.size.sm,
    lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    color: theme.colors.textSecondary,
  },
})
