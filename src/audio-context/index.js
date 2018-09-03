const apply = (f, x) => f(x)

export const ifAudioContext = (a, b) => apply(AudioContext => AudioContext
  ? a(new AudioContext())
  : b,
  window.AudioContext || window.webkitAudioContext
)
