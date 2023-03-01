<template>
  <el-dialog
    :visible.sync="visible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Confirmation required"
    />

    <dialog-body>
      <div class="warning-wrap">
        <svg-icon
          name="icon-warning-circle"
          height="32"
          width="32"
        />
        <h4 class="delete-dataset-title">
          {{action}} : {{ resourceName }}
        </h4>
        <div class="warning-message" v-if="warningMessage !== ''">
          {{warningMessage}}
        </div>
      </div>
      <el-form
        ref="confirmationForm"
        @submit.native.prevent="onFormSubmit"
      >
        <el-form-item prop="checkBoxes">
          <el-checkbox-group
            v-model="form.checkBoxes"
            @change="isChecked"
          >
            <template v-for="(item, key) in confirmations">
              <el-checkbox
                 class="step-1"
                 :label=item
                 name="type"
              />
            </template>

          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </dialog-body>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="closeDialog"
      >
        {{cancelAction}}
      </bf-button>
      <bf-button
        class="red"
        :disabled="disableConfirmation"
        @click="onFormSubmit"
      >
        {{confirmAction}}
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { pathOr, propOr } from 'ramda'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

export default {
  name: 'ConfirmationDialog',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: "Delete"
    },
    resourceName: {
      type: String,
      required: true
    },
    resource: {
      type: Object,
      required: true
    },
    warningMessage: {
      type: String,
      default: ''
    },
    confirmations: {
      type: Array,
      default: () => []
    },
    confirmAction: {
      type: String,
      default: "OK"
    },
    cancelAction: {
      type: String,
      default: "Cancel"
    },
    eventName: {
      type: String,
      default: "confirmed"
    }
  },

  mixins: [
  ],

  computed: {
    ...mapState([]),

    /**
     * Compute rules for checkboxes based on if the dataset has been published
     * @returns {Object}
     */
    rules: function() {
      const checkBoxCount = this.confirmations.length

      return {
        checkBoxes: [
          { type: 'array', required: true, message: 'Please select both boxes', trigger: 'false', len: checkBoxCount },
        ]
      }
    },
    disableConfirmation: function() {
      return this.confirmations.length !== this.form.checkBoxes.length
    }
  },

  data() {
    return {
      form: {
        checkBoxes: [],
      },
    }
  },

  methods: {
    /**
     * Handles checkbox group
     */
    isChecked: function(val) {
      const checkBoxCount = this.confirmations.length

      this.disabled = val.length != checkBoxCount
    },
    /**
     * Handler for form submit and validation
     */
    onFormSubmit: function() {
      this.$emit(this.eventName, this.resource)
      this.closeDialog()
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.form.checkBoxes = []
      this.disabled = true
      this.$emit("close", {})
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/_variables';

.el-form {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.delete-dataset-title {
  margin-top: 0;
}

.el-checkbox-group {
  line-height: 32px;
  width: min-content;
  max-width: 476px;
  overflow-x: scroll;
}

.el-checkbox {
  line-height: 0;
}

.svg-icon {
  color: $red_1;
}

.warning-wrap {
  text-align: center;
  margin-bottom: 24px;
}

.warning-message {
  color: $red_1;
}

.el-form-item {
  // margin-left: 45px;
}

.step-2 {
  margin-left: 0;
}
</style>
