import apply from '../apply'

export const ifAudioContext = (a, b) => apply(AudioContext => AudioContext
  ? a(new AudioContext())
  : b,
window.AudioContext || window.webkitAudioContext)
