import React from 'react'
import { connect } from 'react-redux'
import { pausePlaying, startPlaying, stopPlaying } from './interactions'

const mapStateToProps = state => ({})
const mapDispatchToProps = { pausePlaying, startPlaying, stopPlaying }

const App = props => (
  <div>
    <button onClick={props.startPlaying}>Click to start</button>
    <button onClick={props.pausePlaying}>Click to pause</button>
    <button onClick={props.stopPlaying}>Click to stop</button>
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
