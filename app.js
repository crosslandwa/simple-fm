window.addEventListener('load', onLoad)

function onLoad() {
  const audioContext = new(window.AudioContext || window.webkitAudioContext);
  const { audioParam, multiply, oscillator } = operatorFactory(audioContext)
  const nowMs = () => audioContext.currentTime * 1000
  const connectToOutput = node => node.connect(audioContext.destination)

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

  connectToOutput(multiply(carrier, carrierAmplitude))

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

  window.addEventListener('keypress', ({ key }) => {
    if (!['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'].includes(key)) return
    const noteNumber = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j:11, k: 12 }[key]
    const midiNoteToF = note => 440.0 * Math.pow(2, (note - 69.0) / 12.0)
    const frequency = midiNoteToF(noteNumber + 48)
    playNote({
      amplitude: [[0, 10], [0.9, 10], [0, 500]],
      pitch: [[frequency, 0], [0.5 * frequency, 50]],
      modIndex: [[0, 10], [1, 50],[0.5, 100], [0.1, 500]],
      harmonicity: 4.99
    })
  })
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
  }
})

const applyEnvelope = (param, atTimeMs, ...envelopePoints) => {
  let totalTime = atTimeMs / 1000
  envelopePoints.forEach(([level, time]) => {
    totalTime += (time / 1000)
    // param.exponentialRampToValueAtTime(level, totalTime) // THIS WON'T WORK WHEN THE CURRENT VALUE OR TARGET VALUE IS ZERO!
    param.linearRampToValueAtTime(level, totalTime)
  })
}
