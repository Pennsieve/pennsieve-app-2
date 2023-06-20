<template>
  <el-dialog
    :visible.sync="visible"
    data-cy="customActionsDialog"
    class="bf-delete-dialog simple"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <h2>Run Custom Event on {{ totalFiles }} {{ headline }}</h2>
      <el-select v-model="value" placeholder="Select">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          data-cy="closeDeleteDialog"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="green"
          data-cy="run-custom-event"
          @click="runCustomEvent"
        >
          Run Event
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import BfButton from '../../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import Request from '../../../../mixins/request/index'

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
    ...mapGetters(['userToken', 'config']),
    ...mapState('integrationsModule', ['integrations']),

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
        // if (integration.eventTarget && integration.eventTarget.length && integration.eventTarget.target === 'PACKAGE') {
        if (true) {
          // TODO: remove before PR
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
      const fileIds = this.selectedFiles.map(item => item.content.id)
      this.sendXhr(this.customEventUrl, {
        method: 'POST',
        body: { things: fileIds }
      })
        .then(response => {
          //   this.$emit('custom-event', response)
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
.dialog-body {
  text-align: center;
}
</style>
