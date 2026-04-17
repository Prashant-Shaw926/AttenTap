import React, {memo} from 'react'
import {StyleSheet, Text, View} from 'react-native'

interface ScoreDisplayProps {
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  totalTaps: number
  isPersisting?: boolean
}

const ScoreMetric: React.FC<{label: string; value: string | number}> = ({
  label,
  value,
}) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
)

const ScoreDisplayComponent: React.FC<ScoreDisplayProps> = ({
  correctTaps,
  incorrectTaps,
  accuracy,
  totalTaps,
  isPersisting = false,
}) => (
  <View style={styles.container}>
    <ScoreMetric label="HITS" value={correctTaps} />
    <ScoreMetric label="MISSES" value={incorrectTaps} />
    <ScoreMetric label="ACCURACY" value={`${Math.round(accuracy * 100)}%`} />
    <ScoreMetric label="TAPS" value={totalTaps} />
    {isPersisting ? <Text style={styles.syncing}>Syncing</Text> : null}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(132, 151, 182, 0.18)',
  },
  metric: {
    minWidth: 66,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A97AB',
  },
  metricValue: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: '800',
    color: '#1E2633',
  },
  syncing: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#7F97BA',
  },
})

export const ScoreDisplay = memo(ScoreDisplayComponent)
