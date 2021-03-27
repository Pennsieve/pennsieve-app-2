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
        Delete {{ member.firstName }} {{ member.lastName }}?
      </h2>
      <p>This user will lose access to any datasets shared with this team.</p>
      <h2 class="dialog-simple-buttons">
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
          Delete
        </bf-button>
      </h2>
    </dialog-body>
  </el-dialog>
</template>

<style lang="scss">
@import '../../../assets/variables.scss';

.person-icon {
  color: $dopamine;
}
</style>

<script>
import { mapGetters } from 'vuex'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'

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

  props: {
    team: {
      type: Object
    }
  },

  computed: {
    ...mapGetters([,
      'activeOrganization',
      'userToken',
      'config'
    ])
  },

  data() {
    return {
      dialogVisible: false,
      member: {}
    }
  },

  mounted() {
    EventBus.$on('open-remove-collaborator', this.handleOpenRemoveCollaborator.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('open-remove-collaborator', this.handleOpenRemoveCollaborator.bind(this))
  },

  methods: {
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Handles open-remove-collaborator event
     * @param {Object} member
     */
    handleOpenRemoveCollaborator: function(member) {
      this.dialogVisible = true
      this.member = member
    },
    /**
     * Creates DELETE url to remove member from org
     */
    deleteUrl: function() {
      const orgId = this.activeOrganization.organization.id
      const userToken = this.userToken
      const apiUrl = this.config.apiUrl
      return `${apiUrl}/organizations/${orgId}/teams/${this.team.team.id}/members/${this.member.id}?api_key=${userToken}`
    },
    /**
     * Makes XHR call to remove collaborator from team
     */
    removeCollaborator: function() {
      this.sendXhr(this.deleteUrl(), {
        method: 'DELETE'
      })
      .then(() => {
        this.$emit('team-member-removed', this.member)
        EventBus.$emit('toast', {
          detail: {
            type: 'MESSAGE',
            msg: `${this.member.firstName} ${this.member.lastName} removed from ${this.team.team.name}`
          }
        })
        this.closeDialog()
      })
      .catch(this.handleXhrError.bind(this))
    }
  }
}
</script>
