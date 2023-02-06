<template>
  <el-dialog
    :visible="visible"
    :custom-class="calculateModalWidth"
    :show-close="false"
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
        <bf-button class="primary">Save Draft</bf-button>
        <bf-button class="primary">Submit Request</bf-button>
      </div>
    </div>


<!--    THESE ANSWERS SHOULD PROBABLY BE WRAPPED IN A FORM-->

    <data-card
      ref="titleDataCard"
      class="compact purple question-card"
      title="What is the proposed name for the dataset?"
      :is-expandable="true"
      :padding="false"
    >
      <el-input
        v-model="firstName"
      />
    </data-card>

    <data-card
      ref="titleDataCard"
      class="compact purple question-card"
      title="Please describe the proposed dataset"
      :is-expandable="true"
      :padding="false"
    >
      <markdown-editor
        ref="markdownEditor"
        value="datasetDescription"
        :is-editing="true"
        :is-saving="false"
        empty-state="datasetDescriptionEmptyState"
        :is-loading="false"
      />
    </data-card>


    <div class="questions">
      <data-card
        v-for="(question, idx) in selectedRepoForRequest.survey"
        :key="question.id"
        ref="descriptionDataCard"
        class="compact purple question-card"
        :title="question.question"
        :is-expandable="true"
        :padding="false"
      >

      </data-card>

    </div>



  </el-dialog>

</template>

<script>
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import MarkdownEditor from '@/components/shared/MarkdownEditor/MarkdownEditor.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import RepoSelector from '@/components/welcome/request-survey/RepoSelector.vue'
import DataCard from "@/components/shared/DataCard/DataCard.vue"


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
      firstName: ""
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

    statusStr: function() {
      if (this.datasetRequest.status) {
        return this.datasetRequest.status.toUpperCase();
      }
      return ""

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
  },
  methods: {
    ...mapActions('repositoryModule',[
        'updateRequestModalVisible'
      ]
    ),
    /**
     * Closes the Search Across All Datasets dialog
     */
    closeDialog: function() {
      this.updateRequestModalVisible(false)
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