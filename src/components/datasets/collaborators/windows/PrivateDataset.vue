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
        icon="icon-team"
        height="32"
        width="32"
        color="currentColor"
      />
      <h2 slot="heading">
        Delete Collaborators?
      </h2>
      <p>Making <strong>{{ datasetName }}</strong> private will remove any current collaborators in this dataset.</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="primary"
          @click="removeAllCollaborators"
        >
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

import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import Request from '../../../../mixins/request'
import EventBus from '../../../../utils/event-bus'
import { path, pathOr, propOr, pluck } from 'ramda'

export default {
  name: 'PrivateDataset',

  components: {
    BfButton,
    DialogBody,
    BfDialogHeader
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
      return pathOr('', ['content', 'path'], this.dataset)
    }
  },

  data() {
    return {
      dialogVisible: false
    }
  },

  mounted() {
    EventBus.$on('make-dataset-private', this.onMakeDatasetPrivate.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('make-dataset-private', this.onMakeDatasetPrivate.bind(this))
  },

  methods: {
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Handles make-dataset-private event
     */
    onMakeDatasetPrivate: function() {
      this.dialogVisible = true
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
      const orgId = pathOr(0, ['organization', 'id'], this.activeOrganization)
      const ownerId = propOr('', 'owner', this.dataset)
      const ids =  this.collaborators.length > 0 ? pluck('id', this.collaborators) : [orgId]
      const filteredIds = ids.filter(id => id !== ownerId)
      return filteredIds.length > 0 ? filteredIds : [orgId]
    },
    /**
     * Makes XHR call to remove collaborators from dataset
     */
    removeAllCollaborators: function() {
      const url = this.deleteUrl()
      if (!url) {
        return
      }
      const body = this.getSharedIds()
      this.sendXhr(url, {
        method: 'DELETE',
        body
      })
      .then(() => {
        this.$emit('update-dataset-sharing', 0)
        this.closeDialog()
      })
      .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>
