import CirlceIcon from './CircleIcon.vue'
import { shallow } from 'vue-test-utils'

describe('CircleIcon.vue', () => {

  let cmp;

  beforeEach(() => {
    cmp = shallow(CirlceIcon)
  })

  it('Displays Icon', () => {
    cmp.setProps({
      icon: 'icon-team'
    })
    const svgIcon = cmp.find('svg-icon')
    const iconProp = svgIcon.vnode.data.attrs.icon
    expect(iconProp).toEqual('icon-team')
  })
})