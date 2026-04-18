import {getGrade} from '../src/screens/ResultScreen/utils'

describe('result grading', () => {
  test('returns the top grade for strong accuracy', () => {
    expect(getGrade(0.91)).toEqual(
      expect.objectContaining({
        letter: 'S',
      }),
    )
  })

  test('returns a low grade for weak accuracy', () => {
    expect(getGrade(0.2)).toEqual(
      expect.objectContaining({
        letter: 'D',
      }),
    )
  })
})
