import {
  mapActions,
  mapState
} from 'vuex'
import Request from '@/mixins/request/index'

export default {
  mixins: [
    Request
  ],

  computed: {
    ...mapState([
      'config',
      'userToken'
    ])
  },

  methods: {
    ...mapActions([
      'setIsLoadingDatasetDoi',
      'setDatasetDoi'
    ]),

    /**
     * Get DOI for dataset
     * @param {String} datasetId
     */
    getDatasetDoi: function(datasetId) {
      this.setIsLoadingDatasetDoi(true)
      this.setDatasetDoi('')
      const url = `${this.config.apiUrl}/datasets/${datasetId}/doi?api_key=${this.userToken}`
      this.sendXhr(url)
      .then(response => {
        return this.setDatasetDoi(response)
      })
      .catch(this.handleXhrError.bind(this))
      .finally(() => {
        this.setIsLoadingDatasetDoi(false)
      })
    },
  }
}
