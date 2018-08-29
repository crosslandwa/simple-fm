import React from 'react'
import { connect } from 'react-redux'
import { playNote, updateAmplitude } from './interactions'
import { amplitudeSelector } from './interactions'

const mapStateToProps = state => ({
  amplitude: amplitudeSelector(state),
  octave: 4
})
const mapDispatchToProps = { playNote, updateAmplitude }

const white = {
  backgroundColor: '#EEEEEE',
  border: '1px solid #000000',
  width: '1.5em',
}
const black = {
  backgroundColor: '#111111',
  height: '70%',
  marginLeft: '-0.5em',
  marginRight: '-0.5em',
  width: '1em',
  zIndex: '1'
}

const blackKeys = [1, 3, 6, 8, 10]

const QwertyFM = props => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    width: 'fit-content'
  }}>
    <div style={{
      border: '1px solid #000000',
      display: 'flex',
      height: '10em',
    }}>
      {[...new Array(37).keys()].map(number => number + props.octave * 12).map((noteNumber, index) => (
        <div
          style={blackKeys.includes(index % 12) ? black : white}
          onClick={() => props.playNote(noteNumber)}
          ></div>
        ))}
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column'
    }} >
      <Input label="Amplitude" value={props.amplitude} onInput={props.updateAmplitude}/>
      <Input label="Pitch" />
      <Input label="Mod Index" />
      <Input label="Harmonicity" />
    </div>
  </div>
)

const Input = props => (
  <label style={{
    display: 'flex',
    width: '100%'
  }} >
    <span style={{ minWidth: '5.5em' }}>{props.label}</span>
    <input style={{ flexGrow: 1, marginLeft: '1em' }} type="text" value={props.value} onInput={e => props.onInput(e.target.value)} />
  </label>
)

export default connect(mapStateToProps, mapDispatchToProps)(QwertyFM)
