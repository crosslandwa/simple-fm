import operatorFactory from './operator-factory'

export function appMiddleware (store) {
  return (next) => (action) => {
    switch (action.type) {
      case 'START_PLAYING':
        onLoad()
    }
    return next(action)
  }
}

function fmSynth(operatorFactory) {
  const { audioParam, multiply, oscillator, nowMs } = operatorFactory

  const carrierAmplitude = audioParam(0)
  const carrierFrequency = audioParam(0)
  const harmonicityRatio = audioParam(0)
  const modulationIndex = audioParam(0)

  const carrierFrequencyTimesHarmonicityRatio = multiply(carrierFrequency, harmonicityRatio)
  const modulator = multiply(
    oscillator([carrierFrequencyTimesHarmonicityRatio]),
    multiply(carrierFrequencyTimesHarmonicityRatio, modulationIndex)
  )
  const carrier = oscillator([carrierFrequency, modulator])
  const output = multiply(carrier, carrierAmplitude)

  const playNote = ({ amplitude, pitch, modIndex, harmonicity }) => {
    [carrierFrequency.gain, carrierAmplitude.gain, modulationIndex.gain, harmonicityRatio.gain]
      .forEach(param => param.cancelAndHoldAtTime(0))

    const coerceToEnvelope = x => x.length ? x : [[x, 0]]
    const atTimeMs = nowMs()

    pitch && applyEnvelope(carrierFrequency.gain, atTimeMs, ...coerceToEnvelope(pitch))
    amplitude && applyEnvelope(carrierAmplitude.gain, atTimeMs, ...coerceToEnvelope(amplitude))
    modIndex && applyEnvelope(modulationIndex.gain, atTimeMs, ...coerceToEnvelope(modIndex))
    harmonicity && applyEnvelope(harmonicityRatio.gain, atTimeMs, ...coerceToEnvelope(harmonicity))
  }

  return { playNote, connect: destination => output.connect(destination) }
}

function onLoad() {
  const audioContext = new(window.AudioContext || window.webkitAudioContext);
  const { playNote: playFm1, connect: connectFm1 } = fmSynth(operatorFactory(audioContext))
  const { playNote: playFm2, connect: connectFm2 } = fmSynth(operatorFactory(audioContext))
  const { playNote: playFm3, connect: connectFm3 } = fmSynth(operatorFactory(audioContext))
  const { playNote: playFm4, connect: connectFm4 } = fmSynth(operatorFactory(audioContext))
  const { playNote: playFm5, connect: connectFm5 } = fmSynth(operatorFactory(audioContext))
  connectFm1(audioContext.destination)
  connectFm2(audioContext.destination)

  const panR = audioContext.createStereoPanner()
  panR.pan.setValueAtTime(-0.5, 0)
  panR.connect(audioContext.destination)
  connectFm3(panR)

  const panL = audioContext.createStereoPanner()
  panL.pan.setValueAtTime(0.5, 0)
  panL.connect(audioContext.destination)
  connectFm4(panL)

  connectFm5(audioContext.destination)

  playWithLSystem(playFm3)
  playWithLSystem(playFm4)
  playBassWithLSystem(playFm5)

  let state = nextState()
  let clear;
  const startPlaying = () => { playFm1(state); state = nextState(state); }
  const togglePlaying = () => {
    if (clear) {
      clearInterval(clear)
      clear = undefined
    } else {
      clear = setInterval(startPlaying, 62.5)
    }
  }

  window.addEventListener('keypress', ({ key }) => {
    if (' ' === key) {
      togglePlaying()
      return
    }
    const noteNumber = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j:11, k: 12 }[key]
    if (noteNumber >= 0) {
      const frequency = midiNoteToF(noteNumber + 48)
      playFm2({
        amplitude: [[0, 10], [0.9, 10], [0, 500]],
        pitch: [[frequency, 0], [0.5 * frequency, 50]],
        modIndex: [[0, 10], [1, 50],[0.5, 100], [0.1, 500]],
        harmonicity: 4.99
      })
    }
  })
}

const midiNoteToF = note => 440.0 * Math.pow(2, (note - 69.0) / 12.0)

const nextState = (state = initialState) => Object.assign({}, state, {
  amplitude: Math.random() > 0.75 ? [[0, 5], [1, 5], [0.73, 10], [0, 100]] : [[0, 0], [0, 150]],
  pitch: [[50, 1], [8000, 1], [100, 5], [50, 100]],
  modIndex: Math.random() > 0.5 ? 100 : [[10000, 10], [0, 50]],//scaleEnvelope(shiftEnvelope(randomEnvelope(3, 150), 1.5), 100),
  harmonicity: Math.random() > 0.5 ? [[100, 1], [0, 10]] : 1000, //scaleEnvelope(randomEnvelope(10, 150), 5)
})

