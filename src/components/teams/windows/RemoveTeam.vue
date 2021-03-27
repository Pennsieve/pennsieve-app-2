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
        class="team-icon"
        icon="icon-team"
        height="32"
        width="32"
        color="currentColor"
      />
      <h2 slot="heading">
        Delete {{ teamName }}?
      </h2>
      <p>Collaborators will lose access to any datasets shared with this team.</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          @click="removeTeam"
        >
          Delete
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<style lang="scss">
@import '../../../assets/variables.scss';

.team-icon {
  color: $dopamine;
}
</style>

<script>
import { mapGetters } from 'vuex'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import Request from  '../../../mixins/request'
import EventBus from '../../../utils/event-bus'
import { propOr, pathOr } from 'ramda'

export default {
  name: 'RemoveTeam',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    Request
  ],

  computed: {
    ...mapGetters([,
      'activeOrganization',
      'userToken',
      'config'
    ]),
    teamName: function() {
      const defaultName = propOr('Team', 'name', this.team)
      const teamName = pathOr(defaultName, ['team', 'name'], this.team)
      return teamName
    }
  },

  data() {
    return {
      dialogVisible: false,
      team: {}
    }
  },

  mounted() {
    EventBus.$on('open-remove-team', this.handleRemoveTeam.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('open-remove-team', this.handleRemoveTeam.bind(this))
  },

  methods: {
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    },
    /**
     * Handles remove-team event
     * @param {Object} teamData
     */
    handleRemoveTeam: function(teamData) {
      this.dialogVisible = true
      this.team = teamData.team
    },
    /**
     * Creates DELETE url to remove member from org
     */
    deleteUrl: function() {
      const orgId = this.activeOrganization.organization.id
      const userToken = this.userToken
      const apiUrl = this.config.apiUrl
      return `${apiUrl}/organizations/${orgId}/teams/${this.team.id}?api_key=${userToken}`
    },
    /**
     * Makes XHR call to remove team from org
     */
    removeTeam: function() {
      const url = this.deleteUrl()
      this.sendXhr(url, {
        method: 'DELETE'
      })
      .then(() => {
        const teamName = propOr('Team', 'name', this.team)
        const orgName = pathOr('organization', ['organization', 'name'], this.activeOrganization)
        EventBus.$emit('toast', {
          detail: {
            type: 'MESSAGE',
            msg: `${teamName} removed from ${orgName}`
          }
        })
        if (this.$route.name === 'team-members-list') {
          return this.$router.push('../teams')
        }
        this.closeDialog()
        this.$emit('team-removed', {team: this.team})
      })
      .catch(this.handleXhrError.bind(this))

    }
  }
}
</script>
