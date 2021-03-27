import { mapGetters } from 'vuex'
import { propOr, pathOr } from 'ramda'

export default {

  data: function() {
    return {
      filterName: '',
      filterOwner: 'all-datasets'
    }
  },

  computed: {
    ...mapGetters([
      'profile'
    ]),

    /**
     * Filter datasets by name, status, and owner
     * @returns {Array}
     */
    filteredDatasets: function() {
      return this.datasets.filter(dataset => {
        const datasetName = propOr(pathOr('', ['content', 'name'], dataset), 'name', dataset)
        const dsName = datasetName.toLowerCase()
        const filterName = this.filterName.toLowerCase()
        const nameIndex = dsName.indexOf(filterName)

        const datasetStatusObj = propOr({}, 'status', dataset)
        const displayName = propOr('', 'displayName', datasetStatusObj)

        if (this.filterOwner !== 'my-datasets' && this.filterOwner !== 'all-datasets') {
          // Filter by status && name
          return displayName === this.filterOwner && nameIndex > -1
        }
        // Filter by Name && Owner
        const isOwner = this.userIsOwner(dataset, 'dataset')
        return isOwner && nameIndex > -1
      })
    },

  },

  methods: {
    /**
       * Compute if the current user is the owner of the dataset
       * @param {Object} dataset
       * @returns {Boolean}
      */
      userIsOwner: function(dataset, type) {
        let isOwner = true
        if (type === 'dataset') {
          if (this.filterOwner === 'my-datasets') {
            const ownerId = propOr(propOr('', 'userId', dataset), 'owner', dataset)
            const profileId = propOr('', 'id', this.profile)

            isOwner = ownerId === profileId
          }
        }

        return isOwner
      }
  }
}
