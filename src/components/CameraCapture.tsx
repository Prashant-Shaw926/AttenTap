import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

interface CameraCaptureProps {
  /** Whether the target fruit is currently visible on screen */
  isTargetVisible: boolean;
  /** Called with base64 image data each capture */
  onCapture?: (base64: string, timestamp: number) => void;
  captureIntervalMs?: number;
}

const CAPTURE_INTERVAL_MS = 500;

/**
 * Invisible front-camera capture component.
 * Mounts a minimal camera view and captures a frame every 500ms
 * whenever `isTargetVisible` is true.
 */
const CameraCapture: React.FC<CameraCaptureProps> = ({
  isTargetVisible,
  onCapture,
  captureIntervalMs = CAPTURE_INTERVAL_MS,
}) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
const cameraRef = useRef<Camera>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const captureFrame = async () => {
    if (!cameraRef.current || !isReady) return;
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        skipMetadata: true,
      });
      onCapture?.(photo.path, Date.now());
    } catch {
      // Silently swallow capture errors — game must not be disrupted
    }
  };

  useEffect(() => {
    if (isTargetVisible && hasPermission && device && isReady) {
      captureFrame();
      intervalRef.current = setInterval(captureFrame, captureIntervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTargetVisible, hasPermission, isReady, captureIntervalMs]);

  if (!hasPermission || !device) {
    return null;
  }

  return (
    <View style={styles.hidden}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isTargetVisible}
        onStarted={() => setIsReady(true)}
        onStopped={() => setIsReady(false)}
        onError={() => setIsReady(false)}
      />
    </View>
  );
};

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
});

export default CameraCapture;
