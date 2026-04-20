import React, {useMemo} from 'react'
import {StyleSheet, View} from 'react-native'

import {AppScreen} from '../../components/common'
import type {ResultScreenProps} from '../../navigation/types'
import {useGameStore} from '../../store/gameStore'
import {theme} from '../../theme'
import {formatDurationSeconds, formatPercent} from '../../utils/game/formatters'
import {ResultStatsPanel} from './components/ResultStatsPanel'
import {ResultSummaryPanel} from './components/ResultSummaryPanel'
import {getGrade} from './utils'

export default function ResultScreen({navigation, route}: ResultScreenProps) {
  const resetGame = useGameStore(state => state.resetGame)
  const {bundle} = route.params
  const {session} = bundle
  const grade = useMemo(() => getGrade(session.accuracy), [session.accuracy])
  const accuracyLabel = useMemo(() => formatPercent(session.accuracy), [session.accuracy])
  const durationLabel = useMemo(
    () =>
      formatDurationSeconds(
        session.startedAt?.toMillis() ?? null,
        session.endedAt?.toMillis() ?? null,
      ),
    [session.endedAt, session.startedAt],
  )

  const stats = useMemo(
    () => [
      {label: 'Correct taps', value: session.correctTaps},
      {label: 'Incorrect taps', value: session.incorrectTaps},
      {label: 'Total taps', value: session.totalTaps},
      {label: 'Captures', value: bundle.captures.length},
      {label: 'Item events', value: bundle.itemEvents.length},
      {label: 'Duration', value: durationLabel},
    ],
    [bundle.captures.length, bundle.itemEvents.length, durationLabel, session],
  )

  return (
    <AppScreen>
      <View style={styles.layout}>
        <ResultSummaryPanel accuracyLabel={accuracyLabel} grade={grade} />

        <ResultStatsPanel
          stats={stats}
          onPlayAgain={() => {
            resetGame()
            navigation.replace('Game')
          }}
          onHome={() => {
            resetGame()
            navigation.replace('Home')
          }}
        />
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.layout.screen.horizontalPadding,
    paddingVertical: theme.spacing.sm,
  },
})
