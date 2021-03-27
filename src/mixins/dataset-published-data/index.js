import { mapGetters } from 'vuex'
import {
  defaultTo,
  propOr,
  path
} from 'ramda'

export default {
  computed: {
    ...mapGetters([
      'getPublishedDataByIntId'
    ]),

    /**
     * Compute published data
     */
    publishedData: function() {
      const dataset = defaultTo({}, this.dataset)
      const datasetIntId = path(['content', 'intId'], dataset) || dataset.sourceDatasetId
      return this.getPublishedDataByIntId(datasetIntId)
    },

    /**
     * Compute published count
     * @returns {String}
     */
    publishedCount: function() {
      return propOr(1, 'publishedVersionCount', this.publishedData)
    },

    /**
     * Compute published status
     * @returns {String}
     */
    publishStatus: function() {
      return propOr('NOT_PUBLISHED', 'status', this.publishedData)
    },

    /**
     * Compute if the dataset is published
     * @returns {Boolean}
     */
    isPublished: function() {
      const status = propOr('NOT_PUBLISHED', 'status', this.publishedData)
      return status !== 'NOT_PUBLISHED' && status !== 'UNPUBLISHED'
    },

    /**
     * Compute link for dataset on discover
     * @returns {String}
     */
    discoverLink: function() {
      const publishedDatasetId =  propOr(1, 'publishedDatasetId', this.publishedData)

      return this.config.environment === 'prod'
        ? `https://discover.blackfynn.com/datasets/${publishedDatasetId}`
        : `https://discover.blackfynn.net/datasets/${publishedDatasetId}`
    },

    /**
     * Compute published date
     * @returns {String}
     */
    publishedDate: function() {
      const date = propOr('', 'lastPublishedDate', this.publishedData)
      return this.formatDate(date)
    }
  }
}
