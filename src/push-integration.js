import pushWrapper from 'push-wrapper'
import { playNote } from './qwertyFM/interactions'

export const initialisePush = () => ({ type: 'PUSH_INITIALISE' })
const gridPadPressed = (x, y, velocity) => ({ type: 'PUSH_PAD_PRESSED', x, y, velocity })

function webMidiIO (inputPortName = 'Ableton Push User Port', outputPortName = 'Ableton Push User Port') {
  if (navigator && navigator.requestMIDIAccess) {
    return navigator.requestMIDIAccess({ sysex: true }).then(midiAccess => {
      const portWithName = name => port => port.name === name
      const inputPort = [...midiAccess.inputs.values()].find(portWithName(inputPortName))
      const outputPort = [...midiAccess.outputs.values()].find(portWithName(outputPortName))

      return (inputPort && outputPort)
        ? Promise.resolve({ inputPort, outputPort })
        : Promise.reject(new Error(`No MIDI IO ports found with names "${inputPortName}"/"${outputPortName}"`))
    })
  }
  return Promise.reject(new Error('Web MIDI API not supported by this browser!'))
}

export const middleware = ({ dispatch }) => next => action => {
  switch (action.type) {
    case 'PUSH_INITIALISE':
      webMidiIO('USB MIDI Device Port 2', 'USB MIDI Device Port 2')
        .then(
          ({inputPort, outputPort}) => {
            const push = pushWrapper.push()
            inputPort.onmidimessage = event => push.midiFromHardware(event.data)
            push.onMidiToHardware(outputPort.send.bind(outputPort))
            return push
          },
          err => console.error(err) || pushWrapper.push()
        )
        .then(push => {
          [0, 1, 2, 3, 4, 5, 6, 7].forEach(y => {
            push.gridRow(y).forEach((pad, x) => {
              pad.onPressed(velocity => dispatch(gridPadPressed(x, y, velocity)))
            })
          })
        })
      return
    case 'PUSH_PAD_PRESSED':
      next(action)
      const { x, y } = action
      return dispatch(playNote(36 + (x % 8) + (y * 8)))
  }
  return next(action)
}
