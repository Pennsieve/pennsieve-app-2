<template>
  <el-dialog
    :visible="visible"
    :custom-class="calculateModalWidth"
    :show-close="false"
    @open="openDialog"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Dataset Submission Request"
    />

    <div class="status-info">
      <div class="wrapper">
        <div>
          <div class="status" >
            {{statusStr}}
          </div>
        </div>
        <div>
          <repo-selector
            :locked="proposalLocked"
          />
        </div>

      </div>
      <div>
        <bf-button
          v-if="showSave"
          class="primary"
          :disabled="!readyToSave"
          @click="triggerAction(DatasetProposalAction.SAVE)"
        >
          Save Draft
        </bf-button>
        <bf-button
          v-if="showSubmit"
          class="primary"
          :disabled="!readyToSubmit"
          @click="triggerAction(DatasetProposalAction.SUBMIT)"
        >
          Submit Request
        </bf-button>

        <bf-button
          v-if="showWithdraw"
          class="primary"
          :disabled="!readyToSubmit"
          @click="triggerAction(DatasetProposalAction.WITHDRAW)"
        >
          Retract Request
        </bf-button>

        <bf-button
          v-if="showAccept"
          class="primary"
          :disabled="!readyToAccept"
          @click="triggerAction(DatasetProposalAction.ACCEPT)"
        >
          Accept Proposal
        </bf-button>

        <bf-button
          v-if="showReject"
          class="primary"
          :disabled="!readyToReject"
          @click="triggerAction(DatasetProposalAction.REJECT)"
        >
          Reject Proposal
        </bf-button>
      </div>
    </div>

    <el-form
      id="proposal-request-survey"
      ref="proposalRequestSurvey"
      :model="proposal"
      >
      <data-card
        ref="titleDataCard"
        class="compact purple question-card"
        title="What is the proposed name for the dataset?"
        :is-expandable="true"
        :padding="false"
      >
        <el-input
          v-model="proposal.name"
          :readonly="proposalLocked"
        />
      </data-card>

      <data-card
        ref="descriptionDataCard"
        class="compact purple question-card"
        title="Please describe the proposed dataset"
        :is-expandable="true"
        :padding="false"
      >
        <template v-if="!proposalLocked" slot="title-aux">
          <button
            v-if="!isEditingMarkdown"
            class="linked mr-8"
            :disabled="proposalLocked"
            @click="onClickEditMarkdown"
          >
            Edit
          </button>
          <button
            v-if="isEditingMarkdown"
            class="linked"
            @click="onClickSaveMarkdown"
          >
            Save
          </button>
        </template>
        <markdown-editor
          ref="proposalMarkdownEditor"
          :value="proposal.description"
          :is-editing="isEditingMarkdown"
          :is-saving="isSavingMarkdown"
          :empty-state="datasetProposalEmptyState"
          :is-loading="isLoadingMarkdown"
          @save="saveDescription"
        />
      </data-card>

      <data-card
        ref="contributorsDataCard"
        class="compact purple question-card"
        title="Please list the dataset contributors"
        :is-expandable="true"
        :padding="false"
      >
        <template v-if="!proposalLocked" slot="title-aux">
          <button
            class="linked mr-8"
            :disabled="proposalLocked"
            @click.prevent="onClickAddContributor"
          >
            Add
          </button>
        </template>
        <template v-for="(contributor, idx) in proposal.contributors">
          <proposal-contributor
            :id=contributor.emailAddress
            :index=idx
            :contributor=contributor
            :locked="proposalLocked"
            @edit-contributor="editContributor"
            @remove-contributor="removeContributor"
            />
        </template>
      </data-card>

      <div class="questions">
        <data-card
          v-for="(question, id) in repositoryQuestions"
          :key="question.id"
          ref="surveyDataCard"
          class="compact purple question-card"
          :title="question.question"
          :is-expandable="true"
          :padding="false"
        >
          <el-input
            v-model="proposal.survey[question.id]"
            :readonly="proposalLocked"
          />
        </data-card>
      </div>
    </el-form>

    <proposal-contributor-dialog
      :visible="contributorDialogVisible"
      :all-contributors="datasetRequest.contributors"
      :id="selectedContributorId"
      :contributor="selectedContributor"
      @add-contributor="addContributor"
      @update-contributor="updateContributor"
      @close="closeContributorDialog"
    />

  </el-dialog>

</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import MarkdownEditor from '@/components/shared/MarkdownEditor/MarkdownEditor.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import RepoSelector from '@/components/welcome/request-survey/RepoSelector.vue'
import DataCard from "@/components/shared/DataCard/DataCard.vue"
import datasetProposalEmptyState from './dataset-proposal-empty-state'
import ProposalContributor from "./ProposalContributor";

import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'
import ProposalContributorDialog from "./ProposalContributorDialog";
import {propOr} from "ramda";
import { DatasetProposalAction } from '@/utils/constants';

