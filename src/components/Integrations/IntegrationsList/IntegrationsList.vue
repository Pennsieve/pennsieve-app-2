<template>
  <bf-page class="integrations-list">
    <bf-stage slot="stage" element-loading-background="transparent">
      <div class="addIntegrationContainer">
        <div class="description">
          <p class="mb-16">
            Webhooks provide mechanisms to notify external applications of
            events that happen on the Pennsieve platform, such as "File
            Uploaded", or "Description updated".

            <a
              href="https://docs.pennsieve.io/docs/preventing-files-from-being-included-during-publishing"
              target="_blank"
            >
              What's this?
            </a>
          </p>
        </div>

        <div class="reg-button">
          <bf-button v-if="hasAdminRights" @click="openAddIntegration">
            Register Webhook
          </bf-button>
        </div>
      </div>

      <div v-if="integrations.length > 0" class="integration-list">
        <integration-list-item
          v-for="integration in filteredWebhooks"
          :key="integration.id"
          :integration="integration"
          @open-remove-integration="openDeleteIntegrationDialog"
          @open-edit-integration="openEditIntegrationDialog"
        />
      </div>

      <bf-empty-page-state v-else class="empty">
        <img
          src="/static/images/illustrations/illo-collaboration.svg"
          height="240"
          width="247"
          alt="Teams illustration"
        />
        <div v-if="hasAdminRights" class="copy">
          <h2>There are no integrations yet</h2>
          <p>
            Integrations allow external services to be notified when certain
            events occur on Pennsieve. These integrations are available to all
            members within the organization and can be managed at the dataset
            level under settings.
          </p>
          <bf-button class="create-team-button" @click="openAddIntegration">
            Add Global Integration
          </bf-button>
        </div>
        <div v-if="!hasAdminRights" class="copy">
          <h2>{{ orgName }} doesn't have any integrations yet.</h2>
          <p>
            Contact your administrator to get started working with Integrations.
          </p>
        </div>
      </bf-empty-page-state>
    </bf-stage>

    <add-edit-integration-dialog
      :visible.sync="addEditIntegrationDialogVisible"
      :integration-edit.sync="integrationEdit"
      integrationType="Webhook"
      @add-integration="onAddIntegrationConfirm"
      @edit-integration="onEditIntegrationConfirm"
    />

    <remove-integration-dialog
      ref="removeIntegrationDialog"
      :visible.sync="removeIntegrationDialogVisible"
      @delete="onDeleteIntegrationConfirm"
    />

    <integration-api-key-details
      ref="apiKeyDetails"
      :visible.sync="APIKeyDetailsVisisble"
    />
  </bf-page>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

import BfRafter from '../../shared/bf-rafter/BfRafter.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfEmptyPageState from '../../shared/bf-empty-page-state/BfEmptyPageState.vue'

import AddEditIntegrationDialog from '../AddEditIntegrationDialog.vue'
import IntegrationListItem from '../integration-list-item/IntegrationListItem'
import Sorter from '../../../mixins/sorter'
import UserRoles from '../../../mixins/user-roles'
import RemoveIntegrationDialog from '../removeIntegrationDialog'

import { pathOr, propOr } from 'ramda'
import DeleteApiKey from '../../my-settings/windows/DeleteApiKey'
import IntegrationApiKeyDetails from '../integrationApiKeyDetails'

