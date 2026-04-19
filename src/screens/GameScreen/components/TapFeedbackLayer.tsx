import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'
import Animated, {FadeOut, ZoomIn} from 'react-native-reanimated'

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
  const pulseStyle = PULSE_STYLE[type]

  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.duration(320).springify().mass(0.4)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.pulse,
        {
          left: x - PULSE_SIZE / 2,
          top: y - PULSE_SIZE / 2,
          borderColor: pulseStyle.borderColor,
          backgroundColor: pulseStyle.backgroundColor,
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
