# Components Code Reference

Generated on: 2026-04-18

This document includes all git-tracked files in common components and screen-specific component folders.

## src/components/common/AppScreen.tsx

```tsx
import React from 'react'
import type {StyleProp, ViewStyle} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView, type Edge} from 'react-native-safe-area-context'

import {theme} from '../../theme'

interface AppScreenProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  edges?: Edge[]
}

export function AppScreen({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
}: AppScreenProps) {
  return <SafeAreaView style={[styles.root, style]} edges={edges}>{children}</SafeAreaView>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
})
```

## src/components/common/Button.tsx

```tsx
import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'

import {theme} from '../../theme'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
  disabled?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        variantStyles[variant].button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={[styles.text, variantStyles[variant].text, textStyle]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.touch.minSize,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.black,
    letterSpacing: theme.typography.letterSpacing.button,
  },
  pressed: {
    transform: [{scale: 0.97}],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
})

const variantStyles = {
  primary: StyleSheet.create({
    button: {
      backgroundColor: theme.colors.accent,
      // ...theme.shadows.button,
    },
    text: {
      color: theme.colors.white,
    },
  }),
  secondary: StyleSheet.create({
    button: {
      borderWidth: 1.5,
      borderColor: theme.colors.borderLight,
      backgroundColor: 'transparent',
    },
    text: {
      color: theme.colors.textPrimary,
    },
  }),
  ghost: StyleSheet.create({
    button: {
      backgroundColor: theme.colors.surfaceMid,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  }),
}
```

## src/components/common/Card.tsx

```tsx
import React from 'react'
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native'

import {theme} from '../../theme'

type CardTone = 'light' | 'dark' | 'mid'

interface CardProps {
  children: React.ReactNode
  tone?: CardTone
  style?: StyleProp<ViewStyle>
}

export function Card({children, tone = 'light', style}: CardProps) {
  return <View style={[styles.base, toneStyles[tone], style]}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
})

const toneStyles = StyleSheet.create({
  light: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderOnLight,
  },
  dark: {
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  mid: {
    backgroundColor: theme.colors.surfaceMid,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
})
```

## src/components/common/EmptyState.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({title, description, action}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    lineHeight: Math.round(
      theme.typography.size.xxl * theme.typography.lineHeight.tight,
    ),
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textOnLight,
  },
  description: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textOnLightMuted,
  },
  action: {
    marginTop: theme.spacing.sm,
  },
})
```

## src/components/common/IconButton.tsx

```tsx
import React from 'react'
import {Pressable, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native'

import {theme} from '../../theme'

interface IconButtonProps {
  children: React.ReactNode
  onPress: () => void
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

export function IconButton({
  children,
  onPress,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={theme.touch.hitSlop}
      onPress={onPress}
      style={({pressed}) => [styles.button, pressed && styles.pressed, style]}
    >
      <View style={styles.content}>{children}</View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: theme.touch.iconButton,
    height: theme.touch.iconButton,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: theme.colors.accentDark,
    transform: [{scale: 0.95}],
  },
})
```

## src/components/common/MetricTile.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View, type StyleProp, type ViewStyle} from 'react-native'

import {theme} from '../../theme'

type MetricTileTone = 'dark' | 'light'

interface MetricTileProps {
  label: string
  value: string
  valueColor?: string
  tone?: MetricTileTone
  style?: StyleProp<ViewStyle>
}

export function MetricTile({
  label,
  value,
  valueColor,
  tone = 'dark',
  style,
}: MetricTileProps) {
  const isLight = tone === 'light'

  return (
    <View style={[styles.base, isLight ? styles.light : styles.dark, style]}>
      <Text style={[styles.label, isLight ? styles.labelLight : null]}>{label}</Text>
      <Text
        style={[
          styles.value,
          isLight ? styles.valueLight : null,
          valueColor ? {color: valueColor} : null,
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    minHeight: 60,
  },
  dark: {
    backgroundColor: theme.colors.surfaceMid,
  },
  light: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderOnLight,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  labelLight: {
    color: theme.colors.textOnLightMuted,
  },
  value: {
    marginTop: theme.spacing.xxs,
    fontSize: theme.typography.size.md,
    lineHeight: 20,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  valueLight: {
    color: theme.colors.textOnLight,
  },
})
```

## src/components/common/SectionHeader.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  tone = 'dark',
}: SectionHeaderProps) {
  const isLight = tone === 'light'
  const textAlign = align === 'center' ? 'center' : 'left'

  return (
    <View style={styles.root}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, isLight ? styles.eyebrowLight : null, {textAlign}]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.title, isLight ? styles.titleLight : null, {textAlign}]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isLight ? styles.subtitleLight : null, {textAlign}]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.xxs,
  },
  eyebrow: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.caps,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  eyebrowLight: {
    color: theme.colors.textOnLightMuted,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  subtitle: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textSecondary,
  },
  subtitleLight: {
    color: theme.colors.textOnLightMuted,
  },
})
```

## src/components/common/StatusBanner.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {theme} from '../../theme'

type StatusTone = 'error' | 'warning' | 'info' | 'success'

interface StatusBannerProps {
  message: string
  tone?: StatusTone
}

export function StatusBanner({message, tone = 'info'}: StatusBannerProps) {
  return (
    <View style={[styles.root, toneStyles[tone].container]}>
      <Text style={[styles.text, toneStyles[tone].text]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    textAlign: 'center',
  },
})

const toneStyles = {
  error: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.errorSoft,
      borderColor: 'rgba(244, 100, 92, 0.22)',
    },
    text: {
      color: theme.colors.error,
    },
  }),
  warning: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.warningSoft,
      borderColor: 'rgba(245, 166, 35, 0.24)',
    },
    text: {
      color: theme.colors.warning,
    },
  }),
  info: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.infoSoft,
      borderColor: 'rgba(91, 155, 245, 0.22)',
    },
    text: {
      color: theme.colors.info,
    },
  }),
  success: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.successSoft,
      borderColor: 'rgba(82, 201, 122, 0.22)',
    },
    text: {
      color: theme.colors.success,
    },
  }),
}
```

