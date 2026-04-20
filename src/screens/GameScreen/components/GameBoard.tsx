import React, {memo} from 'react'
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native'

import {theme} from '../../../theme'
import type {ItemInstance} from '../../../types/game.types'
import {ItemSprite} from './ItemSprite'
import type {TapFeedback} from './TapFeedbackLayer'
import {TapFeedbackLayer} from './TapFeedbackLayer'

interface GameBoardProps {
  items: ItemInstance[]
  itemSize: number
  feedbacks: TapFeedback[]
  onLayout: (event: LayoutChangeEvent) => void
  onBoardTap: (event: GestureResponderEvent) => void
  children?: React.ReactNode
}

function GameBoardComponent({
  items,
  itemSize,
  feedbacks,
  onLayout,
  onBoardTap,
  children,
}: GameBoardProps) {
  return (
    <View style={styles.frame}>
      <Pressable style={styles.board} onLayout={onLayout} onPress={onBoardTap}>
        {items.map(item => (
          <ItemSprite key={item.id} item={item} size={itemSize} />
        ))}

        <TapFeedbackLayer feedbacks={feedbacks} />
        {children}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
  board: {
    flex: 1,
    borderRadius: theme.layout.landscape.boardBorderRadius,
    backgroundColor: theme.colors.boardBackground,
    overflow: 'hidden',
  },
})

export const GameBoard = memo(GameBoardComponent)
