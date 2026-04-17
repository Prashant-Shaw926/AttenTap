import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera'

import {CAMERA_CAPTURE_INTERVAL_MS} from '../constants/gameConfig'

interface UseCameraCaptureOptions {
  enabled: boolean
  captureIntervalMs?: number
  onCapture: (path: string, timestampMs: number) => void
}

export const useCameraCapture = ({
  enabled,
  captureIntervalMs = CAMERA_CAPTURE_INTERVAL_MS,
  onCapture,
}: UseCameraCaptureOptions) => {
  const {hasPermission, requestPermission} = useCameraPermission()
  const device = useCameraDevice('front')
  const photoOutput = usePhotoOutput({
    quality: 0.65,
    qualityPrioritization: 'speed',
  })
  const outputs = useMemo(() => [photoOutput], [photoOutput])
  const [isReady, setIsReady] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const captureInFlightRef = useRef(false)
  const onCaptureRef = useRef(onCapture)

  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {})
    }
  }, [hasPermission, requestPermission])

  const capturePhoto = useCallback(async () => {
    if (!enabled || !hasPermission || !device || !isReady || captureInFlightRef.current) {
      return
    }

    captureInFlightRef.current = true

    try {
      const photo = await photoOutput.capturePhotoToFile(
        {
          enableShutterSound: false,
          flashMode: 'off',
        },
        {},
      )
      onCaptureRef.current(photo.filePath, Date.now())
    } catch {
      // Ignore capture failures to keep gameplay uninterrupted.
    } finally {
      captureInFlightRef.current = false
    }
  }, [device, enabled, hasPermission, isReady, photoOutput])

  useEffect(() => {
    if (!enabled || !hasPermission || !device || !isReady) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    capturePhoto().catch(() => {})
    intervalRef.current = setInterval(() => {
      capturePhoto().catch(() => {})
    }, captureIntervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [
    captureIntervalMs,
    capturePhoto,
    device,
    enabled,
    hasPermission,
    isReady,
  ])

  return {
    hasPermission,
    device,
    outputs,
    isActive: enabled && hasPermission && !!device,
    handleStarted: () => setIsReady(true),
    handleStopped: () => setIsReady(false),
    handleError: () => setIsReady(false),
  }
}
