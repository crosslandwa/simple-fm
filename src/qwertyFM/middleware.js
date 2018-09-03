import fmSynth from '../fm-synth'
import midiNoteToF from '../midi-note-to-f'
import OperatorFactory from '../operator-factory'
import { ifAudioContext } from '../audio-context'
import { amplitudeEnvelopeSelector, harmonicityEnvelopeSelector, modIndexEnvelopeSelector, pitchEnvelopeSelector, fixedPitchSelector } from './interactions'

const apply = (f, x) => f(x)

const playNote = ifAudioContext(audioContext => {
  const { playNote, connect } = fmSynth(OperatorFactory(audioContext))
  connect(audioContext.destination)
  return playNote
}, () => {})

const scaleEnvelope = (env, scaleFactor) => env.map(([a, b]) => [a * scaleFactor, b])

export const qwertyFMMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'QWERTY_FM_PLAY_NOTE':
      const frequency = midiNoteToF(action.noteNumber)
      playNote({
        amplitude: amplitudeEnvelopeSelector(store.getState()),
        pitch: fixedPitchSelector(store.getState())
          ? pitchEnvelopeSelector(store.getState())
          : apply(
            env => env ? scaleEnvelope(env, frequency) : frequency,
            pitchEnvelopeSelector(store.getState())
          ),
        modIndex: modIndexEnvelopeSelector(store.getState()),
        harmonicity: harmonicityEnvelopeSelector(store.getState())
      })
  }
  return next(action)
}
