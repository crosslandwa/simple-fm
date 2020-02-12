import OperatorFactory from '../operator-factory'
import fmSynth from '../fm-synth'
import midiNoteToF from '../midi-note-to-f'
import { lSystem } from '../lSystem'
import { ifAudioContext } from '../audio-context'

/* ACTIONS */

export const startPlaying = () => ({ type: 'START_PLAYING' })
export const pausePlaying = () => ({ type: 'PAUSE_PLAYING' })
export const stopPlaying = () => ({ type: 'STOP_PLAYING' })

/* MIDDLEWARE */

let playFm1, playFm2, playFm3, playFm4, playFm5

function startAudio () {
  ({ playFm1, playFm2, playFm3, playFm4, playFm5 } = ifAudioContext(
    audioContext => {
      const operatorFactory = OperatorFactory(audioContext)
      const { playNote: playFm1, connect: connectFm1 } = fmSynth(operatorFactory)
      const { playNote: playFm2, connect: connectFm2 } = fmSynth(operatorFactory)
      const { playNote: playFm3, connect: connectFm3 } = fmSynth(operatorFactory)
      const { playNote: playFm4, connect: connectFm4 } = fmSynth(operatorFactory)
      const { playNote: playFm5, connect: connectFm5 } = fmSynth(operatorFactory)

      const panR = audioContext.createStereoPanner()
      panR.pan.setValueAtTime(0.75, 0)
      panR.connect(audioContext.destination)
      connectFm1(panR)

      const panL = audioContext.createStereoPanner()
      panL.pan.setValueAtTime(-0.75, 0)
      panL.connect(audioContext.destination)
      connectFm2(panL)

      connectFm3(audioContext.destination)
      connectFm4(audioContext.destination)
      connectFm5(audioContext.destination)
      return { playFm1, playFm2, playFm3, playFm4, playFm5 }
    },
    { playFm1: () => {}, playFm2: () => {}, playFm3: () => {}, playFm4: () => {} }
  ))
}

export function middleware (store) {
  return (next) => (action) => {
    switch (action.type) {
      case 'START_PLAYING':
        if (!playFm1) startAudio()
        playWithLSystem(playFm1)
        playWithLSystem(playFm2)
        playBassWithLSystem(playFm3)
        playKick(playFm4)
        playSnare(playFm5)
        return
      case 'PAUSE_PLAYING':
        playFm1()
        playFm2()
        playFm3()
        playFm4()
        playFm5()
        return
      case 'STOP_PLAYING':
        const stop = { amplitude: 0.001 } // TODO handle edge case (in FM synth) where single value of zero passed
        playFm1(stop)
        playFm2(stop)
        playFm3(stop)
        playFm4(stop)
        playFm5(stop)
        return
    }
    return next(action)
  }
}

/** L SYSTEM stuff **/

const randomLSystem = (alphabetMaxSize = 4, ruleTransformationMaxSize = 3) => {
  const alphabetSize = Math.floor(Math.random() * alphabetMaxSize) + 2
  const ruleSize = () => Math.floor(Math.random() * ruleTransformationMaxSize) + 2
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].slice(0, alphabetSize)
  const randomChar = () => alphabet[Math.floor(Math.random() * alphabet.length)]
  const rules = alphabet.reduce((acc, char) => {
    const mappingA = [...new Array(ruleSize()).keys()].map(randomChar).join('')
    const mappingB = [...new Array(ruleSize()).keys()].map(randomChar).join('')
    return Object.assign(acc, { [char]: () => Math.random() > 0.5 ? mappingA : mappingB })
  }, {})
  return {
    axiom: alphabet[0],
    rules,
    apply: iterations => lSystem(alphabet[0], iterations, rules)
  }
}

