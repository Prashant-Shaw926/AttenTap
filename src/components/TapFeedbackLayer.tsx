/**
 * TapFeedbackLayer
 * Renders animated ripple pulses at tap locations.
 * Kept light: CSS-style fade + scale via Animated API.
 */
import React, {memo, useEffect, useRef} from 'react'
import {Animated, StyleSheet, View} from 'react-native'
import {Colors} from '../theme'

export type TapFeedbackType = 'correct' | 'incorrect' | 'background'

export interface TapFeedback {
  id: string
  x: number
  y: number
  type: TapFeedbackType
}

// ── Color map (stable reference, no re-alloc per render) ─────────────────

const PULSE_COLOR: Record<TapFeedbackType, string> = {
  correct: Colors.success,
  incorrect: Colors.error,
  background: 'rgba(91, 155, 245, 0.22)',
}

const PULSE_SIZE = 50

// ── Single ripple ─────────────────────────────────────────────────────────

const Pulse: React.FC<TapFeedback> = ({x, y, type}) => {
  const scale = useRef(new Animated.Value(0.2)).current
  const opacity = useRef(new Animated.Value(0.75)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2.4,
        duration: 310,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 310,
        useNativeDriver: true,
      }),
    ]).start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const color = PULSE_COLOR[type]

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        {
          left: x - PULSE_SIZE / 2,
          top: y - PULSE_SIZE / 2,
          borderColor: color,
          backgroundColor: `${color}28`,
          opacity,
          transform: [{scale}],
        },
      ]}
    />
  )
}

// ── Layer ─────────────────────────────────────────────────────────────────

interface TapFeedbackLayerProps {
  feedbacks: TapFeedback[]
}

const TapFeedbackLayerComponent: React.FC<TapFeedbackLayerProps> = ({
  feedbacks,
}) => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {feedbacks.map(fb => (
      <Pulse key={fb.id} {...fb} />
    ))}
  </View>
)

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    borderWidth: 2,
  },
})

export const TapFeedbackLayer = memo(TapFeedbackLayerComponent)