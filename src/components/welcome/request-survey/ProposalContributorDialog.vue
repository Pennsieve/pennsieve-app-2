<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="onClose"
    @open="onOpen"
  >
    <bf-dialog-header
      slot="title"
      :title="dialogTitle"
    />
    <dialog-body>
      <el-form
        ref="form"
        label-position="top"
        :model="form"
        :rules="rules"
        @keyup.enter.native="validateForm"
      >
        <el-row
          class="mb-24"
          :gutter="8"
        >
          <el-col :span="18">
            <el-form-item
              class="mb-16"
              prop="firstName"
            >
              <template slot="label">
                First Name
                <span class="label-helper">
                  required
                </span>
              </template>
              <el-input
                id="firstName"
                v-model="form.firstName"
                placeholder="Required"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          class="mb-16"
          prop="lastName"
        >
          <template slot="label">
            Last Name
            <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            id="lastName"
            v-model="form.lastName"
            placeholder="Required"
          />
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="email"
        >
          <template slot="label">
            Email Address
            <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            id="email"
            v-model="form.emailAddress"
            placeholder="Required"
          />
          <p>
            Email is used to send contributors notifications about this proposal and dataset, it will not be shared publicly.
          </p>
        </el-form-item>
      </el-form>
    </dialog-body>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="onClose"
      >
        Cancel
      </bf-button>
      <bf-button
        :processing="isProcessing"
        :disabled="!canSubmit"
        @click="validateForm"
      >
        {{ btnSubmitText }}
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { equals , pickBy} from 'ramda'

import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'
import BfButton from '@/components/shared/bf-button/BfButton.vue'
import DegreeSelect from '@/components/shared/DegreeSelect/DegreeSelect.vue'

import Request from '@/mixins/request'

const defaultForm = () => {
  return {
    firstName: '',
    lastName: '',
    emailAddress: '',
  }
}

export default {
  name: 'ProposalContributorDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton,
    DegreeSelect
  },

  mixins: [
    Request
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    allContributors: {
      type: Array,
      default: () => []
    },
    contributor: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data: function () {
    return {
      form: defaultForm(),
      rules: {
        firstName: [
          {
            required: true,
            message: 'First name is required',
            trigger: 'false'
          }
        ],
        lastName: [
          {
            required: true,
            message: 'Last name is required',
            trigger: 'false'
          }
        ],
        emailAddress: [
          {
            type: 'email',
            required: true,
            trigger: 'false',
            validator: this.checkCollaborators
          }
        ],
      },
      isProcessing: false,
      isEditing: false
    }
  },

  computed: {
    /**
     * Compute submit button text based on if the user
     * is editing or creating a contributor
     * @return {String}
     */
    btnSubmitText: function() {
      return this.isEditing
        ? 'Update Contributor'
        : 'Add Contributor'
    },
    /**
     * Compute dialog title based on if the user
     * is editing or creating a contributor
     * @return {String}
     */
    dialogTitle: function() {
      return this.isEditing
        ? 'Update Contributor'
        : 'New Contributor'
    },

    /**
     * Compute if the contributor is an external user
     * @returns {Boolean}
     */
    isExternal: function() {
      return this.contributor.userId === undefined
    },

    /**
     * Compute if ORCID field is disabled
     * @returns {Boolean}
     */
    isOrcidInputDisabled: function() {
      const hasOrcid = !!this.contributor.orcid

      return !this.isExternal && this.isEditing && hasOrcid
    },

    /**
     * Compute if the user can submit
     * Can only submit if they made changes
     */
    canSubmit: function() {
      return Object.keys(this.contributor).length && !this.isExternal
        ? !equals(this.form, this.contributor)
        : true
    }
  },

  methods: {

    /**
     * Validator to check if existing external collaborators exist
     * @param {Object} rule
     * @param {String} value
     * @param {Function} callback
     */
    checkCollaborators: function(rule, value, callback) {
      if (!value) {
        callback(new Error('Email is required'))
      } else {
        const result = this.allContributors.filter(contributor => value === contributor.email );
        if (result.length !== 0 && !this.isEditing) {
          callback(new Error('Contributor with this email already exists'));
        } else {
          callback()
        }
      }
    },

    reset: function() {
      this.isProcessing = false
      this.isEditing = false
      this.$refs.form.resetFields()
      this.form = defaultForm()
    },

    /**
     * Emit event to update the synced property
     */
    onClose: function() {
      console.log("ProposalContributorDialog::onClose()")
      this.reset()
      this.$emit('close', {})
    },

    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      console.log("ProposalContributorDialog::onClosed()")
      this.reset()
      this.$emit('close', {})
    },

    /**
     * Set default values on open
     */
    onOpen: function() {
      this.setContributor()
    },

    /**
     * Set contributor, used when a user is editing
     */
    setContributor: function() {
      if (Object.keys(this.contributor).length) {
        this.form = { ...this.contributor }
        this.isEditing = true
      }
    },

    /**
     * Validate form, and then submit if it is valid
     */
    validateForm: function (){
      this.isProcessing = true

      this.$refs.form
        .validate((valid) => {
          if (!valid) {
            this.isProcessing = false
            return
          }
          this.submitForm()
        })
    },

    /**
     * Submit form and emit event
     */
    submitForm: function() {
      const eventName = this.isEditing
        ? 'update-contributor'
        : 'add-contributor'

      const contributor = this.form
      this.$emit(eventName, contributor)
    },

  }
}
</script>

<style lang="scss" scoped>
p {
  font-size: 12px;
  margin: 4px 0 0;
  line-height: 14px;
}
/deep/ .el-form-item__error {
  text-transform: capitalize;
}
</style>
