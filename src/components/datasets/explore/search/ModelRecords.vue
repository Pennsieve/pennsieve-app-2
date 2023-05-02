<template>
  <div class="records-explore">
      <div class="stage-wrapper">
        <div class="results">
          <h1
            slot="heading"
            class="model-name-heading"
          >
            <svg-icon
              v-if="datasetLocked"
              class="mr-8"
              color="#71747C"
              name="icon-lock-filled"
              height="24"
              width="24"
            />
            {{ modelDisplayName }}
          </h1>
<!--          <h3>-->
<!--            Filters-->
<!--            <el-tooltip-->
<!--              placement="right"-->
<!--              content="Results will match the filters across linked metadata records in the dataset."-->
<!--            >-->
<!--              <svg-icon-->
<!--                class="icon-filters"-->
<!--                icon="icon-info-small"-->
<!--                height="24"-->
<!--                width="24"-->
<!--              />-->
<!--            </el-tooltip>-->
<!--          </h3>-->

          <search-filter
            v-for="(filter, idx) in filterParams"
            :key="filter.id"
            ref="filters"
            v-model="filterParams[idx]"
            class="mb-8"
            :targets="targets"
            :is-loading-targets="isLoadingTargets"
            :disabled="false"
            :lock-target="false"
            :show-dataset-label="false"
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

            <record-search-results
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
              :model="selectedModel"
              @reset-search-params="resetSearchParams"
              @sort="setSort"
              @disable-records-button="isDownloadDisabled = $event"
            />
          </div>
        </div>
        <div
          v-if="hasModels"
          class="models-list-wrap"
          :class="{ 'visible': modelsListVisible }"
        >
          <div
            ref="modelsList"
            class="models-list-scroll"
          >
            <models-list
              :show-heading="false"
              :is-link="false"
              :should-reset.sync="resetModelsList"
              :scrolling-list="true"
              @click="clickModel"
            />
          </div>
        </div>
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
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions} from 'vuex'
import { pathOr, propOr, compose } from 'ramda'
import uuidv1 from 'uuid/v1'
import debounce from 'lodash/debounce'

import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import SearchFilter from '@/components/SearchAllData/SearchFilter/SearchFilter.vue'
import RecordSearchResults from '@/components/Metadata/RecordSearchResults.vue'
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState'
import ModelsList from '@/components/datasets/records/ModelsList/ModelsList.vue'

import ValidateFiltersMixin from '@/components/SearchAllData/validate-filters-mixin'
import StatBlock from '@/components/shared/StatBlock/StatBlock.vue'

import { MAX_SORTABLE_RECORD_COUNT } from '@/utils/constants'

const formatNumber = (number) => new Intl.NumberFormat('en-EN').format(number)

