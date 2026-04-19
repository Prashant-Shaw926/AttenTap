import React, {memo} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import Animated, {ZoomIn, ZoomOut} from 'react-native-reanimated'

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

  if (!definition) {
    return null
  }

  const Icon = definition.Icon

  return (
    <Animated.View
      entering={ZoomIn.duration(320).springify().damping(12).stiffness(100)}
      exiting={ZoomOut.duration(80)}
      style={[
        styles.root,
        {
          width: size,
          height: size,
          left: fruit.x - size / 2,
          top: fruit.y - size / 2,
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
