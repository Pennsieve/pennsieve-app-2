<template>
  <bf-page
    class="search-model"
    element-loading-background="transparent"
  >
    <bf-rafter
      slot="heading"
      :title="modelDisplayName"
    >
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-button
          v-if="recordCount > 0"
          :disabled="isDownloadDisabled"
          @click="downloadRecordCsv"
        >
          Download Results
        </bf-button>
      </div>
    </bf-rafter>
    <bf-stage slot="stage">
      <search-filter
        v-for="(filter, idx) in search.filters"
        :key="filter.id"
        ref="filters"
        v-model="search.filters[idx]"
        class="mb-16"
        :targets="[{
          label: 'Models',
          type: 'model',
          items: [ {
            label: model.displayName,
            value: model.name
          } ]
        }]"
        :is-loading-targets="isLoadingTargets"
        :disabled="false"
        :lock-target="true"
        :show-dataset-label="true"
        @delete="deleteFilter(idx)"
        @enter="$emit('enter')"
        @input-value="onInputValue"
      />

      <div v-show="recordCount > 0">
        <div class="mb-24">
          <button
            class="linked"
            :disabled="search.model === ''"
            @click="addFilter(true)"
          >
            <svg-icon
              name="icon-plus"
              height="24"
              width="24"
            />
            Add Filter
          </button>
        </div>

        <search-results
          ref="searchResults"
          class="mb-48"
          empty-state-copy="Try a different combination of filters"
          :dataset-list="[]"
          :search-criteria="search"
          :show-search-results="true"
          :show-controls="false"
          :show-dataset-column="false"
          :show-menu-column="false"
          :show-download-results="false"
          :is-records-sortable="isSortable"
          :table-search-params="tableSearchParams"
          @reset-search-params="resetSearchParams"
          @sort="setSort"
          @disable-records-button="isDownloadDisabled = $event"
        />
      </div>

      <bf-empty-page-state
        v-if="recordCount === 0"
        class="no-results"
      >
        <img
          src="/static/images/illustrations/illo-search.svg"
          alt=""
        >
        <h3>There are no Records for {{ modelDisplayName }}.</h3>
        <p v-if="propertyCount === 0">
          Before you can create a record, you'll need to add some properties to this model.
        </p>
        <router-link
          v-if="propertyCount > 0"
          :to="{
            name: 'concept-instance',
            params: {
              conceptId: $route.params.conceptId,
              instanceId: 'new'
            }
          }"
        >
          <bf-button
            v-if="getPermission('editor')"
            class="no-results-button"
            :disabled="datasetLocked"
          >
            Create a New Record
          </bf-button>
        </router-link>
        <router-link
          v-else
          :to="{
            name: 'concept-management',
            params: {
              conceptId: $route.params.conceptId
            },
            query: {
              open: 1
            }
          }"
        >
          <bf-button
            v-if="getPermission('editor')"
            class="no-results-button"
          >
            Add Properties
          </bf-button>
        </router-link>
      </bf-empty-page-state>
    </bf-stage>
  </bf-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { pathOr, propOr } from 'ramda'
import uuidv1 from 'uuid/v1'
import debounce from 'lodash/debounce'

import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import SearchFilter from '@/components/SearchAllData/SearchFilter/SearchFilter.vue'
import SearchResults from '@/components/SearchAllData/SearchResults/SearchResults.vue'
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState'

import ValidateFiltersMixin from '@/components/SearchAllData/validate-filters-mixin'

import { MAX_SORTABLE_RECORD_COUNT } from '@/utils/constants'

const searchParams = {
  limit: 25,
  offset: 0,
  orderBy: null,
  ascending: false,
  orderDirection: 'asc'
}

