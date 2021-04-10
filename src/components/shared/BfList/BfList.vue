<template>
  <bf-page class="bf-dataset-list">
    <template>
      <bf-rafter
        slot="heading"
        :title="pageHeading"
      >
        <div
          slot="buttons"
          class="buttons"
        >
          <bf-button
            v-if="hasDatasets"
            @click="openNewDatasetDialog"
          >
            New Dataset
          </bf-button>
        </div>
        <dataset-filter
          v-if="hasDatasets"
          slot="bottom"
          :status-filter="false"
          :filter-name.sync="filterName"
          :filter-owner.sync="filterOwner"
          :sort-by.sync="sortBy"
          :sort-direction="sortDirection"
          :sort-options="sortOptions"
          :status-list="orgDatasetStatuses"
          @set-sort="setSortDirection"
        />
      </bf-rafter>

      <bf-stage
        slot="stage"
        v-loading="isLoadingDatasets"
        element-loading-background="transparent"
      >
        <div
          v-if="hasDatasets"
          class="dataset-list-item-wrap"
        >
          <bf-dataset-list-item
            v-for="item in _sortedItemList"
            :key="item.content.id"
            :dataset="item"
            @show-locked-dialog="dialogLockedVisible = true"
          />
        </div>

        <bf-create-new-dataset
          :datasets="datasets"
          :visible.sync="newDatasetDialogOpen"
          @close-dialog="newDatasetDialogOpen = false"
        />

        <div v-if="!hasDatasets">
          <bf-empty-page-state v-if="!hasDatasets && !isLoadingDatasets">
            <img
              src="/static/images/illustrations/illo-datasets.svg"
              alt="Add datasets illustration"
            >

            <h2 class="bf-empty-state-title">
              Create a dataset
            </h2>
            <p>Datasets are where you store, analyze, and share your data.</p>
            <bf-button
              class="new-dataset-button"
              @click="openNewDatasetDialog"
            >
              New Dataset
            </bf-button>
          </bf-empty-page-state>
        </div>

        <bf-empty-page-state
          v-if="showNoResults || showNoStatusResults || showNoDatasetResults"
          class="no-results-found-wrapper"
        >
          <img
            src="/static/images/illustrations/illo-search.svg"
            height="78"
            width="99"
            alt="No results found"
          >

          <h2>No results found</h2>
          <p>Try removing some filters or trying your search again.</p>
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
    </template>
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import {
  filter,
  pathEq,
  reject,
  propOr,
  head,
  compose,
  defaultTo,
  pathOr
} from 'ramda'
import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfDatasetListItem from './../../datasets/dataset-list/dataset-list-item/BfDatasetListItem.vue'
import BfCreateNewDataset from './../../datasets/dataset-list/bf-create-new-dataset/BfCreateNewDataset.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'
import DatasetFilter from '../../shared/DatasetFilter/DatasetFilter.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DatasetFilterSort from '../../../mixins/datasetFilterSort'
import Sorter from '../../../mixins/sorter'
import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'
import UserAccountAge from '../../../mixins/user-account-age'

const OnboardingCarousel = () =>
  import('../../onboarding-carousel/OnboardingCarousel.vue')

