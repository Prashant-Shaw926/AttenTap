/**
 * GameBoard
 * Container that renders the play area, fruit sprites, and tap feedback.
 * Thin wrapper – all logic lives in the hook layer.
 */
import React, {memo} from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import type {FruitInstance} from '../types/game.types'
import {FruitSprite} from './FruitSprite'
import type {TapFeedback} from './TapFeedbackLayer'
import {TapFeedbackLayer} from './TapFeedbackLayer'
import {Colors, Board} from '../theme'

interface GameBoardProps {
  fruits: FruitInstance[]
  fruitSize: number
  feedbacks: TapFeedback[]
  onLayout: (event: LayoutChangeEvent) => void
  onBoardTap: (event: any) => void
  onFruitTap: (fruitId: string, x: number, y: number) => void
  children?: React.ReactNode
}

const GameBoardComponent: React.FC<GameBoardProps> = ({
  fruits,
  fruitSize,
  feedbacks,
  onLayout,
  onBoardTap,
  onFruitTap,
  children,
}) => (
  <View style={styles.frame}>
    <Pressable
      style={styles.board}
      onLayout={onLayout}
      onPress={onBoardTap}
    >
      {/* Fruits */}
      {fruits.map(fruit => (
        <FruitSprite
          key={fruit.id}
          fruit={fruit}
          size={fruitSize}
          onTap={onFruitTap}
        />
      ))}

      {/* Tap ripples */}
      <TapFeedbackLayer feedbacks={feedbacks} />

      {/* HUD / overlays injected from parent */}
      {children}
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
  board: {
    flex: 1,
    borderRadius: Board.borderRadius,
    backgroundColor: Colors.bgBoard,
    overflow: 'hidden',
  },
})

export const GameBoard = memo(GameBoardComponent)
