<template>
  <bf-page class="bf-dataset-list">
    <bf-rafter
      slot="heading"
      :title="pageHeading"
      class="primary"
    >
      <div
        slot="buttons"
        class="buttons"
      >
        <bf-button
          v-if="hasDatasets && !isWorkspaceGuest"
          @click="openNewDatasetDialog"
        >
          New Dataset
        </bf-button>
      </div>

      <div
        slot="bottom"
        class="search-wrap"
      >
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
        <p v-if="hasDatasets">
          {{ searchHeading }}
        </p>
      </div>
    </bf-rafter>

    <bf-stage
      slot="stage"
      v-loading="isLoadingDatasets"
    >
      <div class="dataset-list-controls mb-16">
        <div class="dataset-list-controls-menus">
          <pagination-page-menu
            class="mr-24"
            pagination-item-label="Datasets"
            :page-size="datasetSearchParams.limit"
            @update-page-size="updateDatasetSearchLimit"
          />

          <dataset-filter-menu
            class="mr-24"
            @select="onDatasetFilterSelect"
          />

          <dataset-sort-menu
            class="mr-24"
            :order-by="datasetSearchParams.orderBy"
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
          :page-size="datasetSearchParams.limit"
          :pager-count="5"
          :current-page="curDatasetSearchPage"
          layout="prev, pager, next"
          :total="datasetTotalCount"
          @current-change="onPaginationPageChange"
        />
      </div>
      <div
        v-if="hasDatasets && isLoadingDatasetsError === false"
        class="dataset-list-item-wrap"
      >
        <bf-dataset-list-item
          v-for="dataset in datasets"
          :key="dataset.content.id"
          :dataset="dataset"
          @show-locked-dialog="dialogLockedVisible = true"
        />
      </div>

      <div
        v-if="hasDatasets && isLoadingDatasetsError === false"
        class="dataset-list-controls mt-16"
      >
        <pagination-page-menu
          class="mr-24"
          pagination-item-label="Datasets"
          :page-size="datasetSearchParams.limit"
          @update-page-size="updateDatasetSearchLimit"
        />

        <el-pagination
          :page-size="datasetSearchParams.limit"
          :pager-count="5"
          :current-page="curDatasetSearchPage"
          layout="prev, pager, next"
          :total="datasetTotalCount"
          @current-change="onPaginationPageChange"
        />
      </div>

      <bf-create-new-dataset
        :datasets="datasets"
        :integrations="integrations"
        :visible.sync="newDatasetDialogOpen"
        @close-dialog="newDatasetDialogOpen = false"
      />

      <bf-empty-page-state v-if="isEmptyOrg">
        <img
          src="/static/images/illustrations/illo-datasets.svg"
          alt="Add datasets illustration"
        >

        <h2 class="bf-empty-state-title">
          Create a dataset
        </h2>
        <p>Datasets are where you store, analyze, and share your data. </p>
        <bf-button
          class="new-dataset-button"
          @click="openNewDatasetDialog"
        >
          New Dataset
        </bf-button>
      </bf-empty-page-state>

      <bf-empty-page-state
        v-if="isNoResultsFound"
        class="no-results-found-wrapper"
      >
        <img
          src="/static/images/illustrations/illo-search.svg"
          height="78"
          width="99"
          alt="No results found"
        >

        <h2>No results found</h2>
        <p>No results found for "{{ searchQuery }}". Try a different search term.</p>
      </bf-empty-page-state>

      <el-dialog
        class="simple"
        :show-close="false"
        :visible.sync="dialogLockedVisible"
      >
        <bf-dialog-header slot="title" />

        <dialog-body>
          <svg-icon
            id="icon-kitchen-timer"
            slot="icon"
            icon="icon-kitchen-timer"
            height="42"
            width="40"
            color="#2760FF"
          />
          <h2 slot="heading">
            Good things take time.
          </h2>

          <p>This dataset is currently being published to Pennsieve Discover. To make sure everything copies properly, we’ve locked this dataset temporarily until we’re sure everything is correct.</p>

          <div class="dialog-simple-buttons">
            <bf-button @click="dialogLockedVisible = false">
              Got it
            </bf-button>
          </div>
        </dialog-body>
      </el-dialog>

      <component :is="carouselDialog" />
    </bf-stage>
  </bf-page>
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapState
  } from 'vuex'
  import {
    propOr,
  } from 'ramda'
  import BfRafter from '@/components/shared/bf-rafter/BfRafter.vue'
  import BfButton from '@/components/shared/bf-button/BfButton.vue'
  import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue'
  import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
  import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
  import BfDatasetListItem from './dataset-list-item/BfDatasetListItem.vue'
  import BfCreateNewDataset from './bf-create-new-dataset/BfCreateNewDataset.vue'
  import DatasetFilterMenu from '../DatasetFilterMenu/DatasetFilterMenu.vue'
  import DatasetSortMenu from '../DatasetSortMenu/DatasetSortMenu.vue'
  import PaginationPageMenu from '@/components/shared/PaginationPageMenu/PaginationPageMenu.vue'

  import Sorter from '@/mixins/sorter'
  import Request from '@/mixins/request'
  import UserAccountAge from '@/mixins/user-account-age'

  const OnboardingCarousel = () => import('../../onboarding-carousel/OnboardingCarousel.vue')

  export default {
    name: 'BfDatasetList',

    components: {
      BfRafter,
      BfButton,
      BfDatasetListItem,
      BfCreateNewDataset,
      BfEmptyPageState,
      DialogBody,
      BfDialogHeader,
      DatasetFilterMenu,
      DatasetSortMenu,
      PaginationPageMenu
    },

    mixins: [
      Request,
      Sorter,
      UserAccountAge
    ],

    props: {
      datasets: {
        type: Array,
        default: () => []
      }
    },

    data: function() {
      return {
        newDatasetDialogOpen: false,
        dialogLockedVisible: false,
        sortBy: 'content.name',
        sortOptions: [
          {
            label: 'Sort by Name',
            value: 'content.name'
          },
          {
            label: 'Sort by Last Updated',
            value: 'content.updatedAt'
          }
        ],
        carouselDialog: '',
        searchQuery: '',
        filterName: ''
      }
    },

    computed: {
      ...mapState([
        'isLoadingDatasets',
        'isLoadingDatasetsError',
        'onboardingEvents',
        'datasetFilters',
        'gettingStartedOpen',
        'activeOrganization'
      ]),

      ...mapState('integrationsModule', [
        'integrations'
      ]),

      ...mapState('datasetModule', [
        'datasetSearchParams',
        'datasetTotalCount'
      ]),

      ...mapGetters([
        'activeOrganization',
        'userToken',
        'config',
        'teams',
        'hasFeature'
      ]),

      ...mapGetters('datasetModule', [
        'curDatasetSearchPage'
      ]),

      /**
       * Compute dataset icon sort direction
       * @returns {String}
       */
      sortIconDirection: function () {
        return this.datasetSearchParams.orderDirection === 'Asc' ? 'up' : 'down'
      },

      /**
       * Compute the search heading
       * @returns {String}
       */
      searchHeading: function () {
        const start = this.datasetSearchParams.offset + 1
        const pageRange = this.datasetSearchParams.limit * this.curDatasetSearchPage
        const end = pageRange < this.datasetTotalCount
          ? pageRange
          : this.datasetTotalCount
        const query = this.datasetSearchParams.query

        let searchHeading = `Displaying ${start}-${end} of ${this.datasetTotalCount} results`

        return query === ''
          ? searchHeading
          : `${searchHeading} for “${query}”`
      },

      isEmptyOrg: function() {
        return  !this.isLoadingDatasets &&
          this.isLoadingDatasetsError === false &&
          this.datasets.length === 0 &&
          !this.searchQuery
      },

      isNoResultsFound: function() {
        return !this.isLoadingDatasets &&
          (this.datasets.length === 0
            || this.isLoadingDatasetsError === true
          ) &&
          this.searchQuery
      },

      /**
       * Computes if datasets exist
       * @returns {Boolean}
       */
      hasDatasets: function() {
        return this.datasets.length > 0
      },

      /**
       * Compute page heading
       */
      pageHeading: function() {
        return 'Datasets'
      },

      isWorkspaceGuest: function() {
        const isGuest = propOr(false, 'isGuest', this.activeOrganization)
        return isGuest
      }
    },

    watch: {
      hasDatasets: {
        handler: function(bool) {
          if (bool) {
            this.isLoading = false
          }
        },
        immediate: true
      },
      gettingStartedOpen: {
        handler: function(bool) {
          if (bool) {
            // onboarding carousel
            this.carouselDialog = OnboardingCarousel
          }
        },
        immediate: true
      },
      activeOrganization: {
        handler: function() {
          // Clear search query keywords on org switch
          this.searchQuery = ''
        }
      }
    },

    /**
   * Save dataset filter state
   * @params {Object} to
   * @params {Object} from
   * @params {Function} next
   */
  beforeRouteLeave(to, from, next) {
    if (this.datasetFilters.filterName === '') {
      const datasetFilters = {
        filterName: this.filterName,
        filterOwner: this.filterOwner,
        filterType: this.filterType,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }

      this.setDatasetFilters(datasetFilters)
    }
    next()
  },


    mounted: function() {
      // Set the local search query to match vuex
      this.searchQuery = this.datasetSearchParams.query
      const {
        filterOwner,
        filterType,
        sortBy,
        sortDirection
      } = this.datasetFilters

      this.filterOwner = filterOwner
      this.filterType = filterType
      this.sortBy = sortBy
      this.sortDirection = sortDirection
    },

    methods: {
      ...mapActions([
        'setDatasetFilters'
        ]),
      ...mapActions('datasetModule', [
        'updateDatasetSearchOrderDirection',
        'updateDatasetSearchLimit',
        'updateDatasetSearchQuery',
        'updateDatasetSearchOnlyMyDatasets',
        'updateDatasetSearchStatus',
        'updateDatasetSearchWithRole',
        'updateDatasetSearchWithCollection',
        'updateDatasetSearchOrderBy',
        'updateDatasetOffset'
      ]),

      searchDatasetsByQuery: function(){
        this.updateDatasetSearchQuery(this.searchQuery)
      },

      /**
       * Update offset
       */
      onPaginationPageChange: function(page) {
        const offset = (page - 1) * this.datasetSearchParams.limit
        this.updateDatasetOffset(offset)
      },

      /**
       * Open New Dataset Dialog
       */
      openNewDatasetDialog: function() {
        this.newDatasetDialogOpen = true
      },

      /**
       * Set sort direction
       */
      setSortDir: function () {
        const orderDirection = this.datasetSearchParams.orderDirection === 'Asc'
          ? 'Desc'
          : 'Asc'

        this.updateDatasetSearchOrderDirection(orderDirection)
      },

      /**
       * Update dataset filter
       * @param {Object} filter
       */
      onDatasetFilterSelect: function(filter) {
        const type = propOr('', 'type', filter)
        const value = propOr('', 'value', filter)
        this.filterName = propOr('', 'name', filter)
        this.filterOwner = value === 'ALL_DATASETS' ? 'all-datasets' : 'my-datasets'

        const datasetFilters = {
          filterName: this.filterName,
          filterOwner: this.filterOwner,
          filterType: this.filterType,
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        }

        this.setDatasetFilters(datasetFilters)
        switch (type) {
          case 'owner':
            this.updateDatasetFilterByOwner(filter)
            break
          case 'role':
            this.updateDatasetSearchWithRole(filter.value)
            break
          case 'collection':
            this.updateDatasetSearchWithCollection(filter.id)
            break
          default:
            this.updateDatasetSearchStatus(filter.name)
            break
        }
      },

      /**
       * Update dataset sort
       * @param {Object} selection
       */
      onDatasetSortSelect: function(selection) {
        this.updateDatasetSearchOrderBy(selection.value)
      },

      updateDatasetFilterByOwner: function(filter) {
        const filterVal = propOr('', 'value', filter)
        const isOnlyMyDatasets = filterVal === 'MY_DATASETS'
        this.updateDatasetSearchOnlyMyDatasets(isOnlyMyDatasets)
      }
    }
  }
</script>

<style scoped lang="scss">
@import '../../../assets/_variables.scss';

.no-results-found-wrapper {
  img {
    height: 99px;
    width: 99px;
  }
}
.new-dataset-button {
  margin: 13px 0;
  height: 40px;
  width: 137px;
}

.bf-empty-state-title{
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  line-height: 16px;
}
.dataset-search-form {
  max-width: 400px;
  width: 100%;
}
.search-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  color: $gray_5;
}
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
</style>
