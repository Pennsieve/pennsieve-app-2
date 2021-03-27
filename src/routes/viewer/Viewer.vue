<template>
  <blackfynn-view-viewer
    ref="viewer"
    :api-url="apiUrl"
    :user-token="userToken"
    :active-organization="JSON.stringify(activeOrganization)"
    :profile="JSON.stringify(profile)"
    :is-package-loading="isPackageLoading"
  />
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import Request from '../../mixins/request/index'
import BfViewerSidePanel from './BfViewerSidePanel.vue'


import { propOr, pathOr, path } from 'ramda'

export default Vue.component('bf-viewer-page', {

  components: {
    BfViewerSidePanel
  },
  mixins: [
    Request
  ],

  data: function() {
    return {
      isPackageLoading: false
    }
  },

  computed: {
    ...mapGetters([
      'config',
      'userToken',
      'profile',
      'getDataset',
      'activeOrganization'
    ]),

    /**
     * Compute the API URL
     * @returns {String}
     */
    apiUrl: function() {
      return propOr('', 'apiUrl', this.config)
    },

    /**
     * Compute the GET file URL
     * @returns {String}
     */
    fileUrl: function() {
      if (this.apiUrl && this.userToken) {
        const id = pathOr('', ['params', 'fileId'], this.$route)
        return `${this.apiUrl}/packages/${id}?api_key=${this.userToken}`
      }
    }
  },

  watch: {
    /**
      * Trigger API request when URL is changed
      */
    fileUrl: function() {
      this.getFile()
    }
  },

  mounted: function() {
    if (this.fileUrl) {
      this.getFile()
    }

    this.$store.watch(this.getDataset, this.setDataset.bind(this))
  },

  methods: {
    /**
    * Get file data to send to bf-viewer
    * @param {Event} e
    */
    getFile: function(e) {
      if (!this.fileUrl) {
        return
      }

      this.isPackageLoading = true;

      this.sendXhr(this.fileUrl)
      .then(response => {
        this.$refs.viewer.openItem({ detail: { item: response }})
        this.isPackageLoading = false

        const datasetId = path(['content', 'datasetId'], response)
        const existingDatasetId = pathOr('', ['content', 'id'], this.dataset)
        if (datasetId && datasetId !== existingDatasetId) {
          this.fetchDataset(datasetId)
        }
      })
      .catch(response => {
        this.handleXhrError(response)
      })
    },

    fetchDataset: function(id) {
      const url = `${this.apiUrl}/datasets/${id}?api_key=${this.userToken}`
      this.sendXhr(url)
        .then(response => {
          this.$store.dispatch('updateDataset', response)
        })
        .catch(response => {
          this.handleXhrError(response)
        })
    },

    setDataset: function(dataset) {
      if (this.$refs.viewer) {
        this.$refs.viewer.set('dataset', dataset)
      }
    }
  }
})
</script>
