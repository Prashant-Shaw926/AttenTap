
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { FRUIT_SIZE } from '../constants/gameConfig'
import { getFruitById } from '../constants/fruits'
import type { FruitInstance } from '../types/game.types'

interface FruitItemProps {
  fruit: FruitInstance
  onTap: (fruitId: string, x: number, y: number) => void
}

const FruitItem: React.FC<FruitItemProps> = ({ fruit, onTap }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  const fruitDef = getFruitById(fruit.fruitType)
  const emoji = fruitDef?.emoji ?? '🍎'

  useEffect(() => {
    // Pop-in animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacityAnim, scaleAnim])

  const handlePress = () => {
    // Shrink-out on tap
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.35,
        tension: 300,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    onTap(fruit.id, fruit.x, fruit.y)
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: fruit.x - FRUIT_SIZE / 2,
          top: fruit.y - FRUIT_SIZE / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View
          style={[
            styles.fruitBubble,
            fruit.isTarget && styles.targetBubble,
          ]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    zIndex: 10,
  },
  fruitBubble: {
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    borderRadius: FRUIT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  targetBubble: {
    borderColor: '#FFD700',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  emoji: {
    fontSize: FRUIT_SIZE * 0.52,
    lineHeight: FRUIT_SIZE * 0.65,
    textAlign: 'center',
  },
})

export default FruitItem