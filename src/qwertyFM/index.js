import React from 'react'
import { connect } from 'react-redux'
import { playNote, updateAmplitude, updateHarmonicity, updateModIndex } from './interactions'
import { amplitudeSelector, harmonicitySelector, modIndexSelector } from './interactions'
import { updatePitch, pitchSelector } from './interactions'
import { updateFixedPitch, fixedPitchSelector } from './interactions'

const mapStateToProps = state => ({
  amplitude: amplitudeSelector(state),
  harmonicity: harmonicitySelector(state),
  modIndex: modIndexSelector(state),
  octave: 4,
  pitch: pitchSelector(state),
  fixedPitch: fixedPitchSelector(state)
})
const mapDispatchToProps = {
  playNote,
  updateAmplitude,
  updateHarmonicity,
  updateModIndex,
  updatePitch,
  updateFixedPitch
}

const white = {
  backgroundColor: '#EEEEEE',
  border: '1px solid #000000',
  width: '1.5em'
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
      height: '10em'
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
      <Input label="Amplitude" value={props.amplitude} onChange={e => props.updateAmplitude(e.target.value)}/>
      <Input label="Pitch" value={props.pitch} onChange={e => props.updatePitch(e.target.value)}/>
      <Input label="Fixed Pitch" checked={props.fixedPitch} onChange={e => props.updateFixedPitch(e.target.checked)} type="checkbox"/>
      <Input label="Mod Index" value={props.modIndex} onChange={e => props.updateModIndex(e.target.value)}/>
      <Input label="Harmonicity" value={props.harmonicity} onChange={e => props.updateHarmonicity(e.target.value)}/>
    </div>
  </div>
)

const Input = props => (
  <label style={{
    display: 'flex',
    width: '100%'
  }} >
    <span style={{ minWidth: '5.5em' }}>{props.label}</span>
    <input
      style={{ flexGrow: 1, marginLeft: '1em' }}
      type={props.type || 'text'}
      value={props.value}
      checked={props.checked}
      onChange={props.onChange}
    />
  </label>
)

export default connect(mapStateToProps, mapDispatchToProps)(QwertyFM)
