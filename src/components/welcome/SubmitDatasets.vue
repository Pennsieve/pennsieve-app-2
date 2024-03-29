<template>
  <bf-page class="bf-people-list">

    <bf-stage
      slot="stage"
      v-loading="isLoading"
      element-loading-background="transparent"
    >

      <div class="content">
        <div class="header-wrapper">
          <h1>My Dataset Publication Requests</h1>
          <div>
            <bf-button
              class="primary"
              @click="startNewRequest"
            >
              New Request
            </bf-button>
          </div>
        </div>

        <p> Here, you can request to submit a dataset for a specific repository. The repository will review your request and either accept or reject your request based on the scope of the repository and your justfication for requesting to publish in the selected repository. If your request is rejected, you can request the dataset to be published in a different repository.</p>

      </div>
      <div
        v-if="hasProposals"
        class="integration-list"
      >
        <request-list-item
          v-for="request in datasetProposals"
          :key="request.id"
          :datasetRequest="request"
          @edit="editDatasetProposal"
          @remove="removeDatasetProposalRequest"
          @submit="submitDatasetProposalRequest"
          @withdraw="withdrawDatasetProposalRequest"
          @open-dataset="openDatasetRequest"
        />
      </div>

      <bf-empty-page-state v-if="!hasProposals">
        <img
          src="/static/images/illustrations/illo-datasets.svg"
          alt="Add datasets illustration"
        >
        <h3>Create a dataset proposal</h3>
        You have not created any dataset proposals yet. <p>Create a <strong><a href="#" @click="startNewRequest">New Request</a></strong> to get started.</p>
      </bf-empty-page-state>

      <request-survey
        :visible.sync="requestModalVisible"
        :dataset-request="activeRequest"
        @create-proposal="createProposal"
        @update-proposal="updateProposal"
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

    </bf-stage>
  </bf-page>
</template>

<script>
import {mapState, mapActions, mapGetters,} from "vuex";
import BfButton from '../shared/bf-button/BfButton.vue'
import RequestListItem from './request-list-item/RequestListItem'
import RequestSurvey from './request-survey/RequestSurvey.vue'
import ConfirmationDialog from "../shared/ConfirmationDialog/ConfirmationDialog";
import BfEmptyPageState from '@/components/shared/bf-empty-page-state/BfEmptyPageState.vue';
import EventBus from '../../utils/event-bus'