const searchParams = {
  limit: 25,
  offset: 0,
  orderBy: null,
  ascending: false,
  orderDirection: 'asc'
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
  name: 'ModelRecords',

  components: {
    BfButton,
    BfEmptyPageState,
    BfRafter,
    SearchFilter,
    RecordSearchResults,
    ModelsList,
    StatBlock
  },

  mixins: [ ValidateFiltersMixin ],

  mounted: function() {
    if (this.dataset.content){
      this.fetchModels()
    }
  },

  data() {
    return {
      // model: {},
      search: {
        model: null,
        isModelInvalid: false,
        filters: [],
        datasets: []
      },
      modelsListVisible: true,
      resetModelsList: false,
      isLoadingTargets: false,
      tableSearchParams: Object.assign({}, searchParams),
      datasetList: [],
      isDownloadDisabled: false
    }
  },

  computed: {
    ...mapState('metadataModule', [
      'models',
      'filters',
      'filterParams',
      'selectedModel'
    ]),

    ...mapState([
      'concepts',
      'dataset',
      'lastRoute',
    ]),

    ...mapGetters([
      'modelsCount',
      'totalRecordsCount',
      'datasetIntId',
      'getPermission',
      'datasetLocked'
    ]),

    /**
     * Compute and format total models
     * @returns {String}
     */
    totalModels: function() {
      return formatNumber(this.modelsCount)
    },

    /**
     * Compute and format total records
     * @returns {String}
     */
    totalRecords: function() {
      return formatNumber(this.totalRecordsCount)
    },

    /**
     * Compute direction for models list arrow based on if it is visible
     * @returns {String}
     */
    modelsListArrowDir: function() {
      return this.modelsListVisible ? 'right' : 'left'
    },

    /**
     * Compute if the dataset has models
     * @returns {Boolean}
     */
    hasModels: function() {
      return this.concepts.length > 0
    },

    /**
     * Compute models list for `SelectModel`
     * @returns {Array}
     */
    modelsList: function() {
      return transformModelListItems(this.models)
    },
    /**
     * Compute all filter items
     * @returns {Array}
     */
    targets: function() {
      return [
        {
          label: 'Models',
          type: 'model',
          items: this.modelsList
        }
      ]
    },

    /**
     * Compute the number of records in the model
     * @returns {Number}
     */
    recordCount: function() {
      return this.selectedModel.count || 0
    },

    /**
     * Compute the number of properties in the model
     */
    propertyCount: function() {
      return this.selectedModel.propertyCount || 0
    },

    /**
     * Get the model's display name
     */
    modelDisplayName: function() {
      return propOr('Unkonwn', 'displayName', this.selectedModel)
      // return this.selectedModel.displayName || 'Files'
    },

    // /**
    //  * Compute search models to limit to the current model
    //  * @returns {Array}
    //  */
    // searchModels: function() {
    //   return [
    //     {
    //       label: this.model.displayName,
    //       value: this.model.name
    //     }
    //   ]
    // },

    /**
     * Compute if the records are sortable
     * This is depending on if the records are under
     * a certain count
     * @returns {Boolean}
     */
    isSortable: function() {
      return this.selectedModel.count < MAX_SORTABLE_RECORD_COUNT
    }
  },

  watch: {
    dataset: {
      handler: function() {
        if (this.dataset.content){
          this.fetchModels()
        }
      }
    },
    selectedModel: {
      handler: function(models) {
        this.executeSearch()
        // if (models.length) {
        //   const model = (models || []).find(c => c.id === this.$route.params.conceptId) || {}
        //   this.model = model
        //
        //   // this.search.model = model.name
        //   this.executeSearch()
        // }
      },
      immediate: true
    },
    models : {
      handler: function() {
        if (this.$route.params.conceptId){
          const m = (this.models || []).find(c => c.id === this.$route.params.conceptId) || {}
          this.setSelectedModel(m.name)
        } else {
          this.setSelectedModel(this.models[0].name)
        }


      }

    }
  },

  methods: {
    ...mapActions('metadataModule', [
      'fetchModels',
      'clearRecords',
      'clearFilters',
      'removeFilter',
      'fetchModelProps',
      'setSelectedModel'
    ]),

    // /**
    //  * Toggle models list visibility and scroll list to the top
    //  */
    // toggleModelsList: function() {
    //   this.modelsListVisible = !this.modelsListVisible
    //
    //   // Scroll list to the top
    //   if (this.modelsListVisible) {
    //     this.$refs.modelsList.scrollTop = 0
    //     this.resetModelsList = true
    //   }
    // },


    clickModel: function(ev) {
      this.setSelectedModel(ev.name)
      console.log('model clicked in records' + ev)
    },
    /**
     * Add filter
     */
    addFilter: function(shouldFocus = false) {
      const datasetId = pathOr('', ['content', 'id'], this.dataset)
      const datasetIntId = pathOr('', ['content', 'intId'], this.dataset)
      const datasetName = pathOr('', ['content', 'name'], this.dataset)

      const newFilter = {
        id: uuidv1(),
        type: 'model',
        target: this.selectedModel.name,
        targetLabel: this.selectedModel.displayName,
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

      this.filterParams.push(newFilter)

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
      let f = this.filterParams[idx]
      this.removeFilter(f.id)
      this.filterParams.splice(idx, 1)
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

      // this.$nextTick(() => {
      //   if(this.search.filters.length) {
      //     this.$refs.searchResults.fetchRecords()
      //   } else {
      //     this.$refs.searchResults.fetchRecordsV1()
      //   }
      // })
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

      // this.$nextTick(() => {
      //   /*
      //    * If there are filters, we should use the
      //    * `/v2/organizations/${this.activeOrgIntId}/search/records` endpoint.
      //    * Otherwise, we should use `/concepts/instances/
      //    */
      //   if(this.search.filters.length) {
      //     this.$refs.searchResults.fetchRecords()
      //   } else {
      //     this.$refs.searchResults.fetchRecordsV1()
      //   }
      // })
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

      // // Fetch results using new sorting params
      // this.$nextTick(() => {
      //   if(this.search.filters.length) {
      //     this.$refs.searchResults.fetchRecords()
      //   } else {
      //     this.$refs.searchResults.fetchRecordsV1()
      //   }
      // })
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/_variables.scss';
.search-model {
  .stat-block {
    color: white;
    text-align: center;
    .stat {
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;
      margin: 0;
    }
    .label {
      font-size: 12px;
    }
  }
}

</style>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';

.search-model {
  background: #fff;
}

h3 {
  margin: 0 0 16px;
}

h2 {
  font-size:20px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 16px;
}

.file-meta-data-info {
  border: 1px solid $gray_2;
  margin-left: 16px;
  border-radius: 4px;
  flex: 0 0 260px;
  max-width: 260px;
  overflow-wrap: anywhere;
}

.header {
  height: 38px;
  font-size: 16px;
  background-color: $gray_1;
  border-bottom: 1px solid $gray_2;
  line-height: 38px;
  padding-left: 16px;
  color: $gray_4;
}

.model-name-heading {
  color: $gray_6;
  margin: 0 0 16px 0;
  text-transform: capitalize;
}

.models-list-wrap {
  background: #fff;
  //box-shadow: -3px 1px 11px 0 rgba(0,0,0,0.21);
  //height: calc(100vh - 130px);
  overflow: hidden;
  //position: absolute;
  right: 0;
  //top: 0px;
  transform: translate3d(100%, 0, 0);
  transition: transform .3s ease-out;
  width: 300px;
  will-change: transform;
  z-index: 3;
  &.visible {
    transform: translate3d(0, 0, 0);
  }
}

.models-list-scroll {
  height: 100%;
  overflow: hidden;
}

.btn-toggle-models-list {
  align-items: center;
  background: #fff;
  //box-shadow: -3px 1px 11px 0 rgba(0, 0, 0, 0.21);
  display: flex;
  height: 32px;
  //left: -33px;
  justify-content: center;
  //position: absolute;
  top: 20px;
  width: 33px;

  &:after {
    background: white;
    content: '';
    height: 100%;
    pointer-events: none;
    //position: absolute;
    top: 0;
    right: -5px;
    width: 5px;
  }
}




.stage-wrapper {
  display: flex;
  flex-direction: row;

  .results {
    flex: 1;
    min-width: 0;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
  }
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
