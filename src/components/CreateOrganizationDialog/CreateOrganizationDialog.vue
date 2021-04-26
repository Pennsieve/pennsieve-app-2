<template>
    <el-dialog
    :visible="visible"
    :show-close="false"
    :append-to-body="true"
    class="create-new-organization"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Create Organization"
    />

    <dialog-body>
      <div>
        <p>Creating an organization on Pennsieve is quick and easy. Just enter an organization name and you'll
          be moments away from experiencing the full power of data sharing on the platform.
        </p>
        <p>You have 3 out of 3 organizations remaining.</p>
        <el-form
          ref="newOrganizationForm"
          :model="newOrganizationForm"
          :rules="rules"
          @submit.native.prevent="createOrganization('newOrganizationForm')"
        >
          <el-form-item
            label="Organization Name"
            prop="name"
          >
            <el-input
              v-model="newOrganizationForm.name"
              autofocus
              :maxlength="255"
            />
          </el-form-item>
        </el-form>
      </div>
    </dialog-body>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <bf-button
        tabindex="4"
        class="secondary"
        @click="closeDialog"
      >
        Cancel
      </bf-button>
      <bf-button
        :disabled="isCreating"
        :processing="isCreating"
        processing-text="Creating Organization"
        @click="createOrganization('newOrganizationForm')"
      >
        Create Organization
      </bf-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

import BfButton from '@/components/shared/bf-button/BfButton.vue'
import BfDialogHeader from '@/components/shared/bf-dialog-header/BfDialogHeader'
import DialogBody from '@/components/shared/dialog-body/DialogBody.vue'

import Request from '@/mixins/request/index'
import CheckUniqueNames from '@/mixins/check-unique-names'

import EventBus from '@/utils/event-bus'
  export default {
    name: 'CreateOrganizationDialog',
    components: {
      BfButton,
      BfDialogHeader,
      DialogBody
    },
    mixins: [
      Request,
      CheckUniqueNames
    ],
    props: {
      visible: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
         newOrganizationForm: {
          name: ''
        },
        rules: {
          name: [
            { required: true, validator: this.validateOrganization, trigger: 'false' },
          ]
        },
        duplicateOrganizationName: false,
        isCreating: false
      }
    },

    computed: {
      ...mapGetters([
        'organizations'
      ])
    },

    methods: {
      /**
       * Close create organization dialog
       */
      closeDialog: function() {
        this.isCreating = false
        this.newOrganizationForm.name = ''
        this.$refs.newOrganizationForm.resetFields()
        this.$emit('close-dialog')
      },

       /**
        * Create new organization
        */
      createOrganization: function(formName) {
        this.duplicateOrganizationName = false

        this.$refs[formName]
          .validate((valid) => {
            if (!valid) {
              return
            }
            this.sendRequest()
          })
      },

      /**
       * Validate name
       * @param {Object} rule
       * @param {String} value
       * @param {Function} callback
       */
      validateOrganization: function(rule, value, callback) {
        const isUnique = this.checkUniqueName(this.organizations, ['organization', 'name'], value, '')
        if (value === '') {
          callback(new Error('Please provide a name'))
        } else if (value.length > 255) {
          callback(new Error('Organization name must be less than 255 characters'))
        } else if  (!isUnique || this.duplicateName) {
          callback(new Error('An organization with this name already exists'))
        } else {
          callback()
        }
      },

      sendRequest: function() {
        this.isCreating = true
        // TODO add endpoint logic to create organization once it becomes available
        this.handleSuccess()
      },

      handleSuccess: function() {
        // logic to handle endpoint success
         EventBus.$emit('toast', {
            detail: {
              msg: `The organization ${this.newOrganizationForm.name} has been created`,
              type: 'success'
            }
          })
          this.closeDialog()
      }
    },
  }
</script>

<style lang="scss" scoped>
.create-new-organization {
  p {
    margin-bottom: 15px;
  }
}
</style>