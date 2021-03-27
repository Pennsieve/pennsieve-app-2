<template>
  <div>
    <form
      class="mb-8 dataset-search-form"
      @submit.prevent="searchDatasetsByQuery"
    >
      <el-input
        ref="input"
        v-model="searchQuery"
        class="dataset-search-input icon-prefix"
        placeholder="Find Datasets"
        @keyup.enter.native="searchDatasetsByQuery"
      >
        <svg-icon
          slot="prefix"
          name="icon-magnifying-glass"
          height="24px"
          width="24px"
          color="#71747c"
        />
      </el-input>
    </form>
    <p
      v-if="hasDatasets"
      class="mb-24"
    >
      {{ searchHeading }}
    </p>

    <div class="dataset-list-controls mb-16">
      <div class="dataset-list-controls-menus">
        <pagination-page-menu
          class="mr-24"
          pagination-item-label="Datasets"
          :page-size="publishingSearchParams.limit"
          @update-page-size="onPageLimitChange"
        />

        <dataset-sort-menu
          class="mr-24"
          :order-by="publishingSearchParams.orderBy"
          @select="onDatasetSortSelect"
        />

        <button
          class="button-icon small icon-sort"
          @click="setSortDir"
        >
          <svg-icon
            name="icon-sort"
            :class="[ sortIconDirection === 'down' ? 'svg-flip' : '' ]"
            color="currentColor"
            :dir="sortIconDirection"
            height="20"
            width="20"
          />
        </button>
      </div>

      <el-pagination
        :page-size="publishingSearchParams.limit"
        :pager-count="5"
        :current-page="curPage"
        layout="prev, pager, next"
        :total="publishingSearchParams.totalCount"
        @current-change="onPaginationPageChange"
      />
    </div>
    <div
      v-loading="isLoadingDatasets"
      element-loading-background="#FBFBFD"
    >
      <div
        v-if="hasDatasets && isLoadingDatasetsError === false"
        class="dataset-list-item-wrap"
      >
        <published-dataset-list-item
          v-for="dataset in datasets"
          :key="generateKey(dataset)"
          :dataset="dataset"
          @publish-dataset="publishDataset"
        />
      </div>


      <bf-empty-page-state v-if="!hasDatasets">
        No datasets found
      </bf-empty-page-state>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { pathOr } from 'ramda'

import PublishedDatasetListItem from '@/components/Publishing/PublishedDatasetListItem/PublishedDatasetListItem.vue'
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
import DatasetSortMenu from '@/components/datasets/DatasetSortMenu/DatasetSortMenu.vue'
import PaginationPageMenu from '@/components/shared/PaginationPageMenu/PaginationPageMenu.vue'

import Request from '@/mixins/request/index'
import DatasetPublishedData from '@/mixins/dataset-published-data'

import toQueryParams from '@/utils/toQueryParams.js'
import { PublicationStatus, PublicationTabs, PublicationTabStatuses } from '@/utils/constants'
import EventBus from '@/utils/event-bus.js'

