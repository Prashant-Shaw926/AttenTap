import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '../../theme';

type MetricTileTone = 'dark' | 'light';

interface MetricTileProps {
  label: string;
  value: string;
  valueColor?: string;
  tone?: MetricTileTone;
  style?: StyleProp<ViewStyle>;
}

export function MetricTile({
  label,
  value,
  valueColor,
  tone = 'dark',
  style,
}: MetricTileProps) {
  const isLight = tone === 'light';

  return (
    <View style={[styles.base, isLight ? styles.light : styles.dark, style]}>
      <Text
        style={[styles.label, isLight ? styles.labelLight : null]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          isLight ? styles.valueLight : null,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const TILE_SIZE = 72

const styles = StyleSheet.create({
  base: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_SIZE / 2,  // perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    fontSize: 9,                                          // tighter than xs (10) for circle
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  labelLight: {
    color: theme.colors.textOnLightMuted,
  },
  value: {
    marginTop: 2,
    fontSize: theme.typography.size.sm,                   // 12px
    lineHeight: 14,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  valueLight: {
    color: theme.colors.textOnLight,
  },
})
