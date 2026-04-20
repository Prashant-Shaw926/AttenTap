# Camera Capture Logic

AttenTap utilizes the front-facing camera to capture user reactions in real-time. This document explains the specialized "Dual-Trigger" strategy used to ensure high-quality data without compromising game performance.

## 🌡 Warm Camera Strategy

To eliminate hardware startup latency, the camera is initialized as soon as the Game Screen loads. It is kept "warm" (active but not necessarily recording) during the countdown and idle states. This ensures that the first frame can be captured the exact millisecond a target appears.

## ⚡ Dual-Trigger Capture

The `useCameraCapture` hook implements a sophisticated two-tier capture logic coordinated with the item spawning system.

### 1. Immediate Trigger (The "Spot" Shot)
As soon as the game logic detects that a **Target Item** has entered the board (`isCapturing` transition to `true`), an immediate capture is fired.
*   **Purpose**: To capture the user's initial reaction (Saccade) to the target's appearance.

### 2. Interval sampling (The "Gaze" Loop)
While a target remains visible on the board, the system enters an interval-based loop (default: **500ms**).
*   **Purpose**: To track sustained attention and gaze stability while the user is processing the target or moving to tap it.

## 🚀 Performance Considerations

Capturing high-frequency photos on a mobile device can be resource-intensive. AttenTap employs several optimizations:

*   **Speed Prioritization**: The `usePhotoOutput` is configured with `qualityPrioritization: 'speed'`. This instructs the hardware to prioritize shutter speed and quick processing over high-resolution detail.
*   **Resolution Control**: We use a quality factor of `0.65` to balance clarity with file size and processing speed.
*   **Local-First Storage**: Photos are saved directly to the device's temporary storage. Only the file path is sent to the store and eventually to Firestore. This prevents the UI thread from blocking on network uploads during gameplay.
*   **Re-entrancy Guards**: A `captureInFlightRef` ensures that we don't attempt to start a new capture if the previous one is still being processed by the camera hardware.

## 🔄 Synchronization

Captures are highly context-aware. Each capture event recorded in the store includes:
*   `visibleItemIds`: Every item currently on the screen.
*   `targetItemIds`: Specifically which of those items are targets.
*   `timestamp`: Synchronized with the game's internal clock.

This metadata allows for precise post-game analysis of what the user was looking at when the photo was taken.
