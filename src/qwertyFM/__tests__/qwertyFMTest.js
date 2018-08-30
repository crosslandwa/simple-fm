import { updateAmplitude, updateHarmonicity, updateModIndex } from '../interactions'
import { amplitudeSelector, amplitudeEnvelopeSelector} from '../interactions'
import { modIndexSelector, modIndexEnvelopeSelector } from '../interactions'
import { harmonicitySelector, harmonicityEnvelopeSelector } from '../interactions'
import createStore from '../../store'

describe('QWERTY FM', () => {
  const store = createStore()
  const dispatch = action => store.dispatch(action)
  const state = () => store.getState()

  it('allows amplitude to be specified as a list and expressed as an envelope', () => {
    dispatch(updateAmplitude('1 200 0 100'))
    expect(amplitudeSelector(state())).toEqual('1 200 0 100')
    expect(amplitudeEnvelopeSelector(state())).toEqual([[1, 200], [0, 100]])
  })

  it('allows harmonicity and modulation index to be specified as a list and expressed as an envelope', () => {
    dispatch(updateHarmonicity('150 250 10 1000'))
    expect(harmonicitySelector(state())).toEqual('150 250 10 1000')
    expect(harmonicityEnvelopeSelector(state())).toEqual([[150, 250], [10, 1000]])

    dispatch(updateModIndex('100 200 10 1000'))
    expect(modIndexSelector(state())).toEqual('100 200 10 1000')
    expect(modIndexEnvelopeSelector(state())).toEqual([[100, 200], [10, 1000]])
  })

  it('allows envelopes to not be provided', () => {
    dispatch(updateAmplitude(' '))
    expect(amplitudeEnvelopeSelector(state())).toEqual(undefined)

    dispatch(updateHarmonicity(''))
    expect(harmonicityEnvelopeSelector(state())).toEqual(undefined)

    dispatch(updateModIndex(''))
    expect(modIndexEnvelopeSelector(state())).toEqual(undefined)
  })

  it('treats an envelope with a single value as a constant', () => {
    dispatch(updateAmplitude('1'))
    expect(amplitudeEnvelopeSelector(state())).toEqual([[1, 0]])

    dispatch(updateHarmonicity('2'))
    expect(harmonicityEnvelopeSelector(state())).toEqual([[2, 0]])

    dispatch(updateModIndex('3'))
    expect(modIndexEnvelopeSelector(state())).toEqual([[3, 0]])
  })
})
