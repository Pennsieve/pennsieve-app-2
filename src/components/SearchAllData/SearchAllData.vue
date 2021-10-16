<template>
  <el-dialog
    :visible="visible"
    :custom-class="calculateModalWidth"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Search Across All Datasets"
    />

    <dialog-body>
      <p>Create unique queries to search across all datasets within your organizations.</p>
      <select-model
        v-model="search.model"
        class="mb-32"
        :is-invalid="search.isModelInvalid"
        :models-list="modelsList"
        :loading="isLoadingAllModels"
        @input="onModelChange"
      />
      <search-all-data-filters
        ref="filters"
        v-model="search.filters"
        class="mb-16"
        :datasets="selectedDatasets"
        :models="relatedModelsList"
        :is-loading-targets="isLoadingTargets"
        :disabled="search.model === ''"
        @delete-filter="deleteFilter"
        @enter="executeSearch"
      />

      <div class="mb-24">
        <button
          class="linked"
          :disabled="search.model === ''"
          @click="addFilter"
        >
          <svg-icon
            name="icon-plus"
            height="24"
            width="24"
          />
          Add Filter
        </button>
      </div>

      <div class="filter-actions mb-48">
        <bf-button
          class="btn-search"
          @click="executeSearch"
        >
          Search
        </bf-button>
        <bf-button
          class="secondary"
          @click="clearAll"
        >
          Clear All
        </bf-button>
      </div>

      <template v-if="showSearchResults">
        <h2>Search Results</h2>

        <search-results
          ref="searchResults"
          class="mb-48"
          :dataset-list="selectedDatasets"
          :search-criteria="search"
          :show-search-results="showSearchResults"
          :table-search-params="tableSearchParams"
          @reset-search-params="resetSearchParams"
        />
      </template>

      <search-all-data-recent-search-list
        :recent-searches="savedSearches"
        @load-search="loadSearch"
      />
    </dialog-body>
  </el-dialog>
</template>

<script>
import {
  mapActions,
  mapState
} from 'vuex'
import {
  assoc,
  clone,
  compose,
  defaultTo,
  pathOr,
  prepend,
  propOr,
  take
} from 'ramda'
import uuidv1 from 'uuid/v1'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import SearchAllDataFilters from './SearchAllDataFilters/SearchAllDataFilters.vue'
import SelectModel from './SelectModel/SelectModel.vue'
import SearchAllDataRecentSearchList from './SearchAllDataRecentSearchList/SearchAllDataRecentSearchList.vue'
import SearchResults from './SearchResults/SearchResults.vue'
import ValidateFiltersMixin from './validate-filters-mixin'

import Request from '@/mixins/request'

/**
 * Stub for the original filter
 */
const filter = () => {
  return {
    id: uuidv1(),
    type: '',
    target: '',
    targetLabel: '',
    property: '',
    propertyLabel: '',
    propertyType: '',
    operation: '',
    operationLabel: '',
    operators: [],
    value: '',
    isInvalid: false
  }
}

/**
 * Stub for the original search
 */
const search = {
  model: '',
  isModelInvalid: false,
  filters: [ filter() ]
}

/**
 * Transform models to a label/value list
 * @returns {Array}
 */
const transformModelListItems = (models) => {
  return models.map(model => {
    return {
      label: model.displayName,
      value: model.name
    }
  })
}

