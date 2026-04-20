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


const styles = StyleSheet.create({
  base: {
    width: theme.layout.landscape.metricTileSize,
    height: theme.layout.landscape.metricTileSize,
    borderRadius: theme.layout.landscape.metricTileSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: theme.spacing.tiny,
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
    fontSize: theme.typography.size.xxs,
    fontWeight: theme.typography.weight.bold,
    letterSpacing: theme.typography.letterSpacing.capsTight,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  labelLight: {
    color: theme.colors.textOnLightMuted,
  },
  value: {
    fontSize: theme.typography.size.sm,
    lineHeight: theme.typography.size.sm * theme.typography.lineHeight.tight,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  valueLight: {
    color: theme.colors.textOnLight,
  },
})