export default {
  name: 'ModelRecords',

  components: {
    BfButton,
    BfEmptyPageState,
    BfRafter,
    SearchFilter,
    SearchResults
  },

  mixins: [ ValidateFiltersMixin ],

  data() {
    return {
      model: {},
      search: {
        model: null,
        isModelInvalid: false,
        filters: [],
        datasets: []
      },
      isLoadingTargets: false,
      tableSearchParams: Object.assign({}, searchParams),
      datasetList: [],
      isDownloadDisabled: false
    }
  },

  computed: {
    ...mapState([
      'concepts',
      'dataset',
      'lastRoute',
    ]),

    ...mapGetters([
      'datasetIntId',
      'getPermission',
      'datasetLocked'
    ]),

    /**
     * Compute the number of records in the model
     * @returns {Number}
     */
    recordCount: function() {
      return this.model.count || 0
    },

    /**
     * Compute the number of properties in the model
     */
    propertyCount: function() {
      return this.model.propertyCount || 0
    },

    /**
     * Get the model's display name
     */
    modelDisplayName: function() {
      return this.model.displayName || 'Files'
    },

    /**
     * Compute search models to limit to the current model
     * @returns {Array}
     */
    searchModels: function() {
      return [
        {
          label: this.model.displayName,
          value: this.model.name
        }
      ]
    },

    /**
     * Compute if the records are sortable
     * This is depending on if the records are under
     * a certain count
     * @returns {Boolean}
     */
    isSortable: function() {
      return this.model.count < MAX_SORTABLE_RECORD_COUNT
    }
  },

  watch: {
    concepts: {
      handler: function(concepts) {
        if (concepts.length) {
          const model = (concepts || []).find(c => c.id === this.$route.params.conceptId) || {}
          this.model = model
        }
      },
      immediate: true
    },

    /**
     * Execute search when the model is set
     * This will search on initial load
     */
    model:{
      handler: function(model) {
        if (Object.keys(model).length) {
          this.search.model = model.name
          this.executeSearch()
        }
      },
      immediate: true
    },

    /**
     * Set the dataset search parameter
     */
    datasetIntId: {
      handler: function(id) {
        this.search.datasets = [id]
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Add filter
     */
    addFilter: function(shouldFocus = false) {
      const datasetId = pathOr('', ['content', 'id'], this.dataset)
      const datasetIntId = pathOr('', ['content', 'intId'], this.dataset)
      const datasetName = pathOr('', ['content', 'name'], this.dataset)

      const filter = {
        id: uuidv1(),
        type: 'model',
        target: this.model.name,
        targetLabel: this.model.displayName,
        property: '',
        propertyLabel: '',
        propertyType: '',
        operation: '',
        operationLabel: '',
        operators: [],
        value: '',
        isInvalid: false,
        datasetId,
        datasetName,
        datasetIntId
      }

      this.search.filters.push(filter)

      if (shouldFocus) {
        this.$nextTick(() => {
          this.focusFilter(this.search.filters.length - 1)
        })
      }
    },

    /**
     * Focus on the last filter
     * @param {Number} idx
     */
    focusFilter: function(idx = 0) {
      const filter = this.$refs.filters[idx]

      if (filter) {
        filter.focus()
      }
    },

    /**
     * Delete filter
     * @params {Number} idx
     */
    deleteFilter: function(idx) {
      this.search.filters.splice(idx, 1)

      this.executeSearch()
    },

    /**
     * Navigate to records details route
     * @param {Object} record
     */
    navigateToRecord: function(record) {
      const recordId = propOr('', 'recordId', record)
      const datasetId = propOr('', 'datasetId', record)
      const modelId = propOr('', 'modelId', record)

      this.$router.push({
        name: 'concept-instance',
        params: {
          instanceId: recordId,
          conceptId: modelId,
          datasetId: datasetId
        }
      })
    },

    /**
     * Resets table search params for pagination
     */
    resetSearchParams: function() {
      this.tableSearchParams = Object.assign({}, searchParams)

      this.$nextTick(() => {
        if(this.search.filters.length) {
          this.$refs.searchResults.fetchRecords()
        } else {
          this.$refs.searchResults.fetchRecordsV1()
        }
      })
    },

    /**
     * Execute search based on search criteria
     */
    executeSearch: function() {
      const isSearchInvalid = this.validateSearch()

      if (isSearchInvalid) {
        return
      }

      this.tableSearchParams = Object.assign({}, searchParams)

      this.$nextTick(() => {
        /*
         * If there are filters, we should use the
         * `/v2/organizations/${this.activeOrgIntId}/search/records` endpoint.
         * Otherwise, we should use `/concepts/instances/
         */
        if(this.search.filters.length) {
          this.$refs.searchResults.fetchRecords()
        } else {
          this.$refs.searchResults.fetchRecordsV1()
        }
      })
    },

    /**
     * Download search results as a CSV
     * Invoke the method on the searchResults components
     */
    downloadRecordCsv: function() {
      this.$refs.searchResults.downloadRecordCsv()
    },

    onInputValue: debounce(function() {
      this.executeSearch()
    }, 500),

    setSort: function(sortOpts) {
      // Update the sorting data
      this.tableSearchParams = {
        ...this.tableSearchParams,
        ...sortOpts
      }

      // Fetch results using new sorting params
      this.$nextTick(() => {
        if(this.search.filters.length) {
          this.$refs.searchResults.fetchRecords()
        } else {
          this.$refs.searchResults.fetchRecordsV1()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.search-model {
  background: #fff;
}

h2 {
  font-size:20px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 16px;
}
/deep/ .records-table .model-title {
  color: $app-primary-color;
  text-decoration: none;
  &:hover, &:focus {
    outline: none;
    text-decoration: underline;
  }
}
</style>
