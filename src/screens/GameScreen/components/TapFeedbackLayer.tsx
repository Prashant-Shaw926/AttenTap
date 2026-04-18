import React, {memo, useEffect, useRef} from 'react'
import {Animated, StyleSheet, View} from 'react-native'

import {theme} from '../../../theme'

export type TapFeedbackType = 'correct' | 'incorrect' | 'background'

export interface TapFeedback {
  id: string
  x: number
  y: number
  type: TapFeedbackType
}

const PULSE_STYLE: Record<
  TapFeedbackType,
  {backgroundColor: string; borderColor: string}
> = {
  correct: {
    backgroundColor: theme.colors.successSoft,
    borderColor: theme.colors.success,
  },
  incorrect: {
    backgroundColor: theme.colors.errorSoft,
    borderColor: theme.colors.error,
  },
  background: {
    backgroundColor: theme.colors.infoSoft,
    borderColor: theme.colors.info,
  },
}

const PULSE_SIZE = theme.layout.landscape.tapPulseSize

function Pulse({x, y, type}: TapFeedback) {
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
  }, [opacity, scale])

  const pulseStyle = PULSE_STYLE[type]

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        {
          left: x - PULSE_SIZE / 2,
          top: y - PULSE_SIZE / 2,
          borderColor: pulseStyle.borderColor,
          backgroundColor: pulseStyle.backgroundColor,
          opacity,
          transform: [{scale}],
        },
      ]}
    />
  )
}

interface TapFeedbackLayerProps {
  feedbacks: TapFeedback[]
}

function TapFeedbackLayerComponent({feedbacks}: TapFeedbackLayerProps) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {feedbacks.map(feedback => (
        <Pulse key={feedback.id} {...feedback} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    borderWidth: 2,
  },
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
})

export const TapFeedbackLayer = memo(TapFeedbackLayerComponent)
