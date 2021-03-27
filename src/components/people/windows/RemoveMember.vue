<template>
  <el-dialog
    class="simple"
    :show-close="false"
    :visible.sync="dialogVisible"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />

    <dialog-body>
      <h2 slot="heading">
        Confirm Deletion
      </h2>
      <p>Are you sure you want to delete the member: <strong>{{ memberDisplayName }}</strong>?</p>

      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          @click="removeMember"
        >
          Confirm
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<style lang="scss">
</style>

<script>
import { mapGetters } from 'vuex'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import EventBus from '../../../utils/event-bus'
import { propOr } from 'ramda'

export default {
  name: 'RemoveMember',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
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
      member: {},
      memberDisplayName: ''
    }
  },

  mounted() {
    EventBus.$on('remove-org-member', this.handleRemoveOrgMember.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('remove-org-member', this.handleRemoveOrgMember.bind(this))
  },

  methods: {
    /**
     * Generates member display name
     * @param {Object} member
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
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.member = {}
      this.memberDisplayName = ''
    },
    /**
     * Handles remove-org-member event
     * @param {Object} member
     */
    handleRemoveOrgMember: function(member) {
      this.dialogVisible = true
      this.member = member
      this.memberDisplayName = this.createDisplayName(member)
    },
    /**
     * Creates DELETE url to remove member from org
     */
    createUrl: function() {
      const orgId = this.activeOrganization.organization.id;
      const userToken = this.userToken;
      const apiUrl = this.config.apiUrl;
      let endpoint = `${apiUrl}/organizations/${orgId}/members/${this.member.id}?api_key=${userToken}`;

      if (this.member.validUntil) {
        endpoint = `${apiUrl}/organizations/${orgId}/invites/${this.member.id}?api_key=${userToken}`;
      }
      return endpoint
    },
    /**
     * Makes XHR call to remove member from org
     */
    removeMember: function() {
      fetch(this.createUrl(), {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(() => {
        this.$emit('member-removed', this.member)
        EventBus.$emit('toast', {
          detail: {
            type: 'MESSAGE',
            msg: `${this.memberDisplayName} removed from ${this.activeOrganization.organization.name}`
          }
        })
        this.closeDialog()
      })
      .catch(() => {
        EventBus.$emit('toast', {
          detail: {
            type: 'ERROR'
          }
        })
      })

    }
  }
}
</script>
