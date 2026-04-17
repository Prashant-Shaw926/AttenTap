/**
 * GameSidebar
 * Vertical strip pinned to the left rail.
 * Contains: home button · target indicator · mute button.
 */
import React, {memo} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import type {FruitDefinition} from '../constants/fruits'
import {TargetBadge} from './TargetBadge'
import {Colors, Radius, Touch, Shadows} from '../theme'

interface GameSidebarProps {
  targetFruit: FruitDefinition | undefined
  onHomePress: () => void
  onToggleMute: () => void
  isMuted: boolean
}

// ── Icon glyphs ──────────────────────────────────────────────────────────

const HomeIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11.6 12 4l8 7.6"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.2 10.6V19a1 1 0 0 0 1 1H10v-4.8h4V20h1.8a1 1 0 0 0 1-1v-8.4"
      fill="#FFFFFF"
    />
  </Svg>
)

const MuteIcon: React.FC<{muted: boolean}> = ({muted}) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M5 10h3.4L13 6.5V17.5L8.4 14H5z" fill="#FFFFFF" />
    {muted ? (
      <Path
        d="M17 9 21 13m0 0-4 4m4-4h-8"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <Path
          d="M16 9.5c.9.8 1.4 1.8 1.4 2.8s-.5 2-1.4 2.8"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M18.2 7.2c1.7 1.5 2.7 3.2 2.7 5.1s-1 3.6-2.7 5"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    )}
  </Svg>
)

// ── Reusable icon button ─────────────────────────────────────────────────

const IconButton: React.FC<{
  onPress: () => void
  children: React.ReactNode
}> = ({onPress, children}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
  >
    {children}
  </Pressable>
)

// ── Sidebar ───────────────────────────────────────────────────────────────

const GameSidebarComponent: React.FC<GameSidebarProps> = ({
  targetFruit,
  onHomePress,
  onToggleMute,
  isMuted,
}) => (
  <View style={styles.root}>
    <IconButton onPress={onHomePress}>
      <HomeIcon />
    </IconButton>

    <TargetBadge fruit={targetFruit} compact />

    <IconButton onPress={onToggleMute}>
      <MuteIcon muted={isMuted} />
    </IconButton>
  </View>
)

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 12,
    top: 12,
    bottom: 12,
    width: 114,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  button: {
    width: Touch.iconButton,
    height: Touch.iconButton,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    ...Shadows.button,
  },
  buttonPressed: {
    backgroundColor: Colors.accentDark,
    transform: [{scale: 0.95}],
  },
})

export const GameSidebar = memo(GameSidebarComponent)