export default {
  name: 'IntegrationsList',

  components: {
    IntegrationApiKeyDetails,
    DeleteApiKey,
    BfEmptyPageState,
    BfRafter,
    BfButton,
    IntegrationListItem,
    AddEditIntegrationDialog,
    RemoveIntegrationDialog
  },

  mixins: [Sorter, UserRoles],

  props: {
    integrations: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      addEditIntegrationDialogVisible: false,
      removeIntegrationDialogVisible: false,
      APIKeyDetailsVisisble: false,
      integrationDelete: null,
      integrationEdit: {}
    }
  },

  computed: {
    ...mapGetters(['activeOrganization', 'userToken', 'config', 'hasFeature']),

    filteredWebhooks: function() {
      let filteredArray = this.integrations.filter(
        x => !x.customTargets || x.customTargets.length == 0
      )

      return filteredArray
    },

    hasAdminRights: function() {
      if (this.activeOrganization) {
        const isAdmin = propOr(false, 'isAdmin', this.activeOrganization)
        const isOwner = propOr(false, 'isOwner', this.activeOrganization)
        return isAdmin || isOwner
      } else {
        return null
      }
    },
    orgName: function() {
      return pathOr('', ['organization', 'name'], this.activeOrganization)
    }
  },

  watch: {},

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.hasFeature('sandbox_org_feature')) {
        vm.$router.push({ name: 'create-org' })
      }
    })
  },

  methods: {
    ...mapActions('integrationsModule', [
      'createIntegration',
      'removeIntegration',
      'editIntegration'
    ]),

    ...mapState([]),

    openDeleteIntegrationDialog: function(integration) {
      this.$refs.removeIntegrationDialog.setIntegration(integration)
      this.removeIntegrationDialogVisible = true
    },
    onDeleteIntegrationConfirm: function(integration) {
      console.log('do deletion on ' + integration.id)
      this.removeIntegration(integration.id)
      this.removeIntegrationDialogVisible = false
    },
    /**
     * Model URL
     * @returns {String}
     */
    getIntegrationUrl: function() {
      if (this.config.apiUrl && this.userToken) {
        return `${this.config.apiUrl}/webhooks`
      }

      return ''
    },
    openEditIntegrationDialog: function(integration) {
      this.integrationEdit = integration
      this.addEditIntegrationDialogVisible = true
    },
    /**
     * Open the add property dialog
     */
    openAddIntegration: function() {
      this.addEditIntegrationDialogVisible = true
    },

    /**
     * Update integration via API
     * @param {Object} Integration
     */
    onEditIntegrationConfirm: function(integration) {
      let eventTargets = []
      for (const [key, value] of Object.entries(integration.eventTypeList)) {
        if (value) {
          eventTargets.push(key)
        }
      }

      let integrationDTO = {
        id: integration.id,
        displayName: integration.displayName,
        description: integration.description,
        apiUrl: integration.apiUrl,
        isPrivate: !integration.isPublic,
        imageUrl: integration.imageUrl,
        isDefault: integration.isDefault,
        hasAccess: integration.hasAccess,
        targetEvents: eventTargets,
        targetPath: integration.targetPath
      }

      if (integration.secret) {
        integrationDTO.secret = integration.secret
      }

      this.editIntegration(integrationDTO)
    },

    /**
     * Send add integration request to API
     * @param {Object} integration
     */
    onAddIntegrationConfirm: function(integration) {
      let eventTargets = []
      for (const [key, value] of Object.entries(integration.eventTypeList)) {
        if (value) {
          eventTargets.push(key)
        }
      }

      let integrationDTO = {
        displayName: integration.displayName,
        secret: integration.secret,
        description: integration.description,
        apiUrl: integration.apiUrl,
        isPrivate: !integration.isPublic,
        imageUrl: integration.imageUrl,
        isDefault: integration.isDefault,
        hasAccess: integration.integrationType === 'viewer' ? false : true,
        targetEvents: eventTargets,
        targetPath: integration.targetPath
      }

      this.createIntegration(integrationDTO).then(response => {
        let detailPopup = this.$refs.apiKeyDetails
        detailPopup.apiKey = {
          key: response.tokenSecret.key,
          secret: response.tokenSecret.secret
        }
        this.APIKeyDetailsVisisble = true
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/variables';

.addIntegrationContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
}

.empty {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 85px 190px;
}

.integration-list {
  display: flex;
  flex-direction: column;
  flex-flow: wrap;
  margin: 16px 0;
}

.description {
  //margin-left: 8px;
  max-width: 500px;
}

.reg-button {
  align-self: flex-start;
}

.copy {
  h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
  }

  p {
    color: #71747c;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    margin-bottom: 16px;
  }
}
</style>
