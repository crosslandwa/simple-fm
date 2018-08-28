import React from 'react'
import { connect } from 'react-redux'
import { startPlaying } from './actions'
import QwertyFM from './QwertyFM'

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
  start: () => dispatch(startPlaying()),
})

const App = props => (
  <div style={{
    width: '90vw',
    fontFamily: 'sans-serif',
    fontSize: '90%'
  }}>
    <QwertyFM />
    <button onClick={props.start}>Click to start</button>
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
