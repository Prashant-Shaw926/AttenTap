import React from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import type {StackNavigationProp} from '@react-navigation/stack'

import {getFruitById} from '../constants/fruits'
import type {RootStackParamList} from '../navigation/AppNavigator'
import {Colors, Typography, Spacing, Radius, Shadows, Touch} from '../theme'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

const TARGET_FRUIT_ID = 'carrot'

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const targetFruit = getFruitById(TARGET_FRUIT_ID)
  const Icon = targetFruit?.Icon

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>

        <Text style={styles.title}>{'Focus\nFruit'}</Text>

        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Game', {targetFruitId: TARGET_FRUIT_ID})}
        >
          <Text style={styles.buttonText}>Play Now ›</Text>
        </Pressable>

        {targetFruit && Icon && (
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>TODAY'S TARGET</Text>
            <View style={styles.targetRow}>
              <Icon width={36} height={36} />
              <Text style={styles.targetName}>{targetFruit.label}</Text>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },

  title: {
    fontSize: Typography.display,
    fontWeight: Typography.weightBlack,
    letterSpacing: -2.5,
    lineHeight: Typography.display,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    minHeight: Touch.minSize,
    justifyContent: 'center',
    ...Shadows.button,
  },
  buttonPressed: {
    backgroundColor: Colors.accentDark,
    transform: [{scale: 0.97}],
  },
  buttonText: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBlack,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  targetCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceMid,
  },
  targetLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.caps,
    color: Colors.textSecondary,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  targetName: {
    fontSize: Typography.lg,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
  },
})

export default HomeScreen