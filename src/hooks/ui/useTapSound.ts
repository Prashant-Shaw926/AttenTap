import {useCallback, useEffect, useRef} from 'react'
import Sound from 'react-native-sound'

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback')

/**
 * Hook to manage tap sound feedback.
 * Preloads the sound and provides a method to play it with overlap handling.
 */
export const useTapSound = (isMuted: boolean) => {
  const soundRef = useRef<Sound | null>(null)

  useEffect(() => {
    // Load the sound from native assets ('android/app/src/main/res/raw/' or iOS bundle)
    const sound = new Sound(
      'fruit_tap_sound.wav',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.warn('Failed to load tap sound:', error)
        }
      },
    )

    soundRef.current = sound

    return () => {
      // Clean up the sound instance on unmount
      if (soundRef.current) {
        soundRef.current.release()
        soundRef.current = null
      }
    }
  }, [])

  const playTapSound = useCallback(() => {
    if (isMuted || !soundRef.current) {
      return
    }

    // prevent overlapping glitches by resetting to start before playing
    // This allows rapid taps to each trigger the sound from the beginning
    soundRef.current.setCurrentTime(0)
    soundRef.current.play((success) => {
      if (!success) {
        console.warn('Playback failed')
      }
    })
  }, [isMuted])

  return {playTapSound}
}
