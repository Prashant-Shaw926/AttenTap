import {buildCaptureRecordInput} from '../src/services/camera'
import {buildSessionWrites} from '../src/services/session'

const makeTimestamp = (value: number) =>
  ({
    toMillis: () => value,
  }) as any

describe('session helpers', () => {
  test('builds sorted capture records', () => {
    const capture = buildCaptureRecordInput({
      sessionId: 'session-1',
      path: 'capture.jpg',
      timestampMs: 3_000,
      visibleFruitIds: ['fruit-2', 'fruit-1', 'fruit-2'],
      targetFruitIds: ['fruit-1', 'fruit-1'],
    })

    expect(capture.visibleFruitIds).toEqual(['fruit-1', 'fruit-2'])
    expect(capture.targetFruitIds).toEqual(['fruit-1'])
    expect(capture.timestamp?.toMillis()).toBe(3_000)
  })

  test('serializes session bundle writes for firestore', () => {
    const session = {
      userId: 'user-1',
      startedAt: makeTimestamp(1_000),
      endedAt: makeTimestamp(9_000),
      targetFruit: 'carrot',
      totalTaps: 2,
      correctTaps: 1,
      incorrectTaps: 1,
      accuracy: 0.5,
      deviceInfo: {os: 'ios', version: '17'},
    }

    const writes = buildSessionWrites({
      sessionId: 'session-1',
      session,
      taps: [
        {
          id: 'tap-1',
          x: 40,
          y: 50,
          type: 'correct',
          timestamp: makeTimestamp(1_500),
          fruitId: 'fruit-1',
        },
      ],
      fruitEvents: [
        {
          id: 'fruit-1',
          fruitType: 'carrot',
          isTarget: true,
          slotId: 'slot-1',
          x: 40,
          y: 50,
          appearedAt: makeTimestamp(1_200),
          disappearedAt: makeTimestamp(1_800),
          wasCorrectlyTapped: true,
        },
      ],
      captures: [
        {
          id: 'capture-1',
          sessionId: 'session-1',
          path: 'capture.jpg',
          timestamp: makeTimestamp(1_700),
          visibleFruitIds: ['fruit-1'],
          targetFruitIds: ['fruit-1'],
        },
      ],
    })

    expect(writes).toHaveLength(4)
    expect(writes[0]).toMatchObject({
      path: 'sessions/session-1',
      merge: true,
      data: session,
    })
    expect(writes[1]?.path).toBe('sessions/session-1/taps/tap-1')
    expect(writes[2]?.path).toBe('sessions/session-1/fruitEvents/fruit-1')
    expect(writes[3]?.path).toBe('sessions/session-1/captures/capture-1')
  })
})
