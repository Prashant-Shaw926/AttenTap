import React, {useMemo} from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type {StackNavigationProp} from '@react-navigation/stack'
import type {RouteProp} from '@react-navigation/native'
import {SafeAreaView} from 'react-native-safe-area-context'

import type {RootStackParamList} from '../navigation/AppNavigator'
import {Colors, Typography, Spacing, Radius, Touch, Shadows} from '../theme'

type ResultsNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>

interface ResultsScreenProps {
  navigation: ResultsNavigationProp
  route: ResultsRouteProp
}

// ── Grade helpers ─────────────────────────────────────────────────────────

interface Grade {
  letter: string
  message: string
  color: string
}

const getGrade = (accuracy: number): Grade => {
  if (accuracy >= 0.9) {
    return {letter: 'S', message: 'Near-perfect focus. Outstanding!', color: '#F5A623'}
  }
  if (accuracy >= 0.75) {
    return {letter: 'A', message: 'Strong selective attention.', color: Colors.success}
  }
  if (accuracy >= 0.6) {
    return {letter: 'B', message: 'Solid pace with a few misses.', color: Colors.info}
  }
  if (accuracy >= 0.4) {
    return {letter: 'C', message: 'Accuracy dipped — keep practising.', color: Colors.warning}
  }
  return {letter: 'D', message: 'Slow the scan down next time.', color: Colors.error}
}

// ── Stat row ─────────────────────────────────────────────────────────────

const StatRow: React.FC<{label: string; value: string | number; isLast?: boolean}> = ({
  label,
  value,
  isLast,
}) => (
  <View style={[statStyles.row, isLast && statStyles.rowLast]}>
    <Text style={statStyles.label}>{label}</Text>
    <Text style={statStyles.value}>{value}</Text>
  </View>
)

// ── Screen ────────────────────────────────────────────────────────────────

const ResultsScreen: React.FC<ResultsScreenProps> = ({navigation, route}) => {
  const {bundle} = route.params
  const {session} = bundle

  const grade = useMemo(() => getGrade(session.accuracy), [session.accuracy])

  const accuracyPct = useMemo(
    () => Math.round(session.accuracy * 100),
    [session.accuracy],
  )

  const durationSeconds = useMemo(() => {
    if (!session.endedAt || !session.startedAt) {return 0}
    return Math.round(
      (session.endedAt.toMillis() - session.startedAt.toMillis()) / 1000,
    )
  }, [session.endedAt, session.startedAt])

  const stats = useMemo(
    () => [
      {label: 'Correct taps', value: session.correctTaps},
      {label: 'Incorrect taps', value: session.incorrectTaps},
      {label: 'Total taps', value: session.totalTaps},
      {label: 'Captures', value: bundle.captures.length},
      {label: 'Fruit events', value: bundle.fruitEvents.length},
      {label: 'Duration', value: `${durationSeconds}s`},
    ],
    [session, bundle, durationSeconds],
  )

  return (
    <SafeAreaView
      style={styles.root}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <View style={styles.layout}>

        {/* ── Left: Grade summary ── */}
        <View style={styles.summaryColumn}>
          <Text style={styles.kicker}>SESSION COMPLETE</Text>

          <View style={styles.gradeRow}>
            <Text style={[styles.gradeLetter, {color: grade.color}]}>
              {grade.letter}
            </Text>

            <View style={styles.accuracyBlock}>
              <Text style={styles.accuracyText}>{accuracyPct}%</Text>
              <Text style={styles.accuracyLabel}>accuracy</Text>
            </View>
          </View>

          <Text style={styles.gradeMessage}>{grade.message}</Text>
        </View>

        {/* ── Right: Stats + actions ── */}
        <View style={styles.detailColumn}>
          <View style={styles.statsCard}>
            {stats.map((stat, i) => (
              <StatRow
                key={stat.label}
                label={stat.label}
                value={stat.value}
                isLast={i === stats.length - 1}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({pressed}) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() =>
                navigation.replace('Game', {targetFruitId: session.targetFruit})
              }
            >
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.secondaryButtonText}>Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xl,
  },

  // Summary column
  summaryColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: Spacing.lg,
  },
  kicker: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    letterSpacing: Typography.caps,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  gradeRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  gradeLetter: {
    fontSize: Typography.giant,
    fontWeight: Typography.weightBlack,
    lineHeight: Typography.giant,
  },
  accuracyBlock: {
    paddingBottom: Spacing.sm,
  },
  accuracyText: {
    fontSize: Typography.xxl,
    fontWeight: Typography.weightBlack,
    color: Colors.textPrimary,
  },
  accuracyLabel: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gradeMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.base,
    lineHeight: Typography.base * Typography.relaxed,
    color: Colors.textSecondary,
    maxWidth: 340,
  },

  // Detail column
  detailColumn: {
    flex: 1.1,
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  statsCard: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgBoard,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  // Buttons
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    ...Shadows.button,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.accentDark,
    transform: [{scale: 0.97}],
  },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.weightBlack,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  secondaryButtonPressed: {
    borderColor: Colors.accent,
  },
  secondaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
  },
})

const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderOnLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: Typography.base,
    color: Colors.textOnLightMuted,
  },
  value: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBold,
    color: Colors.textOnLight,
  },
})

export default ResultsScreen
