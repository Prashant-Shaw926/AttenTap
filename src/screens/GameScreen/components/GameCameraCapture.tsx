import React from 'react'
import {StyleSheet, View} from 'react-native'
import {Camera} from 'react-native-vision-camera'

import {CAMERA_CAPTURE_INTERVAL_MS} from '../../../constants/gameConfig'
import {theme} from '../../../theme'
import {useCameraCapture} from '../../../hooks/useCamera'

interface GameCameraCaptureProps {
  enabled: boolean
  isCapturing: boolean
  onCapture: (path: string, timestampMs: number) => void
}

export function GameCameraCapture({
  enabled,
  isCapturing,
  onCapture,
}: GameCameraCaptureProps) {
  const {
    hasPermission,
    device,
    outputs,
    isActive,
    handleStarted,
    handleStopped,
    handleError,
  } = useCameraCapture({
    enabled,
    isCapturing,
    captureIntervalMs: CAMERA_CAPTURE_INTERVAL_MS,
    onCapture,
  })

  if (!hasPermission || !device) {
    return null
  }

  return (
    <View pointerEvents="none" style={styles.hidden}>
      <Camera
        style={styles.camera}
        device={device}
        outputs={outputs}
        isActive={isActive}
        onStarted={handleStarted}
        onStopped={handleStopped}
        onError={handleError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: theme.layout.landscape.capturePreviewSize,
    height: theme.layout.landscape.capturePreviewSize,
    opacity: 0,
    overflow: 'hidden',
  },
  camera: {
    width: theme.layout.landscape.capturePreviewSize,
    height: theme.layout.landscape.capturePreviewSize,
  },
})
