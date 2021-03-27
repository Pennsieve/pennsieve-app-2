import { propOr, pathOr, prop } from 'ramda'
import { mapState, mapActions } from 'vuex';

import EventBus from '../../utils/event-bus'

export default {
  computed: {
    ...mapState([
      'config',
      'userToken'
    ]),

    /**
     * Compute dataset endpoint URL
     * @returns {String}
     */
    datasetUrl: function() {
      const url = propOr('', 'apiUrl')(this.config)
      const userToken = prop('userToken', this)
      const datasetId = pathOr('', ['content', 'id'])(this.dataset)

      if (!url || !userToken || !datasetId) {
        return ''
      }
      return `${url}/datasets/${datasetId}?api_key=${userToken}`;
    },
  },

  methods: {
    ...mapActions([
      'removeDataset'
    ]),

    /**
     * Makes XHR call to delete a dataset
     */
    submitDeleteDatasetRequest: function() {
      this.sendXhr(this.datasetUrl, {
        method: 'DELETE'
      })
      .then(this.handleDeleteDatasetSuccess.bind(this))
      .catch(this.handleXhrError.bind(this))
    },

    /**
    * Handles successful dataset delete
    */
    handleDeleteDatasetSuccess: function() {
      this.removeDataset(this.dataset).then(() => {
        EventBus.$emit('toast', {
          detail: {
            msg: 'Dataset deleted'
          }
        })

        this.$router.replace({ name: 'datasets-list' })
      })
    },
  }
}