export default {
  name: 'PublishingDatasetsList',

  components: {
    BfEmptyPageState,
    DatasetSortMenu,
    PaginationPageMenu,
    PublishedDatasetListItem
  },

  mixins: [
    DatasetPublishedData,
    Request
  ],

  props: {
    publicationStatus: {
      type: Array,
      default: () => {
        return ['requested']
      },
    }
  },

  data() {
    return {
      isLoadingDatasetsError: false,
      searchQuery: ''
    }
  },

  computed: {
    ...mapState([
      'config',
      'userToken'
    ]),

    ...mapState('publishingModule', [
      'publishingSearchParams',
      'isLoadingDatasets'
    ]),

    ...mapGetters('publishingModule', [
      'getTotalCount',
      'getDatasets'
    ]),

    PublicationStatus: function() {
      return PublicationStatus
    },

    /**
     * Compute publishing statuses
     * This is to account for the ready for review/pending review tab
     * which is a combination of REQUESTED, ACCEPTED, and FAILED
     * @returns {String}
     */
    includedPublicationStatuses: function() {
      const [head, ...tail] = this.publicationStatus
      return this.publicationStatus.includes(PublicationStatus.REQUESTED) ? PublicationStatus.REQUESTED : head
    },

    /**
     * Compute the datasets by the includedPublicationStatuses
     * @returns {Array}
     */
    datasets: function() {
      return this.getDatasets(this.$route.name)
    },

    /**
     * Compute endpoint URL to get datasets
     * @return {String}
     */
    getDatasetsUrl: function() {
      const queryParams = toQueryParams({
        publicationStatus: this.publicationStatus,
        publicationType: this.publicationType,
        api_key: this.userToken,
        includeBannerUrl: true,
        includePublishStatus: true,
        ...this.datasetSearchParams
      })

      return this.userToken
        ? `${this.config.apiUrl}/datasets/paginated?${queryParams}`
        : ''
    },

    hasDatasets: function() {
      return this.datasets.length > 0
    },

    /**
     * Compute current page
     * @returns {Number}
     */
    curPage: function () {
      return this.publishingSearchParams.offset / this.publishingSearchParams.limit + 1
    },

    /**
     * Compute dataset icon sort direction
     * @returns {String}
     */
    sortIconDirection: function () {
      return this.publishingSearchParams.orderDirection === 'Asc' ? 'up' : 'down'
    },

    /**
     * Compute the search heading
     * @returns {String}
     */
    searchHeading: function () {
      const start = this.publishingSearchParams.offset + 1
      const pageRange = this.publishingSearchParams.limit * this.curPage
      const end = pageRange < this.publishingSearchParams.totalCount
        ? pageRange
        : this.publishingSearchParams.totalCount
      const query = this.publishingSearchParams.query

      let searchHeading = `Displaying ${start}-${end} of ${this.publishingSearchParams.totalCount} results`

      return query === ''
        ? searchHeading
        : `${searchHeading} for “${query}”`
    },
  },

  beforeRouteEnter: function(to, from, next) {
    next(vm => {
      vm.getInitialData()
      next()
    })
  },

  methods: {
    ...mapActions('publishingModule', [
      'updateDatasets',
      'updatePublishingTotalCount',
      'updatePublishingSearchOrderDirection',
      'updatePublishingSearchLimit',
      'updatePublishingSearchQuery',
      'updatePublishingSearchOrderBy',
      'updatePublishingOffset',
      'fetchDatasets',
      'clearSearchParams'
    ]),

    getInitialData: function(){
      this.clearSearchParams()
      .then(() => {
        this.fetchDatasets()
      })
    },

    /**
     * Publish dataset
     * @param {String} id
     */
    publishDataset: function(id) {
      this.sendXhr(`${this.config.apiUrl}/datasets/${id}/publication/accept?api_key=${this.userToken}&publicationType=publication`, {
        method: 'POST'
      })
    },

    /**
     * Set sort direction
     */
    setSortDir: function() {
      const orderDirection = this.publishingSearchParams.orderDirection === 'Asc'
        ? 'Desc'
        : 'Asc'

      this.updatePublishingSearchOrderDirection(orderDirection)
    },

    /**
     * Update offset
     * @param {Number} page
     */
    onPaginationPageChange: function(page) {
      const offset = (page - 1) * this.publishingSearchParams.limit
      this.updatePublishingOffset(offset)
    },

    /**
     * Update dataset sort
     * @param {Object} selection
     */
    onDatasetSortSelect: function(selection) {
      this.updatePublishingSearchOrderBy(selection.value)
    },

    /**
     * Update search query and execute the search
     */
    searchDatasetsByQuery: function(){
      this.updatePublishingSearchQuery(this.searchQuery)
    },

    /**
     * Update the page limit
     * @param {Number} pageSize
     */
    onPageLimitChange: function(pageSize) {
      this.updatePublishingSearchLimit(pageSize)
    },

    /**
     * Account for different dataset object shapes
     * in the published tabs (content object
     * may not be available if the user does not
     * have permissions to the dataset)
     * @returns {String}
     */
    generateKey: function(dataset) {
      const datasetId = pathOr('', ['content', 'intId'], dataset) || dataset.sourceDatasetId
      return datasetId
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/_variables.scss';
.dataset-list-controls {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
.dataset-list-controls-menus {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  .el-dropdown {
    flex-shrink: 0
  }
}
.dataset-search-form {
  max-width: 400px;
  width: 100%;
}
</style>
