import User from './User.vue'
import { shallow } from 'vue-test-utils'

describe('User.vue', () => {

  let cmp;

  beforeEach(() => {
    cmp = shallow(User)
  })

  it('Displays User Info', () => {
    cmp.setProps({
      user: {
        firstName: 'Ren',
        lastName: 'Hoek',
        email: 'ren@spumco.com'
      }
    })
    cmp.update()
    const hasAvatar = cmp.find('.icon') ? true : false
    expect(hasAvatar).toBe(true)
    const hasName = cmp.find('.name') ? true : false
    expect(hasName).toBe(true)
    const hasEmail = cmp.find('.email') ? true : false
    expect(hasEmail).toBe(true)
    expect(cmp.vm.avatarClass).toBe('icon')
  })

  it('Does not display email', () => {
    cmp.setProps({
      user: {
        firstName: 'Ren',
        lastName: 'Hoek',
        email: 'ren@spumco.com'
      },
      isOwner: true,
      showEmail: false
    })
    cmp.update()
    const isOwner = cmp.find('.dataset-owner') ? true : false
    expect(isOwner).toBe(true)
    const hasEmail = cmp.find('.email')
    expect(hasEmail.exists()).toBe(false)
    expect(cmp.vm.avatarClass).toBe('icon condensed')
  })
})