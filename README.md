# AttenTap

**AttenTap** is a high-performance, focus-based tapping game built with React Native. The application challenges users to maintain attention and react quickly to target items while tracking detailed interaction metrics.

## 💡 Why AttenTap?

AttenTap explores how user attention can be measured through interaction patterns and real-time signals. By combining gameplay data with camera capture, it demonstrates a foundation for attention-aware applications.

## 📱 Project Overview

AttenTap is designed to capture and analyze user attention through a dynamic game loop. Users must tap a specific target item while ignoring distractors within a timed session. The app precisely tracks every tap, item appearance, and captures synchronized camera frames to analyze user attention during gameplay.

## ✨ Key Features

*   **Real-time Gameplay**: Fast-paced item spawning with target-based tapping and time constraints.
*   **Precision Tracking**: Every tap (Correct, Incorrect, Background) is logged with high-precision timestamps.
*   **Synchronized Camera Capture**: Dual-strategy capture (Immediate on spawn + Interval during visibility) using Vision Camera v5.
*   **Batch Store-to-Cloud Sync**: Uses an in-memory buffer (Zustand) to aggregate session data, syncing to Firestore only at completion to optimize performance and battery life.
*   **Fairness Algorithms**: Implements "Hit Slop" for touch forgiveness and "Ghost Hit" buffers to handle latency edge cases.

## 🛠 Tech Stack & Decisions

### Core Frameworks
*   **React Native 0.85 (CLI)**: Chosen for maximum control over native modules (Camera, Audio).
*   **TypeScript**: Ensures type safety across the complex "Start -> Buffer -> Sync" lifecycle.

### State Management: Why Zustand v5?
We selected **Zustand** over Redux due to:
*   **Minimal Boilerplate**: Faster iteration on session event logs.
*   **Shallow State Subscription**: Components only re-render when their specific game slice updates, critical for maintaining 60FPS.
*   **Native Compatibility**: Easily accessible in non-React files for background logging.

### Hardware & Persistence
*   **Vision Camera v5**: Leverages the latest low-latency hardware APIs for "warm" camera states and rapid frame processing.
*   **Nitro Modules**: High-performance JSI-based communication between JS and Native layers.
*   **Firebase Firestore**: Handles multi-session metrics with sub-collections for `taps`, `itemEvents`, and `captures`.

## 🚀 Setup Instructions

### 1. Prerequisites
*   **Node.js**: v22.11.0 or higher
*   **Java Development Kit (JDK)**: v17+
*   **Android SDK**: API Level 34+
*   **Physical Device**: Recommended for Camera features (Vision Camera stability on emulators varies).

### 2. Firebase Configuration
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Add an Android app with package name `com.focusfruit`.
> Note: The package name remains `com.focusfruit` for Firebase configuration, while the app is branded as AttenTap.
3.  Download `google-services.json` and place it in `android/app/`.
4.  Enable **Firestore Database** in Test Mode (or apply secure rules).

### 3. Installation
```bash
# Clone the repository
git clone <repo-url>
cd AttenTap

# Install dependencies
npm install
```

### 4. Running the App
```bash
# Terminal 1: Start Metro Bundler
npx react-native start --reset-cache

# Terminal 2: Run on Android
npx react-native run-android
```

## 🧠 Assumptions & Technical Logic

### Gameplay Fairness
*   **Hit Slop**: Interactive items feature a 15-20% touch padding area to reduce frustration from close-proximity misses.
*   **Ghost Hit Buffer (250ms)**: If an item despawns exactly as a tap arrives, the system validates the hit against a buffer of recently expired items to account for human/device latency.

### Data Integrity
*   **Local-to-Cloud Pipeline**: Camera captures are stored in the temporary app directory. The local URI is persisted in Firestore; if a sync fails, data remains in the store's "retry queue."
*   **Session Lifecycle**: A session starts with a "Warm Camera" trigger to eliminate the 500-1000ms delay of hardware initialization during active gameplay.

### System Permissions
The app assumes the user will grant **Camera** and **Storage** permission at the first session start. Handling rejection is architectural (app goes into 'Restricted Mode').

## 🎥 Demo

A short demo video showcasing gameplay, tap detection, and result tracking is included in the submission folder.
---
For technical implementation details, see:
- [Architecture Documentation](docs/architecture.md)
- [Camera Logic](docs/camera.md)
- [Firestore Schema](docs/firestore.md)
- [Gameplay Mechanics](docs/gameplay.md)
