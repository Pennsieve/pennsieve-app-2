<template>
  <el-dialog
    class="simple"
    :visible.sync="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header slot="title" />
    <dialog-body>
      <svg-icon
        slot="icon"
        class="icon-graph"
        icon="icon-graph"
        height="32"
        width="32"
        color="#2760FF"
      />
      <h2 slot="heading">
        {{ this.relationshipText }}
      </h2>
      <p>Deleting relationships cannot be undone.</p>
      <div class="dialog-simple-buttons">
        <bf-button
          class="secondary"
          @click="closeDialog"
        >
          Cancel
        </bf-button>
        <bf-button
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
import { pathOr, prop } from 'ramda'

import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'
import BfButton from '../../../shared/bf-button/BfButton.vue'

import Request from '../../../../mixins/request'
import EventBus from '../../../../utils/event-bus'

export default {
  components: {
    BfButton,
    DialogBody,
    BfDialogHeader
  },

  mixins: [
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      tableName: '',
      relationships: []
    }
  },

  computed: {
    ...mapGetters([
      'userToken',
      'config'
    ]),
    /**
     * Endpoint for removing relationship instances
     */
    apiUrl: function() {
      const url = pathOr('', ['config', 'conceptsUrl'])(this)
      if (!url) {
        return ''
      }
      const datasetId = this.datasetId
      return `${url}/datasets/${datasetId}/relationships/instances/bulk`
    },
    /**
     * Sum total of relationships
     */
    count: function() {
      return this.relationships.length
    },
    /**
     * Generate text for Dialog Body
     */
    relationshipText: function() {
      if (this.count > 1) {
        return `Delete these ${this.count} Relationships?`
      }
      return 'Delete this Relationship?'
    }
  },

  methods: {
    /**
     * Makes XHR call to update two factor auth status
     */
    sendRequest: function() {
      const relationshipInstanceIds = this.relationships

      this.sendXhr(this.apiUrl, {
        method: 'DELETE',
        body: { relationshipInstanceIds },
        header: {
          'Authorization': `bearer ${this.userToken}`
        }
      })
      .then(this.handleXhrSuccess.bind(this))
      .catch(this.handleXhrError.bind(this))

      this.closeDialog()
    },
    /**
     * Handles successful response
     */
    handleXhrSuccess: function() {
      const msg = this.count > 1 ? 'Relationships Removed' : 'Relationship Removed'
      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg
        }
      })
      EventBus.$emit('refresh-table-data', {
        name: this.tableName,
        count: this.count,
        type: 'Remove'
      })
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables.scss';
@import '../../../../assets/_icon-item-colors.scss';

.dialog-body {
  text-align: center;

  .icon-graph {
    margin-bottom: 8px;
  }
}

</style>
