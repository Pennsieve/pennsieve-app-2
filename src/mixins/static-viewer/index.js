import { pathOr, propOr, head, compose, defaultTo } from 'ramda'
import { mapState } from 'vuex'

import Request from '../../mixins/request'

const getPkgId = compose(
  pathOr('', ['content', 'id']),
  defaultTo({}),
  head,
  defaultTo([])
)

export default {

  mixins: [
    Request
  ],

  props: ['pkg'],

  data() {
    return {
      viewerDataId: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken'
    ]),

    getViewerDataUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      const pkgId = pathOr('', ['content', 'id'], this.pkg)

      if (apiUrl && pkgId && this.userToken) {
        return `${apiUrl}/packages/${pkgId}/view?api_key=${this.userToken}`
      }
    },

    getFileUrl: function() {
      const apiUrl = propOr('', 'apiUrl', this.config)
      const pkgId = pathOr('', ['content', 'id'], this.pkg)

      if (apiUrl && pkgId && this.viewerDataId && this.userToken) {
        return `${apiUrl}/packages/${pkgId}/files/${this.viewerDataId}/presign/?api_key=${this.userToken}`
      }
    },
  },

  watch: {
    getViewerDataUrl: {
      handler: function(url) {
        if (url) {
          this.getViewerData()
        }
      },
      immediate: true
    },
  },

  methods: {
    /**
     * Request viewer data
     */
    getViewerData: function() {
      this.sendXhr(this.getViewerDataUrl)
        .then(this.handleGetViewerData.bind(this))
        .catch(this.handleXhrError.bind(this))
    },

    /**
     * Handle get viewer data hxr response
     * @param {Object} response
     */
    handleGetViewerData: function(response) {
      this.viewerDataId = getPkgId(response)
    }
  }
}
