import fmSynth from '../fm-synth'
import midiNoteToF from '../midi-note-to-f'
import OperatorFactory from '../operator-factory'
import { amplitudeEnvelopeSelector } from './interactions'

const createSynth = () => {
  const audioContext = new(window.AudioContext || window.webkitAudioContext)
  const operatorFactory = OperatorFactory(audioContext)
  const { playNote, connect } = fmSynth(operatorFactory)
  connect(audioContext.destination)
  return playNote
}

const playNote = window.AudioContext || window.webkitAudioContext
  ? createSynth()
  : () => {}

export const qwertyFMMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'QWERTY_FM_PLAY_NOTE':
      const frequency = midiNoteToF(action.noteNumber)
      playNote({
        amplitude: amplitudeEnvelopeSelector(store.getState()),
        pitch: frequency,
        modIndex: [[0, 10], [200, 20],[5, 100], [0.1, 500]],
        harmonicity: [[4.99, 5], [4.99, 300], [1, 100]]
      })
  }
  return next(action)
}
