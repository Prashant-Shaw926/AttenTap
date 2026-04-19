import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'
import Animated, {ZoomIn, ZoomOut} from 'react-native-reanimated'

import {getItemById} from '../../../constants/items'
import type {ItemInstance} from '../../../types/game.types'

interface ItemSpriteProps {
  item: ItemInstance
  size: number
}

function ItemSpriteComponent({item, size}: ItemSpriteProps) {
  const definition = getItemById(item.itemType)

  if (!definition) {
    return null
  }

  const Icon = definition.Icon

  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.duration(320).springify().damping(12).stiffness(100)}
      exiting={ZoomOut.duration(80)}
      style={[
        styles.root,
        {
          width: size,
          height: size,
          left: item.x - size / 2,
          top: item.y - size / 2,
        },
      ]}
    >
      <View style={styles.surface}>
        <Icon width={size} height={size} />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 6,
  },
  surface: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const ItemSprite = memo(ItemSpriteComponent)
