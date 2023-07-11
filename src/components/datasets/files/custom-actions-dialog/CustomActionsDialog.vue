<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="customActionsDialog"
    class="bf-delete-dialog"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" title="Actions" />
    <dialog-body>
      <div class="flex">
        <h2>Run Custom Event on {{ totalFiles }} {{ headline }}</h2>
        <el-select v-model="value" placeholder="Select">
          <el-option
            v-for="(item, i) in options"
            :key="i"
            :label="item ? item.label : ''"
            :value="item ? item.value : ''"
          ></el-option>
        </el-select>
      </div>
    </dialog-body>
    <div slot="footer" class="dialog-footer">
      <bf-button
        class="secondary"
        data-cy="closeDeleteDialog"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        data-cy="run-custom-event"
        @click="runCustomEvent"
        :disabled="false"
      >
        Run Event
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import BfButton from '../../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import Request from '../../../../mixins/request/index'
import EventBus from '../../../../utils/event-bus'

import { mapGetters, mapState } from 'vuex'

export default {
  name: 'BfDeleteDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton
  },

  mixins: [Request],

  props: {
    selectedFiles: {
      type: Array
    },
    callingFromDeleted: {
      type: Boolean,
      default: false
    },
    selectedDeletedFiles: {
      type: Array
    }
  },
  data: function() {
    return {
      visible: false,
      options: [],
      value: ''
    }
  },

  computed: {
    ...mapGetters(['userToken', 'config', 'dataset', 'activeOrganization']),
    ...mapState('integrationsModule', ['integrations']),
    /**
     * Checks for whether submit action should be allowed
     * @returns {Boolean}
     */
    disableRunAction: function() {
      return 'false'
    },

    /**
     * Computes form URL based on type of action user is taking (rename vs creating)
     * @returns {String}
     */
    customEventUrl: function() {
      if (this.config.apiUrl && this.userToken) {
        console.log('make the API call')
        // TODO: Update with action api endpoint when available
        // return `${this.config.apiUrl}/addTheEndpointHere?api_key=${this.userToken}`
      }
    },

    /**
     * Compute total files
     * @return {Number}
     */
    totalFiles: function() {
      return this.selectedFiles.length
    },

    /**
     * Compute headline based on total files
     * @return {String}
     */
    headline: function() {
      return this.totalFiles > 1 ? 'items' : 'item'
    },

    /**
     * Compute copy based on total files
     * @return {String}
     */
    copy: function() {
      return this.totalFiles > 1 ? 'these items' : 'this item'
    }
  },

  watch: {
    /**
     * Watch file
     */
    file: function(file) {
      if (Object.keys(file).length) {
        this.packageForm.name = file.content.name
      }
    }
  },

  mounted() {
    this.formatCustomIntegrationsOptions()
  },

  methods: {
    /**
     * Access integrations from global state and format options for input select
     */
    formatCustomIntegrationsOptions: function() {
      this.options = this.integrations.map(integration => {
        console.log('integration.eventTargets', ...integration.eventTargets)
        const [eventTargetType] = [...integration.eventTargets]
        if (eventTargetType === 'FILES') {
          return {
            value: integration.name,
            label: integration.displayName
          }
        }
      })
    },

    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.visible = false
    },
    /**
     * Makes API Call to run custom event on target
     */
    runCustomEvent: function() {
      // const fileIds = this.selectedFiles.map(item => item.content.id)
      const url = `https://api.pennsieve.net/datasets/N:dataset:e2eaa76a-e0e0-4f25-97a8-6fa2bf6dd83f/event`
      const message = JSON.stringify({
        organizationId: `${this.activeOrganization.organization.id}`,
        datasetId: `${this.dataset.content.id}`,
        eventCategory: 'CATEGORY',
        eventType: 'CUSTOM'
      })
      this.sendXhr(url, {
        method: 'POST',
        header: {
          Authorization: `bearer ${this.userToken}`
        },
        body: {
          message: message,
          eventType: 'CUSTOM'
        }
      })
        .then(response => {
          EventBus.$emit('toast', {
            detail: {
              msg: 'The selected event has been successfully initiated!',
              type: 'success'
            }
          })
          this.closeDialog()
        })
        .catch(response => {
          this.handleXhrError(response)
        })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../assets/_variables.scss';

.svg-icon {
  color: $app-primary-color;
}

.flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
