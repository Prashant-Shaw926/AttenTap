/**
 * GameScreen
 * 
 * The core gameplay view. Manages high-level UI layout, integrates the camera 
 * for analysis, and coordinates the board size/scaling based on device orientation.
 */
import React, {useCallback, useMemo, useState} from 'react'
import {
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native'

import {AppScreen} from '../../components/common'
import {ITEM_SIZE} from '../../constants/gameConfig'
import {useGame} from '../../hooks/useGame'
import {useTapSound} from '../../hooks/ui/useTapSound'
import type {GameScreenProps} from '../../navigation/types'
import {theme} from '../../theme'
import type {SessionBundle} from '../../types/game.types'
import {GameBoard} from './components/GameBoard'
import {GameCameraCapture} from './components/GameCameraCapture'
import {GameErrorBanner} from './components/GameErrorBanner'
import {GameHudRail} from './components/GameHudRail'
import {GameIdleOverlay} from './components/GameIdleOverlay'
import {GameSidebarRail} from './components/GameSidebarRail'
import {useTapFeedbackQueue} from './hooks/useTapFeedbackQueue'

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

export default function GameScreen({navigation, route: _route}: GameScreenProps) {
  const [boardSize, setBoardSize] = useState({width: 0, height: 0})
  const [isMuted, setIsMuted] = useState(false)
  const {feedbacks, addFeedback} = useTapFeedbackQueue()
  const {playTapSound} = useTapSound(isMuted)

  const itemSize = useMemo(
    () =>
      clamp(
        Math.min(boardSize.width, boardSize.height) *
          theme.layout.landscape.itemScaleRatio || ITEM_SIZE,
        theme.layout.landscape.itemMinSize,
        theme.layout.landscape.itemMaxSize,
      ),
    [boardSize.height, boardSize.width],
  )

  const handleSessionCompleted = useCallback(
    async (bundle: SessionBundle) => navigation.replace('Result', {bundle}),
    [navigation],
  )

  const {
    status,
    visibleItems,
    remainingTimeMs,
    correctTaps,
    incorrectTaps,
    accuracy,
    lastError,
    targetItemDefinition,
    handleTap,
    startGame,
    resetGame,
    handleCapture,
  } = useGame({
    userId: 'demo-user',
    boardWidth: boardSize.width,
    boardHeight: boardSize.height,
    itemSize,
    onSessionCompleted: handleSessionCompleted,
  })

  const sidebarTargetItem = targetItemDefinition
  const idleOverlayTitle = "Start when you're ready"
  const idleOverlayDescription =
    'Your target item will be chosen when the round starts.'

  const hasVisibleTargetItem = useMemo(
    () => visibleItems.some(item => item.isTarget),
    [visibleItems],
  )

  const handleBoardLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout
    setBoardSize({width, height})
  }, [])

  const handleBoardTap = useCallback(
    (event: GestureResponderEvent) => {
      if (status !== 'playing') {
        return
      }

      const {locationX, locationY} = event.nativeEvent
      const tap = handleTap(locationX, locationY)

      if (tap) {
        addFeedback(locationX, locationY, tap.type)
        playTapSound()
      }
    },
    [addFeedback, handleTap, playTapSound, status],
  )

  return (
    <AppScreen>
      <GameCameraCapture
        enabled={status === 'playing'}
        isCapturing={hasVisibleTargetItem}
        onCapture={handleCapture}
      />

      <View style={styles.layout}>
        <GameSidebarRail
          targetItem={sidebarTargetItem}
          isMuted={isMuted}
          onHomePress={() => {
            resetGame()
            navigation.replace('Home')
          }}
          onToggleMute={() => setIsMuted(value => !value)}
        />

        <View style={styles.boardWrap}>
          <GameBoard
            items={visibleItems}
            itemSize={itemSize}
            feedbacks={feedbacks}
            onLayout={handleBoardLayout}
            onBoardTap={handleBoardTap}
          >
            {status === 'idle' ? (
              <GameIdleOverlay
                targetLabel={targetItemDefinition?.label?.toLowerCase()}
                title={idleOverlayTitle}
                description={idleOverlayDescription}
                onStart={() => {
                  startGame().catch(() => {})
                }}
              />
            ) : null}

            {lastError ? <GameErrorBanner message={lastError.message} /> : null}
          </GameBoard>
        </View>

        <GameHudRail
          remainingTimeMs={remainingTimeMs}
          correctTaps={correctTaps}
          incorrectTaps={incorrectTaps}
          accuracy={accuracy}
        />
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.layout.landscape.railGap,
    paddingHorizontal: theme.layout.landscape.outerPadding,
    paddingVertical: theme.layout.landscape.outerPadding,
  },
  boardWrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: theme.layout.landscape.boardBorderRadius,
    overflow: 'hidden',
  },
})
