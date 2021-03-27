import { isValidPackageName } from './namingConventions'

describe('namingConventions', () => {
  it('Allows valid name', () => {
    const name = '(This) is a valid-name*'
    expect(isValidPackageName(name)).toBe(true)
  })

  it('Disallows double whitespaces', () => {
    const name = 'name  here'
    expect(isValidPackageName(name)).toBe(false)
  })

  it('Allows proper percentage sign', () => {
    const validName = 'name %20 here'
    expect(isValidPackageName(validName)).toBe(true)
    const invalidName = 'name % here'
    expect(isValidPackageName(invalidName)).toBe(false)
  })
})
