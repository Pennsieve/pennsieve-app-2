<template>
  <el-dialog
    class="simple"
    :visible="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        class="icon-trash"
        name="icon-trash"
        height="32"
        width="32"
        color="#e94b4b"
      />
      <h2>Confirm Removal</h2>
      <p>Are you sure you want to this Dataset Template?</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          class="red"
          :processing="isProcessing"
          @click="sendRequest"
        >
          Confirm
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { pathOr, prop, propOr } from 'ramda'

import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'

import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'DeleteDatasetTemplate',

  components: {
    BfButton,
    DialogBody,
    BfDialogHeader
  },

  mixins: [
    Request
  ],

  props: {
    datasetTemplate: {
      type: Object,
      default: function() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isProcessing: false
    }
  },

  computed: {
    ...mapState([
      'activeOrganization',
      'userToken',
      'config'
    ]),

    /**
     * Compute dataset template url
     * @returns {String}
     */
    deleteDatasetTemplateUrl: function() {
      const orgId = pathOr('', ['organization', 'intId'], this.activeOrganization)
      const templateId = propOr('', 'id', this.datasetTemplate)

      if (!orgId || !templateId) {
        return ''
      }

      return `${this.config.apiUrl}/model-schema/organizations/${orgId}/dataset-templates/${templateId}`
    }
  },

  methods: {
    ...mapActions([
      'removeDatasetTemplate'
    ]),
    /**
     * Makes XHR call to update two factor auth status
     */
    sendRequest: function() {
      this.isProcessing = true

      this.sendXhr(this.deleteDatasetTemplateUrl, {
        method: 'DELETE',
        header: {
          'Authorization': `Bearer ${this.userToken}`
        },
      })
      .then(this.handleXhrSuccess.bind(this))
      .catch(err => {
        this.isProcessing = false
        this.handleXhrError(err)
      })
    },
    /**
     * Handles successful two factor xhr response
     */
    handleXhrSuccess: function() {
      this.removeDatasetTemplate(this.datasetTemplate)

      this.closeDialog()

      this.isProcessing = false

      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg: 'Dataset template successfully deleted'
        }
      })
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-trash {
  margin-bottom: 8px;
}
</style>

