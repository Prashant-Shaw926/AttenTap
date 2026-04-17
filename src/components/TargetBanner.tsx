
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

import type { FruitDefinition } from '../constants/fruits'

interface TargetBannerProps {
  targetFruitDef: FruitDefinition | undefined
}

const TargetBanner: React.FC<TargetBannerProps> = ({ targetFruitDef }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    // Bounce in
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 180,
      friction: 7,
      useNativeDriver: true,
    }).start()

    // Pulsing glow on the emoji
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )
    glow.start()
    return () => glow.stop()
  }, [bounceAnim, glowAnim])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
          opacity: bounceAnim,
        },
      ]}
    >
      <Text style={styles.instructionText}>TAP THE</Text>
      <View style={styles.fruitRow}>
        <Animated.Text style={[styles.emoji, { opacity: glowAnim }]}>
          {targetFruitDef?.emoji ?? '❓'}
        </Animated.Text>
        <Text style={styles.fruitName}>
          {targetFruitDef?.label?.toUpperCase() ?? '???'}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.6)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  instructionText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  fruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 28,
  },
  fruitName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
})

export default TargetBanner