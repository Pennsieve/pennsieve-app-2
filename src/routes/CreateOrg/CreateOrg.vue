<template>
  <bf-page>
    <div class="create-org">
      <img
        src="/static/images/illustrations/illo-research-platform.svg"
        alt="Patient Data"
        width="446"
        height="220"
      >
      <h2>Restricted Access</h2>
      <p>You must create a new organization in order to access this feature on the platform. </p>
      <bf-button
      :disabled="maxOrgsCreated"

        class="primary"
        @click="requestCreateOrganization"
      >
        Request to Create Organization
      </bf-button>
      <create-organization-dialog
        :visible.sync="isDialogVisible"
        @close-dialog="onCloseDialog"
      />
    </div>
  </bf-page>
</template>

<script>
import { mapState } from 'vuex'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import CreateOrganizationDialog from '@/components/CreateOrganizationDialog/CreateOrganizationDialog'
  export default {
    name: 'CreateOrg',
    components: {
      BfButton,
      CreateOrganizationDialog
    },
    data() {
      return {
        isDialogVisible: false
      }
    },
    computed: {
      ...mapState(['profile']),
     /**
       * Checks where user has created the maximum number of organizations
       * @returns {Boolean}
       */
      maxOrgsCreated: function() {
        // NOTE: Adding the first condition so that this can go through
        // as these properties do not exist in the profile object yet
        return this.profile.maxOrganizationsAllowed === 3 && this.profile.organizationsCreated === this.profile.maxOrganizationsAllowed
      },
    },

    methods: {
      openCreateOrgModal: function() {
        this.isDialogVisible = true
      },

      onCloseDialog: function() {
        this.isDialogVisible = false
      },

      /**
       * Show the intercom window to allow
       * user to talk to support to create an
       * organization
       */
      requestCreateOrganization: function() {
        window.Intercom('show')
      }
    },
  }
</script>

<style lang="scss" scoped>
.create-org {
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  font-size: 22px;
  line-height: 26px;
  font-weight: bold;
  margin-right: 30px;
}

p {
  margin-bottom: 20px;
}

img {
  margin-top: -125px;
  margin-bottom: 20px;
}

.bf-button {
  margin-right: 30px;
}
</style>
