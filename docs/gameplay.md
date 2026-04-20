# Gameplay Mechanics

AttenTap is a focus-assessment game designed to test reaction time and selective attention. This document details the rules, metric calculations, and the logic behind interaction handling.

## 📜 Game Rules

*   **Objective**: Tap the "Target Item" as many times as possible while avoiding distractors.
*   **Session Duration**: Fixed duration (default 30-60 seconds) per session.
*   **Item Spawning**: Multiple items appear and disappear at random intervals across a grid-based board.
*   **Target Continuity**: The target item is chosen at the start of the session and remains the same throughout.

## 🎯 Tap Classification

Every user interaction on the game board is classified into one of three categories:

| Tap Type | Condition | Result |
| :--- | :--- | :--- |
| **Correct** | Hit the Target Item | +1 Correct Tap, Item disappears immediately. |
| **Incorrect** | Hit any Distractor Item | +1 Incorrect Tap, Item disappears immediately. |
| **Background** | Hit the empty board | +1 Incorrect Tap (total count), Item remains. |

### Accuracy Calculation
Accuracy is calculated as the ratio of correct taps to the total number of taps recorded during the session:
`Accuracy = Correct Taps / (Correct + Incorrect + Background Taps)`

## 🛠 Interaction Logic

The game uses several advanced techniques to ensure tapping feels natural and fair:

### 1. Nearest Item Selection
The `getNearestItemAtPoint` utility calculates the distance between the tap coordinates (X, Y) and all active items. It uses a **Hit Slop** (extra padding) to ensure that close misses are still counted as hits, providing a more forgiving and "premium" feel.

### 2. Ghost Hit Detection
To handle the "I tapped it just as it disappeared" edge case, the system maintains a 250ms buffer of recently expired items.
*   If a tap occurs where a target item *just* was, it is counted as a **Correct** hit.
*   This prevents user frustration caused by hardware latency or animation timing.

### 3. Immediate Despawn
To prevent "double-tapping" an item before its removal state propagates, items are removed from the `activeItems` map immediately upon a successful hit.

## 🚀 Edge Cases Handled

*   **Rapid Taps**: The hit detection prevents a single tap from being registered multiple times.
*   **Overlapping Items**: The "Nearest" logic ensures the intended item is prioritized if two items are spawning close to each other.
*   **Empty Board Taps**: Background taps are intentionally penalized to discourage "spamming" the screen to find the target.
