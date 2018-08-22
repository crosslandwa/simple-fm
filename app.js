window.addEventListener('load', onLoad)

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
  connectFm1(audioContext.destination)
  connectFm2(audioContext.destination)
  connectFm3(audioContext.destination)
  playWithLSystem(playFm3)

  let state = nextState()
  let clear;
  const startPlaying = () => { playFm1(state); state = nextState(state); }
  const togglePlaying = () => {
    if (clear) {
      clearInterval(clear)
      clear = undefined
    } else {
      clear = setInterval(startPlaying, 125)
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
  amplitude: [[0, 5], [1, 5], [0.3, 10], [0, 100]],
  pitch: [[50, 1], [8000, 5], [80, 5], [50, 100]],
  modIndex: scaleEnvelope(shiftEnvelope(randomEnvelope(3, 150), 1.5), 100),
  harmonicity: scaleEnvelope(randomEnvelope(10, 150), 5)
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

const operatorFactory = audioContext => ({
  oscillator: (frequencyModulators) => {
    const osc = audioContext.createOscillator()
    osc.frequency.setValueAtTime(0, 0)
    frequencyModulators.forEach(frequency => frequency.connect(osc.frequency))
    osc.start()
    return osc
  },
  audioParam: (initialValue) => {
    const node = audioContext.createGain()
    const source = audioContext.createConstantSource()
    source.start()
    node.gain.setValueAtTime(initialValue, 0)
    source.connect(node)
    return node
  },
  multiply: (a, b) => {
    const node = audioContext.createGain()
    node.gain.setValueAtTime(0, 0)
    a.connect(node)
    b.connect(node.gain)
    return node
  },
  nowMs: () => audioContext.currentTime * 1000
})

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
    const mapping = [...new Array(ruleSize()).keys()].map(randomChar).join('')
    return Object.assign(acc, { [char]: () => mapping })
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
    }[key] || [[0, 0], [0, 500]]
  }

  // const amplitude = lSystem('A', 5, {
  //   A: () => 'ABABB',
  //   B: () => 'BBA'
  // }).split('').reduce((acc, i) => acc.concat(amplitudeSegment(i)), [])

  const amplitude = randomLSystem(6).apply(5).split('').reduce((acc, i) => acc.concat(amplitudeSegment(i)), [])

  const pitchSegment = key => {
    const noteNumber = { A: 2, B: 3, C: 5, D: 7, E: 9, F: 12, G: 15, H: 24 }[key] || 7
    return Math.random() > 0.5
      ? [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 124]]
      : [[midiNoteToF(noteNumber + 60), 1], [midiNoteToF(noteNumber + 60), 249]]
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
    }[key] || [[0, 0], [1, 500], [10, 1000]]
  }

  const modIndex = randomLSystem(5).apply(6).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])
  const harmonicity = randomLSystem(5).apply(5).split('').reduce((acc, i) => acc.concat(modIndexSegment(i)), [])

  play({amplitude, pitch, modIndex, harmonicity })
}
