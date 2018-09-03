import apply from '../index'

describe('apply', () => {
  it('passes single argument to supplied function', done => {
    apply(a => {
      expect(a).toEqual(1)
      done()
    },
    1)
  })

  it('passes mutliple argument to supplied function', done => {
    apply((a, b) => {
      expect(a).toEqual(1)
      expect(b).toEqual([2, 3])
      done()
    },
    1, [2, 3])
  })

  it('returns the result of calling the supplied function', () => {
    expect(apply(() => 'abc')).toEqual('abc')
  })
})
