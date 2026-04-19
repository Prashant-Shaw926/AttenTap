import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {IconButton, TargetBadge} from '../../../components/common'
import type {ItemDefinition} from '../../../constants/items'
import {theme} from '../../../theme'

interface GameSidebarRailProps {
  targetItem: ItemDefinition | undefined
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
  targetItem,
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

      {targetItem ? (
        <View style={styles.targetSection}>
          <TargetBadge item={targetItem} compact tone="dark" />
          <Text style={styles.label}>Target</Text>
        </View>
      ) : (
        <View style={styles.targetSection}>
          <View accessibilityLabel="Target pending" style={styles.targetPlaceholder}>
            <Text style={styles.targetPlaceholderText}>?</Text>
          </View>
          <Text style={styles.label}>Target</Text>
        </View>
      )}

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
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.railBackground,
    borderRadius: theme.radius.pill,
  },
  actionGroup: {
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  targetPlaceholder: {
    width: theme.touch.iconButton,
    height: theme.touch.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surfaceMid,
  },
  targetPlaceholderText: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textSecondary,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.microLabel,
  },
  targetSection: {
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  sectionLabel: {
    fontSize: theme.typography.size.xxs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textOnLightMuted,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.capsTight,
  },
  itemName: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.white,
  },
})