export default {
  name: 'SubmitDatasets',

  components: {
    ConfirmationDialog,
    BfButton,
    RequestListItem,
    RequestSurvey,
    BfEmptyPageState
  },

  props: {
    datasetProposals: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState('repositoryModule', [
      'requestModalVisible',
    ]),
    ...mapGetters('repositoryModule',[
      'getRepositoryByNodeId',
    ]),

    hasProposals: function() {
      return this.datasetProposals.length > 0
    },

  },
  data() {
    return {
      isLoading: false,
      activeRequest: {},
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

  methods: {
    ...mapGetters(['organizations']),
    ...mapActions('repositoryModule',[
        'updateRequestModalVisible',
        'setSelectedRepo',
        'setSelectedProposal',
        'clearSelectedRepo',
        'fetchProposals',
        'storeNewProposal',
        'storeChangedProposal',
        'removeProposal',
        'submitProposal',
        'withdrawProposal'
      ]
    ),

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

    editDatasetProposal: function(proposal) {
      if (proposal) {
        this.activeRequest = proposal
        this.setSelectedProposal(proposal)
      }
      // set the selected repository, if one is designated on the proposal
      if (proposal && proposal.repositoryId) {
        let repository = this.getRepositoryByNodeId(proposal.organizationNodeId)
        if (repository) {
          this.setSelectedRepo(repository)
        }
      }
      this.updateRequestModalVisible(true)
    },

    confirmedAction: async function(event) {
      console.log("SubmitDatasets::confirmedAction() event:")
      console.log(event)
      this.resetConfirmation()
      if (event.action && event.resource) {
        switch (event.action) {
          case "delete":
            this.removeDatasetProposal(event.resource)
              .catch(err => console.log(err))
            break;
          case "submit":
            this.submitDatasetProposal(event.resource)
              .catch(err => console.log(err))
            break;
          case "withdraw":
            this.withdrawDatasetProposal(event.resource)
              .catch(err => console.log(err))
            break;
        }
      }
    },

    removeDatasetProposal: async function(proposal) {
      console.log("SubmitDatasets::removeDatasetProposal() proposal:")
      console.log(proposal)
      this.removeProposal(proposal)
        .then(() => this.fetchProposals())
        .catch(err => console.log(err))
    },

    submitDatasetProposal: async function(proposal) {
      console.log("SubmitDatasets::submitDatasetProposal() proposal:")
      console.log(proposal)
      this.submitProposal(proposal)
        .then(() => this.fetchProposals())
        .catch(err => console.log(err))
    },

    withdrawDatasetProposal: async function(proposal) {
      console.log("SubmitDatasets::withdrawDatasetProposal() proposal:")
      console.log(proposal)
      this.withdrawProposal(proposal)
        .then(() => this.fetchProposals())
        .catch(err => console.log(err))
    },

    removeDatasetProposalRequest: function(proposal) {
      console.log("SubmitDatasets::removeDatasetProposalRequest() proposal:")
      console.log(proposal)
      this.resetConfirmation()
      this.confirmationDialog = {
        action: 'delete',
        actionMessage: `Remove Dataset Proposal: "${proposal.name}"?`,
        resource: proposal,
        warningMessage: 'This will delete the Dataset Proposal and cannot be undone.',
        confirmActionLabel: 'Remove',
        cancelActionLabel: 'Cancel',
      }
      this.confirmationDialogVisible = true
    },

    submitDatasetProposalRequest: function(proposal) {
      console.log("SubmitDatasets::submitDatasetProposalRequest() proposal:")
      console.log(proposal)
      let repositoryName = "???"
      let repository = this.getRepositoryByNodeId(proposal.organizationNodeId)
      if (repository) {
        repositoryName = repository.displayName
      }
      this.resetConfirmation()
      this.confirmationDialog = {
        action: 'submit',
        actionMessage: `Submit Dataset Proposal: "${proposal.name}"?`,
        resource: proposal,
        warningMessage: `This will submit the dataset proposal to ${repositoryName} for review and consideration.`,
        confirmActionLabel: 'Submit',
        cancelActionLabel: 'Cancel',
      }
      this.confirmationDialogVisible = true
    },

    withdrawDatasetProposalRequest: function(proposal) {
      console.log("SubmitDatasets::withdrawDatasetProposalRequest() proposal:")
      console.log(proposal)
      let repositoryName = "???"
      let repository = this.getRepositoryByNodeId(proposal.organizationNodeId)
      if (repository) {
        repositoryName = repository.displayName
      }
      this.resetConfirmation()
      this.confirmationDialog = {
        action: 'withdraw',
        actionMessage: `Withdraw Dataset Proposal: "${proposal.name}"?`,
        resource: proposal,
        warningMessage: `This will withdraw the request to review and consider the dataset proposal from ${repositoryName}.`,
        confirmActionLabel: 'Withdraw',
        cancelActionLabel: 'Cancel',
      }
      this.confirmationDialogVisible = true
    },

    openDatasetRequest: function(proposal) {
      console.log("SubmitDatasets::openDatasetRequest() proposal:")
      console.log(proposal)
      console.log("SubmitDatasets::openDatasetRequest() organizations:")
      console.log(this.organizations())
      let evt = this.organizations().filter(org => org.organization.id === proposal.organizationNodeId)[0]
      evt.destination = {
        datasetNodeId: proposal.datasetNodeId,
        view: "overview"
      }
      console.log("SubmitDatasets::openDatasetRequest() evt:")
      console.log(evt)
      EventBus.$emit('switch-organization', evt)
      // this.$router.push(`/${proposal.organizationNodeId}/datasets/${proposal.datasetNodeId}/overview`)
    },

    startNewRequest: function() {
      this.activeRequest = {}
      this.clearSelectedRepo()
      this.updateRequestModalVisible(true)
    },

    createProposal: async function(proposal) {
      console.log("SubmitDatasets::createProposal() proposal:")
      console.log(proposal)
      // TODO: make storeNewProposal an async function
      // TODO: if storeNewProposal() succeeds, then call fetchProposals
      this.storeNewProposal(proposal)
        .then(() => this.fetchProposals())
        .catch(err => console.log(err))
    },

    updateProposal: async function(proposal) {
      console.log("SubmitDatasets::updateProposal() proposal:")
      console.log(proposal)
      this.storeChangedProposal(proposal)
        .then(() => this.fetchProposals())
        .catch(err => console.log(err))
    },
  }
}
</script>

<style scoped lang="scss">

.header-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h1 {
  font-size: 22px;
  margin-bottom: 8px;
}

p {
  max-width: 760px;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 380px;
  margin: 48px 0px;
}
.logo {
  width: 300px;
}

.content {
  margin-bottom: 42px;
}

.data-usage {
  text-align: right;
}
.col-spacer {
  height: 17px;
}
.pagination-header {
  display: flex;
  justify-content: space-between
}
</style>