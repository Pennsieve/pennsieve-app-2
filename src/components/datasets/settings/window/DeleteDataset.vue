<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Confirm Delete"
    />

    <dialog-body>
      <div class="warning-wrap">
        <svg-icon
          name="icon-warning-circle"
          height="32"
          width="32"
        />
        <h4 class="delete-dataset-title">
          Delete {{ datasetName }}
        </h4>
        <div class="warning-message">
          Warning: This cannot be undone
        </div>
      </div>
      <el-form
        ref="deleteDatasetForm"
        @submit.native.prevent="onFormSubmit"
      >
        <el-form-item prop="checkBoxes">
          <el-checkbox-group
            v-model="form.checkBoxes"
            @change="isChecked"
          >
            <el-checkbox
              class="step-1"
              :label="stepOneLabelText"
              name="type"
            />
            <el-checkbox
              class="step-2"
              label="Shared data will become inaccessible for all users"
              name="type"
            />
            <el-checkbox
              v-if="isPublished"
              class="step-2"
              label="Published dataset will no longer be available in Discover"
              name="type"
            />
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
        Cancel
      </bf-button>
      <bf-button
        class="red"
        :disabled="disabled"
        @click="onFormSubmit"
      >
        Delete
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { pathOr, propOr } from 'ramda'

import BfButton from '../../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../../shared/dialog-body/DialogBody.vue'

import DatasetPublishedData from '../../../../mixins/dataset-published-data/index'

export default {
  name: 'DeleteDataset',

  components: {
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    DatasetPublishedData
  ],

  computed: {
    ...mapState([
      'activeOrganization',
      'dataset'
    ]),

    datasetName: function() {
      const name = pathOr('', ['content', 'name'])(this.dataset)
      return name
    },
    stepOneLabelText: function() {
      const orgName = pathOr('', ['organization', 'name'])(this.activeOrganization)
      return `All data in this dataset will be removed from ${orgName}`
    },

    /**
     * Compute rules for checkboxes based on if the dataset has been published
     * @returns {Object}
     */
    rules: function() {
      const checkBoxCount = this.isPublished ? 3 : 2

      return {
        checkBoxes: [
          { type: 'array', required: true, message: 'Please select both boxes', trigger: 'false', len: checkBoxCount },
        ]
      }
    }
  },

  data() {
    return {
      dialogVisible: false,
      form: {
        checkBoxes: [],
      },
      disabled: true,
    }
  },

  methods: {
    /**
     * Handles checkbox group
     */
    isChecked: function(val) {
      const checkBoxCount = this.isPublished ? 3 : 2

      this.disabled = val.length != checkBoxCount
    },
    /**
     * Handler for form submit and validation
     */
    onFormSubmit: function() {
      this.$emit('delete-dataset-confirmed')
      this.closeDialog()
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.form.checkBoxes = []
      this.disabled = true
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/_variables';

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
