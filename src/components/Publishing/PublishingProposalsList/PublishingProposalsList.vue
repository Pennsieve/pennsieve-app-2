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
          :key="proposals.nodeId"
          :proposal="proposal"
          @view="viewProposal"
          @accept="acceptDatasetProposalRequest"
          @reject="rejectDatasetProposalRequest"
        />
      </div>


      <bf-empty-page-state v-if="!hasProposals">
        No dataset proposals found
      </bf-empty-page-state>

      <request-survey
        :visible.sync="requestModalVisible"
        :dataset-request="selectedRequest"
        :role="role"
        @accept="acceptDatasetProposalRequest"
        @reject="rejectDatasetProposalRequest"
      />

      <confirmation-dialog
        :visible="confirmationDialogVisible"
        :action="confirmationDialog.action"
        :action-message="confirmationDialog.actionMessage"
        :resource="confirmationDialog.resource"
        :info-message="confirmationDialog.infoMessage"
        :warning-message="confirmationDialog.warningMessage"
        :acknowledgements="confirmationDialog.acknowledgements"
        :confirm-action-label="confirmationDialog.confirmActionLabel"
        :cancel-action-label="confirmationDialog.cancelActionLabel"
        @close="confirmationDialogVisible = false"
        @confirmed="confirmedAction"
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
import ConfirmationDialog from "@/components/shared/ConfirmationDialog/ConfirmationDialog";

export default {
  name: 'PublishingProposalsList',

  components: {
    BfEmptyPageState,
    PublishingProposalsListItem,
    DatasetSortMenu,
    PaginationPageMenu,
    RequestSurvey,
    ConfirmationDialog
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
      selectedRequest: {},
      confirmationDialogVisible: false,
      confirmationDialog: {
        action: '',
        actionMessage: '',
        resource: {},
        infoMessage: '',
        warningMessage: '',
        acknowledgements: [],
        confirmActionLabel: '',
        cancelActionLabel: '',
      },
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

    ...mapState('repositoryModule', [
      'requestModalVisible',
    ]),

    ...mapGetters('repositoryModule',[
        'getRepositoryById'
      ]
    ),

    proposals: function() {
      return this.getDatasets(this.$route.name)
    },

    hasProposals: function() {
      return this.proposals != null && this.proposals.length > 0
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
      'fetchRepositories',
      'fetchProposals',
      'updateRequestModalVisible',
      'setSelectedRepo',
      'setSelectedProposal',
      'acceptProposal',
      'rejectProposal'
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
      // set selected proposal
      if (proposal) {
        this.selectedRequest = proposal
        this.setSelectedProposal(proposal)
      }
      // set selected repo
      if (proposal && proposal.repositoryId) {
        console.log(`PublishingProposalsList::viewProposal() proposal.repositoryId: ${proposal.repositoryId}`)
        let repository = this.getRepositoryById(proposal.repositoryId)
        console.log("PublishingProposalsList::viewProposal() repository:")
        console.log(repository)
        this.setSelectedRepo(repository)
      }
      // enable modal visibility
      this.updateRequestModalVisible(true)
    },

    resetConfirmation: function() {
      this.confirmationDialogVisible = false
      this.confirmationDialog = {
        action: '',
        actionMessage: '',
        resource: {},
        infoMessage: '',
        warningMessage: '',
        acknowledgements: [],
        confirmActionLabel: '',
        cancelActionLabel: '',
      }
    },

    confirmedAction: async function(event) {
      console.log("PublishingProposalsList::confirmedAction() event:")
      console.log(event)
      this.updateRequestModalVisible(false)
      this.resetConfirmation()
      if (event.action && event.resource) {
        switch (event.action) {
          case "accept":
            this.acceptDatasetProposal(event.resource)
              .catch(err => console.log(err))
            break;
          case "reject":
            this.rejectDatasetProposal(event.resource)
              .catch(err => console.log(err))
            break;
        }
      }
    },

    acceptDatasetProposalRequest: function(proposal) {
      console.log("PublishingProposalsList::acceptDatasetProposalRequest() proposal:")
      console.log(proposal)
      // raise Confirmation Dialog
      this.resetConfirmation()
      this.confirmationDialog = {
        action: 'accept',
        actionMessage: `Accept Dataset Proposal: "${proposal.name}"?`,
        resource: proposal,
        warningMessage: 'This will accept the Dataset Proposal.',
        confirmActionLabel: 'Accept',
        cancelActionLabel: 'Cancel',
      }
      this.confirmationDialogVisible = true
    },

    acceptDatasetProposal: async function(proposal) {
      console.log("PublishingProposalsList::acceptDatasetProposal() proposal:")
      console.log(proposal)
      // invoke repositoryModule::acceptProposal()
      this.acceptProposal(proposal)
        .then(() => this.fetchDatasetProposals())
        .catch(err => console.log(err))
    },

    rejectDatasetProposalRequest: function(proposal) {
      console.log("PublishingProposalsList::rejectDatasetProposalRequest() proposal:")
      console.log(proposal)
      // raise Confirmation Dialog
      this.resetConfirmation()
      this.confirmationDialog = {
        action: 'reject',
        actionMessage: `Reject Dataset Proposal: "${proposal.name}"?`,
        resource: proposal,
        warningMessage: 'This will reject the Dataset Proposal.',
        confirmActionLabel: 'Reject',
        cancelActionLabel: 'Cancel',
      }
      this.confirmationDialogVisible = true
    },

    rejectDatasetProposal: function(proposal) {
      console.log("PublishingProposalsList::rejectProposalConfirmed() proposal:")
      console.log(proposal)
      // invoke repositoryModule::rejectProposal()
      this.rejectProposal(proposal)
        .then(() => this.fetchDatasetProposals())
        .catch(err => console.log(err))
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
