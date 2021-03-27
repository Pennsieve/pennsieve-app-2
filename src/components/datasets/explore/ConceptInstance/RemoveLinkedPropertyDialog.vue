<template>
  <el-dialog
    class="simple"
    :visible="unlinkDialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        slot="icon"
        class="icon-unlink"
        icon="icon-unlink"
        height="32"
        width="32"
        color="#2760FF"
      />
      <h2 slot="heading">
        Delete Linked Record?
      </h2>
      <p>Deleting linked records cannot be undone.</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
          :processing="isRemoving"
          class="red"
          @click="sendRequest"
        >
          Delete
        </bf-button>
      </div>
    </dialog-body>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { pathOr, prop, propOr } from 'ramda'

import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'

import Request from '../../../../mixins/request'
import EventBus from '../../../../utils/event-bus'

export default {
  name: 'RemoveLinkedPropertyDialog',

  components: {
    BfButton,
    DialogBody,
    BfDialogHeader
  },

  mixins: [
    Request
  ],

  props: {
    selectedLinkedProperty: {
      type: Object,
      default: function() {
        return {}
      }
    },

    unlinkDialogVisible: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      isRemoving: false
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config'
    ]),

    /**
     * Endpoint for removing linked properties
     * @returns {String}
     */
    linkedPropertiesUrl: function() {
      if (!this.userToken) {
        return
      }
      const conceptsUrl = pathOr('', ['config', 'conceptsUrl'])(this)
      const datasetId = pathOr('', ['params', 'datasetId'], this.$route)
      const modelId = pathOr('', ['params', 'conceptId'], this.$route)
      const instanceId = pathOr('', ['params', 'instanceId'], this.$route)

      return `${conceptsUrl}/datasets/${datasetId}/concepts/${modelId}/instances/${instanceId}/linked`
    },
  },

  methods: {
    /**
     * Makes XHR call to remove linked property
     */
    sendRequest: function() {
      this.isRemoving = true

      if (this.linkedPropertiesUrl) {
        const id = propOr('', 'linkedPropertyId', this.selectedLinkedProperty)
        const url = `${this.linkedPropertiesUrl}/${id}`
        this.sendXhr(url, {
          method: 'DELETE',
          header: {
            'Authorization': `bearer ${this.userToken}`
          }
        })
        .then(this.handleXhrSuccess.bind(this))
        .catch(error => {
          this.handleXhrError(error)

          this.closeDialog()

          this.isRemoving = false

          EventBus.$emit('toast', {
            detail: {
              type: 'error',
              msg: 'Could not remove Linked Property'
            }
          })
        })
      }
    },

    /**
     * Handles successful response
     */
    handleXhrSuccess: function() {
      this.$emit('remove-linked-property', this.selectedLinkedProperty)

      this.closeDialog()

      this.isRemoving = false

      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg: 'Linked Property Removed'
        }
      })
    },

    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('update:unlinkDialogVisible', false)
      this.$emit('update:selectedLinkedProperty', {})
      this.isRemoving = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
@import '../../../../assets/_icon-item-colors.scss';

.dialog-body {
  text-align: center;

  .icon-unlink {
    margin-bottom: 8px;
  }
}

</style>
