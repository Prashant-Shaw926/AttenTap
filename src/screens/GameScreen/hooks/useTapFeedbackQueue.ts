import {useCallback, useEffect, useRef, useState} from 'react'
import uuid from 'react-native-uuid'

import type {TapFeedback} from '../components/TapFeedbackLayer'

const TAP_FEEDBACK_DURATION_MS = 1000 // Keep in state longer to allow for exiting animations

export const useTapFeedbackQueue = () => {
  const [feedbacks, setFeedbacks] = useState<TapFeedback[]>([])
  const timeoutIdsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutIdsRef.current
    return () => {
      Object.values(currentTimeouts).forEach(clearTimeout)
    }
  }, [])

  const addFeedback = useCallback((x: number, y: number, type: TapFeedback['type']) => {
    const id = uuid.v4() as string
    setFeedbacks(current => [...current, {id, x, y, type}])

    timeoutIdsRef.current[id] = setTimeout(() => {
      setFeedbacks(current => current.filter(feedback => feedback.id !== id))
      delete timeoutIdsRef.current[id]
    }, TAP_FEEDBACK_DURATION_MS)
  }, [])

  return {
    feedbacks,
    addFeedback,
  }
}
