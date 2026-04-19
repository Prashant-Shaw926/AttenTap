import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera'

import {CAMERA_CAPTURE_INTERVAL_MS} from '../constants/gameConfig'

interface UseCameraCaptureOptions {
  enabled: boolean
  isCapturing: boolean
  captureIntervalMs?: number
  onCapture: (path: string, timestampMs: number) => void
}

export const useCameraCapture = ({
  enabled,
  isCapturing,
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
  const prevIsCapturingRef = useRef(false)
  const onCaptureRef = useRef(onCapture)
  const isCapturingRef = useRef(isCapturing)
  const enabledRef = useRef(enabled)

  // Keep refs in sync for the async capturePhoto callback
  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  useEffect(() => {
    isCapturingRef.current = isCapturing
  }, [isCapturing])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // Handle permission request
  useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {})
    }
  }, [hasPermission, requestPermission])

  const capturePhoto = useCallback(async () => {
    // Guards: Stop if not enabled, not capturing (no target), no permission, hardware not ready, or already capturing
    if (
      !enabledRef.current ||
      !isCapturingRef.current ||
      !hasPermission ||
      !device ||
      !isReady ||
      captureInFlightRef.current
    ) {
      return
    }

    captureInFlightRef.current = true

    try {
      // Re-verify enabled state inside try block to handle rapid shutdown
      if (!enabledRef.current) return

      const photo = await photoOutput.capturePhotoToFile(
        {
          enableShutterSound: false,
          flashMode: 'off',
        },
        {},
      )
      onCaptureRef.current(photo.filePath, Date.now())
    } catch (error) {
      // Ignore capture failures to keep gameplay uninterrupted
    } finally {
      captureInFlightRef.current = false
    }
  }, [device, hasPermission, isReady, photoOutput])

  // EFFECT 1: Immediate Capture on Visibility Transition (Target Appears)
  useEffect(() => {
    if (!enabled || !hasPermission || !device || !isReady) {
      prevIsCapturingRef.current = isCapturing
      return
    }

    const targetAppeared = isCapturing && !prevIsCapturingRef.current

    if (targetAppeared) {
      // Fire immediately. capturePhoto handles its own guards (inFlight etc)
      capturePhoto().catch(() => {})
    }

    prevIsCapturingRef.current = isCapturing
  }, [isCapturing, enabled, hasPermission, device, isReady, capturePhoto])

  // EFFECT 2: Stable Interval Loop (Sampling while Target is Visible)
  useEffect(() => {
    // Clear any existing interval before evaluation
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only start interval if gameplay is active AND target is visible
    if (enabled && isCapturing && hasPermission && device && isReady) {
      intervalRef.current = setInterval(() => {
        capturePhoto().catch(() => {})
      }, captureIntervalMs)
    }

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
    isCapturing,
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
