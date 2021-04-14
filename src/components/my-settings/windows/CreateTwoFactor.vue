<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    @open="handleOpen"
    @close="closeDialog"
  >
    <bf-dialog-header
      slot="title"
      title="Choose Two-Factor Authentication"
    />

    <dialog-body>
      <el-form
        ref="twoFactorForm"
        :model="ruleForm"
        :rules="rules"
        @submit.native.prevent="onTwoFactorFormSubmit"
      >

        <el-form-item
          prop="twoFactorValue"
        >
          <el-radio-group v-model="twoFactorValue">
            <el-radio label="TOTP">TOTP</el-radio>
            <el-radio label="SMS">SMS</el-radio>
          </el-radio-group>

        </el-form-item>

        <!-- <el-form-item
          label="Phone Number"
          prop="phoneNumber"
        >
          <a11y-keys @key-pressed="onHandleKeyPressed">
            <el-input v-model="ruleForm.phoneNumber">
              <template slot="prepend">
                +{{ ruleForm.countryCode }}
              </template>
            </el-input>
          </a11y-keys>
        </el-form-item>
        <div>Please provide numbers only.</div> -->
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
      <bf-button @click="onTwoFactorFormSubmit">
        Confirm
      </bf-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { pathOr, prop } from 'ramda'

import A11yKeys from '../../shared/a11y-keys/A11yKeys.vue'
import BfButton from '../../shared/bf-button/BfButton.vue'
import BfDialogHeader from '../../shared/bf-dialog-header/BfDialogHeader.vue'
import DialogBody from '../../shared/dialog-body/DialogBody.vue'

import AutoFocus from '../../../mixins/auto-focus'
import Request from '../../../mixins/request'
import EventBus from '../../../utils/event-bus'

export default {
  name: 'CreateTwoFactor',

  components: {
    A11yKeys,
    BfButton,
    BfDialogHeader,
    DialogBody
  },

  mixins: [
    AutoFocus,
    Request
  ],

  data() {
    return {
      dialogVisible: false,
      labelPosition: 'right',
      twoFactorValue: false,
      ruleForm: {
        countryCode: '1',
        phoneNumber: '',
      },
      rules: {
        countryCode: [
          { required: true, message: 'Please provide a country code', trigger: 'false' },
        ],
        phoneNumber: [
          { required: true, message: 'Please provide your phone number', trigger: 'false' }
        ]
      }
    }
  },

  computed: {
    ...mapGetters([
      'profile',
      'activeOrganization',
      'userToken',
      'config'
    ]),
    twoFactorUrl: function() {
      const url = pathOr('', ['config', 'apiUrl'])(this)
      const userToken = prop('userToken', this)

      if (!url || !userToken) {
        return ''
      }
      return `${url}/user/twofactor?api_key=${userToken}`
    }
  },

  methods: {
    ...mapActions([
      'updateProfile'
    ]),
    /**
     * Handles key-pressed event for last input in form
     */
    onHandleKeyPressed: function() {
      this.onTwoFactorFormSubmit()
    },
    /**
     * Handles submit event
     */
    onTwoFactorFormSubmit: function() {
      // this.$refs.twoFactorForm
      //   .validate((valid) => {
      //     if (!valid) {
      //       return
      //     }
      //     this.sendTwoFactorAuthRequest()
      //   })

     this.handleTwoFactorXhrSucces()
    },
    /**
     * Makes XHR call to update two factor auth status
     */
    sendTwoFactorAuthRequest: function() {
      const phoneNumber = this.ruleForm.phoneNumber.replace(/\D/g, '')

      this.sendXhr(this.twoFactorUrl, {
        method: 'POST',
        body: {
          countryCode: this.ruleForm.countryCode,
          phoneNumber
        }
      })
      .then(this.handleTwoFactorXhrSucces.bind(this))
      .catch(this.handleXhrError.bind(this))
    },
    /**
     * Handles successful two factor xhr response
     * @param {Object} response
     */
    handleTwoFactorXhrSucces: function(response) {
      this.closeDialog()

      EventBus.$emit('toast', {
        detail: {
          type: 'MESSAGE',
          msg: 'Two-factor Authentication successfully added'
        }
      })

      this.updateProfile({
        ...this.profile,
        authyId: this.twoFactorValue
      })
    },
    /**
     * Resets form fields and validations
     */
    handleOpen: function() {
      this.labelPosition = 'right'
      this.apiKeys = []
      this.autoFocus()
    },
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.dialogVisible = false
      this.$refs.twoFactorForm.resetFields()
    }
  }
}
</script>
