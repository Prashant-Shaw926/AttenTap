import React, {memo, useEffect, useRef} from 'react'
import {Animated, Pressable, StyleSheet, View} from 'react-native'

import {getFruitById} from '../../../constants/fruits'
import type {FruitInstance} from '../../../types/game.types'
import {theme} from '../../../theme'

interface FruitSpriteProps {
  fruit: FruitInstance
  size: number
  onTap: (fruitId: string, x: number, y: number) => void
}

function FruitSpriteComponent({fruit, size, onTap}: FruitSpriteProps) {
  const definition = getFruitById(fruit.fruitType)
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 240,
        friction: 13,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  if (!definition) {
    return null
  }

  const Icon = definition.Icon

  return (
    <Animated.View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          left: fruit.x - size / 2,
          top: fruit.y - size / 2,
          opacity,
          transform: [{scale}],
        },
      ]}
    >
      <Pressable
        hitSlop={theme.touch.hitSlop}
        onPress={() => onTap(fruit.id, fruit.x, fruit.y)}
        style={styles.pressable}
      >
        <View style={styles.surface}>
          <Icon width={size} height={size} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 6,
  },
  pressable: {
    flex: 1,
  },
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const FruitSprite = memo(FruitSpriteComponent)
