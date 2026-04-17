import React, {
  startTransition,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type {StackNavigationProp} from '@react-navigation/stack'
import type {RouteProp} from '@react-navigation/native'
import {SafeAreaView} from 'react-native-safe-area-context'

import CameraCapture from '../components/CameraCapture'
import {GameBoard} from '../components/GameBoard'
import type {TapFeedback} from '../components/TapFeedbackLayer'
import {useGame} from '../hooks/useGame'
import type {RootStackParamList} from '../navigation/AppNavigator'
import type {SessionBundle} from '../types/game.types'
import {Colors, Typography, Spacing, Radius, Touch} from '../theme'

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>

interface GameScreenProps {
  navigation: GameScreenNavigationProp
  route: GameScreenRouteProp
}

const TAP_FEEDBACK_DURATION = 340
const SIDEBAR_W = 68
const HUD_W = 76
const FRUIT_EMOJI: Record<string, string> = {
  apple: '\u{1F34E}',
  banana: '\u{1F34C}',
  carrot: '\u{1F955}',
  grapes: '\u{1F347}',
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi)

const GameScreen: React.FC<GameScreenProps> = ({navigation, route}) => {
  const {targetFruitId = 'carrot'} = route.params ?? {}

  const [boardSize, setBoardSize] = useState({width: 0, height: 0})
  const [tapFeedbacks, setTapFeedbacks] = useState<TapFeedback[]>([])
  const [isMuted, setIsMuted] = useState(false)

  const fruitSize = useMemo(
    () => clamp(Math.min(boardSize.width, boardSize.height) * 0.15 || 112, 76, 144),
    [boardSize.height, boardSize.width],
  )

  const handleSessionCompleted = useCallback(
    async (bundle: SessionBundle) => navigation.replace('Results', {bundle}),
    [navigation],
  )

  const {
    status,
    visibleFruits,
    remainingTimeMs,
    correctTaps,
    incorrectTaps,
    accuracy,
    totalTaps,
    lastError,
    targetFruitDefinition,
    handleTap,
    startGame,
    resetGame,
    handleCapture,
    isPersisting,
  } = useGame({
    userId: 'demo-user',
    boardWidth: boardSize.width,
    boardHeight: boardSize.height,
    fruitSize,
    initialTargetFruit: targetFruitId,
    onSessionCompleted: handleSessionCompleted,
  })

  const visibleTargetFruitIds = useMemo(
    () => visibleFruits.filter(f => f.isTarget).map(f => f.id),
    [visibleFruits],
  )

  const showTapFeedback = useCallback(
    (x: number, y: number, type: TapFeedback['type']) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      startTransition(() => setTapFeedbacks(prev => [...prev, {id, x, y, type}]))
      setTimeout(() => {
        startTransition(() =>
          setTapFeedbacks(prev => prev.filter(fb => fb.id !== id)),
        )
      }, TAP_FEEDBACK_DURATION)
    },
    [],
  )

  const handleBoardTap = useCallback(
    (event: any) => {
      if (status !== 'playing') {return}
      const {locationX, locationY} = event.nativeEvent
      const tap = handleTap(locationX, locationY)
      if (tap) {showTapFeedback(locationX, locationY, tap.type)}
    },
    [handleTap, showTapFeedback, status],
  )

  const handleFruitTap = useCallback(
    (_fruitId: string, x: number, y: number) => {
      if (status !== 'playing') {return}
      const tap = handleTap(x, y)
      if (tap) {showTapFeedback(x, y, tap.type)}
    },
    [handleTap, showTapFeedback, status],
  )

  const handleBoardLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout
    setBoardSize({width, height})
  }, [])

  const handleHomePress = useCallback(() => {
    resetGame()
    navigation.replace('Home')
  }, [navigation, resetGame])

  const handleToggleMute = useCallback(() => setIsMuted(v => !v), [])

  const handleStart = useCallback(() => {
    startGame(targetFruitId).catch(() => {})
  }, [startGame, targetFruitId])

  const timeLabel = useMemo(() => {
    const totalSec = Math.ceil(remainingTimeMs / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [remainingTimeMs])

  const isLowTime = remainingTimeMs > 0 && remainingTimeMs <= 30_000

  return (
    // SafeAreaView respects notch, status bar, and home indicator on all sides.
    <SafeAreaView style={styles.root} edges={['top', 'right', 'bottom', 'left']}>
      <CameraCapture
        enabled={status === 'playing' && visibleTargetFruitIds.length > 0}
        onCapture={handleCapture}
      />

      <View style={styles.row}>
        <View style={styles.sidebar}>
          <View style={styles.btnWrap}>
            <Pressable
              onPress={handleHomePress}
              hitSlop={Touch.hitSlop}
              style={({pressed}) => [styles.btn, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnIcon}>{'\u2302'}</Text>
            </Pressable>
            <Text style={styles.sidebarBtnLabel}>Home</Text>
          </View>

          <View style={styles.muteWrap}>
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Mute"
              accessibilityState={{checked: isMuted}}
              onPress={handleToggleMute}
              hitSlop={Touch.hitSlop}
              style={styles.toggleTrack}
            >
              <View style={[styles.toggleThumb, isMuted && styles.toggleThumbOn]} />
            </Pressable>
            <Text style={styles.sidebarBtnLabel}>Mute</Text>
          </View>

          <View style={styles.targetBadge}>
            <Text style={styles.targetMeta}>TARGET</Text>
            <Text style={styles.targetEmoji}>
              {FRUIT_EMOJI[targetFruitDefinition?.id ?? 'carrot'] ?? '\u{1F955}'}
            </Text>
          </View>
        </View>

        <View style={styles.boardWrap}>
          <GameBoard
            fruits={visibleFruits}
            fruitSize={fruitSize}
            feedbacks={tapFeedbacks}
            onLayout={handleBoardLayout}
            onBoardTap={handleBoardTap}
            onFruitTap={handleFruitTap}
          >
            {status === 'idle' && (
              <IdleOverlay
                targetLabel={targetFruitDefinition?.label?.toLowerCase()}
                onStart={handleStart}
              />
            )}
            {lastError && <ErrorBanner message={lastError.message} />}
          </GameBoard>
        </View>

        <View style={styles.hud}>
          <StatTile
            label="TIME"
            value={timeLabel}
            valueColor={isLowTime ? Colors.timerLow : Colors.textPrimary}
          />
          <StatTile label="HITS" value={String(correctTaps)} valueColor={Colors.success} />
          <StatTile label="MISSES" value={String(incorrectTaps)} valueColor={Colors.error} />
          <StatTile label="ACCURACY" value={`${Math.round(accuracy * 100)}%`} />
          <StatTile label="TAPS" value={String(totalTaps)} />
          {isPersisting && <View style={styles.savingDot} />}
        </View>
      </View>
    </SafeAreaView>
  )
}

const StatTile: React.FC<{label: string; value: string; valueColor?: string}> = ({
  label,
  value,
  valueColor,
}) => (
  <View style={tileS.root}>
    <Text style={tileS.label}>{label}</Text>
    <Text style={[tileS.value, valueColor ? {color: valueColor} : null]}>{value}</Text>
  </View>
)

const IdleOverlay: React.FC<{targetLabel?: string; onStart: () => void}> = ({
  targetLabel,
  onStart,
}) => (
  <View style={idleS.root}>
    <Text style={idleS.eyebrow}>READY</Text>
    <Text style={idleS.title}>
      <Text style={idleS.titleLight}>{'Tap only\nthe '}</Text>
      <Text style={idleS.accent}>{targetLabel ?? 'target'}</Text>
    </Text>
    <Text style={idleS.sub}>{'2:00 duration \u00B7 stay fast \u00B7 stay accurate'}</Text>
    <Pressable
      onPress={onStart}
      style={({pressed}) => [idleS.btn, pressed && idleS.btnPressed]}
    >
      <Text style={idleS.btnText}>Start Session</Text>
    </Pressable>
  </View>
)

const ErrorBanner: React.FC<{message: string}> = ({message}) => (
  <View style={errS.root}>
    <Text style={errS.text}>{message}</Text>
  </View>
)

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
row: {
  flex: 1,
  flexDirection: 'row',
  gap: Spacing.xs,           // ← ADD: ensure gap between sidebar and board
  paddingHorizontal: Spacing.xs, // ← ADD: small outer padding
},
sidebar: {
  width: SIDEBAR_W,          // keep explicit width
  flexShrink: 0,             // ← ADD: prevent flex from shrinking it
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: Spacing.sm,
  backgroundColor: Colors.bgRail,
  borderRadius: Radius.xl,
  zIndex: 1,                 // ← ADD: ensure it sits above nothing
},
  btnWrap: {
    alignItems: 'center',
  },
  sidebarBtnLabel: {
    fontSize: 10,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{scale: 0.95}],
  },
  btnIcon: {
    fontSize: 20,
    color: '#fff',
  },
  muteWrap: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 36,
    height: 20,
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.textSecondary,
  },
  toggleThumbOn: {
    backgroundColor: Colors.accent,
    alignSelf: 'flex-end',
  },
  targetBadge: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    width: 52,
  },
  targetMeta: {
    fontSize: 8,
    fontWeight: Typography.weightBold,
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  targetEmoji: {
    fontSize: 26,
  },
boardWrap: {
  flex: 1,
  minWidth: 0,               // ← ADD: critical — prevents flex child overflow
  borderRadius: Radius.xl,
  overflow: 'hidden',        // ← keep
},
hud: {
  width: HUD_W,
  backgroundColor: Colors.bgRail,
  borderRadius: Radius.xl,
  paddingHorizontal: 6,
    paddingVertical: Spacing.xs,
    gap: 6,
    justifyContent: 'space-evenly',
  },
  savingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
    alignSelf: 'center',
  },
})

const tileS = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 8,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginBottom: 1,
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
})

const idleS = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.bgBoard,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    zIndex: 10,
  },
  eyebrow: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.caps,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 40,
    fontWeight: Typography.weightBlack,
    lineHeight: 46,
    color: Colors.textOnLight,
  },
  titleLight: {
    fontWeight: Typography.weightRegular,
  },
  accent: {
    color: Colors.accent,
  },
  sub: {
    fontSize: Typography.base,
    color: Colors.textOnLightMuted,
  },
  btn: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    minHeight: Touch.minSize,
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: Colors.accentDark,
    transform: [{scale: 0.97}],
  },
  btnText: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBlack,
    color: '#fff',
    letterSpacing: 0.3,
  },
})

const errS = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(244,100,92,0.22)',
    zIndex: 30,
  },
  text: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
    color: Colors.error,
    textAlign: 'center',
  },
})

export default GameScreen
