import { updateAmplitude } from '../interactions'
import { amplitudeSelector, amplitudeEnvelopeSelector } from '../interactions'
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
})
