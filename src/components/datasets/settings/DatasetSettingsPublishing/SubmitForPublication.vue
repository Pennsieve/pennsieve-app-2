<template>
  <div class="submit-for-publication">
    <bf-button
      class="primary"
      :disabled="!canPublish || datasetLocked || isRequested"
      <!--check syntax -->
      @click="submitForPublication", "deployChangelogPopup"
    >
      Request to Publish
    </bf-button>
    <changelog-popup
       <!-- :visible.sync="isLoginModalVisible" -->
       <!-- @close-login-dialog="isLoginModalVisible = false" -->
     />
    <submit-dataset-dialog
      :visible.sync="isSubmitDatasetDialogVisible"
      :dataset-id="datasetId"
    />
  </div>

  <!-- </router-link> -->
</template>

<script>
import { PublicationTabs } from '@/utils/constants'
import BfButton from '@/components/shared/bf-button/BfButton';
import SubmitDatasetDialog from '@/components/Publishing/SubmitDatasetDialog/SubmitDatasetDialog.vue'
import { mapGetters } from 'vuex';
import ChangelogPopup from '@/components/datasets/settings/DataSettingsPublishing/ChangelogPopup.vue';
export default {
  components: {
    BfButton,
    SubmitDatasetDialog
  },
  props: {
    datasetId: {
      type: String,
      required: true,
    },
    canPublish: {
      type: Boolean,
      required: true
    },
    isRequested: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isSubmitDatasetDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['datasetLocked']),

    PublicationTabs: function() {
      return PublicationTabs
    }
  },

  methods: {
   /**
    * Open submit for publication dialog
   */
    submitForPublication: function() {
     this.isSubmitDatasetDialogVisible = true
   },
   deployChangelogPopup: function() {
     //
   }
  },
}
</script>
