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

export default operatorFactory
