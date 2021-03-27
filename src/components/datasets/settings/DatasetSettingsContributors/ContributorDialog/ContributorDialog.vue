<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="onClosed"
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
                :disabled="!isExternal && isEditing"
                autofocus
                placeholder="Required"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              class="mb-16"
              prop="middleInitial"
            >
              <template slot="label">
                Middle Initial
              </template>
              <el-input
                id="middleInitial"
                v-model="form.middleInitial"
                :maxlength="1"
                :disabled="!isExternal && isEditing"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="!isExternal && isEditing"
            :span="24"
          >
            <p>
              First and last name can be changed in this user's profile.
            </p>
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
            :disabled="!isExternal && isEditing"
            placeholder="Required"
          />
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="email"
        >
          <template slot="label">
            Email
            <span class="label-helper">
              required
            </span>
          </template>
          <el-input
            id="email"
            v-model="form.email"
            :disabled="!!contributor.email"
            placeholder="Required"
          />
          <p>
            Email will be used to notify this contributor when a dataset is published and will not be shared publicly.
          </p>
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="degree"
        >
          <template slot="label">
            Degree
          </template>
          <degree-select v-model="form.degree" />
        </el-form-item>
        <el-form-item
          class="mb-16"
          prop="orcid"
        >
          <template slot="label">
            ORCID iD
            <span class="label-helper">
              optional
            </span>
          </template>
          <el-input
            id="orcid"
            v-model="form.orcid"
            :disabled="isOrcidInputDisabled"
            placeholder="Ex. 0000-0003-0837-7120"
          />
        </el-form-item>
      </el-form>
    </dialog-body>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        class="secondary"
        @click="close"
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

import Autofocus from '@/mixins/auto-focus'
import Request from '@/mixins/request'

const getBlackfynnUserFields = (form, contributor) => {
  const isDifferent = (val, key) => contributor[key] !== val
  const differentFields = pickBy(isDifferent, form)

  return { ...differentFields, id: form.id }
}
const defaultForm = () => {
  return {
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    degree: null,
    orcid: '',
    id: '',
    userId: null
  }
}

export default {
  name: 'ContributorDialog',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton,
    DegreeSelect
  },

  mixins: [
    Autofocus,
    Request
  ],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orgContributors: {
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
        email: [
          {
            type: 'email',
            required: true,
            trigger: 'false',
            validator: this.checkCollaborators
          }
        ],
        orcid: [
          {
            type: 'string',
            trigger: 'false',
            validator: this.validateOrcid
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
        ? 'Update Existing Contributor'
        : 'New External Contributor'
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
       const result = this.orgContributors.filter(contributor => value === contributor.email );
       if (result.length !== 0 && !this.isEditing) {
          callback(new Error('Contributor with this email already exists'));
       } else {
         callback()
       }
      }
    },

    /**
     * Emit event to update the synced property
     */
    close: function() {
      this.$emit('update:visible', false)
    },

    /**
     * Callback after the dialog has closed
     * Reset dialog
     */
    onClosed: function() {
      this.isProcessing = false
      this.isEditing = false
      this.$refs.form.resetFields()
      this.form = defaultForm()

      this.$emit('update:contributor', {})
    },

    /**
     * Set default values on open
     */
    onOpen: function() {
      this.autoFocus()

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
        ? 'edit-contributor'
        : 'add-contributor'

      const contributor = this.isExternal
        ? this.form
        : getBlackfynnUserFields(this.form, this.contributor)
      this.$emit(eventName, contributor)
    },

    /**
     * Validate ORCID to see if it exists
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
     */
    validateOrcid: function(rule, value, callback) {
      if (value) {
        this.sendXhr(`https://pub.orcid.org/v2.1/${value}`)
          .then(() => {
            callback()
          })
          .catch(response => {
            switch (response.status) {
              case 404:
                callback(new Error(`ORCID iD not valid`))
                break;

              default:
                callback(new Error(`An error has occured`))
                break;
            }
          })
      } else {
        callback()
      }
    }
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
