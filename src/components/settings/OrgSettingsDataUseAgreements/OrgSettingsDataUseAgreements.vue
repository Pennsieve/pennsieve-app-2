<template>
  <div class="org-settings-data-use-agreements">
    <div class="header mb-24">
      <div class="heading">
        <h3 class="mb-0 mt-0">
          Data Use Agreements
        </h3>
        <a
          href="https://docs.pennsieve.io/docs/data-use-agreements"
          class="ml-8"
          target="_blank"
        >
          What’s this?
        </a>
      </div>
      <bf-button @click="isDialogVisible = true">
        Add New Agreement
      </bf-button>
    </div>

    <div>
      <data-use-agreement-list-item
        v-for="dataUseAgreement in dataUseAgreements"
        :key="dataUseAgreement.id"
        :data-use-agreement="dataUseAgreement"
        @delete="deleteDataUseAgreement"
        @edit="openEditDataUseAgreement"
        @make-default="makeDataUseAgreementDefault"
      />
    </div>

    <data-use-agreement-update-dialog
      :visible.sync="isDialogVisible"
      :data-use-agreement.sync="editableDataUseAgreement"
      @add-data-use-agreement="addDataUseAgreement"
      @edit-data-use-agreement="editDataUseAgreement"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import BfButton from '@/components/shared/bf-button/BfButton'
import DataUseAgreementListItem from './DataUseAgreementListItem/DataUseAgreementListItem'
import DataUseAgreementUpdateDialog from './DataUseAgreementUpdateDialog/DataUseAgreementUpdateDialog'

import Request from '@/mixins/request'

import EventBus from '@/utils/event-bus'

export default {
  name: 'OrgSettingsDataUseAgreements',

  components: {
    BfButton,
    DataUseAgreementListItem,
    DataUseAgreementUpdateDialog
  },

  mixins: [
    Request
  ],

  data() {
    return {
      isDialogVisible: false,
      editableDataUseAgreement: {}
    }
  },

  computed:  {
    ...mapState([
      'activeOrganization',
      'config',
      'dataUseAgreements',
      'userToken'
    ]),

    /**
     * Compute data use agreement URL
     * @returns {String}
     */
    dataUseAgreementUrl: function() {
      return `${this.config.apiUrl}/organizations/${this.activeOrganization.organization.id}/data-use-agreements`
    }
  },

  methods: {
    ...mapActions([
      'createDataUseAgreement',
      'removeDataUseAgreement',
      'updateDataUseAgreement',
      'updateDefaultDataUseAgreement'
    ]),

    /**
     * Delete data use agreement and remove it from the list
     * @param {Object} dataUseAgreement
     */
    deleteDataUseAgreement: function(dataUseAgreement) {
      const { id } = dataUseAgreement

      this.sendXhr(`${this.dataUseAgreementUrl}/${id}?api_key=${this.userToken}`, {
        method: 'DELETE'
      })
        .then(() => {
          this.removeDataUseAgreement(id)
        })
        .catch(() => {
          this.handleXhrError()
          EventBus.$emit('toast', {
            detail: {
              msg: 'There was an error deleting the agreement',
              type: 'error'
            }
          })
        })
    },

    /**
     * Create data use agreement and add it to the list
     * @param {Object} dataUseAgreement
     */
    addDataUseAgreement: async function(dataUseAgreement) {
      try {
        const agreement = await this.sendXhr(`${this.dataUseAgreementUrl}?api_key=${this.userToken}`, {
          method: 'POST',
          body: dataUseAgreement
        })
        this.createDataUseAgreement(agreement)
        this.isDialogVisible = false
      } catch (error) {
        this.handleXhrError()
        EventBus.$emit('toast', {
          detail: {
            msg: 'There was an error creating the agreement',
            type: 'error'
          }
        })
      }
    },

    /**
     * Create data use agreement and add it to the list
     * @param {Object} dataUseAgreement
     */
    openEditDataUseAgreement: function(dataUseAgreement) {
      this.editableDataUseAgreement = { ...dataUseAgreement }
      this.isDialogVisible = true
    },

    /**
     * Update data use agreement
     * @param {Object} dataUseAgreement
     */
    editDataUseAgreement: function(dataUseAgreement) {
      const { id } = dataUseAgreement

      this.sendXhr(`${this.dataUseAgreementUrl}/${id}?api_key=${this.userToken}`, {
        method: 'PUT'
      })
        .then(() => {
          this.updateDataUseAgreement({ ...dataUseAgreement })
        })
        .catch(() => {
          this.handleXhrError()
          EventBus.$emit('toast', {
            detail: {
              msg: 'There was an error updating the agreement',
              type: 'error'
            }
          })
        })

      this.isDialogVisible = false
    },

    /**
     * Make data use agreement default,
     * which will also make the current default
     * agreement not default
     * @param {Object} dataUseAgreement
     */
    makeDataUseAgreementDefault: function(dataUseAgreement) {
      const updatedDataUseAgreement = {
        ...dataUseAgreement,
        isDefault: true
      }
      const { id } = dataUseAgreement

      this.sendXhr(`${this.dataUseAgreementUrl}/${id}?api_key=${this.userToken}`, {
        method: 'PUT',
        body: updatedDataUseAgreement
      })
        .then(() => {
          this.updateDefaultDataUseAgreement({ ...updatedDataUseAgreement })
        })
        .catch(() => {
          this.handleXhrError()
          EventBus.$emit('toast', {
            detail: {
              msg: 'There was an error making the agreement default',
              type: 'error'
            }
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
.heading {
  align-items: center;
  display: flex;
}
</style>
