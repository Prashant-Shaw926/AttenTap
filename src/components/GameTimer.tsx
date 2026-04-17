
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { GAME_DURATION_MS } from '../constants/gameConfig'

interface GameTimerProps {
  remainingTimeMs: number
}

const SIZE = 72
const STROKE = 5
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const GameTimer: React.FC<GameTimerProps> = ({ remainingTimeMs }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progress = remainingTimeMs / GAME_DURATION_MS
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const remainingSeconds = Math.ceil(remainingTimeMs / 1000)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`

  const isLow = remainingTimeMs < 30_000

  useEffect(() => {
    if (!isLow) return

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [isLow, pulseAnim])

  const ringColor = isLow ? '#FF4444' : progress > 0.5 ? '#4CAF50' : '#FF9800'

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background ring */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={STROKE}
          fill="transparent"
        />
        {/* Progress ring */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.timeText, isLow && styles.timeTextLow]}>
          {timeLabel}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeTextLow: {
    color: '#FF4444',
  },
})

export default GameTimer