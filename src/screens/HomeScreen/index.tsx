import React from 'react'
import {StyleSheet, View, Text} from 'react-native'

import {AppScreen, Button} from '../../components/common'
import type {HomeScreenProps} from '../../navigation/types'
import {theme} from '../../theme'

const TARGET_FRUIT_ID = 'carrot'

export default function HomeScreen({navigation}: HomeScreenProps) {
  const handleStart = () => {
    navigation.navigate('Game', {targetFruitId: TARGET_FRUIT_ID})
  }

  return (
    <AppScreen>
      <View style={styles.layout}>
        <Text style={styles.title}>Focus Fruit</Text>
        <Button label="Play" onPress={handleStart} style={styles.button} />
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.size.display,
    lineHeight: theme.typography.size.display,
    letterSpacing: theme.typography.letterSpacing.title,
    fontWeight: theme.typography.weight.black,
    color: theme.colors.textPrimary,
  },
  button: {
    minWidth: 160,
  },
})
