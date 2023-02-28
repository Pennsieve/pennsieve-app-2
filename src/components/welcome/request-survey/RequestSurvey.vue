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
          <repo-selector/>
        </div>

      </div>
      <div>
        <bf-button
          class="primary"
          :disabled="!readyToSave"
          @click="saveDraft"
        >
          Save Draft
        </bf-button>
        <bf-button
          class="primary"
          :disabled="!readyToSubmit"
        >
          Submit Request
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
        />
      </data-card>

      <data-card
        ref="descriptionDataCard"
        class="compact purple question-card"
        title="Please describe the proposed dataset"
        :is-expandable="true"
        :padding="false"
      >
        <template slot="title-aux">
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

      <div class="questions">
        <data-card
          v-for="(question, Id) in repositoryQuestions"
          :key="question.Id"
          ref="surveyDataCard"
          class="compact purple question-card"
          :title="question.Question"
          :is-expandable="true"
          :padding="false"
        >
          <el-input
            v-model="proposal.survey[question.Id]"
          />
        </data-card>
      </div>
    </el-form>

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

import {
  mapState,
  mapActions
} from 'vuex'



export default {
  name: "RequestSurvey",
  components: {
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
        survey: []
      },
      isEditingMarkdown: false,
      isSavingMarkdown: false,
      isLoadingMarkdown: false,
      datasetProposalEmptyState
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

    allRepoQuestionsAnswered: function() {
      if (this.selectedRepoForRequest) {
        let answered = this.surveyResponses()
        return answered.length === this.selectedRepoForRequest.survey.length
      }
      return false
    },
    readyToSave: function() {
      // must have: selected a repo, and provided a name
      return (this.selectedRepoForRequest && this.proposal.name)
    },
    readyToSubmit: function() {
      // readyToSave, and provided a description, and answered questions
      return (this.readyToSave && this.proposal.description && this.allRepoQuestionsAnswered)
    },
    statusStr: function() {
      if (this.datasetRequest.status) {
        return this.datasetRequest.status.toUpperCase();
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
        return this.selectedRepoForRequest.survey
      }
      return []
    }
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
      // populate name
      if (this.datasetRequest && this.datasetRequest.name) {
        this.proposal.name = this.datasetRequest.name
      }
      // populate description
      if (this.datasetRequest && this.datasetRequest.description) {
        this.proposal.description = this.datasetRequest.description
      }
      // populate survey responses
      if (this.datasetRequest && this.datasetRequest.survey) {
        this.datasetRequest.survey.forEach(e => {
          this.proposal.survey[e.QuestionId] = e.Response
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
            QuestionId: index,
            Response: this.proposal.survey[index]
          })
        }
      }
      return responses
    },
    // TODO: note that this.proposal.survey[] has a [0] entry that should be ignored
    createProposal: function() {
      console.log("RequestSurvey::createProposal()")
      let proposal = {
        name: this.proposal.name,
        description: this.proposal.description,
        repositoryId: this.selectedRepoForRequest.organizationId,
        organizationNodeId: this.selectedRepoForRequest.organizationNodeId,
        survey: this.surveyResponses(),
      }
      this.$emit("create-proposal", proposal)
      this.closeDialog()
    },
    updateProposal: function() {
      console.log("RequestSurvey::updateProposal()")
      let proposal = {
        nodeId: this.datasetRequest.nodeId,
        name: this.proposal.name,
        description: this.proposal.description,
        repositoryId: this.selectedRepoForRequest.organizationId,
        organizationNodeId: this.selectedRepoForRequest.organizationNodeId,
        survey: this.surveyResponses(),
      }
      this.$emit("update-proposal", proposal)
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

</style>

<style scoped>

</style>