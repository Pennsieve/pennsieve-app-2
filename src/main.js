// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './components/app/App.vue'
import { sync } from 'vuex-router-sync'
import store from './vuex/store'
import Clipboard from 'v-clipboard'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import {
  Dialog,
  Form,
  FormItem,
  Input,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  RadioButton,
  Loading,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
  Popover,
  Message,
  Select,
  Option,
  OptionGroup,
  Table,
  TableColumn,
  DatePicker,
  Collapse,
  CollapseItem,
  Spinner,
  Switch,
  Slider,
  Tooltip,
  Pagination,
  InputNumber,
  ButtonGroup,
  Button
} from 'element-ui'
import './assets/element-variables.scss'
import vOutsideEvents from 'vue-outside-events'
import routes from './routes'
import Cookies from 'js-cookie'
import CheckOverflow from './mixins/check-overflow'
import * as svgicon from 'vue-svgicon'
import VueInputAutowidth from 'vue-input-autowidth'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import './assets/icons'
import * as siteConfig from '@/site-config/site.json'

import Amplify from '@aws-amplify/core'
import AWSConfig from '@/utils/aws-exports.js'
Amplify.configure(AWSConfig)

import BfPage from './components/layout/BfPage'
import BfStage from './components/layout/BfStage'

import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

import striptags from 'striptags';
Vue.prototype.$sanitize = (html, allowedTags=['br']) => striptags(html, allowedTags)

import VueGtag from 'vue-gtag'

// configure language
locale.use(lang)

Vue.config.productionTip = false

Vue.config.ignoredElements = [
  'blackfynn-app',
  'blackfynn-view-not-logged-in',
  'blackfynn-view-login',
  'blackfynn-view-404',
  'blackfynn-view-data',
  'blackfynn-view-password',
  'blackfynn-view-viewer',
  'bf-onboarding',
  'iron-icon',
  'bf-viewer-toolbar',
  'bf-viewer-side-panel',
  'bf-viewer-package-title',
  'paper-icon-button',
  'paper-tooltip',
  'blackfynn-data-info-panel',
  'bf-palette-discussion',
  'bf-file-browser',
  'bf-annotations-list',
  'bf-channel-list',
  'bf-palette-navigator',
  'bf-viewer-side-panel-empty-state',
  'bf-zoom-tool',
  'bf-rotate-tool',
  'bf-discussion-add-comment',
  'bf-annotation-group'
]

Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Loading)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Switch)
Vue.use(Popover)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(DatePicker)
Vue.use(Spinner)
Vue.use(Pagination)
Vue.use(Tooltip)
Vue.use(Slider)
Vue.use(VueAwesomeSwiper),
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(VueRouter)
Vue.use(InputNumber)
Vue.use(svgicon, {
  tagName: 'svg-icon'
})
Vue.use(BfPage)
Vue.use(BfStage)
Vue.use(Clipboard)
Vue.component(Message.name, Message)
Vue.use(vOutsideEvents)
Vue.use(VueInputAutowidth)
Vue.use(ButtonGroup)
Vue.use(Button)
Vue.use(VueReCaptcha, {
  siteKey: siteConfig.reCAPTCHASiteKey,
  loaderOptions: {
    autoHideBadge: true,
    explicitRenderParameters: {
      badge: 'bottomleft'
    }
  },
})
// Vue.use(VueContentLoader)


Vue.directive('overflow', {
  inserted: function(el) {
    const label = el.querySelector('.label')
    if (!label) {
      return
    }
    const hasOverflow = CheckOverflow.methods.checkWidth(label)
    if (hasOverflow) {
      el.classList.add('overflow')
    }
  }
})

Vue.prototype.$message = Message

const router = new VueRouter({
  mode: 'history',
  routes
})
sync(store, router)

const isAuthorized = (to, from, next) => {
  const token = Cookies.get('user_token')
  const savedOrgId = Cookies.get('preferred_org_id')
  const stateToken = store.state.userToken

  if (token && !stateToken) {
    store.dispatch('updateUserToken', token)
}

  const allowList = ['home', 'password', 'welcome', 'setup-profile', 'setup-profile-accept', 'verify-account','welcome-to-pennsieve', 'docs-login', 'jupyter-login','create-account']
  if (allowList.indexOf(to.name) < 0 && !token) {
    const destination = to.fullPath
    if (destination && destination.name !== 'page-not-found') {
      next(`/?redirectTo=${destination}`)
    } else {
      next('/
    }
  } else if (token && to.name === 'home' && savedOrgId) {
    next(`/${savedOrgId}/datasets`)
  }
}

// Top level routes allowList
const topLevelRoutes = [
  'datasets-list',
  'people-list',
  'teams-list',
  'integrations',
  'settings',
  'my-settings-container'
]

router.beforeEach((to, from, next) => {
  // ensure user is authorized to use the app
  
  isAuthorized(to, from, next)

    // Store the last route for history
  if (from.name && from.name !== 'viewer') {
    store.dispatch('setLastRoute', from)
  }

  next()
})

router.afterEach((to, from) => {
  window.Intercom('update')

  // Set nav state based on route
  if (topLevelRoutes.indexOf(to.name) >= 0) {
    store.dispatch('togglePrimaryNav', true)
    store.dispatch('condensePrimaryNav', false)
    store.dispatch('condenseSecondaryNav', false)
  }
})

Vue.use(VueGtag, {
  config: { id: siteConfig.googleAnalytics }
}, router)

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
