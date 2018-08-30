/* UTILITY */
const chunk = (x, size = 2) => x.reduce(([l, r]) => [l.concat([r.slice(0, size)]), r.slice(size)], [[], x])[0].filter(a => a.length)
const toEnvelope = raw => raw.trim()
  ? chunk(raw.split(/\s+/).map(Number), 2).map(([value, time = 0]) => [value, time])
  : undefined


/* ACTIONS */
export const playNote = noteNumber => ({ type: 'QWERTY_FM_PLAY_NOTE', noteNumber})
export const updateAmplitude = valueList => ({ type: 'QWERTY_FM_UPDATE_AMPLITUDE', valueList})
export const updateModIndex = valueList => ({ type: 'QWERTY_FM_UPDATE_MOD_INDEX', valueList})
export const updateHarmonicity = valueList => ({ type: 'QWERTY_FM_UPDATE_HARMONICITY', valueList})



/* SELECTORS */
export const amplitudeSelector = state => state.qwertyFMReducer.amplitude
export const amplitudeEnvelopeSelector = state => toEnvelope(amplitudeSelector(state))
export const modIndexSelector = state => state.qwertyFMReducer.modIndex
export const modIndexEnvelopeSelector = state => toEnvelope(modIndexSelector(state))
export const harmonicitySelector = state => state.qwertyFMReducer.harmonicity
export const harmonicityEnvelopeSelector = state => toEnvelope(harmonicitySelector(state))

/* REDUCER */
const initialState = {
  amplitude: '0.9 20 0 500',
  harmonicity: '4.99 5 4.99 300 1 100',
  modIndex: '0 10 200 20 5 100 0.1 500'
}

export const reducer = (state = initialState, action)  => {
  switch (action.type) {
    case 'QWERTY_FM_UPDATE_AMPLITUDE':
      return {...state, amplitude: action.valueList}
    case 'QWERTY_FM_UPDATE_HARMONICITY':
      return {...state, harmonicity: action.valueList}
    case 'QWERTY_FM_UPDATE_MOD_INDEX':
      return {...state, modIndex: action.valueList}
  }
  return state
}