const playWithLSystem = play => {
  const amplitudeSegment = key => {
    return {
      A: [[1, 10], [0.5, 100], [0, 140]],
      B: [[1, 10], [0, 240]],
      C: [[1, 245], [0, 5]],
      D: [[0.5, 10], [0, 40], [0, 200]]
    }[key] || (Math.random() > 0.5 ? [[0, 0], [0, 500]] : [[0, 0], [1, 500]])
  }

  const amplitude = randomLSystem(6).apply(5).split('')
    .reduce((acc, i) => acc.concat(amplitudeSegment(i)), [])
    .concat([[0, 10]])

  const pitchSegment = key => {
    const noteNumber = { A: 2, B: 3, C: 5, D: 7, E: 9, F: 12, G: 15, H: 24 }[key] || 7
    return Math.random() > 0.7
      ? [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 124]]
      : Math.random() > 0.5
        ? [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 249]]
        : [[midiNoteToF(noteNumber + 72), 1], [midiNoteToF(noteNumber + 72), 124]]
  }

  const pitch = randomLSystem(8).apply(5).split('').reduce((acc, i) => acc.concat(pitchSegment(i)), [])

  const modIndexSegment = key => {
    return {
      A: [[35, 10], [1000, 25], [10, 5000]],
      B: [[10, 250]],
      C: [[500, 250]],
      D: [[19.99, 250], [9.99, 500]]
    }[key] || [[20, 10], [2, 490], [10, 1000]]
  }

  const modIndex = randomLSystem(5).apply(6).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])
  const harmonicity = randomLSystem(5).apply(5).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])

  play({ amplitude, pitch, modIndex, harmonicity })
}

const playBassWithLSystem = play => {
  const amplitude = [...new Array(100).keys()].reduce((acc, it) => acc.concat(
    [[0.7, 10], [0.55, 240], [0, 1750]]
  ), [])

  const pitchSegment = key => {
    const noteNumber = { A: 2, B: 3, C: 5, D: 7, E: 9, F: 12, G: 15, H: 24 }[key] || 7
    return [[midiNoteToF(noteNumber + 24), 1], [midiNoteToF(noteNumber + 24), 1999]]
  }
  const pitch = randomLSystem(6).apply(5).split('').reduce((acc, i) => acc.concat(pitchSegment(i)), [])

  play({amplitude, pitch, modIndex: 5, harmonicity: 1})
}

const envLength = env => env.reduce((acc, [x, t]) => acc + t, 0)
const padLength = (env, targetLength) => env.concat([[env.slice(-1)[0][0], Math.max(0, targetLength - envLength(env))]])
const trimEnvelope = (env, maxLength) => env.slice(
  0,
  env.reduce((acc, [x, t]) => ({ max: acc.length + t < maxLength ? acc.max + 1 : acc.max, length: acc.length + t }), { max: 0, length: 0 }).max
)

const playKick = play => {
  const ampEnv = [[1, 1], [0.05, 50], [0, 200]]
  const harmonicityEnv = [[50.1, 0], [0, 5]]

  const noteLengths = { A: 250, B: 500, C: 750, D: 125, E: 1000, F: 75.5, G: 1250, H: 1250, I: 250 }

  const sequence = randomLSystem(9).apply(5).split('')

  const amplitude = sequence.reduce((acc, i) => acc.concat(padLength(trimEnvelope(ampEnv, noteLengths[i]), noteLengths[i])), [])
  const harmonicity = sequence.reduce((acc, i) => acc.concat(padLength(trimEnvelope(harmonicityEnv, noteLengths[i]), noteLengths[i])), [])

  play({amplitude, pitch: 70, modIndex: 0.5, harmonicity})
}

const playSnare = play => {
  const amp = [[0, 0], [0, 500], [0.25, 1], [0, 100], [0, 399]]
  const h = [[0, 0], [0, 500], [1.1, 0], [0.3, 500]]

  const amplitude = [...new Array(100).keys()].reduce((acc, it) => acc.concat(amp), [])
  const harmonicity = [...new Array(100).keys()].reduce((acc, it) => acc.concat(h), [])

  play({amplitude, pitch: 1800, modIndex: 12, harmonicity})
}
