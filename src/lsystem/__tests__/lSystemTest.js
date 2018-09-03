import { lSystem } from '../index'

describe('L SYSTEM', () => {

  it('generates a sequence based on the requested number of iterations and supplied rules', () => {
    const axiom = 'A'
    const rules = {
      A: () => 'AB',
      B: () => 'ABC'
    }
    expect(lSystem('A', 1, rules)).toEqual('AB')
    expect(lSystem('A', 2, rules)).toEqual('ABABC')
    expect(lSystem('A', 3, rules)).toEqual('ABABCABABCC')
  })

  it('returns the same character where no rule is provided for that character', () => {
    const axiom = 'A'
    const rules = {
      A: () => 'AB',
    }
    expect(lSystem('A', 1, rules)).toEqual('AB')
    expect(lSystem('B', 1, rules)).toEqual('B')
  })
})