export default {
  name: 'BfList',

  components: {
    BfRafter,
    BfButton,
    BfDatasetListItem,
    BfCreateNewDataset,
    BfEmptyPageState,
    DatasetFilter,
    DialogBody,
    BfDialogHeader,
    OnboardingCarousel
  },

  mixins: [Request, Sorter, DatasetFilterSort, UserAccountAge],

  props: {
    datasets: {
      type: Array,
      default: () => []
    },
    listType: {
      type: String,
      default: ''
    }
  },

  data: function() {
    return {
      newDatasetDialogOpen: false,
      newWorkspaceDialogOpen: false,
      dialogLockedVisible: false,
      sortBy: 'content.name',
      sortDirection: 'asc',
      carouselDialog: '',
      filterType: 'datasets'
    }
  },

  computed: {
    ...mapState([
      'isLoadingDatasets',
      'onboardingEvents',
      'datasetFilters',
      'orgDatasetStatuses'
    ]),

    ...mapGetters([
      'activeOrganization',
      'userToken',
      'config',
      'teams',
      'hasFeature'
    ]),

    /**
     * Get activeOrgId
     */
    activeOrgId: function() {
      return pathOr('', ['organization', 'id'], this.activeOrganization)
    },

    /**
     * Compute sort options based on the list type
     * @returns {Array}
     */
    sortOptions: function() {
      const sortOptions = {
        dataset: [
          {
            label: 'Sort by Name',
            value: 'content.name'
          },
          {
            label: 'Sort by Last Updated',
            value: 'content.updatedAt'
          }
        ]
      }
      return propOr([], this.listType, sortOptions)
    },

    /**
     * Compute if the no results found message should appear
     * @returns {Boolean}
     */
    showNoResults: function() {
        return this.filteredDatasets.length === 0 && this.filterName !== ''
    },

    /**
     * Compute if the no results found message should appear
     * when filtering dataset status
     * @returns {Boolean}
     */
    showNoStatusResults: function() {
      return (
        this.filteredDatasets.length === 0 &&
        this.filterOwner !== 'my-datasets' &&
        this.filterOwner !== 'all-datasets'
      )
    },

    /**
     * Compute if the no results found message should appear
     * when filtering my datasets
     * @returns {Boolean}
     */
    showNoDatasetResults: function() {
      return (
        this.filteredDatasets.length === 0 && this.filterOwner === 'my-datasets'
      )
    },

    /**
     * Compute whether or not to render the onboarding carousel
     * @returns {Boolean}
     */
    shouldLaunchCarousel: function() {
      const launchCarousel =
        this.onboardingEvents.indexOf('LaunchCarousel') >= 0
      const lessThan30 = this.userIsLessThan30DaysOld
      return !launchCarousel && lessThan30
    },

    /**
     * Computes if datasets exist
     * @returns {Boolean}
     */
    hasDatasets: function() {
      return this.datasets.length > 0
    },

    /**
     * Sort lists by name
     */
    _sortedItemList: function() {
        const sortedList = this.returnSort(
          this.sortBy,
          this.filteredDatasets,
          this.sortDirection
        )

        // const datasets = reject(
        //   pathEq(['content', 'datasetType'], 'trial'),
        //   sortedList
        // )
        return sortedList
    },

    /**
     * Compute page heading based on datasets or trials
     */
    pageHeading: function() {
      return 'Datasets'
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
    onboardingEvents: {
      handler: function(val) {
        if (val && this.shouldLaunchCarousel) {
          // onboarding carousel
          this.carouselDialog = OnboardingCarousel
        }
      },
      immediate: true
    }
  },

  /**
   * Save dataset filter state
   * @params {Object} to
   * @params {Object} from
   * @params {Function} next
   */
  beforeRouteLeave(to, from, next) {
      const datasetFilters = {
        filterName: this.filterName,
        filterOwner: this.filterOwner,
        filterType: this.filterType,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }

      this.setDatasetFilters(datasetFilters)
    next()
  },

  mounted: function() {
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
    ...mapActions(['setDatasetFilters']),

    /**
     * Open New Dataset Dialog
     */
    openNewDatasetDialog: function() {
      this.newDatasetDialogOpen = true
    },

    /**
     * Open New Workspace Dialog
     */
    openNewWorkspaceDialog: function() {
      this.newWorkspaceDialogOpen = true
    }
  }
}
</script>

<style scoped lang="scss">
.no-results-found-wrapper {
  img {
    height: 99px;
    width: 99px;
  }
}

.no-status-results-found-wrapper {
  margin-bottom: 32px;
  padding: 0 32px;
  padding-top: 84px !important;
  padding-bottom: 114px;
  border: dashed 2px #dadada;
  border-radius: 2px;
  max-width: none !important;
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

.bf-empty-state-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  line-height: 16px;
}
</style>
