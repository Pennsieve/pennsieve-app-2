<template>
  <div>
    <form
      class="mb-8 dataset-search-form"
      @submit.prevent="searchProposalsByQuery"
    >
      <el-input
        ref="input"
        v-model="searchQuery"
        class="dataset-search-input icon-prefix"
        placeholder="Find Datasets"
        @keyup.enter.native="searchProposalsByQuery"
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
      v-if="hasProposals"
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
        v-if="hasProposals && isLoadingDatasetsError === false"
        class="dataset-list-item-wrap"
      >
        <publishing-proposals-list-item
          v-for="proposal in proposals"
          :key="proposals.NodeId"
          :proposal="proposal"
          @view="viewProposal"
          @accept="acceptProposal"
          @reject="rejectProposal"
        />
      </div>


      <bf-empty-page-state v-if="!hasProposals">
        No dataset proposals found
      </bf-empty-page-state>

      <request-survey
        :visible.sync="requestModalVisible"
        :dataset-request="selectedRequest"
        :role="role"
        @accept-proposal="acceptProposal"
        @reject-proposal="rejectProposal"
      />

    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue';
import PublishingProposalsListItem from "./PublishingProposalsListItem";
import DatasetSortMenu from '@/components/datasets/DatasetSortMenu/DatasetSortMenu.vue'
import PaginationPageMenu from '@/components/shared/PaginationPageMenu/PaginationPageMenu.vue'
import RequestSurvey from "@/components/welcome/request-survey/RequestSurvey";

export default {
  name: 'PublishingProposalsList',

  components: {
    BfEmptyPageState,
    PublishingProposalsListItem,
    DatasetSortMenu,
    PaginationPageMenu,
    RequestSurvey
  },

  props: {
    publicationStatus: {
      type: Array,
      default: () => {
        return ['requested']
      },
    }
  },

  beforeRouteEnter: function(to, from, next) {
    next(vm => {
      vm.getInitialData()
      next()
    })
  },

  data() {
    return {
      role: 'publisher',
      isLoadingDatasetsError: false,
      searchQuery: '',
      requestModalVisible: false,
      selectedRequest: {},
    }
  },

  computed: {
    ...mapState('publishingModule', [
      'publishingSearchParams',
      'isLoadingDatasets'
    ]),

    ...mapGetters('publishingModule', [
      'getDatasets'
    ]),

    proposals: function() {
      return this.getDatasets(this.$route.name)
    },

    hasProposals: function() {
      return this.proposals.length > 0
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

    /**
     * Compute dataset icon sort direction
     * @returns {String}
     */
    sortIconDirection: function () {
      return this.publishingSearchParams.orderDirection === 'Asc' ? 'up' : 'down'
    },

    /**
     * Compute current page
     * @returns {Number}
     */
    curPage: function () {
      return this.publishingSearchParams.offset / this.publishingSearchParams.limit + 1
    },
  },

  methods: {
    ...mapActions('publishingModule', [
      'clearSearchParams',
      'fetchDatasetProposals',
      'updatePublishingSearchLimit',
      'updatePublishingSearchOrderBy'
    ]),
    ...mapActions('repositoryModule', [
      'fetchRepositories'
    ]),

    getInitialData: function(){
      this.clearSearchParams()
        .then(() => {
          this.fetchRepositories()
          this.fetchDatasetProposals()
        })
    },

    searchProposalsByQuery: function() {

    },

    /**
     * Update the page limit
     * @param {Number} pageSize
     */
    onPageLimitChange: function(pageSize) {
      this.updatePublishingSearchLimit(pageSize)
    },

    /**
     * Update dataset sort
     * @param {Object} selection
     */
    onDatasetSortSelect: function(selection) {
      this.updatePublishingSearchOrderBy(selection.value)
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

    viewProposal: function(proposal) {
      console.log("PublishingProposalsList::viewProposal() proposal:")
      console.log(proposal)
      this.selectedRequest = proposal
      // this.requestModalVisible = true
    },

    acceptProposal: function(proposal) {
      console.log("PublishingProposalsList::acceptProposal() proposal:")
      console.log(proposal)
      // raise Confirmation Dialog, with callback = acceptProposalConfirmed()
    },

    acceptProposalConfirmed: function() {
      console.log("PublishingProposalsList::acceptProposalConfirmed()")
    },

    rejectProposal: function(proposal) {
      console.log("PublishingProposalsList::rejectProposal() proposal:")
      console.log(proposal)
      // raise Confirmation Dialog, with callback = rejectProposalConfirmed()
    },

    rejectProposalConfirmed: function() {
      console.log("PublishingProposalsList::rejectProposalConfirmed()")
    },

  },
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
