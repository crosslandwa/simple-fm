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
  connectFm1(audioContext.destination)
  connectFm2(audioContext.destination)

  let state = nextState()
  let clear;
  const startPlaying = () => { playFm1(state); state = nextState(state); }
  const togglePlaying = () => {
    if (clear) {
      clearInterval(clear)
      clear = undefined
    } else {
      clear = setInterval(startPlaying, 100)
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
