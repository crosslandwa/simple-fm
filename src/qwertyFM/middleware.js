import fmSynth from '../fm-synth'
import midiNoteToF from '../midi-note-to-f'
import OperatorFactory from '../operator-factory'

const audioContext = new(window.AudioContext || window.webkitAudioContext)
const operatorFactory = OperatorFactory(audioContext)
const { playNote, connect } = fmSynth(operatorFactory)
connect(audioContext.destination)

export const qwertyFMMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'QWERTY_FM_PLAY_NOTE':
      const frequency = midiNoteToF(action.noteNumber)
      playNote({
        amplitude: [[0, 5], [0.9, 20], [0, 500]],
        pitch: frequency,
        modIndex: [[0, 10], [200, 20],[5, 100], [0.1, 500]],
        harmonicity: [[4.99, 5], [4.99, 300], [1, 100]]
      })
  }
  return next(action)
}
