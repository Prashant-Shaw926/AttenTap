import 'react-native-gesture-handler/jestSetup'

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  const {View} = require('react-native')
  const mock = require('react-native-safe-area-context/jest/mock')

  return {
    ...mock,
    SafeAreaProvider: ({children}: {children: unknown}) => children,
    SafeAreaView: ({children}: {children: unknown}) =>
      React.createElement(View, null, children),
  }
})

jest.mock('react-native-vision-camera', () => {
  const React = require('react')
  const {View} = require('react-native')

  return {
    Camera: ({children}: {children?: unknown}) =>
      React.createElement(View, null, children),
    useCameraDevice: jest.fn(() => ({id: 'front-device', position: 'front'})),
    useCameraPermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })),
    usePhotoOutput: jest.fn(() => ({
      capturePhotoToFile: jest.fn().mockResolvedValue({filePath: 'mock-photo-path'}),
    })),
  }
})

jest.mock('@react-native-firebase/firestore', () => {
  const firestoreInstance = {
    settings: jest.fn().mockResolvedValue(undefined),
    doc: jest.fn(() => ({
      set: jest.fn().mockResolvedValue(undefined),
    })),
    batch: jest.fn(() => ({
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    })),
  }

  const firestore = jest.fn(() => firestoreInstance)

  return {
    __esModule: true,
    default: firestore,
    FieldValue: {
      serverTimestamp: jest.fn(),
      arrayUnion: jest.fn(),
      arrayRemove: jest.fn(),
      increment: jest.fn(),
    },
    Timestamp: {
      now: () => ({
        toMillis: () => Date.now(),
      }),
      fromMillis: (value: number) => ({
        toMillis: () => value,
      }),
    },
  }
})
