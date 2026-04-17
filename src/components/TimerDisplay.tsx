import React, {memo} from 'react'
import {StyleSheet, Text, View} from 'react-native'

interface TimerDisplayProps {
  remainingTimeMs: number
}

const TimerDisplayComponent: React.FC<TimerDisplayProps> = ({
  remainingTimeMs,
}) => {
  const remainingSeconds = Math.ceil(remainingTimeMs / 1000)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`
  const isLow = remainingTimeMs < 30_000

  return (
    <View style={[styles.container, isLow && styles.containerLow]}>
      <Text style={styles.label}>TIME</Text>
      <Text style={[styles.value, isLow && styles.valueLow]}>{timeLabel}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(132, 151, 182, 0.18)',
    minWidth: 98,
  },
  containerLow: {
    borderColor: 'rgba(205, 110, 99, 0.24)',
    backgroundColor: 'rgba(255, 245, 243, 0.96)',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#8A97AB',
  },
  value: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
    color: '#1E2633',
  },
  valueLow: {
    color: '#C26459',
  },
})

export const TimerDisplay = memo(TimerDisplayComponent)
