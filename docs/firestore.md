# Firestore Data Schema

AttenTap uses Firebase Firestore to persist session data and interaction events. To ensure scalability and avoid document size limits, the data is organized into a hierarchical structure of collections and subcollections.

## 📁 Collection Structure

Every gameplay session is represented by a unique document in the `sessions` collection. Granular event data is stored in subcollections beneath that session.

```text
sessions/
  └── {sessionId}/           (Main session metadata)
        ├── taps/            (Subcollection: every screen tap)
        ├── itemEvents/      (Subcollection: item spawning/despawning)
        └── captures/        (Subcollection: camera trigger logs)
```

## 📄 Schema Definitions

### 1. Sessions Collection
Contains high-level summary and device metadata.

```json
{
  "userId": "user_123",
  "targetItem": "apple",
  "startedAt": "Timestamp",
  "endedAt": "Timestamp",
  "totalTaps": 15,
  "correctTaps": 10,
  "incorrectTaps": 5,
  "accuracy": 0.67,
  "deviceInfo": {
    "os": "android",
    "version": "33"
  }
}
```

### 2. Taps Subcollection
Logs every individual tap, even if it hit nothing.

```json
{
  "x": 145.5,
  "y": 420.2,
  "type": "correct | incorrect | background",
  "timestamp": "Timestamp",
  "itemId": "item_abc_123" (null for background)
}
```

### 3. ItemEvents Subcollection
Tracks the lifecycle of every item that appeared on the board.

```json
{
  "itemType": "apple | banana | etc",
  "isTarget": true,
  "x": 100,
  "y": 200,
  "appearedAt": "Timestamp",
  "disappearedAt": "Timestamp",
  "wasCorrectlyTapped": true
}
```

### 4. Captures Subcollection
Logs when the camera was triggered and the context of the screen at that moment.

```json
{
  "path": "file:///path/to/local/photo.jpg",
  "timestamp": "Timestamp",
  "visibleItemIds": ["item_1", "item_2"],
  "targetItemIds": ["item_1"]
}
```

## ⚡ Performance Optimizations

### Atomic Batch Writes
To ensure data integrity and minimize network overhead, all documents (Session + Taps + Events + Captures) are written using **Firestore Batches** at the end of the session.
*   This ensures that either the entire session is saved or nothing is, preventing "partial sessions" in the database.
*   By buffering data in the Zustand store during gameplay, we avoid expensive database calls while the game is running, maintaining a smooth 60FPS.

### Subcollection Rationale
Storing taps and events in subcollections rather than arrays within the session document is critical because:
1.  **Document Size**: Firestore has a 1MB limit per document. High-frequency tapping or long sessions would easily exceed this if using arrays.
2.  **Querying**: Subcollections allow for more complex analysis, such as querying all "correct" taps across all sessions for a specific user.
