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
        <h2>Run the Custom Event on {{ totalFiles }} {{ headline }}</h2>
        <el-select
          v-model="value"
          placeholder="Select"
          @change="onSelect(value)"
        >
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
import { pathOr } from 'ramda'

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
      type: Array,
      default: () => {}
    },
    callingFromDeleted: {
      type: Boolean,
      default: false
    },
    selectedDeletedFiles: {
      type: Array,
      default: () => {}
    }
  },
  data: function() {
    return {
      visible: false,
      options: [],
      value: '',
      selectedApplication: {}
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config',
      'dataset',
      'activeOrganization',
      'userToken'
    ]),
    ...mapState('integrationsModule', ['integrations']),
    /**
     * Checks for whether submit action should be allowed
     * @returns {Boolean}
     */
    disableRunAction: function() {
      return 'false'
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
    onSelect: function(value) {
      this.selectedApplication = this.integrations.find(
        integration => integration.name === value
      )
    },
    /**
     * Access integrations from global state and format options for input select
     */
    formatCustomIntegrationsOptions: function() {
      this.options = this.integrations.map(integration => {
        const [eventTargetType] = [...integration.eventTargets]
        if (eventTargetType === 'CUSTOM') {
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
      const url = `${this.config.api2Url}/integrations`

      const body = {
        applicationId: this.selectedApplication.id,
        datasetId: null,
        packageIds: [],
        params: {}
      }
      this.sendXhr(url, {
        method: 'POST',
        header: {
          Authorization: `Bearer ${this.userToken}`
        },
        body: body
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
          EventBus.$emit('toast', {
            detail: {
              msg: 'Sorry! There was an issue initiating your event',
              type: 'error'
            }
          })
          this.closeDialog()
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
