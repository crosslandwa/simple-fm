import pushWrapper from 'push-wrapper'
import { playNote } from './qwertyFM/interactions'

export const initialisePush = () => ({ type: 'PUSH_INITIALISE' })
const gridPadPressed = (x, y, velocity) => ({ type: 'PUSH_PAD_PRESSED', x, y, velocity })

export const middleware = ({ dispatch }) => next => action => {
  switch (action.type) {
    case 'PUSH_INITIALISE':
      pushWrapper.webMIDIio('USB MIDI Device Port 2', 'USB MIDI Device Port 2')
        .then(
          ({inputPort, outputPort}) => {
            const push = pushWrapper.push()
            inputPort.onmidimessage = event => push.midiFromHardware(event.data)
            push.onMidiToHardware(outputPort.send.bind(outputPort))
            return push
          },
          err => { console.error(err); return pushWrapper.push() } // Ports not found or Web MIDI API not supported
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
