<template>
  <el-dialog
    class="simple"
    :show-close="false"
    :visible.sync="dialogVisible"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        slot="icon"
        icon="icon-person"
        class="person-icon"
        height="32"
        width="32"
        color="currentColor"
      />
      <h2 slot="heading">
        Confirm Removal
      </h2>
      <p>Are you sure you want to remove <strong>{{ displayName }}</strong> from this dataset?</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          @click="removeCollaborator"
        >
          Confirm
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<style lang="scss">
@import '../../../../assets/variables.scss';

.delete-msg {
  text-align: center;
}
.person-icon {
  color: $purple_1;
  margin-bottom: 8px;
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex'

import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'
import EventBus from '../../../../utils/event-bus'
import Request from '../../../../mixins/request'

import { propOr, prop, pathOr, path } from 'ramda'

export default {
  name: 'RemoveCollaborator',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      collaborator: {},
      displayName: ''
    }
  },

  computed: {
    ...mapGetters([
      'config',
      'userToken',
      'dataset'
    ])
  },

  mounted() {
    EventBus.$on('remove-dataset-collaborator', this.onRemoveCollaborator.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('remove-dataset-collaborator', this.onRemoveCollaborator.bind(this))
  },

  methods: {
    ...mapActions([
      'updateDataset'
    ]),

    /**
     * Generates collaborator display name
     * @param {Object} collaborator
     * @returns {String}
     */
    createDisplayName: function(member) {
      const firstName = propOr('', 'firstName', member)
      const lastName = propOr('', 'lastName', member)
      const email = propOr('', 'email', member)

      let str = `${firstName} ${lastName}`
      if (str.trim().length === 0) {
        str = email
      }

      return str.trim()
    },
    /**
     * Closes remove collaborator dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.collaborator = {}
      this.displayName = ''
    },
    /**
     * Handles remove-dataset-collaborator event
     * @param {Object} collaborator
     */
    onRemoveCollaborator: function(collaborator) {
      this.dialogVisible = true
      this.collaborator = collaborator
      this.displayName = this.createDisplayName(collaborator)
    },
    /**
     * Creates DELETE url to remove member from org
     * @returns {String}
     */
    deleteUrl: function() {
      const datasetId = path(['content', 'id'], this.dataset)
      if (!datasetId || !this.userToken) {
        return
      }
      return `${this.config.apiUrl}/datasets/${datasetId}/collaborators?api_key=${this.userToken}`
    },
    /**
     * Makes XHR call to remove member from org
     */
    removeCollaborator: function() {
      const defaultId = propOr(0, 'id', this.collaborator)
      const collaboratorId = pathOr(defaultId, ['team', 'id'], this.collaborator)
      const url = this.deleteUrl()
      if (!url) {
        return
      }
      this.sendXhr(url, {
        method: 'DELETE',
        body: [collaboratorId]
      })
        .then(() => {
          this.$emit('collaborator-removed-from-dataset', collaboratorId)

          const numOrgs = pathOr(0, ['collaboratorCounts', 'organizations'], this.dataset)
          const numTeams = pathOr(0, ['collaboratorCounts', 'teams'], this.dataset)
          const numUsers = pathOr(0, ['collaboratorCounts', 'users'], this.dataset)
          const updatedCounts = {
            collaboratorCounts: {
              organizations: collaboratorId.indexOf('organization:') >= 0 ? numOrgs - 1 : numOrgs,
              teams: collaboratorId.indexOf('team:') >= 0 ? numTeams - 1 : numTeams,
              users: collaboratorId.indexOf('user:') >= 0 ? numUsers - 1 : numUsers
            }
          }
          const updatedDataset = Object.assign({}, this.dataset, updatedCounts)
          this.updateDataset(updatedDataset)

          const datasetName = pathOr('', ['content', 'name'], this.dataset)
          EventBus.$emit('toast', {
            detail: {
              type: 'MESSAGE',
              msg: `${this.displayName} removed from ${datasetName}`
            }
          })

          this.closeDialog()
        })
        .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>