export default {
  name: 'SearchAllData',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody,
    SearchAllDataFilters,
    SearchAllDataRecentSearchList,
    SelectModel,
    SearchResults
  },

  mixins: [
    Request,
    ValidateFiltersMixin
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data: function() {
    return {
      search: clone(search),
      savedSearches: [],
      showSearchResults: false,
      allModels: [],
      relatedModels: [],
      isLoadingAllModels: false,
      isLoadingRelatedModels: false,
      selectedDatasets: [],
      mapAllDatasets: new Map(),
      isLoadingAllDatasets: false,
      tableSearchParams: {
        limit: 25,
        offset: 0
      },
      filteredDatasets:[]
    }
  },

  computed: {
    ...mapState([
      'config',
      'activeOrganization',
      'primaryNavOpen',
      'primaryNavCondensed',
      'secondaryNavOpen',
      'searchModalVisible',
      'searchModalSearch',
      'userToken'
    ]),

    /**
     * Compute URL to get all models endpoint
     * @returns {String}
     */
    getAllModelsUrl: function() {
      return `${this.config.conceptsUrl}/v2/organizations/${this.activeOrganizationIntId}/autocomplete/models`
    },

    /**
     * Compute URL to get all models endpoint
     * @returns {String}
     */
    getRelatedModelsUrl: function() {
      return this.search.model
        ? `${this.getAllModelsUrl}?relatedTo=${this.search.model}`
        : ''
    },

    /**
     * Compute URL to get all datasets endpoint
     * @returns {String}
     */
    getAllDatasetsUrl: function() {
      return `${this.config.apiUrl}/datasets?api_key=${this.userToken}`
    },

    /**
     * Compute URL to get the datasets filtered by model endpoint
     * @returns {String}
     */
    getFilteredDatasetsUrl: function() {
      return `${this.config.conceptsUrl}/v2/organizations/${this.activeOrganizationIntId}/autocomplete/models/filter`
    },

    /**
     * Calculate modal width based on navigation width
     * @returns {String}
     */
    calculateModalWidth: function() {
      return this.primaryNavCondensed || this.secondaryNavOpen
        ? 'condensed-nav-modal-width'
        : 'default-nav-modal-width'
    },

    /**
     * Compute active organization intId
     * @returns {String}
     */
    activeOrganizationIntId: function() {
      return pathOr('', ['organization', 'intId'], this.activeOrganization)
    },

    /**
     * Compute models list for `SelectModel`
     * @returns {Array}
     */
    modelsList: function() {
      return compose(
        transformModelListItems,
        propOr([],'models')
      )(this.allModels)
    },

    /**
     * Compute realted models list that are related to the selected model
     * @returns {Array}
     */
    relatedModelsList: function() {
      return compose(
        transformModelListItems,
        propOr([],'models')
      )(this.relatedModels)
    },

    /**
     * Compute if the targets are being loaded
     * This is computed by datasets and related models
     * @returns {Boolean}
     */
    isLoadingTargets: function() {
      return this.isLoadingRelatedModels || this.isLoadingAllDatasets
    }
  },

  watch: {
    activeOrganizationIntId: {
      handler: function(val) {
        // Get saved searches
        this.getSavedSearches(val)

        // Reset search data
        this.clearAll()
        this.selectedDatasets = []
        this.mapDatasets = new Map()
        this.allModels = []
      },
      immediate: true
    },

    /**
     * When a user opens the dialog, make a request
     * for all models they have access to. This is done
     * on open so the request only happens when the user
     * makes a related action
     * @param {Boolean} val
     */
    searchModalVisible: function(val) {
      if (val) {
        this.getData()
      }
    },

    /**
     * Watch selected model and make a request
     * @param {String} val
     */
    getRelatedModelsUrl: function(val) {
      if (val) {
        this.getRelatedModels()
      }
    }
  },

  methods: {
    ...mapActions(['updateSearchModalVisible', 'updateSearchModalSearch']),

    /**
     * Resets table search params for pagination
     */
    resetSearchParams: function(buttonVal) {
      this.tableSearchParams = {
        limit: 25,
        offset: 0
      }
      this.$nextTick(() => {
        if (buttonVal === 'Files') {
          this.$refs.searchResults.fetchFiles()
        } else {
          this.$refs.searchResults.fetchRecords()
        }
      })
    },

    /**
     * Get all data required for the modal
     */
    getData: function() {
      if (this.allModels.length === 0) {
        this.getAllModels()
      }

      if (this.selectedDatasets.length === 0) {
        this.getAllDatasets()
      }

      /**
       * Set a default search term
       * This will allow for other parts of the app to set
       * a search, such as from a model's page
       */
      if (Object.keys(this.searchModalSearch).length) {
        this.search = Object.assign({}, this.search, this.searchModalSearch)
        this.updateSearchModalSearch({})
      }
    },

    /**
     * Get all models
     */
    getAllModels: function() {
      // Set loading state
      this.isLoadingAllModels = true

      this.sendXhr(this.getAllModelsUrl, {
        header: {
          'Authorization': `Bearer ${this.userToken}`
        }
      })
        .then(response => {
          this.allModels = response
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          // Set loading state
          this.isLoadingAllModels = false
        })
    },

    /**
     * Get related models to the model selected
     */
    getRelatedModels: function() {
      // Set loading state
      this.isLoadingRelatedModels = true

      this.sendXhr(this.getRelatedModelsUrl, {
        header: {
          'Authorization': `Bearer ${this.userToken}`
        }
      })
        .then(response => {
          this.relatedModels = response
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          // Set loading state
          this.isLoadingRelatedModels = false
        })
    },

    /**
     * Get all datasets
     */
    getAllDatasets: function() {
      // Set loading state
      this.isLoadingAllDatasets = true

      this.sendXhr(this.getAllDatasetsUrl, {
        header: {
          'Authorization': `Bearer ${this.userToken}`
        }
      })
        .then(response => {
          //all datasets are loaded since no filter are applied
          this.selectedDatasets = response
          //build the map dataset name -> dataset to search for a particular dataset
          for (let i = 0; i < this.selectedDatasets.length; i++) {
            this.mapDatasets.set(this.selectedDatasets[i].content.id, this.selectedDatasets[i])
          }
        })
        .catch(this.handleXhrError.bind(this))
        .finally(() => {
          // Set loading state
          this.isLoadingAllDatasets = false
        })
    },

    /**
    * Get dataset filtered by models
    */
    getFilteredDatasets: function() {

      this.sendXhr(this.getFilteredDatasetsUrl+"/"+this.search.model, {
        header: {
          'Authorization': `Bearer ${this.userToken}`
        }
       })
         .then(response => {
            this.selectedDatasets = []
            for (let j = 0; j < response.datasets.length; j++){
              if(this.mapDatasets.has(response.datasets[j].nodeId)){
                this.selectedDatasets.push(this.mapDatasets.get(response.datasets[j].nodeId))
              }
              else{
                console.error("The dataset ["+response.datasets[j].nodeId+"] contains the model selected but it is not included in all datasets available.")
              }
            }
         })
         .catch(this.handleXhrError.bind(this))
         .finally(() => {
         })


    },

    /**
     * Execute search based on search criteria
     */
    executeSearch: function(shouldAddSavedSearch = true) {
      const isSearchInvalid = this.validateSearch()

      if (isSearchInvalid) {
        return
      }
        this.showSearchResults = true
        this.tableSearchParams = {
          limit: 25,
          offset: 0
        },
        this.$nextTick(() => {
          this.$refs.searchResults.fetchFiles()
          this.$refs.searchResults.fetchRecords()
        })

        if (shouldAddSavedSearch) {
          this.addSavedSearch(this.search)
        }
    },

    /**
     * Get saved searches for the active organization
     * @param {Number} id
     */
    getSavedSearches: function(id) {
      // Get and set saved searches from localStorage
      const savedSearches = localStorage.getItem(`searchAllDataSavedSearches-${id}`)
      if (savedSearches) {
        const parsedSavedSeearches = JSON.parse(savedSearches)
        this.savedSearches = clone(parsedSavedSeearches)
      }
    },

    /**
     * Add search to saved search
     * @param {Object} search
     */
    addSavedSearch: function(search) {
      const curSearch = assoc('date', Date.now(), search)

      const savedSearches = JSON.parse(localStorage.getItem(`searchAllDataSavedSearches-${this.activeOrganizationIntId}`))
      const newSavedSearches = compose(
        take(5),
        prepend(curSearch),
        defaultTo([])
      )(savedSearches)

      this.savedSearches = clone(newSavedSearches)

      localStorage.setItem(`searchAllDataSavedSearches-${this.activeOrganizationIntId}`, JSON.stringify(newSavedSearches))
    },

    /**
     * Load search filters and make
     * request to get search results
     * @param {Object} search
     */
    loadSearch: function(search) {
      this.search = clone(search)

      this.executeSearch(false)
    },

    /**
     * Closes the Search Across All Datasets dialog
     */
    closeDialog: function() {
      this.updateSearchModalVisible(false)
    },

    /**
     * On model change, reset filters
     * and focus on the filter
     */
    onModelChange: function() {
      this.search.filters = [filter()]

      this.getFilteredDatasets()

      this.search.isModelInvalid = false

      this.filteredDatasets = "somesubset of this.allDatasets"
    },

    /**
     * Add filter
     */
    addFilter: function() {
      const newFilter = filter()
      this.search.filters.push(newFilter)

      this.$nextTick(() => {
        this.$refs.filters.focusFilter(this.search.filters.length - 1)
      })
    },

    /**
     * Delete filter
     * @params {Number} idx
     */
    deleteFilter: function(idx) {
      this.search.filters.splice(idx, 1)

      if (this.search.filters.length === 0) {
        this.addFilter()
      }
    },

    /**
     * Clear all inputs
     */
    clearAll: function() {
      this.search = clone(search)
      // we can just hide the table since the result arrays are reset when making
      // a new call to get results
      this.showSearchResults = false
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';

h2 {
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
}

/deep/ .el-dialog {
  height: calc(100vh - 32px);
  border-radius: 3px;
  margin-bottom: 0;
  margin-top: 16px !important;
  .el-dialog__header {
    border-bottom: none;
    padding-bottom: 0px;
  }

  .el-dialog__body {
    padding-top: 7px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: bold;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: $gray_6;
    height: 10px;
    width: 10px;
  }
}

.search-all-data-buttons {
   display: flex;
  .bf-button:first-child {
    margin-right: 16px;
  }
}

p {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;
  color: $gray_4;
}

/deep/ h3 {
  font-size: 14px;
  font-weight: bold;
  color: $gray_6;
}

.filter-actions {
  display: flex;
}
.btn-search {
  margin-right: 16px;
}
.search-all-data-filters {
  max-width: 811px
}
</style>

<style lang="scss">
.default-nav-modal-width {
  width: calc(100vw - 32px - 230px);
  margin-left: 246px;
  overflow-y: auto;
}

.condensed-nav-modal-width {
  width: calc(100vw - 32px - 56px);
  margin-left: 72px;
  overflow-y: auto;
}
</style>