## src/components/common/TargetBadge.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import type {FruitDefinition} from '../../constants/fruits'
import {theme} from '../../theme'

interface TargetBadgeProps {
  fruit: FruitDefinition | undefined
  label?: string
  compact?: boolean
  tone?: 'light' | 'dark'
}

export function TargetBadge({
  fruit,
  label = 'TARGET',
  compact = false,
  tone = 'light',
}: TargetBadgeProps) {
  if (!fruit) {
    return null
  }

  const Icon = fruit.Icon
  const isLight = tone === 'light'
  const iconSize = compact
    ? theme.layout.landscape.compactTargetIcon
    : theme.layout.landscape.regularTargetIcon

  return (
    <View
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        isLight ? styles.light : styles.dark,
      ]}
    >
      <Text style={[styles.label, isLight ? styles.labelLight : null]}>{label}</Text>
      <View style={[styles.row, compact ? styles.rowCompact : null]}>
        <Icon width={iconSize} height={iconSize} />
        {!compact ? (
          <Text style={[styles.name, isLight ? styles.nameLight : null]}>{fruit.label}</Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  regular: {
    minWidth: 152,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  compact: {
    width: theme.layout.landscape.compactTargetWidth,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  light: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.borderOnLight,
  },
  dark: {
    backgroundColor: theme.colors.surfaceMid,
    borderColor: theme.colors.borderLight,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textSecondary,
  },
  labelLight: {
    color: theme.colors.textOnLightMuted,
  },
  row: {
    marginTop: theme.spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rowCompact: {
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  nameLight: {
    color: theme.colors.textOnLight,
  },
})
```

## src/components/common/index.ts

```ts
export * from './AppScreen'
export * from './Button'
export * from './Card'
export * from './EmptyState'
export * from './IconButton'
export * from './MetricTile'
export * from './SectionHeader'
export * from './StatusBanner'
export * from './TargetBadge'
```

## src/screens/GameScreen/components/FruitSprite.tsx

```tsx
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
```

## src/screens/GameScreen/components/GameBoard.tsx

```tsx
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
  onFruitTap: (fruitId: string, x: number, y: number) => void
  children?: React.ReactNode
}

function GameBoardComponent({
  fruits,
  fruitSize,
  feedbacks,
  onLayout,
  onBoardTap,
  onFruitTap,
  children,
}: GameBoardProps) {
  return (
    <View style={styles.frame}>
      <Pressable style={styles.board} onLayout={onLayout} onPress={onBoardTap}>
        {fruits.map(fruit => (
          <FruitSprite key={fruit.id} fruit={fruit} size={fruitSize} onTap={onFruitTap} />
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
```

## src/screens/GameScreen/components/GameCameraCapture.tsx

```tsx
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {Camera} from 'react-native-vision-camera'

import {CAMERA_CAPTURE_INTERVAL_MS} from '../../../constants/gameConfig'
import {theme} from '../../../theme'
import {useCameraCapture} from '../../../hooks/useCamera'

interface GameCameraCaptureProps {
  enabled: boolean
  onCapture: (path: string, timestampMs: number) => void
}

export function GameCameraCapture({
  enabled,
  onCapture,
}: GameCameraCaptureProps) {
  const {
    hasPermission,
    device,
    outputs,
    isActive,
    handleStarted,
    handleStopped,
    handleError,
  } = useCameraCapture({
    enabled,
    captureIntervalMs: CAMERA_CAPTURE_INTERVAL_MS,
    onCapture,
  })

  if (!hasPermission || !device) {
    return null
  }

  return (
    <View pointerEvents="none" style={styles.hidden}>
      <Camera
        style={styles.camera}
        device={device}
        outputs={outputs}
        isActive={isActive}
        onStarted={handleStarted}
        onStopped={handleStopped}
        onError={handleError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: theme.layout.landscape.capturePreviewSize,
    height: theme.layout.landscape.capturePreviewSize,
    opacity: 0,
    overflow: 'hidden',
  },
  camera: {
    width: theme.layout.landscape.capturePreviewSize,
    height: theme.layout.landscape.capturePreviewSize,
  },
})
```

## src/screens/GameScreen/components/GameErrorBanner.tsx

```tsx
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {StatusBanner} from '../../../components/common'
import {theme} from '../../../theme'

interface GameErrorBannerProps {
  message: string
}

export function GameErrorBanner({message}: GameErrorBannerProps) {
  return (
    <View style={styles.root}>
      <StatusBanner message={message} tone="error" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    zIndex: 20,
  },
})
```

## src/screens/GameScreen/components/GameHudRail.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {MetricTile} from '../../../components/common'
import {theme} from '../../../theme'
import {formatClock, formatPercent} from '../../../utils/game/formatters'

interface GameHudRailProps {
  remainingTimeMs: number
  correctTaps: number
  incorrectTaps: number
  accuracy: number
  totalTaps: number
  isPersisting: boolean
}

export function GameHudRail({
  remainingTimeMs,
  correctTaps,
  incorrectTaps,
  accuracy,
  totalTaps,
  isPersisting,
}: GameHudRailProps) {
  const isLowTime = remainingTimeMs > 0 && remainingTimeMs <= 30_000

  return (
    <View style={styles.root}>
      <MetricTile
        label="TIME"
        value={formatClock(remainingTimeMs)}
        valueColor={isLowTime ? theme.colors.timerLow : undefined}
      />
      <MetricTile label="HITS" value={String(correctTaps)} valueColor={theme.colors.success} />
      <MetricTile label="MISSES" value={String(incorrectTaps)} valueColor={theme.colors.error} />
      <MetricTile label="ACCURACY" value={formatPercent(accuracy)} />
      <MetricTile label="TAPS" value={String(totalTaps)} />
      {isPersisting ? <Text style={styles.sync}>SYNC</Text> : <View style={styles.syncSpacer} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: theme.layout.landscape.hudWidth,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.railBackground,
    borderRadius: theme.radius.xl,
  },
  sync: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.pill,
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceMid,
  },
  syncSpacer: {
    height: theme.spacing.lg,
  },
})
```

## src/screens/GameScreen/components/GameIdleOverlay.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, EmptyState} from '../../../components/common'
import {theme} from '../../../theme'

interface GameIdleOverlayProps {
  targetLabel?: string
  onStart: () => void
}

export function GameIdleOverlay({targetLabel, onStart}: GameIdleOverlayProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>Ready</Text>
      <EmptyState
        title={`Tap only\nthe ${targetLabel ?? 'target'}`}
        description="2:00 duration, fast scanning, and accurate taps."
        action={<Button label="Start Session" onPress={onStart} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.boardBackground,
    zIndex: 10,
  },
  eyebrow: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.caps,
    textTransform: 'uppercase',
    color: theme.colors.textOnLightMuted,
  },
})
```

## src/screens/GameScreen/components/GameSidebarRail.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {IconButton, TargetBadge} from '../../../components/common'
import type {FruitDefinition} from '../../../constants/fruits'
import {theme} from '../../../theme'

interface GameSidebarRailProps {
  targetFruit: FruitDefinition | undefined
  isMuted: boolean
  onHomePress: () => void
  onToggleMute: () => void
}

const HomeIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11.6 12 4l8 7.6"
      stroke={theme.colors.white}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.2 10.6V19a1 1 0 0 0 1 1H10v-4.8h4V20h1.8a1 1 0 0 0 1-1v-8.4"
      fill={theme.colors.white}
    />
  </Svg>
)

const MuteIcon = ({muted}: {muted: boolean}) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M5 10h3.4L13 6.5V17.5L8.4 14H5z" fill={theme.colors.white} />
    {muted ? (
      <Path
        d="M17 9 21 13m0 0-4 4m4-4h-8"
        stroke={theme.colors.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <Path
          d="M16 9.5c.9.8 1.4 1.8 1.4 2.8s-.5 2-1.4 2.8"
          stroke={theme.colors.white}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M18.2 7.2c1.7 1.5 2.7 3.2 2.7 5.1s-1 3.6-2.7 5"
          stroke={theme.colors.white}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    )}
  </Svg>
)

export function GameSidebarRail({
  targetFruit,
  isMuted,
  onHomePress,
  onToggleMute,
}: GameSidebarRailProps) {
  return (
    <View style={styles.root}>
      <View style={styles.actionGroup}>
        <IconButton accessibilityLabel="Go home" onPress={onHomePress}>
          <HomeIcon />
        </IconButton>
        <Text style={styles.label}>Home</Text>
      </View>

      <TargetBadge fruit={targetFruit} compact />

      <View style={styles.actionGroup}>
        <IconButton accessibilityLabel="Toggle mute" onPress={onToggleMute}>
          <MuteIcon muted={isMuted} />
        </IconButton>
        <Text style={styles.label}>{isMuted ? 'Muted' : 'Sound'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: theme.layout.landscape.sidebarWidth,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.railBackground,
    borderRadius: theme.radius.xl,
  },
  actionGroup: {
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.microLabel,
  },
})
```

## src/screens/GameScreen/components/TapFeedbackLayer.tsx

```tsx
import React, {memo, useEffect, useRef} from 'react'
import {Animated, StyleSheet, View} from 'react-native'

import {theme} from '../../../theme'

export type TapFeedbackType = 'correct' | 'incorrect' | 'background'

export interface TapFeedback {
  id: string
  x: number
  y: number
  type: TapFeedbackType
}

const PULSE_STYLE: Record<
  TapFeedbackType,
  {backgroundColor: string; borderColor: string}
> = {
  correct: {
    backgroundColor: theme.colors.successSoft,
    borderColor: theme.colors.success,
  },
  incorrect: {
    backgroundColor: theme.colors.errorSoft,
    borderColor: theme.colors.error,
  },
  background: {
    backgroundColor: theme.colors.infoSoft,
    borderColor: theme.colors.info,
  },
}

const PULSE_SIZE = theme.layout.landscape.tapPulseSize

function Pulse({x, y, type}: TapFeedback) {
  const scale = useRef(new Animated.Value(0.2)).current
  const opacity = useRef(new Animated.Value(0.75)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2.4,
        duration: 310,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 310,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  const pulseStyle = PULSE_STYLE[type]

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        {
          left: x - PULSE_SIZE / 2,
          top: y - PULSE_SIZE / 2,
          borderColor: pulseStyle.borderColor,
          backgroundColor: pulseStyle.backgroundColor,
          opacity,
          transform: [{scale}],
        },
      ]}
    />
  )
}

interface TapFeedbackLayerProps {
  feedbacks: TapFeedback[]
}

function TapFeedbackLayerComponent({feedbacks}: TapFeedbackLayerProps) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {feedbacks.map(feedback => (
        <Pulse key={feedback.id} {...feedback} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    borderWidth: 2,
  },
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
})

export const TapFeedbackLayer = memo(TapFeedbackLayerComponent)
```

## src/screens/HomeScreen/components/HomeHero.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, SectionHeader} from '../../../components/common'
import {theme} from '../../../theme'

interface HomeHeroProps {
  onStart: () => void
}

export function HomeHero({onStart}: HomeHeroProps) {
  return (
    <View style={styles.root}>
      <SectionHeader
        eyebrow="Landscape Focus Training"
        title="Focus Fruit"
        subtitle="Spot the target fruit fast, ignore the noise, and keep your accuracy high."
      />

      <Text style={styles.display}>Focus{'\n'}Fruit</Text>

      <Button label="Play Now" onPress={onStart} style={styles.button} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    maxWidth: theme.layout.landscape.heroMaxWidth,
  },
  display: {
    fontSize: theme.typography.size.display,
    lineHeight: theme.typography.size.display,
    letterSpacing: theme.typography.letterSpacing.title,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  button: {
    alignSelf: 'flex-start',
  },
})
```

## src/screens/HomeScreen/components/HomeTargetPanel.tsx

```tsx
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Card, SectionHeader, TargetBadge} from '../../../components/common'
import type {FruitDefinition} from '../../../constants/fruits'
import {theme} from '../../../theme'

interface HomeTargetPanelProps {
  fruit: FruitDefinition | undefined
}

export function HomeTargetPanel({fruit}: HomeTargetPanelProps) {
  return (
    <Card tone="mid" style={styles.card}>
      <SectionHeader
        eyebrow="Today"
        title="Target Fruit"
        subtitle="Tap only the highlighted fruit during the two minute round."
      />

      <View style={styles.badgeWrap}>
        <TargetBadge fruit={fruit} label="Today's Target" />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: theme.layout.landscape.homeTargetPanelWidth,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    ...theme.shadows.card,
  },
  badgeWrap: {
    alignItems: 'flex-start',
  },
})
```

## src/screens/ResultScreen/components/ResultStatsPanel.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Card, SectionHeader} from '../../../components/common'
import {theme} from '../../../theme'

interface StatItem {
  label: string
  value: string | number
}

interface ResultStatsPanelProps {
  stats: StatItem[]
  onPlayAgain: () => void
  onHome: () => void
}

export function ResultStatsPanel({
  stats,
  onPlayAgain,
  onHome,
}: ResultStatsPanelProps) {
  return (
    <View style={styles.root}>
      <Card style={styles.card}>
        <SectionHeader
          eyebrow="Breakdown"
          title="Session Stats"
          tone="light"
        />

        <View style={styles.rows}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.row, index === stats.length - 1 ? styles.rowLast : null]}
            >
              <Text style={styles.label}>{stat.label}</Text>
              <Text style={styles.value}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label="Play Again" onPress={onPlayAgain} style={styles.actionButton} />
        <Button
          label="Home"
          onPress={onHome}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: theme.layout.landscape.resultStatsWidth,
    gap: theme.spacing.sm,
  },
  card: {
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  rows: {
    gap: theme.spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderOnLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: theme.typography.size.base,
    color: theme.colors.textOnLightMuted,
  },
  value: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textOnLight,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
})
```

## src/screens/ResultScreen/components/ResultSummaryPanel.tsx

```tsx
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {SectionHeader} from '../../../components/common'
import type {Grade} from '../utils'
import {theme} from '../../../theme'

interface ResultSummaryPanelProps {
  accuracyLabel: string
  grade: Grade
}

export function ResultSummaryPanel({
  accuracyLabel,
  grade,
}: ResultSummaryPanelProps) {
  return (
    <View style={styles.root}>
      <SectionHeader eyebrow="Session Complete" title="Results" />

      <View style={styles.gradeRow}>
        <Text style={[styles.gradeLetter, {color: grade.color}]}>{grade.letter}</Text>
        <View style={styles.accuracyBlock}>
          <Text style={styles.accuracyValue}>{accuracyLabel}</Text>
          <Text style={styles.accuracyLabel}>accuracy</Text>
        </View>
      </View>

      <Text style={styles.message}>{grade.message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  gradeLetter: {
    fontSize: theme.typography.size.giant,
    lineHeight: theme.typography.size.giant,
    fontWeight: theme.typography.weight.black,
  },
  accuracyBlock: {
    paddingBottom: theme.spacing.sm,
  },
  accuracyValue: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  accuracyLabel: {
    marginTop: theme.spacing.xxs,
    fontSize: theme.typography.size.base,
    color: theme.colors.textSecondary,
  },
  message: {
    maxWidth: theme.layout.landscape.resultMessageWidth,
    fontSize: theme.typography.size.base,
    lineHeight: theme.typography.size.base * theme.typography.lineHeight.relaxed,
    color: theme.colors.textSecondary,
  },
})
```

