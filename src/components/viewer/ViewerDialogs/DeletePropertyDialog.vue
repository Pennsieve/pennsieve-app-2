<template>
  <el-dialog
    class="delete-property-dialog"
    :visible="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Confirm Delete"
    />

    <dialog-body>
      <p>Are you sure you want to delete {{ packageProperty }}?</p>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="processing"
        @click="deleteProperty"
      >
        Delete
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader'
import BfButton from '../../shared/bf-button/BfButton.vue'
import Request from '../../../mixins/request'
export default {
  name: 'DeletePropertyDialog',

  components: {
    DialogBody,
    BfDialogHeader,
    BfButton
  },

  mixins: [Request],

  props: {
    packageProperty: {
      type: String,
      default: ''
    },
    packageCategory: {
      type: String,
      default: ''
    },
    packageId: {
      type: String,
      default: ''
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      processing: false
    }
  },

  computed: {
    ...mapState(['config', 'userToken']),

    /**
     * Compute delete property endpoint url
     * @returns {String}
     */
    deletePropertyUrl: function() {
      return `${this.config.apiUrl}/data/${this.packageId}/properties?api_key=${
        this.userToken
      }`
    }
  },

  methods: {
    /**
     * Call endpoint to delete package property
     */
    deleteProperty: function() {
      this.processing = true
      const payload = {
        properties: [
          {
            key: this.packageProperty,
            value: '',
            category: this.packageCategory
          }
        ]
      }

      this.sendXhr(this.deletePropertyUrl, {
        method: 'PUT',
        body: payload
      }).then(() => {
        this.processing = false
        this.$emit('on-remove-property')
      }).catch(this.handleXhrError.bind(this))
    },

    /**
     * Emit event to close delete property dialog
     */
    closeDialog: function() {
      this.$emit('on-close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables.scss';
.delete-property-dialog {
  top: 77px;
  .delete-button {
    background-color: #071540;
    border: solid 1px #071540;
    color: #fff;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    padding: 9px 35px;
    line-height: 20px;
    margin-left: 5px;
  }

  .cancel-button {
    background-color: #fff;
    border: solid 1px #bdbdbd;
    border-radius: 5px;
    color: $glial;
    font-size: 14px;
    font-weight: 500;
    padding: 9px 35px;
    line-height: 20px;
  }

  h2 {
    font-size: 20px;
    font-weight: 500;
    padding-left: 7px;
    padding-bottom: 12px;
  }

  p {
    padding-left: 7px;
    padding-bottom: 19px;
  }

  .dialog-simple-buttons {
    margin-left: 163px;
  }
}
</style>