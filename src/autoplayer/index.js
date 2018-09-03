import React from 'react'
import { connect } from 'react-redux'
import { startPlaying } from './interactions'

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
  start: () => dispatch(startPlaying())
})

const App = props => (
  <div>
    <button onClick={props.start}>Click to start</button>
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
