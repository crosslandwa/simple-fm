import fmSynth from '../fm-synth'
import midiNoteToF from '../midi-note-to-f'
import OperatorFactory from '../operator-factory'
import { amplitudeEnvelopeSelector, harmonicityEnvelopeSelector, modIndexEnvelopeSelector, pitchEnvelopeSelector } from './interactions'

const createSynth = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const operatorFactory = OperatorFactory(audioContext)
  const { playNote, connect } = fmSynth(operatorFactory)
  connect(audioContext.destination)
  return playNote
}

const playNote = window.AudioContext || window.webkitAudioContext
  ? createSynth()
  : () => {}

const scaleEnvelope = (env, scaleFactor) => env.map(([a, b]) => [a * scaleFactor, b])

const apply = (f, x) => f(x)

export const qwertyFMMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'QWERTY_FM_PLAY_NOTE':
      const frequency = midiNoteToF(action.noteNumber)
      playNote({
        amplitude: amplitudeEnvelopeSelector(store.getState()),
        pitch: apply(env => env ? scaleEnvelope(env, frequency) : frequency, pitchEnvelopeSelector(store.getState())),
        modIndex: modIndexEnvelopeSelector(store.getState()),
        harmonicity: harmonicityEnvelopeSelector(store.getState())
      })
  }
  return next(action)
}
