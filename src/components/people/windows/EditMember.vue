<template>
  <el-dialog
    :show-close="false"
    :visible.sync="dialogVisible"
    @open="autoFocus"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      :title="memberDisplayName"
    />

    <dialog-body>
      <el-form
        ref="memberForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="updateMember('memberForm')"
      >
        <el-form-item
          label="First Name"
          prop="firstName"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input
              v-model="ruleForm.firstName"
              autofocus
            />
          </a11y-keys>
        </el-form-item>
        <el-form-item
          label="Last Name"
          prop="lastName"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input v-model="ruleForm.lastName" />
          </a11y-keys>
        </el-form-item>
        <el-form-item
          label="Email"
          prop="email"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input v-model="ruleForm.email" />
          </a11y-keys>
        </el-form-item>
        <el-form-item label="Title">
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input v-model="ruleForm.credential" />
          </a11y-keys>
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
      <bf-button @click="updateMember('memberForm')">
        Save
      </bf-button>
    </span>
  </el-dialog>
</template>

<style lang="scss">
</style>

<script>
import { mapGetters } from 'vuex'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'
import A11yKeys from '../../shared/a11y-keys/A11yKeys.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import Request from '../../../mixins/request'
import AutoFocus from '../../../mixins/auto-focus'
import EventBus from '../../../utils/event-bus'
import { propOr, pathOr, defaultTo } from 'ramda'

export default {
  name: 'EditMember',

  components: {
    BfDialogHeader,
    DialogBody,
    BfButton,
    A11yKeys
  },

  mixins: [
    Request,
    AutoFocus
  ],

  computed: {
    ...mapGetters([,
      'activeOrganization',
      'userToken',
      'config'
    ])
  },

  data() {
    return {
      dialogVisible: false,
      member: {},
      memberDisplayName: '',
      ruleForm: {
        firstName: '',
        lastName: '',
        email: '',
        credential: ''
      },
      rules: {
        firstName: [
          { required: true, message: 'Please provide your first name', trigger: 'false' },
        ],
        lastName: [
          { required: true, message: 'Please provide your last name', trigger: 'false' }
        ],
        email: [
          { type: 'email', required: true, message: 'Please provide a valid email address', trigger: 'false' }
        ]
      }
    }
  },

  mounted() {
    EventBus.$on('update-org-member', this.handleUpdateOrgMember.bind(this))
  },

  beforeDestroy() {
    EventBus.$off('update-org-member', this.handleUpdateOrgMember.bind(this))
  },

  methods: {
    /**
     * Handles key-pressed event
     */
    onHandleKeyPressed: function() {
      this.updateMember('memberForm')
    },
    /**
     * Generates member display name
     * @param {Object} member
     * @returns {String}
     */
    createDisplayName: function(member) {
      const firstName = propOr('', 'firstName', member)
      const lastName = propOr('', 'lastName', member)
      const email = propOr('', 'email', member)

      let str = `${firstName} ${lastName}`
      if (str.trim().length === 0) {
        str = email
      }

      return str.trim()
    },
    /**
     * Closes remove member dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.$refs.memberForm.resetFields()
      this.member = {}
      this.memberDisplayName = ''
    },
    /**
     * Handles update-org-member event
     * @param {Object} member
     */
    handleUpdateOrgMember: function(member) {
      this.dialogVisible = true
      this.member = defaultTo({}, member)
      this.ruleForm.firstName = member.firstName
      this.ruleForm.lastName = member.lastName
      this.ruleForm.email = member.email
      this.ruleForm.credential = member.credential
      this.memberDisplayName = this.createDisplayName(member)
    },
    /**
     * Creates PUT url to remove member from org
     */
    createUrl: function() {
      const orgId = pathOr('', ['organization', 'id'], this.activeOrganization)
      const apiUrl = propOr('', 'apiUrl', this.config)
      const memberId = propOr('', 'id', this.member)
      return `${apiUrl}/organizations/${orgId}/members/${memberId}?api_key=${this.userToken}`
    },
    /**
     * Validates member form
     * @param {String} formName
     */
    updateMember: function(formName) {
      this.$refs[formName]
        .validate((valid) => {
          if (!valid) {
            return
          }
          this.updateMemberXhr()
        })
    },
    /**
     * Makes XHR call to update member
     */
    updateMemberXhr: function() {
      this.sendXhr(this.createUrl(), {
        method: 'PUT',
        body: {
          firstName: this.ruleForm.firstName,
          lastName: this.ruleForm.lastName,
          email: this.ruleForm.email,
          credential: this.ruleForm.credential
        }
      })
      .then(updatedMember => {
        this.$emit('member-updated', updatedMember)
        EventBus.$emit('toast', {
          detail: {
            type: 'MESSAGE',
            msg: `Profile for ${this.memberDisplayName} updated`
          }
        })
        this.closeDialog()
      })
      .catch(() => {
        EventBus.$emit('toast', {
          detail: {
            type: 'ERROR',
            msg: `Error updating ${this.memberDisplayName}`
          }
        })
      })
    }
  }
}
</script>
