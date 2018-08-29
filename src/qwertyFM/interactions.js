/* UTILITY */
const chunk = (x, size = 2) => x.reduce(([l, r]) => [l.concat([r.slice(0, size)]), r.slice(size)], [[], x])[0].filter(a => a.length)

/* ACTIONS */
export const playNote = noteNumber => ({ type: 'QWERTY_FM_PLAY_NOTE', noteNumber})
export const updateAmplitude = valueList => ({ type: 'QWERTY_FM_UPDATE_AMPLITUDE', valueList})

/* SELECTORS */
export const amplitudeSelector = state => state.qwertyFMReducer.amplitude
export const amplitudeEnvelopeSelector = state => chunk(amplitudeSelector(state).split(/\s+/).map(Number))

/* REDUCER */
export const reducer = (state = { amplitude: '0.9 20 0 500' }, action)  => {
  switch (action.type) {
    case 'QWERTY_FM_UPDATE_AMPLITUDE':
      return {...state, amplitude: action.valueList}
  }
  return state
}
