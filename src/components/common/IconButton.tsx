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
