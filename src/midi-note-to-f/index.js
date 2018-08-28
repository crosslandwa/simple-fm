const midiNoteToF = note => 440.0 * Math.pow(2, (note - 69.0) / 12.0)

export default midiNoteToF
