import {theme} from '../../theme'

export interface Grade {
  letter: string
  message: string
  color: string
}

export const getGrade = (accuracy: number): Grade => {
  if (accuracy >= 0.9) {
    return {
      letter: 'S',
      message: 'Near-perfect focus. Outstanding!',
      color: theme.colors.warning,
    }
  }

  if (accuracy >= 0.75) {
    return {
      letter: 'A',
      message: 'Strong selective attention.',
      color: theme.colors.success,
    }
  }

  if (accuracy >= 0.6) {
    return {
      letter: 'B',
      message: 'Solid pace with a few misses.',
      color: theme.colors.info,
    }
  }

  if (accuracy >= 0.4) {
    return {
      letter: 'C',
      message: 'Accuracy dipped. Keep practising.',
      color: theme.colors.warning,
    }
  }

  return {
    letter: 'D',
    message: 'Slow the scan down next time.',
    color: theme.colors.error,
  }
}
