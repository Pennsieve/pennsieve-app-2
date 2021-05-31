<template>
  <el-dialog
    class="simple"
    :show-close="false"
    :visible.sync="dialogVisible"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        slot="icon"
        icon="icon-organization"
        height="32"
        width="32"
        color="currentColor"
      />
      <h2 slot="heading">
        Share with your Organization?
      </h2>

      <p>This action will make <strong>{{ datasetName }}</strong> available to any collaborators within <strong>{{ orgName }}</strong>.</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button @click="shareWithEveryone">
          Confirm
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '../../../../assets/variables.scss';

svg {
  color: $purple_1;
}
p {
  text-align: center;
}
</style>

<script>
import { mapGetters } from 'vuex'

import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import Request from '../../../../mixins/request'
import EventBus from '../../../../utils/event-bus'

import { path, pathOr, propOr, pluck } from 'ramda'

export default {
  name: 'OrganizationDataset',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  mixins: [
    Request
  ],

  props: {
    collaborators: {
      type: Array,
      default: []
    }
  },

  computed: {
    ...mapGetters([,
      'activeOrganization',
      'userToken',
      'config',
      'dataset'
    ]),
    datasetName: function() {
      return pathOr('', ['content', 'name'], this.dataset)
    },
    orgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    }
  },

  data() {
    return {
      dialogVisible: false
    }
  },

  mounted() {
    EventBus.$on('share-dataset-with-org', this.onShareDatasetWithOrg.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('share-dataset-with-org', this.onShareDatasetWithOrg.bind(this))
  },

  methods: {
    /**
     * Opens add collaborators modal
     */
    openAddCollaborators: function() {
      this.closeDialog()
      EventBus.$emit('open-add-collaborators')
    },
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Creates DELETE url to remove all collaborators from dataset
     */
    deleteUrl: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Gets either all shared user ids or current active org id
     */
    getSharedIds: function() {
      const ownerId = propOr('', 'owner', this.dataset)
      const ids =  this.collaborators.length > 0 ? pluck('id', this.collaborators) : []
      return ids.filter(id => id !== ownerId)
    },
    /**
     * Makes XHR call to remove collaborators from dataset
     */
    removeAllCollaborators: function() {
      const url = this.deleteUrl()
      const ids = this.getSharedIds()
      if (!url || ids.length === 0) {
        return Promise.resolve()
      }
      return this.sendXhr(url, {
        method: 'DELETE',
        body: ids
      })
      .then(() => {
        this.$emit('update-dataset-sharing', 0)
        this.closeDialog()
      })
    },
    /**
     * Handles share-dataset-with-org event
     */
    onShareDatasetWithOrg: function() {
      this.dialogVisible = true
    },
    /**
     * Creates PUT url to share dataset with entire org
     */
    putUrl: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      if (!this.userToken || !datasetId) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to remove collaborators from dataset
     */
    shareWithOrg: function() {
      const url = this.putUrl()
      const orgId = path(['organization', 'id'], this.activeOrganization)
      if (!url || !orgId) {
        return
      }
      this.sendXhr(url, {
        method: 'PUT',
        body: [orgId]
      })
      .then(() => {
        this.$emit('update-dataset-sharing', 1)
        this.closeDialog()
      })
      .catch(this.handleXhrError.bind(this))
    },
    /**
     * Share with everyone and remove all shared members
     */
    shareWithEveryone: function() {
      this.removeAllCollaborators()
        .then(this.shareWithOrg.bind(this))
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>
