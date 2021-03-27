<template>
  <el-dialog
    class="simple"
    :visible.sync="visible"
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
      <p>Deleting file links cannot be undone.</p>
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

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'

import Request from '@/mixins/request'
import EventBus from '@/utils/event-bus'

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
      tableName: '',
      relationships: []
    }
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => { return {
          relationships: [],
          datasetId: ''
        }
      }
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
      const datasetId = this.data.datasetId
      const relationshipInstanceIds = this.data.relationships
      return `${url}/datasets/${datasetId}/proxy/package/instances/${relationshipInstanceIds[0]}`
    },
    /**
     * Sum total of relationships
     */
    count: function() {
      return this.data && this.data.relationships ? this.data.relationships.length : 0
    },
    /**
     * Generate text for Dialog Body
     */
    relationshipText: function() {
      if (this.count > 1) {
        return `Delete these ${this.count} Links?`
      }
      return 'Delete this Link?'
    }
  },

  methods: {
    /**
     * Makes XHR call to update two factor auth status
     */
    sendRequest: function() {
      this.sendXhr(this.apiUrl, {
        method: 'DELETE',
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
      const msg = this.count > 1 ? 'Links Removed' : 'Link Removed'
      EventBus.$emit('toast', {
        detail: {
          type: 'success',
          msg
        }
      })
      EventBus.$emit('refresh-table-data', {
        name: this.data.tableName,
        count: this.count,
        type: 'Remove'
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
@import '../../../../assets/_variables.scss';
@import '../../../../assets/_icon-item-colors.scss';

.dialog-body {
  text-align: center;

  .icon-graph {
    margin-bottom: 8px;
  }
}

</style>
