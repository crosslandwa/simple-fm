export const lSystem = (axiom, iterations, rules) => [...Array(iterations).keys()]
  .reduce(acc => acc.split('').map(c => rules[c] ? rules[c]() : c).join(''), axiom)
