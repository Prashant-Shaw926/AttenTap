
import React, { useCallback, useRef, useState } from 'react'
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'

import FruitItem from '../components/FruitItem'
import GameTimer from '../components/GameTimer'
import ScoreHUD from '../components/ScoreHUD'
import TargetBanner from '../components/TargetBanner'
import CameraCapture from '../components/CameraCapture'
import { useGame } from '../hooks/useGame'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { SessionBundle } from '../types/game.types'
import { SafeAreaView } from 'react-native-safe-area-context'

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>

interface GameScreenProps {
  navigation: GameScreenNavigationProp
  route: GameScreenRouteProp
}

const TAP_FEEDBACK_DURATION = 400

interface TapFeedback {
  id: string
  x: number
  y: number
  type: 'correct' | 'incorrect' | 'background'
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { targetFruitId = 'carrot' } = route.params ?? {}
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 })
  const [tapFeedbacks, setTapFeedbacks] = useState<TapFeedback[]>([])

  const hasTargetVisible = useRef(false)

  const handleSessionCompleted = useCallback(
    async (bundle: SessionBundle) => {
      navigation.replace('Results', { bundle })
    },
    [navigation],
  )

  const {
    status,
    visibleFruits,
    remainingTimeMs,
    correctTaps,
    incorrectTaps,
    accuracy,
    lastError,
    targetFruitDefinition,
    handleTap,
    startGame,
    resetGame,
  } = useGame({
    userId: 'demo-user',
    boardWidth: boardSize.width,
    boardHeight: boardSize.height,
    initialTargetFruit: targetFruitId,
    onSessionCompleted: handleSessionCompleted,
  })

  // Track if any target fruit is currently visible
  hasTargetVisible.current = visibleFruits.some(f => f.isTarget)

  const showTapFeedback = useCallback(
    (x: number, y: number, type: TapFeedback['type']) => {
      const id = `${Date.now()}_${Math.random()}`
      setTapFeedbacks(prev => [...prev, { id, x, y, type }])
      setTimeout(() => {
        setTapFeedbacks(prev => prev.filter(fb => fb.id !== id))
      }, TAP_FEEDBACK_DURATION)
    },
    [],
  )

  const handleBoardTap = useCallback(
    (e: GestureResponderEvent) => {
      if (status !== 'playing') return
      const { locationX, locationY } = e.nativeEvent
      const tap = handleTap(locationX, locationY)
      if (tap) {
        showTapFeedback(locationX, locationY, tap.type)
      }
    },
    [handleTap, showTapFeedback, status],
  )

  const handleFruitTap = useCallback(
    (_fruitId: string, x: number, y: number) => {
      if (status !== 'playing') return
      const tap = handleTap(x, y)
      if (tap) {
        showTapFeedback(x, y, tap.type)
      }
    },
    [handleTap, showTapFeedback, status],
  )

  const handleStart = useCallback(() => {
    startGame(targetFruitId)
  }, [startGame, targetFruitId])

  const handleReset = useCallback(() => {
    resetGame()
  }, [resetGame])

  const isIdle = status === 'idle'

  return (
    <SafeAreaView style={styles.root}>
      {/* Camera bonus feature - invisible, captures when target is visible */}
      <CameraCapture isTargetVisible={hasTargetVisible.current} />

      {/* HUD */}
      <View style={styles.hud}>
        <ScoreHUD
          correctTaps={correctTaps}
          incorrectTaps={incorrectTaps}
          accuracy={accuracy}
        />
        <TargetBanner targetFruitDef={targetFruitDefinition} />
        <GameTimer remainingTimeMs={remainingTimeMs} />
      </View>

      {/* Game board */}
      <View
        style={styles.board}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout
          setBoardSize({ width, height })
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleBoardTap}
      >
        {visibleFruits.map(fruit => (
          <FruitItem key={fruit.id} fruit={fruit} onTap={handleFruitTap} />
        ))}

        {/* Tap ripple feedbacks */}
        {tapFeedbacks.map(fb => (
          <TapRipple key={fb.id} x={fb.x} y={fb.y} type={fb.type} />
        ))}

        {/* Idle overlay */}
        {isIdle && boardSize.width > 0 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayEmoji}>🎯</Text>
            <Text style={styles.overlayTitle}>Ready?</Text>
            <Text style={styles.overlaySubtitle}>
              Tap only the {targetFruitDefinition?.emoji}{' '}
              {targetFruitDefinition?.label}!
            </Text>
            {lastError && (
              <Text style={styles.overlayErrorText}>{lastError.message}</Text>
            )}
            <TouchableOpacity
              style={styles.goButton}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <Text style={styles.goButtonText}>GO!</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Back button */}
      <View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            handleReset()
            navigation.goBack()
          }}
        >
          <Text style={styles.backButtonText}>✕ Quit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// Animated ripple shown at tap position
const TapRipple: React.FC<{ x: number; y: number; type: TapFeedback['type'] }> =
  ({ x, y, type }) => {
    const scale = useRef(new Animated.Value(0.2)).current
    const opacity = useRef(new Animated.Value(1)).current

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2.2,
          duration: TAP_FEEDBACK_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: TAP_FEEDBACK_DURATION,
          useNativeDriver: true,
        }),
      ]).start()
    }, [opacity, scale])

    const color =
      type === 'correct'
        ? '#4CAF50'
        : type === 'incorrect'
        ? '#FF5252'
        : 'rgba(255,255,255,0.3)'

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ripple,
          {
            left: x - 24,
            top: y - 24,
            borderColor: color,
            backgroundColor: `${color}22`,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    )
  }

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A0A2E',
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  board: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#2D1B4E',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,10,46,0.88)',
    gap: 12,
    zIndex: 30,
  },
  overlayEmoji: {
    fontSize: 64,
  },
  overlayTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -1,
  },
  overlaySubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
  overlayErrorText: {
    color: '#FF8A80',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
    maxWidth: 320,
  },
  goButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  goButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A0A2E',
    letterSpacing: 3,
  },
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    zIndex: 50,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
})

export default GameScreen
