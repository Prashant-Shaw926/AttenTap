import {startTransition, useCallback, useRef, useState} from 'react'

import type {TapFeedback} from '../components/TapFeedbackLayer'

const TAP_FEEDBACK_DURATION_MS = 340

export const useTapFeedbackQueue = () => {
  const [feedbacks, setFeedbacks] = useState<TapFeedback[]>([])
  const timeoutIdsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const addFeedback = useCallback((x: number, y: number, type: TapFeedback['type']) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    startTransition(() => {
      setFeedbacks(current => [...current, {id, x, y, type}])
    })

    timeoutIdsRef.current[id] = setTimeout(() => {
      startTransition(() => {
        setFeedbacks(current => current.filter(feedback => feedback.id !== id))
      })

      delete timeoutIdsRef.current[id]
    }, TAP_FEEDBACK_DURATION_MS)
  }, [])

  return {
    feedbacks,
    addFeedback,
  }
}
