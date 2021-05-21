import Cookies from 'js-cookie'
import EventBus from '../../utils/event-bus'
import Logger from '../../mixins/logger'
import LogoutHandler from '../../mixins/logout-handler'
import { always, compose, defaultTo, pathOr, prop, propOr, tryCatch, F } from 'ramda'

const _isString = (x) => Object.prototype.toString.call(x) === '[object String]'

const _trimValues = (obj) => {
  Object.keys(obj).forEach(key => {
    if (_isString(obj[key])) {
      obj[key] = obj[key].trim()
    }
  })
}

export default {
  mixins: [
    LogoutHandler,
    Logger,
  ],
  data() {
    return {
      method: 'GET',
      body: null,
      isLoading: true
    }
  },
  methods: {
    /**
     * Sends an XHR request
     * @param {Object} opts
     * @returns {Promise}
     */
    sendXhr: function(url, opts) {
      if (!url) {
        return Promise.reject({status: 400, message: 'Url is missing!'})
      }

      this.isLoading = true
      this.method = propOr('GET', 'method', opts)

      const optsHeader = propOr({}, 'header', opts)
      const headers = Object.assign({}, { 'Content-type': 'application/json' }, optsHeader)

      const optsBody = prop('body', opts)
      let requestOpts = { headers, method: this.method }

      if (optsBody) {
        if (typeof optsBody === 'object') {
          _trimValues(optsBody)
        }
        this.body = JSON.stringify(optsBody)
        requestOpts = Object.assign({}, requestOpts, { body: this.body })
      }

      return fetch(url, requestOpts)
        .then(resp => {
          if (resp.status >= 400) {
            return Promise.reject(resp)
          }
          // if the payload cannot be converted to json, just return the original response
          return resp.json()
            .then(this.finishLoading.bind(this))
            .catch(() => this.finishLoading(resp))
        })
    },
    /**
     * Update isLoading on $nextTick
     * @param {Object} json
     * @returns {Object}
     */
    finishLoading: function(json) {
      this.$nextTick(() => {
        this.isLoading = false
      })
      return json
    },
    /**
     * Handles ajax errors
     * @param {Object} err
     */
    handleXhrError: function(err) {
      this.isLoading = false
      const status = prop('status', err)

      if (status === 400 && err.body) {
        err.body.getReader().read().then(({ done, value }) => {
          const strData = value instanceof Uint8Array ? String.fromCharCode.apply(null, value) : value
          const errorMsg = compose(defaultTo(strData), tryCatch(compose(prop('message'), JSON.parse), (_, v) => v))(strData)
          EventBus.$emit('ajaxError', {
            detail: {
              type: 'error',
              msg: errorMsg
            }
          })
        })
      } // logout
      else if (status === 401) {
        return this.handleLogout()
      } // unauthorized
      // else if (status === 403) {
      //   return this.$router.replace({name: 'datasets-list'})
        // }
      else {
        // emit ajaxError
        EventBus.$emit('ajaxError', err)
      }
    }
  }
}
