function fmSynth (operatorFactory) {
  const { audioParam, multiply, oscillator, nowMs } = operatorFactory

  const carrierAmplitude = audioParam(0)
  const carrierFrequency = audioParam(0)
  const harmonicityRatio = audioParam(1)
  const modulationIndex = audioParam(1)

  const carrierFrequencyTimesHarmonicityRatio = multiply(carrierFrequency, harmonicityRatio)
  const modulator = multiply(
    oscillator([carrierFrequencyTimesHarmonicityRatio]),
    multiply(carrierFrequencyTimesHarmonicityRatio, modulationIndex)
  )
  const carrier = oscillator([carrierFrequency, modulator])
  const output = multiply(carrier, carrierAmplitude)

  const playNote = ({ amplitude, pitch, modIndex, harmonicity } = {}) => {
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

const applyEnvelope = (param, atTimeMs, ...envelopePoints) => {
  let totalTime = atTimeMs / 1000
  envelopePoints.forEach(([level, time]) => {
    totalTime += (time / 1000)
    // param.exponentialRampToValueAtTime(level, totalTime) // THIS WON'T WORK WHEN THE CURRENT VALUE OR TARGET VALUE IS ZERO!
    param.linearRampToValueAtTime(level, totalTime)
  })
}

export default fmSynth