export default {
  name: "RequestSurvey",
  components: {
    ProposalContributorDialog,
    ProposalContributor,
    BfDialogHeader,
    DialogBody,
    MarkdownEditor,
    BfButton,
    RepoSelector,
    DataCard
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: "owner"
    },
    datasetRequest: {
      type: Object,
      default: {
        name: "",
        repositoryId: 0,
        description: "",
        status: ""
      }
    }
  },
  data: function() {
    return {
      proposal: {
        name: '',
        description: '',
        contributors: [],
        survey: []
      },
      isEditingMarkdown: false,
      isSavingMarkdown: false,
      isLoadingMarkdown: false,
      datasetProposalEmptyState,
      selectedContributorId: '',
      selectedContributor: {},
      contributorDialogVisible: false
    }
  },
  computed: {
    ...mapState([
      'primaryNavCondensed',
      'secondaryNavOpen',
    ]),
    ...mapState('repositoryModule',[
      "isLoadingRepositoryDescription",
      "activeRequest",
      "selectedRepoForRequest"
    ]),

    DatasetProposalAction: function() {
      return DatasetProposalAction
    },

    showSave: function() {
      return this.role === "owner" && !this.proposalLocked
    },

    showSubmit: function() {
      return this.role === "owner" && !this.proposalLocked
    },

    showAccept: function() {
      return this.role === "publisher"
    },

    showReject: function() {
      return this.role === "publisher"
    },

    showWithdraw: function() {
      return this.role === "owner" && this.statusStr === "SUBMITTED"
    },

    readyToSave: function() {
      // must have: selected a repo, and provided a name
      if (this.selectedRepoForRequest && this.proposal.name) {
        return true
      } else {
        return false
      }
    },

    readyToSubmit: function() {
      // readyToSave, and provided a description, and answered questions
      return (this.readyToSave && this.proposal.description && this.allRepoQuestionsAnswered)
    },

    readyToAccept: function() {
      return true
    },

    readyToReject: function() {
      return true
    },

    allRepoQuestionsAnswered: function() {
      if (this.selectedRepoForRequest) {
        let answered = this.surveyResponses()
        return answered.length === this.selectedRepoForRequest.questions.length
      }
      return false
    },

    statusStr: function() {
      if (this.datasetRequest.proposalStatus) {
        return this.datasetRequest.proposalStatus.toUpperCase();
      }
      return "DRAFT"
    },

    proposalLocked: function() {
      return this.statusStr !== "DRAFT"
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
     * If a repository has been selected, return the list of questions
     * @returns {*[]}
     */
    repositoryQuestions: function() {
      if (this.selectedRepoForRequest) {
        return this.selectedRepoForRequest.questions
      }
      return []
    },
  },
  watch: {
    selectedRepoForRequest: function() {
      this.proposal.survey = []
    }
  },
  methods: {
    ...mapActions('repositoryModule',[
        'updateRequestModalVisible'
      ]
    ),

    openDialog: function() {
      console.log("RequestSurvey::openDialog()")

      // populate name
      if (this.datasetRequest && this.datasetRequest.name) {
        this.proposal.name = this.datasetRequest.name
      }
      // populate description
      if (this.datasetRequest && this.datasetRequest.description) {
        this.proposal.description = this.datasetRequest.description
      }
      // populate list of contributors
      if (this.datasetRequest && this.datasetRequest.contributors) {
        console.log("RequestSurvey::openDialog() loading from datasetRequest")
        this.proposal.contributors = this.datasetRequest.contributors
      } // else {
      //   console.log("RequestSurvey::openDialog() populating with fake data")
      //   this.proposal.contributors.push({firstName: 'Some', lastName: 'Researcher', emailAddress: 'scientist@research.org'})
      //   this.proposal.contributors.push({firstName: 'Another', lastName: 'Professor', emailAddress: 'professor@university.edu'})
      // }
      // populate survey responses
      if (this.datasetRequest && this.datasetRequest.survey) {
        this.datasetRequest.survey.forEach(e => {
          this.proposal.survey[e.questionId] = e.response
        })
      }
    },
    /**
     * Closes the Search Across All Datasets dialog
     */
    closeDialog: function() {
      this.clearForm()
      this.updateRequestModalVisible(false)
    },
    clearForm: function() {
      this.proposal = {
        name: '',
        description: '',
        contributors: [],
        survey: []
      }
    },
    onClickEditMarkdown: function(evt) {
      evt.preventDefault()
      this.isEditingMarkdown = true
    },
    onClickSaveMarkdown: function(evt) {
      evt.preventDefault()
      this.isSavingMarkdown = true
    },
    saveDescription: function(markdown) {
      this.proposal.description = markdown
      this.isEditingMarkdown = false
      this.isSavingMarkdown = false
    },
    saveDraft: function() {
      console.log("RequestSurvey::saveDraft()")
      // this.datasetRequest: prop (if empty, then this is a new request)
      // this.proposal: form data
      // this.selectedRepoForRequest
      if (this.datasetRequest && this.datasetRequest.id) {
        this.updateProposal()
      }
      else {
        this.createProposal()
      }
    },
    surveyResponses: function() {
      let responses = []
      for (let index = 0; index < this.proposal.survey.length; index++) {
        if (this.proposal.survey[index]) {
          responses.push({
            questionId: index,
            response: this.proposal.survey[index]
          })
        }
      }
      return responses
    },
    /**
     *
     */
    resetContributorDialog: function() {
      this.selectedContributorId = ''
      this.selectedContributor = {}
    },
    onClickAddContributor: function() {
      console.log("RequestSurvey::onClickAddContributor()")
      this.resetContributorDialog()
      this.contributorDialogVisible = true
    },
    editContributor: function(event) {
      console.log("RequestSurvey::editContributor() event:")
      console.log(event)
      this.selectedContributorId = event.id
      this.selectedContributor = event.contributor
      this.contributorDialogVisible = true
    },
    removeContributor: function(event) {
      console.log("RequestSurvey::removeContributor() event:")
      console.log(event)
      // search this.proposal.contributors where email === event.id, and remove it
      let update = this.proposal.contributors.filter(e => e.emailAddress !== event.id)
      this.proposal.contributors = update
      this.resetContributorDialog()
      this.contributorDialogVisible = false
    },
    addContributor: function(event) {
      console.log("RequestSurvey::addContributor() event:")
      console.log(event)
      this.proposal.contributors.push({
        firstName: event.contributor.firstName,
        lastName: event.contributor.lastName,
        emailAddress: event.contributor.emailAddress
      })
      this.resetContributorDialog()
      this.contributorDialogVisible = false
    },
    updateContributor: function(event) {
      console.log("RequestSurvey::updateContributor() event:")
      console.log(event)
      // search this.proposal.contributors where email === event.id, and replace that with event.contributor
      // let update = this.proposal.contributors.map(c =>  || c)
      // this.proposal.contributors = update
      let index = this.proposal.contributors.findIndex(e => e.emailAddress === event.id)
      console.log(`RequestSurvey::updateContributor() index: ${index}`)
      if (index >= 0) {
        this.proposal.contributors[index] = event.contributor
      }
      this.resetContributorDialog()
      this.contributorDialogVisible = false
    },
    closeContributorDialog: function(event) {
      console.log("RequestSurvey::closeContributorDialog() event:")
      console.log(event)
      this.resetContributorDialog()
      this.contributorDialogVisible = false
    },
    /**
     *
     */
    synthesizeProposal: function() {
      console.log("RequestSurvey::synthesizeProposal()")
      let proposal = {
        nodeId: propOr(undefined, "nodeId", this.datasetRequest),
        name: this.proposal.name,
        description: this.proposal.description,
        repositoryId: this.selectedRepoForRequest.repositoryId,
        organizationNodeId: this.selectedRepoForRequest.organizationNodeId,
        datasetNodeId: propOr(undefined, "datasetNodeId", this.datasetRequest),
        status: propOr("DRAFT", "status", this.datasetRequest),
        survey: this.surveyResponses(),
        contributors: this.proposal.contributors,
        createdAt: propOr(undefined, "createdAt", this.datasetRequest),
        updatedAt: propOr(undefined, "updatedAt", this.datasetRequest),
      }
      console.log("RequestSurvey::synthesizeProposal() proposal:")
      console.log(proposal)
      return proposal
    },

    triggerAction: function(action) {
      console.log(`RequestSurvey::triggerAction() action: ${action}`)
      switch (action) {
        case DatasetProposalAction.SAVE:
          this.saveDraft()
          break;
        case DatasetProposalAction.SUBMIT:
          break;
        case DatasetProposalAction.ACCEPT:
          break;
        case DatasetProposalAction.REJECT:
          break;
      }
    },

    // TODO: note that this.proposal.survey[] has a [0] entry that should be ignored
    createProposal: function() {
      console.log("RequestSurvey::createProposal()")
      this.$emit("create-proposal", this.synthesizeProposal())
      this.closeDialog()
    },
    updateProposal: function() {
      console.log("RequestSurvey::updateProposal()")
      this.$emit("update-proposal", this.synthesizeProposal())
      this.closeDialog()
    },

  }
}
</script>

<style lang="scss">

.status-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .wrapper {
    display: flex;
    flex-direction: column;
  }
}

.el-dialog {
  margin-top: 16px !important;
}
.default-nav-modal-width {
  width: calc(100vw - 32px - 230px);
  margin-left: 246px;
  overflow-y: auto;
  margin-top: 0px;

}

.condensed-nav-modal-width {
  width: calc(100vw - 32px - 56px);
  margin-left: 72px;
  overflow-y: auto;
  margin-top: 0px;
}

.question-card {
  margin: 8px 0;
}

//.el-input__inner {
//  background-color: red !important;
//}

</style>

<style scoped>

</style>