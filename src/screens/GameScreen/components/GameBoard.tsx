import React, {memo} from 'react'
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native'

import {theme} from '../../../theme'
import type {FruitInstance} from '../../../types/game.types'
import {FruitSprite} from './FruitSprite'
import type {TapFeedback} from './TapFeedbackLayer'
import {TapFeedbackLayer} from './TapFeedbackLayer'

interface GameBoardProps {
  fruits: FruitInstance[]
  fruitSize: number
  feedbacks: TapFeedback[]
  onLayout: (event: LayoutChangeEvent) => void
  onBoardTap: (event: GestureResponderEvent) => void
  children?: React.ReactNode
}

function GameBoardComponent({
  fruits,
  fruitSize,
  feedbacks,
  onLayout,
  onBoardTap,
  children,
}: GameBoardProps) {
  return (
    <View style={styles.frame}>
      <Pressable style={styles.board} onLayout={onLayout} onPress={onBoardTap}>
        {fruits.map(fruit => (
          <FruitSprite key={fruit.id} fruit={fruit} size={fruitSize} />
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
