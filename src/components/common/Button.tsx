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