const randomInt = max => Math.floor(Math.random() * (max + 1))

const randomEnvelope = (maxSteps, length) => stretchEnvelope(randomNormalisedEnvelope(randomInt(maxSteps)), length)

const randomNormalisedEnvelope = steps => {
  const x = [...Array(steps)].map((u, i) => i)
  const lengths = x.map(i => Math.random())
  const totalLength = lengths.reduce((total, it) => total + it, 0)
  return x.map(i => {
    return [Math.random(), lengths[i] / totalLength]
  })
}

const scaleEnvelope = (env, scaleFactor) => env.map(([a, b]) => [a * scaleFactor, b])
const shiftEnvelope = (env, shiftAmount) => env.map(([a, b]) => [a + shiftAmount, b])
const stretchEnvelope = (env, stretchFactor) => env.map(([a, b]) => [a, b * stretchFactor])

const initialState = {
  amplitude: [[0, 10], [0.9, 10], [0, 500]],
  pitch: [[440, 0], [0.5 * 440, 50]],
  modIndex: [[0, 10], [1, 50],[0.5, 100], [0.1, 500]],
  harmonicity: 4.99
}

const applyEnvelope = (param, atTimeMs, ...envelopePoints) => {
  let totalTime = atTimeMs / 1000
  envelopePoints.forEach(([level, time]) => {
    totalTime += (time / 1000)
    // param.exponentialRampToValueAtTime(level, totalTime) // THIS WON'T WORK WHEN THE CURRENT VALUE OR TARGET VALUE IS ZERO!
    param.linearRampToValueAtTime(level, totalTime)
  })
}

/** L SYSTEM stuff **/

const lSystem = (axiom, iterations, rules) => [...Array(iterations).keys()]
  .reduce(acc => acc.split('').map(c => rules[c] ? rules[c]() : c).join(''), axiom)

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

  // const amplitude = lSystem('A', 5, {
  //   A: () => 'ABABB',
  //   B: () => 'BBA'
  // }).split('').reduce((acc, i) => acc.concat(amplitudeSegment(i)), [])

  const amplitude = randomLSystem(6).apply(5).split('')
    .reduce((acc, i) => acc.concat(amplitudeSegment(i)), [])
    .concat([[0, 10]])

  const pitchSegment = key => {
    const noteNumber = { A: 2, B: 3, C: 5, D: 7, E: 9, F: 12, G: 15, H: 24 }[key] || 7
    return Math.random() > 0.7
      ? [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 124]]
      : Math.random() > 0.5
        ? [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 249]]
        : [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 124]]
  }

  // const pitch = lSystem('A', 9, {
  //   A: () => 'AB',
  //   B: () => 'BCD',
  //   C: () => 'CA',
  //   D: () => 'DE',
  //   E: () => 'EFD'
  // }).split('').reduce((acc, i) => acc.concat(pitchSegment(i)), [])
  const pitch = randomLSystem(8).apply(5).split('').reduce((acc, i) => acc.concat(pitchSegment(i)), [])


  const modIndexSegment = key => {
    return {
      A: [[35, 10], [1000, 25], [10, 5000]],
      B: [[10, 250]],
      C: [[500, 250]],
      D: [[19.99, 250], [9.99, 500]],
    }[key] || [[20, 10], [2, 490], [10, 1000]]
  }

  const modIndex = randomLSystem(5).apply(6).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])
  const harmonicity = randomLSystem(5).apply(5).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])

  play({amplitude, pitch, modIndex, harmonicity })
}

const playBassWithLSystem = play => {
  const amplitude = [...new Array(100).keys()].reduce((acc, it) => acc.concat(
    [[0.7, 10], [0.55, 240], [0, 1750]]
  ),[])

  const pitchSegment = key => {
    const noteNumber = { A: 2, B: 3, C: 5, D: 7, E: 9, F: 12, G: 15, H: 24 }[key] || 7
    return [[midiNoteToF(noteNumber + 24), 1], [midiNoteToF(noteNumber + 24), 1999]]
  }
  const pitch = randomLSystem(4).apply(5).split('').reduce((acc, i) => acc.concat(pitchSegment(i)), [])

  play({amplitude, pitch, modIndex: 5, harmonicity: 1})
}
