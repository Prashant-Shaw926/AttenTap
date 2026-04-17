/**
 * CameraCapture
 * Invisible 1×1 camera view that fires periodic captures during gameplay.
 * No visual output – purely a capture controller.
 */
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {Camera} from 'react-native-vision-camera'

import {CAMERA_CAPTURE_INTERVAL_MS} from '../constants/gameConfig'
import {useCameraCapture} from '../hooks/useCamera'

interface CameraCaptureProps {
  enabled: boolean
  onCapture: (path: string, timestampMs: number) => void
  captureIntervalMs?: number
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  enabled,
  onCapture,
  captureIntervalMs = CAMERA_CAPTURE_INTERVAL_MS,
}) => {
  const {
    hasPermission,
    device,
    outputs,
    isActive,
    handleStarted,
    handleStopped,
    handleError,
  } = useCameraCapture({enabled, captureIntervalMs, onCapture})

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
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  camera: {
    width: 1,
    height: 1,
  },
})

export default CameraCapture