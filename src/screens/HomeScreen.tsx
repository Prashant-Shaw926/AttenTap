import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { FRUITS } from '../constants/fruits'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
}

const FLOATING_FRUITS = ['🍎', '🍌', '🥕', '🍇', '🍊', '🍓', '🍍', '🍉', '🍐']

const FloatingFruit: React.FC<{ emoji: string; delay: number; x: number }> = ({
  emoji,
  delay,
  x,
}) => {
  const translateY = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = () => {
      translateY.setValue(600)
      opacity.setValue(0)
      rotate.setValue(0)

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 5000 + Math.random() * 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(3500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(animate, Math.random() * 2000)
      })
    }

    const t = setTimeout(animate, delay)
    return () => clearTimeout(t)
  }, [delay, opacity, rotate, translateY])

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-20deg', '20deg'],
  })

  return (
    <Animated.Text
      style={[
        styles.floatingFruit,
        { left: x, transform: [{ translateY }, { rotate: spin }], opacity },
      ]}
    >
      {emoji}
    </Animated.Text>
  )
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const titleAnim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [buttonAnim, titleAnim])

  const handleStart = () => {
    navigation.navigate('Game', { targetFruitId: 'carrot' })
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Animated background fruits */}
      {FLOATING_FRUITS.map((emoji, i) => (
        <FloatingFruit
          key={emoji}
          emoji={emoji}
          delay={i * 600}
          x={10 + (i / FLOATING_FRUITS.length) * 80 + '%' as any}
        />
      ))}

      <View style={styles.safe}>
        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.bigEmoji}>🎯</Text>
          <Text style={styles.title}>Fruit{'\n'}Finder!</Text>
          <Text style={styles.subtitle}>
            Tap the right fruit{'\n'}as fast as you can!
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonBlock,
            {
              opacity: buttonAnim,
              transform: [
                {
                  scale: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>▶ PLAY NOW</Text>
          </TouchableOpacity>

          <View style={styles.fruitPreview}>
            {FRUITS.slice(0, 5).map(f => (
              <Text key={f.id} style={styles.previewEmoji}>
                {f.emoji}
              </Text>
            ))}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A0A2E',
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  floatingFruit: {
    position: 'absolute',
    fontSize: 36,
    zIndex: 0,
  },
  titleBlock: {
    alignItems: 'center',
    zIndex: 1,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 60,
    letterSpacing: -1,
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 26,
    fontWeight: '600',
  },
  buttonBlock: {
    alignItems: 'center',
    gap: 24,
    zIndex: 1,
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 50,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A0A2E',
    letterSpacing: 2,
  },
  fruitPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  previewEmoji: {
    fontSize: 32,
  },
})

export default HomeScreen
