import React from 'react'
import { connect } from 'react-redux'
import { playNote } from './interactions'

const mapStateToProps = state => ({
  octave: 4
})
const mapDispatchToProps = { playNote }

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
    border: '1px solid #000000',
    display: 'flex',
    height: '10em',
    width: 'fit-content'
  }}>
    {[...new Array(37).keys()].map(number => number + props.octave * 12).map((noteNumber, index) => (
      <div
        style={blackKeys.includes(index % 12) ? black : white}
        onClick={() => props.playNote(noteNumber)}
      ></div>
    ))}
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(QwertyFM)
