
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

interface ScoreHUDProps {
  correctTaps: number
  incorrectTaps: number
  accuracy: number
}

const ScorePill: React.FC<{
  label: string
  value: number | string
  color: string
  bump?: boolean
}> = ({ label, value, color, bump }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!bump) return
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.25,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [value, bump, scaleAnim])

  return (
    <Animated.View
      style={[
        styles.pill,
        { borderColor: color, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </Animated.View>
  )
}

const ScoreHUD: React.FC<ScoreHUDProps> = ({
  correctTaps,
  incorrectTaps,
  accuracy,
}) => {
  const prevCorrect = useRef(correctTaps)
  const prevIncorrect = useRef(incorrectTaps)

  const correctBumped = correctTaps !== prevCorrect.current
  const incorrectBumped = incorrectTaps !== prevIncorrect.current

  useEffect(() => {
    prevCorrect.current = correctTaps
  }, [correctTaps])

  useEffect(() => {
    prevIncorrect.current = incorrectTaps
  }, [incorrectTaps])

  const accuracyPct = Math.round(accuracy * 100)

  return (
    <View style={styles.container}>
      <ScorePill
        label="HIT"
        value={correctTaps}
        color="#4CAF50"
        bump={correctBumped}
      />
      <ScorePill
        label="MISS"
        value={incorrectTaps}
        color="#FF5252"
        bump={incorrectBumped}
      />
      <ScorePill
        label="ACC"
        value={`${accuracyPct}%`}
        color="#FFD700"
        bump={correctBumped || incorrectBumped}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 52,
  },
  pillValue: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  pillLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 1,
  },
})

export default ScoreHUD