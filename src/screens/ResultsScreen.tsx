
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'

import { getFruitById } from '../constants/fruits'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'

type ResultsNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>

interface ResultsScreenProps {
  navigation: ResultsNavigationProp
  route: ResultsRouteProp
}

interface StatCardProps {
  label: string
  value: string | number
  color: string
  delay: number
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      tension: 140,
      friction: 8,
      delay,
      useNativeDriver: true,
    }).start()
  }, [anim, delay])

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          borderColor: color,
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  )
}

const getGrade = (accuracy: number): { letter: string; message: string; color: string } => {
  if (accuracy >= 0.9) return { letter: 'S', message: 'Perfect! 🌟', color: '#FFD700' }
  if (accuracy >= 0.75) return { letter: 'A', message: 'Amazing! 🎉', color: '#4CAF50' }
  if (accuracy >= 0.6) return { letter: 'B', message: 'Great job! 👍', color: '#2196F3' }
  if (accuracy >= 0.4) return { letter: 'C', message: 'Good try! 🙂', color: '#FF9800' }
  return { letter: 'D', message: 'Keep going! 💪', color: '#FF5252' }
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { bundle } = route.params
  const { session, sessionId } = bundle

  const headerAnim = useRef(new Animated.Value(0)).current
  const gradeAnim = useRef(new Animated.Value(0)).current

  const accuracyPct = Math.round(session.accuracy * 100)
  const grade = getGrade(session.accuracy)
  const targetFruitDef = getFruitById(session.targetFruit)

  // Duration
  const durationMs = session.endedAt && session.startedAt
    ? session.endedAt.toMillis() - session.startedAt.toMillis()
    : 0
  const durationSecs = Math.round(durationMs / 1000)

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(gradeAnim, {
        toValue: 1,
        tension: 130,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [gradeAnim, headerAnim])

  const handlePlayAgain = () => {
    navigation.replace('Game', { targetFruitId: session.targetFruit })
  }

  const handleHome = () => {
    navigation.navigate('Home')
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.emoji}>{targetFruitDef?.emoji ?? '🎯'}</Text>
            <Text style={styles.title}>Game Over!</Text>
            <Text style={styles.subtitle}>{grade.message}</Text>
          </Animated.View>

          {/* Grade circle */}
          <Animated.View
            style={[
              styles.gradeCircle,
              {
                borderColor: grade.color,
                transform: [{ scale: gradeAnim }],
                opacity: gradeAnim,
              },
            ]}
          >
            <Text style={[styles.gradeLetter, { color: grade.color }]}>
              {grade.letter}
            </Text>
            <Text style={styles.gradeAccuracy}>{accuracyPct}%</Text>
          </Animated.View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard
              label="CORRECT"
              value={session.correctTaps}
              color="#4CAF50"
              delay={300}
            />
            <StatCard
              label="MISSED"
              value={session.incorrectTaps}
              color="#FF5252"
              delay={400}
            />
            <StatCard
              label="TOTAL TAPS"
              value={session.totalTaps}
              color="#2196F3"
              delay={500}
            />
            <StatCard
              label="DURATION"
              value={`${durationSecs}s`}
              color="#FF9800"
              delay={600}
            />
          </View>

          {/* Session ID */}
          <Text style={styles.sessionId}>Session · {sessionId.slice(-8)}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={handlePlayAgain}
              activeOpacity={0.85}
            >
              <Text style={styles.playAgainText}>▶ Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleHome}
              activeOpacity={0.85}
            >
              <Text style={styles.homeButtonText}>🏠 Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A0A2E',
  },
  safe: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  gradeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: {
    fontSize: 60,
    fontWeight: '900',
    lineHeight: 68,
  },
  gradeAccuracy: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  statCard: {
    width: '44%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  sessionId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actions: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A0A2E',
    letterSpacing: 1.5,
  },
  homeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
})

export default ResultsScreen
