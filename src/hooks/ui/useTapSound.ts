import {useCallback, useEffect, useRef} from 'react'
import Sound from 'react-native-sound'

Sound.setCategory('Playback')

/**
 * Hook to manage tap sound feedback.
 * Preloads the sound and provides a method to play it with overlap handling.
 */
export const useTapSound = (isMuted: boolean) => {
  const soundRef = useRef<Sound | null>(null)

  useEffect(() => {
    const sound = new Sound(
      'item_tap_sound.wav',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.warn('Failed to load tap sound:', error)
        }
      },
    )

    soundRef.current = sound

    return () => {
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

    soundRef.current.setCurrentTime(0)
    soundRef.current.play((success) => {
      if (!success) {
        console.warn('Playback failed')
      }
    })
  }, [isMuted])

  return {playTapSound}
}
